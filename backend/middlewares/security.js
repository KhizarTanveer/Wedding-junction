/**
 * Security Middleware
 * Provides security headers, sanitization, and protection
 */

/**
 * Set security headers
 */
const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Enable XSS filter in browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Control referrer information
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions policy
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Content Security Policy (basic)
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;"
  );

  // Strict Transport Security (for HTTPS)
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  next();
};

/**
 * Sanitize request body to prevent NoSQL injection
 * Removes $ and . from keys
 */
const sanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

/**
 * Recursively sanitize an object
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const key of Object.keys(obj)) {
    // Remove keys starting with $ (MongoDB operators)
    if (key.startsWith("$")) {
      continue;
    }

    // Remove keys containing . (nested object notation)
    if (key.includes(".")) {
      continue;
    }

    // Recursively sanitize nested objects
    sanitized[key] = sanitizeObject(obj[key]);
  }

  return sanitized;
};

/**
 * XSS sanitization for strings
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Sanitize request body strings for XSS
 */
const xssSanitize = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeStringsInObject(req.body);
  }
  next();
};

/**
 * Recursively sanitize strings in an object
 * @param {Object} obj - Object to process
 * @returns {Object} Processed object
 */
const sanitizeStringsInObject = (obj) => {
  if (obj === null || typeof obj !== "object") {
    if (typeof obj === "string") {
      return sanitizeString(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeStringsInObject);
  }

  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = sanitizeStringsInObject(obj[key]);
  }
  return result;
};

/**
 * Prevent HTTP Parameter Pollution
 * Only keeps the last value for each parameter
 */
const preventHPP = (whitelist = []) => {
  return (req, res, next) => {
    if (req.query) {
      for (const key of Object.keys(req.query)) {
        if (Array.isArray(req.query[key]) && !whitelist.includes(key)) {
          req.query[key] = req.query[key][req.query[key].length - 1];
        }
      }
    }
    next();
  };
};

/**
 * CORS configuration middleware
 */
const corsConfig = (options = {}) => {
  const allowedOrigins = options.origins || [
    "http://localhost:3000",
    "http://localhost:5173",
  ];

  return (req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, X-CSRF-Token"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    next();
  };
};

/**
 * Request size limiter
 */
const limitRequestSize = (maxSize = "10kb") => {
  const parseSize = (size) => {
    if (typeof size === "number") return size;
    const match = size.match(/^(\d+)(kb|mb|gb)?$/i);
    if (!match) return 10240; // Default 10kb

    const num = parseInt(match[1], 10);
    const unit = (match[2] || "b").toLowerCase();

    const multipliers = {
      b: 1,
      kb: 1024,
      mb: 1024 * 1024,
      gb: 1024 * 1024 * 1024,
    };

    return num * (multipliers[unit] || 1);
  };

  const limit = parseSize(maxSize);

  return (req, res, next) => {
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        res.status(413).json({
          status: "error",
          message: "Request entity too large",
        });
        req.destroy();
      }
    });

    next();
  };
};

/**
 * Detect and block suspicious requests
 */
const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /(\.\.|%2e%2e)/i, // Directory traversal
    /<script/i, // Script injection
    /javascript:/i, // JavaScript protocol
    /vbscript:/i, // VBScript protocol
    /on\w+\s*=/i, // Event handlers
    /union\s+select/i, // SQL injection
    /\bexec\s*\(/i, // Code execution
    /\beval\s*\(/i, // Eval execution
  ];

  const checkString = (str) => {
    if (typeof str !== "string") return false;
    return suspiciousPatterns.some((pattern) => pattern.test(str));
  };

  const checkObject = (obj) => {
    if (!obj || typeof obj !== "object") return false;

    for (const key of Object.keys(obj)) {
      if (checkString(key)) return true;
      if (checkString(obj[key])) return true;
      if (typeof obj[key] === "object" && checkObject(obj[key])) return true;
    }

    return false;
  };

  // Check URL
  if (checkString(req.url)) {
    console.warn(`Suspicious URL detected: ${req.url} from ${req.ip}`);
    return res.status(400).json({
      status: "error",
      message: "Invalid request",
    });
  }

  // Check body
  if (checkObject(req.body)) {
    console.warn(`Suspicious body detected from ${req.ip}`);
    return res.status(400).json({
      status: "error",
      message: "Invalid request content",
    });
  }

  // Check query
  if (checkObject(req.query)) {
    console.warn(`Suspicious query detected from ${req.ip}`);
    return res.status(400).json({
      status: "error",
      message: "Invalid query parameters",
    });
  }

  next();
};

/**
 * Log security events
 */
const securityLogger = (req, res, next) => {
  // Log authentication attempts
  if (req.path.includes("/login") || req.path.includes("/signup")) {
    console.log(`Auth attempt: ${req.method} ${req.path} from ${req.ip}`);
  }

  // Log admin actions
  if (req.user?.role === "admin") {
    console.log(`Admin action: ${req.method} ${req.path} by ${req.user.email}`);
  }

  // Log sensitive operations
  const sensitivePatterns = ["/password", "/delete", "/admin"];
  if (sensitivePatterns.some((pattern) => req.path.includes(pattern))) {
    console.log(
      `Sensitive operation: ${req.method} ${req.path} by ${req.user?.email || req.ip}`
    );
  }

  next();
};

/**
 * Apply all security middleware
 */
const applySecurity = (app) => {
  app.use(securityHeaders);
  app.use(sanitizeBody);
  app.use(
    preventHPP(["price", "rating", "category", "status", "tags"])
  );
  app.use(detectSuspiciousActivity);

  if (process.env.NODE_ENV !== "test") {
    app.use(securityLogger);
  }
};

module.exports = {
  securityHeaders,
  sanitizeBody,
  sanitizeObject,
  sanitizeString,
  xssSanitize,
  sanitizeStringsInObject,
  preventHPP,
  corsConfig,
  limitRequestSize,
  detectSuspiciousActivity,
  securityLogger,
  applySecurity,
};
