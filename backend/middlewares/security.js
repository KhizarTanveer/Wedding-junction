const securityHeaders = (req, res, next) => {
  
  res.setHeader("X-Content-Type-Options", "nosniff");

 
  res.setHeader("X-Frame-Options", "DENY");

  
  res.setHeader("X-XSS-Protection", "1; mode=block");

 
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;"
  );

 
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  next();
};


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
    
    if (key.startsWith("$")) {
      continue;
    }

   
    if (key.includes(".")) {
      continue;
    }

   
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
    res.setHeader("Access-Control-Max-Age", "86400"); 

   
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    next();
  };
};


const limitRequestSize = (maxSize = "10kb") => {
  const parseSize = (size) => {
    if (typeof size === "number") return size;
    const match = size.match(/^(\d+)(kb|mb|gb)?$/i);
    if (!match) return 10240; 

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


const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /(\.\.|%2e%2e)/i, 
    /<script/i, 
    /javascript:/i, 
    /vbscript:/i, 
    /on\w+\s*=/i, 
    /union\s+select/i,
    /\bexec\s*\(/i,
    /\beval\s*\(/i, 
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

  
  if (checkString(req.url)) {
    console.warn(`Suspicious URL detected: ${req.url} from ${req.ip}`);
    return res.status(400).json({
      status: "error",
      message: "Invalid request",
    });
  }

 
  if (checkObject(req.body)) {
    console.warn(`Suspicious body detected from ${req.ip}`);
    return res.status(400).json({
      status: "error",
      message: "Invalid request content",
    });
  }

 
  if (checkObject(req.query)) {
    console.warn(`Suspicious query detected from ${req.ip}`);
    return res.status(400).json({
      status: "error",
      message: "Invalid query parameters",
    });
  }

  next();
};


const securityLogger = (req, res, next) => {
 
  if (req.path.includes("/login") || req.path.includes("/signup")) {
    console.log(`Auth attempt: ${req.method} ${req.path} from ${req.ip}`);
  }

  
  if (req.user?.role === "admin") {
    console.log(`Admin action: ${req.method} ${req.path} by ${req.user.email}`);
  }

  const sensitivePatterns = ["/password", "/delete", "/admin"];
  if (sensitivePatterns.some((pattern) => req.path.includes(pattern))) {
    console.log(
      `Sensitive operation: ${req.method} ${req.path} by ${req.user?.email || req.ip}`
    );
  }

  next();
};


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
