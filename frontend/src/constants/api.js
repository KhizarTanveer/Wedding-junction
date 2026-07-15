export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/signup",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
  },

  // Services
  SERVICES: {
    BASE: "/api/services",
    BY_ID: (id) => `/api/services/${id}`,
  },

  // Vendors
  VENDORS: {
    BASE: "/api/vendors",
    BY_ID: (id) => `/api/vendors/${id}`,
    FEATURED: "/api/vendors/featured",
  },

  // Categories
  CATEGORIES: {
    BASE: "/api/categories",
    BY_ID: (id) => `/api/categories/${id}`,
    BY_NAME: (name) => `/api/categories/name/${name}`,
  },

  // Bookings
  BOOKINGS: {
    BASE: "/api/bookings",
    BY_ID: (id) => `/api/bookings/${id}`,
    USER_BOOKINGS: "/api/bookings/user",
    CONFIRM: (id) => `/api/bookings/${id}/confirm`,
    CANCEL: (id) => `/api/bookings/${id}/cancel`,
  },

  // Chat
  CHAT: {
    CONVERSATIONS: "/api/chat/conversations",
    BY_ID: (id) => `/api/chat/${id}`,
    MESSAGES: (id) => `/api/chat/${id}/messages`,
    SEND_MESSAGE: (id) => `/api/chat/${id}/messages`,
    UPDATE_PRICE: (id) => `/api/chat/${id}/price`,
    CREATE_BOOKING: (id) => `/api/chat/${id}/booking`,
  },

  // Reviews
  REVIEWS: {
    BASE: "/api/reviews",
    BY_ID: (id) => `/api/reviews/${id}`,
    BY_VENDOR: (vendorId) => `/api/reviews/vendors/${vendorId}/reviews`,
    HELPFUL: (id) => `/api/reviews/${id}/helpful`,
    REPORT: (id) => `/api/reviews/${id}/report`,
    RESPONSE: (id) => `/api/reviews/${id}/response`,
  },

  // Admin
  ADMIN: {
    DASHBOARD: "/api/admin/dashboard",
    USERS: "/api/admin/users",
    VENDORS: "/api/admin/vendors",
    BOOKINGS: "/api/admin/bookings",
    CATEGORIES: "/api/admin/categories",
    SERVICES: "/api/admin/services",
  },

  // Vendor Dashboard
  VENDOR_DASHBOARD: {
    STATS: "/api/vendor/stats",
    BOOKINGS: "/api/vendor/bookings",
    PROFILE: "/api/vendor/profile",
    APPLICATIONS: "/api/vendor/applications",
  },
};
