/**
 * Test data constants for E2E tests
 */

export const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'TestPassword123!',
};

export const testVendor = {
  name: 'Test Vendor',
  email: 'testvendor@example.com',
  password: 'VendorPassword123!',
  businessInfo: {
    name: 'Premium Wedding Photography',
    description: 'We are a professional wedding photography studio with over 10 years of experience capturing beautiful moments. Our team specializes in candid, traditional, and contemporary styles.',
  },
  serviceDetails: {
    category: 'Photography', // Will need to match actual category ID
    experience: 5,
    servicesOffered: ['Wedding Photography', 'Pre-Wedding Shoots', 'Candid Photography'],
    pricing: {
      minPrice: 50000,
      maxPrice: 200000,
      pricingModel: 'package',
    },
  },
  contact: {
    phone: '03001234567',
    email: 'contact@premiumwedding.com',
    website: 'https://premiumwedding.com',
    socialMedia: {
      instagram: '@premiumwedding',
      facebook: 'premiumweddingpk',
    },
  },
  location: {
    city: 'Lahore',
    state: 'Punjab',
    serviceAreas: ['Lahore', 'Islamabad', 'Karachi'],
  },
};

export const testAdmin = {
  email: 'admin@weddingjunction.com',
  password: 'AdminPassword123!',
};

export const testBooking = {
  eventDate: getFutureDate(30), // 30 days from now
  eventType: 'Wedding',
  notes: 'Looking forward to our special day!',
  guestCount: 200,
  clientDetails: {
    name: 'Wedding Client',
    phone: '03009876543',
    email: 'client@example.com',
    address: '123 Wedding Street, Lahore',
  },
};

export const testReview = {
  rating: 5,
  title: 'Amazing Experience!',
  comment: 'The photography team was absolutely wonderful. They captured every moment beautifully and were professional throughout. Highly recommended!',
};

export const testChatMessage = {
  text: 'Hello, I am interested in your wedding photography services. Could you please share more details?',
};

// Payment test data
export const testPayment = {
  cardholderName: 'Test User',
  cardNumber: '4242424242424242',
  expiry: '12/30',
  cvv: '123',
};

export const invalidPayment = {
  cardholderName: '',
  cardNumber: '1234567890123456', // Invalid
  expiry: '01/20', // Expired
  cvv: '12', // Too short
};

// All 16 booking statuses
export const BOOKING_STATUSES = {
  DRAFT: 'draft',
  REQUESTED: 'requested',
  VENDOR_ACCEPTED: 'vendor_accepted',
  VENDOR_DECLINED: 'vendor_declined',
  PAYMENT_PENDING: 'payment_pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  CANCELLED_BY_USER: 'cancelled_by_user',
  CANCELLED_BY_VENDOR: 'cancelled_by_vendor',
  REFUND_PENDING: 'refund_pending',
  REFUNDED: 'refunded',
  DISPUTED: 'disputed',
  RESOLVED: 'resolved',
  EXPIRED: 'expired',
} as const;

export type BookingStatus = typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES];

// Profile update test data
export const profileUpdate = {
  name: 'Updated Test User',
  phone: '03001112222',
};

// Password change test data
export const passwordChange = {
  currentPassword: 'TestPassword123!',
  newPassword: 'NewPassword456!',
  invalidPassword: 'wrong',
};

// Helper function to get future date
function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

// Helper: generate future date (exported)
export function generateFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

// Helper: generate past date
export function generatePastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// Generate unique email for tests to avoid conflicts
export function generateUniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}@example.com`;
}

// Generate unique phone for tests
export function generateUniquePhone(): string {
  const random = Math.floor(Math.random() * 9000000) + 1000000;
  return `0300${random}`;
}
