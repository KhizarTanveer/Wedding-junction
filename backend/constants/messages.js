const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: "Invalid email or password",
  UNAUTHORIZED: "Not authorized to access this resource",
  TOKEN_EXPIRED: "Token has expired",
  TOKEN_INVALID: "Invalid token",
  ACCOUNT_LOCKED: "Account is locked. Please try again later",
  ACCOUNT_SUSPENDED: "Your account has been suspended",
  EMAIL_NOT_VERIFIED: "Please verify your email address",

  // Validation
  VALIDATION_ERROR: "Validation failed",
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Please provide a valid email address",
  INVALID_PHONE: "Please provide a valid phone number",
  PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
  PASSWORDS_DONT_MATCH: "Passwords do not match",

  // Resources
  NOT_FOUND: "Resource not found",
  USER_NOT_FOUND: "User not found",
  VENDOR_NOT_FOUND: "Vendor not found",
  BOOKING_NOT_FOUND: "Booking not found",
  SERVICE_NOT_FOUND: "Service not found",
  CATEGORY_NOT_FOUND: "Category not found",
  CONVERSATION_NOT_FOUND: "Conversation not found",
  REVIEW_NOT_FOUND: "Review not found",

  // Booking
  INVALID_STATUS_TRANSITION: "Invalid status transition",
  BOOKING_CANNOT_BE_CANCELLED: "This booking cannot be cancelled",
  BOOKING_EXPIRED: "This booking has expired",
  ALREADY_REVIEWED: "You have already reviewed this booking",

  // Rate limiting
  RATE_LIMIT_EXCEEDED: "Too many requests, please try again later",
  AUTH_RATE_LIMIT: "Too many login attempts, please try again after 15 minutes",

  // Server
  SERVER_ERROR: "Internal server error",
  DATABASE_ERROR: "Database operation failed",
};

const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logged out successfully",
  SIGNUP_SUCCESS: "Account created successfully",
  PASSWORD_RESET_EMAIL_SENT: "Password reset email sent",
  PASSWORD_RESET_SUCCESS: "Password has been reset successfully",
  EMAIL_VERIFIED: "Email verified successfully",

  // CRUD
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",

  // Booking
  BOOKING_CREATED: "Booking created successfully",
  BOOKING_ACCEPTED: "Booking accepted",
  BOOKING_DECLINED: "Booking declined",
  BOOKING_CONFIRMED: "Booking confirmed",
  BOOKING_CANCELLED: "Booking cancelled",
  PAYMENT_SUCCESS: "Payment successful",

  // Review
  REVIEW_SUBMITTED: "Review submitted successfully",
  REVIEW_UPDATED: "Review updated successfully",
  REVIEW_DELETED: "Review deleted",

  // Vendor
  VENDOR_APPLICATION_SUBMITTED: "Vendor application submitted",
  VENDOR_APPLICATION_APPROVED: "Vendor application approved",
};

module.exports = {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
