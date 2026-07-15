/**
 * Rate Limiter Middleware
 * Provides rate limiting for API endpoints
 */

// Simple in-memory store for rate limiting
// In production, use Redis for distributed rate limiting
const rateLimitStore = new Map();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute default
    max = 100, // 100 requests per window default
    message = "Too many requests, please try again later",
    keyGenerator = (req) => req.user?._id?.toString() || req.ip,
    skip = () => false,
    onLimitReached = null,
  } = options;

  return async (req, res, next) => {
    try {
      // Skip if configured to skip
      if (skip(req)) {
        return next();
      }

      // Skip for admins
      if (req.user?.role === "admin") {
        return next();
      }

      const key = keyGenerator(req);
      const now = Date.now();

      // Get or create rate limit entry
      let entry = rateLimitStore.get(key);

      if (!entry || entry.resetTime < now) {
        entry = {
          count: 0,
          resetTime: now + windowMs,
        };
      }

      entry.count++;
      rateLimitStore.set(key, entry);

      // Calculate remaining
      const remaining = Math.max(0, max - entry.count);
      const resetTime = Math.ceil(entry.resetTime / 1000);

      // Set rate limit headers
      res.set({
        "X-RateLimit-Limit": max,
        "X-RateLimit-Remaining": remaining,
        "X-RateLimit-Reset": resetTime,
      });

      // Check if limit exceeded
      if (entry.count > max) {
        // Call onLimitReached callback if provided
        if (onLimitReached) {
          onLimitReached(req, res);
        }

        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        res.set("Retry-After", retryAfter);

        return res.status(429).json({
          status: "error",
          message,
          retryAfter,
        });
      }

      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      // Don't block request on rate limiter error
      next();
    }
  };
};

/**
 * Pre-configured rate limiters
 */

// Helper to check test mode at runtime (not at module load time for Windows compatibility)
const isInTestMode = () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

// Authentication rate limiter (strict in production, disabled in test mode)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 5, // 5 attempts in prod
  message: "Too many login attempts, please try again after 15 minutes",
  keyGenerator: (req) => `auth:${req.ip}`,
  skip: (req) => isInTestMode(), // Skip rate limiting entirely in test/dev mode (evaluated at runtime)
  onLimitReached: (req) => {
    console.warn(`Auth rate limit reached for IP: ${req.ip}`);
  },
});

// General API rate limiter
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: "Too many requests, please slow down",
});

// Search rate limiter
const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: "Too many search requests, please wait a moment",
});

// Upload rate limiter
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: "Upload limit reached, please try again later",
});

// Booking creation rate limiter
const bookingLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 bookings per hour
  message: "Booking limit reached, please try again later",
});

// Message sending rate limiter
const messageLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute
  message: "You're sending messages too quickly, please slow down",
});

// Password reset rate limiter
const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour
  message: "Too many password reset requests, please try again later",
  keyGenerator: (req) => `reset:${req.body.email || req.ip}`,
});

// Vendor application rate limiter
const applicationLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // 1 application per day
  message: "You can only submit one vendor application per day",
});

/**
 * Dynamic rate limiter based on user tier
 * Premium users get higher limits
 */
const tieredLimiter = (baseMax = 60) => {
  return createRateLimiter({
    windowMs: 60 * 1000,
    max: baseMax,
    keyGenerator: (req) => {
      const userId = req.user?._id?.toString() || req.ip;
      const tier = req.user?.vendorTier || "basic";

      // Tier multipliers
      const multipliers = {
        basic: 1,
        premium: 2,
        enterprise: 5,
      };

      const multiplier = multipliers[tier] || 1;
      return `${userId}:${Math.round(baseMax * multiplier)}`;
    },
  });
};

/**
 * Sliding window rate limiter for more precise limiting
 */
const slidingWindowLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    max = 100,
    message = "Rate limit exceeded",
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    const key = req.user?._id?.toString() || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this key
    let userRequests = requests.get(key) || [];

    // Filter out old requests
    userRequests = userRequests.filter((timestamp) => timestamp > windowStart);

    // Check if limit exceeded
    if (userRequests.length >= max) {
      const oldestRequest = userRequests[0];
      const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);

      res.set("Retry-After", retryAfter);
      return res.status(429).json({
        status: "error",
        message,
        retryAfter,
      });
    }

    // Add current request
    userRequests.push(now);
    requests.set(key, userRequests);

    // Set headers
    res.set({
      "X-RateLimit-Limit": max,
      "X-RateLimit-Remaining": max - userRequests.length,
    });

    next();
  };
};

module.exports = {
  createRateLimiter,
  authLimiter,
  apiLimiter,
  searchLimiter,
  uploadLimiter,
  bookingLimiter,
  messageLimiter,
  passwordResetLimiter,
  applicationLimiter,
  tieredLimiter,
  slidingWindowLimiter,
};
