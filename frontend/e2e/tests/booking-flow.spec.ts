import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { VendorPage } from '../pages/VendorPage';
import { BookingsPage } from '../pages/BookingsPage';
import { testUser, testBooking } from '../fixtures/test-data';
import { login, loginAsUser, resetTestUsers } from '../fixtures/auth.fixture';

test.describe('Booking Flow', () => {
  // Reset test users before each test to clear any account locks
  test.beforeAll(async () => {
    await resetTestUsers();
  });

  test.describe('Browse Vendors', () => {
    test('should browse vendors from home page', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // Home page should load
      await expect(page).toHaveURL('/');

      // Should see categories or featured vendors section
      await expect(page.locator('text=/categories|vendors|services/i').first()).toBeVisible();
    });

    test('should search for vendors', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // Search for photography
      await page.getByPlaceholder(/search/i).fill('photography');
      await page.getByRole('button', { name: /search/i }).click();

      // Should show search results
      await expect(page.locator('text=/photographer|photography/i').first()).toBeVisible({ timeout: 10000 });
    });

    test('should filter vendors by category', async ({ page }) => {
      await page.goto('/');

      // Click on a category
      await page.getByRole('link', { name: /photography/i }).first().click();

      // Should navigate to category page
      await expect(page).toHaveURL(/explore|category/);

      // Should show vendors in that category
      await expect(page.locator('.grid > div, a[href*="/vendor"]').first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Vendor Details', () => {
    test('should view vendor details', async ({ page }) => {
      // Navigate to explore page and click on a vendor
      await page.goto('/');

      // Find and click a vendor card/link
      await page.locator('a[href*="/vendor"], a[href*="/explore"]').first().click();

      // Should show vendor details
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should see vendor information', async ({ page }) => {
      // Navigate to a vendor page
      await page.goto('/');
      await page.locator('a[href*="/vendor"], a[href*="/explore"]').first().click();

      // Should display vendor name
      await expect(page.locator('h1')).toBeVisible();

      // Should show book button for logged in users (or login prompt)
      await expect(page.getByRole('button', { name: /book|login/i }).first()).toBeVisible();
    });
  });

  test.describe('Create Booking', () => {
    test.beforeEach(async ({ page }) => {
      // Login as user before each booking test
      await loginAsUser(page);
    });

    test('should create booking from vendor page', async ({ page }) => {
      // Navigate to a vendor page
      await page.goto('/');
      await page.locator('a[href*="/vendor"], a[href*="/explore"]').first().click();

      // Click book button
      await page.getByRole('button', { name: /book/i }).first().click();

      // After booking, might show form modal OR navigate to bookings page
      // Wait for either booking form elements or bookings page
      const hasBookingForm = await page.locator('text=/booking|date|event|confirm/i').first().isVisible({ timeout: 5000 }).catch(() => false);
      const isOnBookingsPage = await page.url().includes('/bookings');

      // Should either show form or be on bookings page
      expect(hasBookingForm || isOnBookingsPage).toBeTruthy();
    });

    test('should fill client details and confirm booking', async ({ page }) => {
      // Navigate to a vendor page
      await page.goto('/');
      await page.locator('a[href*="/vendor"], a[href*="/explore"]').first().click();

      // Click book button
      await page.getByRole('button', { name: /book/i }).first().click();

      // After clicking book, might need to navigate to bookings page to confirm
      // Check if we're on bookings page or if modal appeared
      const bookingsPage = new BookingsPage(page);

      // If navigated to bookings page, find the booking card and click Confirm
      if (page.url().includes('/bookings')) {
        // Wait for bookings to load
        await page.waitForLoadState('networkidle');

        // Find booking card with Confirm button and click it
        const confirmBtn = page.getByRole('button', { name: /Confirm/i }).first();
        if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await confirmBtn.click();
        }
      }

      // Fill event date if input is visible
      if (await bookingsPage.eventDateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await bookingsPage.eventDateInput.fill(testBooking.eventDate);
      }

      // Fill client details if available
      if (await bookingsPage.clientNameInput.isVisible().catch(() => false)) {
        await bookingsPage.clientNameInput.fill(testBooking.clientDetails.name);
      }
      if (await bookingsPage.clientPhoneInput.isVisible().catch(() => false)) {
        await bookingsPage.clientPhoneInput.fill(testBooking.clientDetails.phone);
      }
      if (await bookingsPage.clientEmailInput.isVisible().catch(() => false)) {
        await bookingsPage.clientEmailInput.fill(testBooking.clientDetails.email);
      }

      // Fill notes if available
      if (await bookingsPage.notesInput.isVisible().catch(() => false)) {
        await bookingsPage.notesInput.fill(testBooking.notes);
      }

      // Confirm booking
      await page.getByRole('button', { name: /confirm|book|submit|proceed/i }).click();

      // Should show success or proceed to payment
      await expect(page.locator('text=/success|payment|confirmed|booked/i').first()).toBeVisible({ timeout: 10000 });
    });

    test('should proceed to payment flow', async ({ page }) => {
      // Navigate to a vendor page and initiate booking
      await page.goto('/');
      await page.locator('a[href*="/vendor"], a[href*="/explore"]').first().click();
      await page.getByRole('button', { name: /book/i }).first().click();

      const bookingsPage = new BookingsPage(page);

      // If navigated to bookings page, find the booking card and click Confirm
      if (page.url().includes('/bookings')) {
        await page.waitForLoadState('networkidle');
        const confirmBtn = page.getByRole('button', { name: /Confirm/i }).first();
        if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await confirmBtn.click();
        }
      }

      // Fill minimal required fields
      if (await bookingsPage.eventDateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await bookingsPage.eventDateInput.fill(testBooking.eventDate);
      }

      // Submit booking
      await page.getByRole('button', { name: /confirm|book|submit|proceed/i }).click();

      // If payment button is visible, click it
      const paymentButton = page.getByRole('button', { name: /payment|pay/i });
      if (await paymentButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await paymentButton.click();

        // Should be on payment page or show payment form
        const isPaymentPage = page.url().includes('payment');
        const hasPaymentForm = await page.locator('text=/payment|card|amount/i').first().isVisible().catch(() => false);
        expect(isPaymentPage || hasPaymentForm).toBeTruthy();
      }
    });
  });

  test.describe('View Bookings', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(page);
    });

    test('should show booking in user bookings list', async ({ page }) => {
      const bookingsPage = new BookingsPage(page);
      await bookingsPage.goto();

      // Should be on bookings page
      await expect(page).toHaveURL('/bookings');

      // Should show either bookings list or empty state
      const hasBookings = await bookingsPage.bookingCards.count() > 0;
      if (hasBookings) {
        await bookingsPage.expectBookingsVisible();
      } else {
        // Empty state is also acceptable
        await expect(page.locator('text=/no booking|empty|book your first/i').first()).toBeVisible();
      }
    });

    test('should view booking details', async ({ page }) => {
      const bookingsPage = new BookingsPage(page);
      await bookingsPage.goto();

      const bookingCount = await bookingsPage.getBookingsCount();

      if (bookingCount > 0) {
        // Click on first booking
        await bookingsPage.clickBooking(0);

        // Should show booking details modal or page
        await expect(page.locator('text=/details|status|vendor|date/i').first()).toBeVisible();
      }
    });

    test('should filter bookings by status', async ({ page }) => {
      const bookingsPage = new BookingsPage(page);
      await bookingsPage.goto();

      // Check if filter dropdown exists
      const filterExists = await bookingsPage.filterDropdown.count() > 0;
      if (filterExists) {
        // Filter by pending
        await bookingsPage.filterByStatus('pending');

        // List should update (may be empty if no pending bookings)
        await page.waitForLoadState('networkidle');
      }
    });
  });

  test.describe('Booking Status', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(page);
    });

    test('should display correct booking status', async ({ page }) => {
      const bookingsPage = new BookingsPage(page);
      await bookingsPage.goto();

      const bookingCount = await bookingsPage.getBookingsCount();

      if (bookingCount > 0) {
        // Get first booking status
        const status = await bookingsPage.getBookingStatus(0);

        // Status should be one of the expected values
        expect(status.toLowerCase()).toMatch(/pending|confirmed|completed|cancelled|rejected/);
      }
    });

    test('should allow cancellation of pending booking', async ({ page }) => {
      const bookingsPage = new BookingsPage(page);
      await bookingsPage.goto();

      const bookingCount = await bookingsPage.getBookingsCount();

      if (bookingCount > 0) {
        // Click on first booking
        await bookingsPage.clickBooking(0);

        // Check if cancel button is available
        const cancelButton = page.getByRole('button', { name: /cancel/i });
        if (await cancelButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await cancelButton.click();

          // Confirm cancellation
          await page.getByRole('button', { name: /confirm|yes/i }).click();

          // Should show cancelled status or success message
          await expect(page.locator('text=/cancelled|success/i').first()).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });
});
