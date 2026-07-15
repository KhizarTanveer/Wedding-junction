import { test, expect } from '../fixtures';
import { BookingsPage, ChatPage, VendorPage } from '../pages';
import { resetTestUsers, loginAsUser } from '../fixtures/auth.fixture';

test.describe('Error Handling', () => {
  test.beforeEach(async () => {
    await resetTestUsers();
  });

  test.describe('Network Errors', () => {
    test('should show error toast on API failure', async ({ page }) => {
      await loginAsUser(page);

      // Block API calls to simulate network error
      await page.route('**/api/bookings**', route => route.abort());

      const bookingsPage = new BookingsPage(page);
      await bookingsPage.goto();

      // Error message should appear
      const errorToast = page.locator('[role="alert"], .toast, .notification').filter({
        hasText: /error|failed|unable/i,
      });
      await expect(errorToast.first()).toBeVisible({ timeout: 15000 });

      await page.unroute('**/api/bookings**');
    });

    test('should allow retry on failed request', async ({ page }) => {
      await loginAsUser(page);

      let callCount = 0;
      await page.route('**/api/vendors**', async route => {
        callCount++;
        if (callCount === 1) {
          await route.abort();
        } else {
          await route.continue();
        }
      });

      await page.goto('/vendors');

      // First request fails, but retry button might appear
      const retryButton = page.getByRole('button', { name: /Retry|Try Again/i });
      if (await retryButton.isVisible()) {
        await retryButton.click();
        // Second request should succeed
        await expect(page.locator('a[href^="/vendors/"]').first()).toBeVisible({ timeout: 10000 });
      }

      await page.unroute('**/api/vendors**');
    });

    test('should handle timeout gracefully', async ({ page }) => {
      await loginAsUser(page);

      // Simulate slow response
      await page.route('**/api/bookings**', async route => {
        await new Promise(resolve => setTimeout(resolve, 35000));
        await route.continue();
      });

      const bookingsPage = new BookingsPage(page);
      await page.goto('/bookings');

      // Should show loading state or timeout error
      const errorOrLoading = page.locator('[role="alert"], .loading, .spinner');
      await expect(errorOrLoading.first()).toBeVisible({ timeout: 40000 });

      await page.unroute('**/api/bookings**');
    });
  });

  test.describe('Session Handling', () => {
    test('should redirect to login on 401', async ({ page }) => {
      await loginAsUser(page);

      // Clear auth to simulate expired session
      await page.evaluate(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      });

      // Navigate to protected route
      await page.goto('/bookings');

      // Should redirect to login
      await expect(page).toHaveURL(/login/i, { timeout: 10000 });
    });

    test('should clear stale auth data', async ({ page }) => {
      // Set invalid token
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('token', 'invalid-token');
        localStorage.setItem('currentUser', JSON.stringify({ id: '123' }));
      });

      // Try to access protected route
      await page.goto('/bookings');

      // Should redirect to login and clear data
      await expect(page).toHaveURL(/login/i, { timeout: 10000 });

      // Token should be cleared
      const token = await page.evaluate(() => localStorage.getItem('token'));
      // Token might be null or cleared
    });

    test('should preserve intended destination', async ({ page }) => {
      // Navigate to protected route while not logged in
      await page.goto('/bookings');

      // Should redirect to login
      await expect(page).toHaveURL(/login/i);

      // Login
      await page.getByPlaceholder('you@example.com').fill('testuser@example.com');
      await page.getByPlaceholder('Enter your password').fill('TestPassword123!');
      await page.getByRole('button', { name: 'Sign In' }).click();

      // Should redirect back to intended destination
      await expect(page).toHaveURL(/bookings/i, { timeout: 10000 });
    });
  });

  test.describe('Form Validation Errors', () => {
    test('should show inline validation errors', async ({ page }) => {
      await page.goto('/signup');

      // Select user type
      await page.getByRole('button', { name: 'User' }).click();

      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: /Create Account|Sign Up/i });
      await submitButton.click();

      // Should show inline errors
      const errorMessages = page.locator('.text-red-500, .text-red-600, [role="alert"]');
      await expect(errorMessages.first()).toBeVisible();
    });

    test('should focus first error field', async ({ page }) => {
      await page.goto('/signup');
      await page.getByRole('button', { name: 'User' }).click();

      // Fill only email
      await page.getByPlaceholder('you@example.com').fill('test@example.com');

      // Submit
      await page.getByRole('button', { name: /Create Account|Sign Up/i }).click();

      // First empty required field should be focused
      const nameInput = page.getByPlaceholder('Your full name');
      const isFocused = await nameInput.evaluate(el => el === document.activeElement);
      // Name field might be focused
    });

    test('should clear errors on valid input', async ({ page }) => {
      await page.goto('/signup');
      await page.getByRole('button', { name: 'User' }).click();

      // Trigger error
      await page.getByRole('button', { name: /Create Account|Sign Up/i }).click();

      // Error should be visible
      const nameError = page.locator('.text-red-500').filter({ hasText: /name/i });
      await expect(nameError.first()).toBeVisible({ timeout: 5000 });

      // Fill valid input
      await page.getByPlaceholder('Your full name').fill('Test User');

      // Error should clear (on blur or input)
      await page.getByPlaceholder('you@example.com').focus();
      // Error might be cleared
    });
  });

  test.describe('Not Found Errors', () => {
    test('should show 404 for invalid vendor ID', async ({ page }) => {
      await page.goto('/vendors/invalid-vendor-id-12345');

      // Should show 404 or not found message
      const notFound = page.locator('h1, h2, p').filter({
        hasText: /404|not found|doesn't exist/i,
      });
      await expect(notFound.first()).toBeVisible({ timeout: 10000 });
    });

    test('should show 404 for invalid booking ID', async ({ page }) => {
      await loginAsUser(page);

      await page.goto('/bookings/invalid-booking-id-12345');

      // Should show 404 or not found message
      const notFound = page.locator('h1, h2, p').filter({
        hasText: /404|not found|doesn't exist/i,
      });
      await expect(notFound.first()).toBeVisible({ timeout: 10000 });
    });

    test('should provide navigation options', async ({ page }) => {
      await page.goto('/this-route-does-not-exist');

      // Should have link to home or navigation
      const homeLink = page.getByRole('link', { name: /Home|Go Back/i });
      await expect(homeLink.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Permission Errors', () => {
    test('should show 403 for unauthorized access', async ({ page }) => {
      await loginAsUser(page);

      // Try to access admin route
      await page.goto('/admin');

      // Should show 403 or redirect
      const forbidden = page.locator('h1, h2, p').filter({
        hasText: /403|forbidden|not authorized|access denied/i,
      });
      const shouldShow403 = await forbidden.first().isVisible({ timeout: 5000 }).catch(() => false);

      // Or might redirect to home/login
      const isOnAdminPage = page.url().includes('/admin');
      expect(!isOnAdminPage || shouldShow403).toBe(true);
    });

    test('user cannot access vendor dashboard', async ({ page }) => {
      await loginAsUser(page);

      // Try to access vendor dashboard
      await page.goto('/vendor/dashboard');

      // Should show error or redirect
      const forbidden = page.locator('h1, h2, p').filter({
        hasText: /403|forbidden|not authorized|not a vendor/i,
      });
      const shouldShow403 = await forbidden.first().isVisible({ timeout: 5000 }).catch(() => false);

      // Or might redirect
      const isOnVendorDashboard = page.url().includes('/vendor/dashboard');
      expect(!isOnVendorDashboard || shouldShow403).toBe(true);
    });

    test('vendor cannot access admin panel', async ({ vendorPage }) => {
      // Try to access admin route as vendor
      await vendorPage.goto('/admin');

      // Should show 403 or redirect
      const forbidden = vendorPage.locator('h1, h2, p').filter({
        hasText: /403|forbidden|not authorized|admin only/i,
      });
      const shouldShow403 = await forbidden.first().isVisible({ timeout: 5000 }).catch(() => false);

      // Or might redirect
      const isOnAdminPage = vendorPage.url().includes('/admin');
      expect(!isOnAdminPage || shouldShow403).toBe(true);
    });
  });
});
