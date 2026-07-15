import { test as base, Page, expect } from '@playwright/test';
import { testUser, testVendor, testAdmin, generateUniqueEmail, BookingStatus } from './test-data';

// Define custom fixture types
type AuthFixtures = {
  authenticatedPage: Page;
  vendorPage: Page;
  adminPage: Page;
};

// Backend API URL for test utilities
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Store for auth tokens (used for API calls)
let authTokens: { user?: string; vendor?: string; admin?: string } = {};

/**
 * Reset test users - clears failed login attempts and account locks
 * Call this before tests to ensure test users are not locked out
 */
export async function resetTestUsers(): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-test-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      console.warn('Failed to reset test users:', await response.text());
    }
  } catch (error) {
    console.warn('Could not reset test users (backend may not be running):', error);
  }
}

/**
 * Login helper function with improved error handling
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');

  // Wait for page to be ready
  await page.waitForLoadState('networkidle');

  // Fill credentials
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('Enter your password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for response - either success redirect or error message
  try {
    // Wait for navigation away from login page (success) or error message
    await Promise.race([
      expect(page).not.toHaveURL('/login', { timeout: 10000 }),
      page.waitForSelector('.bg-red-50, [role="alert"]', { timeout: 10000 }),
    ]);

    // Check if we're still on login (error case)
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      const errorElement = await page.locator('.bg-red-50, [role="alert"]').first();
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        throw new Error(`Login failed: ${errorText}`);
      }
    }
  } catch (error) {
    // If we got a navigation error, check current state
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error(`Login failed for ${email}: Still on login page after attempt`);
    }
    // Otherwise we navigated successfully
  }
}

/**
 * Login as test user
 */
export async function loginAsUser(page: Page): Promise<void> {
  await login(page, testUser.email, testUser.password);
}

/**
 * Login as test vendor
 */
export async function loginAsVendor(page: Page): Promise<void> {
  await login(page, testVendor.email, testVendor.password);
}

/**
 * Login as admin
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, testAdmin.email, testAdmin.password);
}

/**
 * Signup a new user
 */
export async function signup(
  page: Page,
  userData: { name: string; email: string; password: string }
): Promise<void> {
  await page.goto('/signup');

  // Select user type
  await page.getByRole('button', { name: 'User Browse & book vendors' }).click();

  // Fill form
  await page.getByPlaceholder('Your full name').fill(userData.name);
  await page.getByPlaceholder('you@example.com').fill(userData.email);
  await page.getByPlaceholder('Create a password').fill(userData.password);
  await page.getByPlaceholder('Confirm your password').fill(userData.password);

  // Accept terms
  await page.locator('input[type="checkbox"]').check();

  // Submit
  await page.getByRole('button', { name: 'Create Account' }).click();

  // Wait for redirect
  await expect(page).toHaveURL('/');
}

/**
 * Signup a new vendor (multi-step)
 */
export async function signupVendor(
  page: Page,
  vendorData: typeof testVendor
): Promise<void> {
  await page.goto('/signup');

  // Select vendor type
  await page.getByRole('button', { name: 'Vendor Offer wedding services' }).click();

  // Step 0: Account info
  await page.getByPlaceholder('Your full name').fill(vendorData.name);
  await page.getByPlaceholder('you@example.com').fill(vendorData.email);
  await page.getByPlaceholder('Create a password').fill(vendorData.password);
  await page.getByPlaceholder('Confirm your password').fill(vendorData.password);
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 1: Business Info
  await page.getByPlaceholder('Your business or brand name').fill(vendorData.businessInfo.name);
  await page.getByPlaceholder(/Tell us about your services/).fill(vendorData.businessInfo.description);
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2: Services
  await page.locator('select[name="serviceCategory"]').selectOption({ label: vendorData.serviceDetails.category });
  await page.locator('input[name="experience"]').fill(vendorData.serviceDetails.experience.toString());

  // Select services offered
  for (const service of vendorData.serviceDetails.servicesOffered) {
    await page.getByLabel(service).check();
  }

  await page.locator('input[name="minPrice"]').fill(vendorData.serviceDetails.pricing.minPrice.toString());
  await page.locator('input[name="maxPrice"]').fill(vendorData.serviceDetails.pricing.maxPrice.toString());
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 3: Contact
  await page.getByPlaceholder('10-digit mobile number').fill(vendorData.contact.phone);
  await page.getByPlaceholder('business@example.com').fill(vendorData.contact.email);
  if (vendorData.contact.website) {
    await page.getByPlaceholder('https://yourwebsite.com').fill(vendorData.contact.website);
  }
  if (vendorData.contact.socialMedia.instagram) {
    await page.getByPlaceholder('@yourusername').fill(vendorData.contact.socialMedia.instagram);
  }
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 4: Location
  await page.getByPlaceholder('e.g., Lahore').fill(vendorData.location.city);
  await page.locator('select[name="state"]').selectOption(vendorData.location.state);
  await page.getByPlaceholder(/comma separated/).fill(vendorData.location.serviceAreas.join(', '));
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 5: Review & Submit
  await page.locator('input#termsAccepted').check();
  await page.getByRole('button', { name: 'Submit Application' }).click();

  // Wait for redirect to become-vendor page
  await expect(page).toHaveURL('/become-vendor');
}

/**
 * Logout helper
 */
export async function logout(page: Page): Promise<void> {
  // Click on user menu/profile icon and logout
  // This may vary based on the actual UI implementation
  await page.evaluate(() => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  });
  await page.goto('/');
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const token = await page.evaluate(() => localStorage.getItem('token'));
  return token !== null;
}

/**
 * Get current user from localStorage
 */
export async function getCurrentUser(page: Page): Promise<any> {
  const user = await page.evaluate(() => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  });
  return user;
}

/**
 * Set auth state directly (useful for test setup)
 */
export async function setAuthState(
  page: Page,
  user: any,
  token: string
): Promise<void> {
  await page.evaluate(
    ({ user, token }) => {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', token);
    },
    { user, token }
  );
}

/**
 * Extended test with authenticated fixtures
 * Automatically resets test users before each test suite
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await resetTestUsers(); // Reset before login attempt
    await loginAsUser(page);
    await use(page);
  },
  vendorPage: async ({ page }, use) => {
    await resetTestUsers(); // Reset before login attempt
    await loginAsVendor(page);
    await use(page);
  },
  adminPage: async ({ page }, use) => {
    await resetTestUsers(); // Reset before login attempt
    await loginAsAdmin(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';

/**
 * Login with specific number of failed attempts
 * Useful for testing account lockout functionality
 */
export async function loginWithFailedAttempts(
  page: Page,
  email: string,
  wrongPassword: string,
  attempts: number
): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('Enter your password').fill(wrongPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    // Wait for error message to appear
    await page.waitForSelector('.bg-red-50, [role="alert"]', { timeout: 5000 }).catch(() => {});
  }
}

/**
 * Get remaining login attempts from error message
 */
export async function getRemainingAttempts(page: Page): Promise<number> {
  const errorElement = page.locator('.bg-red-50, [role="alert"]');
  if (await errorElement.isVisible()) {
    const text = await errorElement.textContent();
    // Look for patterns like "3 attempts remaining" or "X attempts left"
    const match = text?.match(/(\d+)\s*attempt/i);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return -1; // Unknown
}

/**
 * Get auth token for API calls
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  return await page.evaluate(() => localStorage.getItem('token'));
}

/**
 * Create test booking via API
 */
export async function createTestBooking(
  token: string,
  vendorId: string,
  status?: BookingStatus
): Promise<{ bookingId: string }> {
  const response = await fetch(`${API_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      vendorId,
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      eventType: 'Wedding',
      guestCount: 200,
      specialRequests: 'Test booking',
      status: status || 'requested',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create booking: ${await response.text()}`);
  }

  const data = await response.json();
  return { bookingId: data._id || data.id };
}

/**
 * Update booking status via API
 */
export async function setBookingStatus(
  token: string,
  bookingId: string,
  status: BookingStatus
): Promise<void> {
  const response = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update booking status: ${await response.text()}`);
  }
}

/**
 * Create conversation with agreed price via API
 */
export async function createConversationWithPrice(
  token: string,
  vendorId: string,
  agreedPrice: number
): Promise<{ conversationId: string }> {
  // First create the conversation
  const createResponse = await fetch(`${API_URL}/api/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ vendorId }),
  });

  if (!createResponse.ok) {
    throw new Error(`Failed to create conversation: ${await createResponse.text()}`);
  }

  const conversation = await createResponse.json();
  const conversationId = conversation._id || conversation.id;

  // Set the agreed price
  const priceResponse = await fetch(`${API_URL}/api/conversations/${conversationId}/price`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ agreedPrice }),
  });

  if (!priceResponse.ok) {
    console.warn('Failed to set conversation price:', await priceResponse.text());
  }

  return { conversationId };
}

/**
 * Delete test booking via API (cleanup)
 */
export async function deleteTestBooking(
  token: string,
  bookingId: string
): Promise<void> {
  try {
    await fetch(`${API_URL}/api/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.warn('Failed to delete test booking:', error);
  }
}

/**
 * Get vendor ID from local storage (after login as user)
 */
export async function getTestVendorId(page: Page): Promise<string | null> {
  // Navigate to vendors page and get first vendor ID
  await page.goto('/vendors');
  await page.waitForLoadState('networkidle');

  const vendorLink = page.locator('a[href^="/vendors/"]').first();
  if (await vendorLink.isVisible()) {
    const href = await vendorLink.getAttribute('href');
    if (href) {
      const match = href.match(/\/vendors\/([^\/]+)/);
      return match ? match[1] : null;
    }
  }
  return null;
}
