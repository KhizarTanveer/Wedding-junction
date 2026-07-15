export const ROUTES = {
  // Public
  HOME: "/",
  SERVICES: "/services",
  VENDORS: "/vendors",
  VENDOR_DETAIL: "/vendors/:id",
  EXPLORE_VENDOR: "/explorevendor/:id",
  CATEGORY: "/category/:categoryName",
  EXPLORE_CATEGORY: "/explore/:categoryName",
  EXPLORE_VENDOR_DETAILS: "/explore/vendor-details",

  // Auth
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password/:token",

  // Protected - User
  BOOKINGS: "/bookings",
  PAYMENT: "/payment/:bookingId",
  PAYMENT_SUCCESS: "/payment-success/:bookingId",
  BECOME_VENDOR: "/become-vendor",

  // Chat
  CHAT: "/chat",
  CHAT_ROOM: "/chat/:conversationId",

  // Admin
  ADMIN: "/admin",
  ADMIN_VENDORS: "/admin/vendors",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_SERVICES: "/admin/services",

  // Vendor
  VENDOR_DASHBOARD: "/vendor",
  VENDOR_BOOKINGS: "/vendor/bookings",
  VENDOR_PROFILE: "/vendor/profile",

  // Legal
  TERMS: "/terms",
  PRIVACY: "/privacy",
  COOKIES: "/cookies",
};

// Helper to generate dynamic routes
export const generateRoute = {
  vendorDetail: (id) => `/vendors/${id}`,
  exploreVendor: (id) => `/explorevendor/${id}`,
  category: (name) => `/category/${name}`,
  exploreCategory: (name) => `/explore/${name}`,
  resetPassword: (token) => `/reset-password/${token}`,
  payment: (bookingId) => `/payment/${bookingId}`,
  paymentSuccess: (bookingId) => `/payment-success/${bookingId}`,
  chatRoom: (conversationId) => `/chat/${conversationId}`,
};
