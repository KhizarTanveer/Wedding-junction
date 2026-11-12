const rateLimitStore = new Map();


setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); 

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, 
    max = 100, 
    message = "Too many requests, please try again later",
    keyGenerator = (req) => req.user?._id?.toString() || req.ip,
    skip = () => false,
    onLimitReached = null,
  } = options;

  return async (req, res, next) => {
    try {
     
      if (skip(req)) {
        return next();
      }

      
      if (req.user?.role === "admin") {
        return next();
      }

      const key = keyGenerator(req);
      const now = Date.now();

     
      let entry = rateLimitStore.get(key);

      if (!entry || entry.resetTime < now) {
        entry = {
          count: 0,
          resetTime: now + windowMs,
        };
      }

      entry.count++;
      rateLimitStore.set(key, entry);

      
      const remaining = Math.max(0, max - entry.count);
      const resetTime = Math.ceil(entry.resetTime / 1000);

     
      res.set({
        "X-RateLimit-Limit": max,
        "X-RateLimit-Remaining": remaining,
        "X-RateLimit-Reset": resetTime,
      });

     
      if (entry.count > max) {
        
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
    
      next();
    }
  };
};


const isInTestMode = () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';


const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: "Too many login attempts, please try again after 15 minutes",
  keyGenerator: (req) => `auth:${req.ip}`,
  skip: (req) => isInTestMode(), 
  onLimitReached: (req) => {
    console.warn(`Auth rate limit reached for IP: ${req.ip}`);
  },
});


const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, 
  max: 60, 
  message: "Too many requests, please slow down",
});


const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000, 
  max: 30, 
  message: "Too many search requests, please wait a moment",
});


const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, 
  max: 20, 
  message: "Upload limit reached, please try again later",
});


const bookingLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, 
  max: 10, 
  message: "Booking limit reached, please try again later",
});


const messageLimiter = createRateLimiter({
  windowMs: 60 * 1000, 
  max: 20, 
  message: "You're sending messages too quickly, please slow down",
});


const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, 
  max: 3, 
  message: "Too many password reset requests, please try again later",
  keyGenerator: (req) => `reset:${req.body.email || req.ip}`,
});


const applicationLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 1, 
  message: "You can only submit one vendor application per day",
});


const tieredLimiter = (baseMax = 60) => {
  return createRateLimiter({
    windowMs: 60 * 1000,
    max: baseMax,
    keyGenerator: (req) => {
      const userId = req.user?._id?.toString() || req.ip;
      const tier = req.user?.vendorTier || "basic";

      
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

    
    let userRequests = requests.get(key) || [];

   
    userRequests = userRequests.filter((timestamp) => timestamp > windowStart);

   
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

    
    userRequests.push(now);
    requests.set(key, userRequests);

    
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
