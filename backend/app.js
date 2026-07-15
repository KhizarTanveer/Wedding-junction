const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { errorHandler, notFound } = require("./middlewares/errorHandler");
const logger = require("./utils/logger");

// Custom security middleware
const {
  securityHeaders,
  sanitizeBody,
  preventHPP,
  detectSuspiciousActivity,
} = require("./middlewares/security");

// Custom rate limiters
const {
  authLimiter: customAuthLimiter,
  apiLimiter: customApiLimiter,
  searchLimiter,
  bookingLimiter,
} = require("./middlewares/rateLimiter");

// Routes
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const vendorDashboardRoutes = require("./routes/vendorDashboardRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

// Security headers
app.use(helmet());

// Helper to check if running in test/dev mode
const isTestOrDev = () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

// Rate limiting for auth endpoints (prevent brute force)
// In test/dev mode, skip rate limiting to allow E2E tests to run without being blocked
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 10, // 10 attempts in prod
  message: {
    status: "error",
    message: "Too many login attempts, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestOrDev(), // Skip rate limiting in test/dev mode
});

// General API rate limit
// In test/dev mode, skip rate limiting to allow E2E tests to run without being blocked
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 500, // 500 requests in prod
  message: {
    status: "error",
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestOrDev(), // Skip rate limiting in test/dev mode
});

// CORS configuration - restrict to frontend URL
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Custom security middleware
app.use(securityHeaders);
app.use(sanitizeBody);
app.use(preventHPP(["price", "rating", "category", "status", "tags"]));
app.use(detectSuspiciousActivity);

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging (only in development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    logger.http(`${req.method} ${req.url}`);
    next();
  });
}

// health check
app.get("/", (req, res) => {
  res.send("Backend API is running");
});

// Test-only route bypass (no rate limiting for test reset endpoint)
const { resetTestUsers } = require("./controllers/authController");
app.post("/api/auth/reset-test-users", resetTestUsers);

// api routes with rate limiting
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", apiLimiter, serviceRoutes);
app.use("/api", apiLimiter, bookingRoutes);
app.use("/api", apiLimiter, vendorRoutes);
app.use("/api", apiLimiter, categoryRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);
app.use("/api/chat", apiLimiter, chatRoutes);
app.use("/api/vendor", apiLimiter, vendorDashboardRoutes);
app.use("/api/reviews", apiLimiter, reviewRoutes);

// 404 handler for undefined routes
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
