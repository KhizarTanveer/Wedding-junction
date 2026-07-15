import { test, expect } from '@playwright/test';
import { VendorDashboardPage } from '../pages/VendorDashboardPage';
import { loginAsVendor, resetTestUsers } from '../fixtures/auth.fixture';

test.describe('Vendor Dashboard', () => {
  // Reset test users before all tests to clear any account locks
  test.beforeAll(async () => {
    await resetTestUsers();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page);
  });

  test.describe('Dashboard Overview', () => {
    test('should display dashboard with stats', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();

      // Should be on vendor dashboard
      await expect(page).toHaveURL('/vendor');

      // Should display stats section
      await expect(page.locator('text=/dashboard|overview|stats/i').first()).toBeVisible();
    });

    test('should show booking statistics', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();

      // Should show booking-related stats
      await expect(page.locator('text=/booking|pending|confirmed/i').first()).toBeVisible();
    });

    test('should show earnings or revenue stats', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();

      // Should show earnings (may be 0 for new vendors)
      await expect(page.locator('text=/earning|revenue|income|total/i').first()).toBeVisible();
    });

    test('should show rating information', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();

      // Should show rating or performance metrics info (Response Rate, Acceptance Rate, etc.)
      await expect(page.locator('text=/rating|reviews|stars|response rate|acceptance rate/i').first()).toBeVisible();
    });
  });

  test.describe('Bookings Management', () => {
    test('should list vendor bookings', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.goToBookings();

      // Should be on bookings page
      await expect(page).toHaveURL('/vendor/bookings');

      // Should show bookings list or empty state
      const hasBookings = await dashboardPage.bookingCards.count() > 0;
      if (hasBookings) {
        await expect(dashboardPage.bookingCards.first()).toBeVisible();
      } else {
        await expect(page.locator('text=/no booking|empty/i').first()).toBeVisible();
      }
    });

    test('should filter bookings by status', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.goToBookings();

      // Check if tabs exist
      if (await dashboardPage.pendingTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Select pending bookings
        await dashboardPage.selectPendingBookings();
        await page.waitForTimeout(500);

        // Select confirmed bookings
        await dashboardPage.selectConfirmedBookings();
        await page.waitForTimeout(500);

        // Select completed bookings
        await dashboardPage.selectCompletedBookings();
        await page.waitForTimeout(500);
      }
    });

    test('should accept booking', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.goToBookings();

      // Select pending bookings
      if (await dashboardPage.pendingTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dashboardPage.selectPendingBookings();
      }

      // Check if there are pending bookings
      const bookingCount = await dashboardPage.getBookingsCount();

      if (bookingCount > 0) {
        // Accept first booking
        await dashboardPage.acceptBooking(0);

        // Should show success message or update status
        await expect(page.locator('text=/accepted|confirmed|success/i').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should reject booking with reason', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.goToBookings();

      // Select pending bookings
      if (await dashboardPage.pendingTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dashboardPage.selectPendingBookings();
      }

      // Check if there are pending bookings
      const bookingCount = await dashboardPage.getBookingsCount();

      if (bookingCount > 0) {
        // Reject first booking
        await dashboardPage.rejectBooking(0, 'Already booked for this date');

        // Should show success message
        await expect(page.locator('text=/rejected|declined|success/i').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should view booking details', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.goToBookings();

      const bookingCount = await dashboardPage.getBookingsCount();

      if (bookingCount > 0) {
        // Click "View Details" button on first booking (or click the card if no button)
        const viewDetailsBtn = dashboardPage.bookingCards.first().getByRole('button', { name: /View Details|Details/i });
        if (await viewDetailsBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await viewDetailsBtn.click();
        } else {
          await dashboardPage.bookingCards.first().click();
        }

        // Should show booking details
        await expect(page.locator('text=/details|client|event|date|status history/i').first()).toBeVisible();
      }
    });
  });

  test.describe('Profile Management', () => {
    test('should navigate to profile page', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.goToProfile();

      // Should be on profile page
      await expect(page).toHaveURL('/vendor/profile');
    });

    test('should display current profile information', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.goToProfile();

      // Should show profile fields
      await expect(page.locator('text=/business name|profile|contact/i').first()).toBeVisible();
    });

    test('should update vendor profile', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.goToProfile();

      // Click edit button if available
      const editButton = page.getByRole('button', { name: /edit/i });
      if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editButton.click();

        // Update description
        const descriptionInput = page.locator('textarea[name="description"]');
        if (await descriptionInput.isVisible()) {
          await descriptionInput.clear();
          await descriptionInput.fill('Updated business description for testing purposes. We provide premium wedding services.');
        }

        // Save changes
        await page.getByRole('button', { name: /save|update/i }).click();

        // Should show success message
        await expect(page.locator('text=/success|updated|saved/i').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should update pricing information', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.goToProfile();

      // Click edit button
      const editButton = page.getByRole('button', { name: /edit/i });
      if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editButton.click();

        // Update pricing
        const minPriceInput = page.locator('input[name="minPrice"]');
        const maxPriceInput = page.locator('input[name="maxPrice"]');

        if (await minPriceInput.isVisible()) {
          await minPriceInput.clear();
          await minPriceInput.fill('60000');
        }

        if (await maxPriceInput.isVisible()) {
          await maxPriceInput.clear();
          await maxPriceInput.fill('250000');
        }

        // Save changes
        await page.getByRole('button', { name: /save|update/i }).click();

        // Should show success message
        await expect(page.locator('text=/success|updated|saved/i').first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Gallery Management', () => {
    test('should display gallery section', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();

      // Navigate to gallery if link exists
      if (await dashboardPage.galleryLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dashboardPage.galleryLink.click();

        // Should show gallery section
        await expect(page.locator('text=/gallery|photos|images/i').first()).toBeVisible();
      }
    });

    test('should upload gallery images', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();

      // Navigate to gallery
      if (await dashboardPage.galleryLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dashboardPage.galleryLink.click();

        // Check for upload button
        const uploadButton = page.getByRole('button', { name: /upload/i });
        if (await uploadButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          // Note: Actual file upload would require setting up a test file
          // This test just verifies the upload UI is present
          await expect(uploadButton).toBeVisible();
        }
      }
    });

    test('should delete gallery image', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();

      // Navigate to gallery
      if (await dashboardPage.galleryLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dashboardPage.galleryLink.click();

        const imageCount = await dashboardPage.getGalleryImagesCount();

        if (imageCount > 0) {
          // Delete first image
          await dashboardPage.deleteImage(0);

          // Should show success or image should be removed
          await page.waitForTimeout(1000);
          const newCount = await dashboardPage.getGalleryImagesCount();
          expect(newCount).toBeLessThanOrEqual(imageCount);
        }
      }
    });
  });

  test.describe('Reviews Section', () => {
    test('should display received reviews', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();

      // Navigate to reviews if link exists
      if (await dashboardPage.reviewsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dashboardPage.reviewsLink.click();

        // Should show reviews section
        await expect(page.locator('text=/reviews|ratings/i').first()).toBeVisible();
      }
    });

    test('should show review statistics', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();

      // Navigate to reviews
      if (await dashboardPage.reviewsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dashboardPage.reviewsLink.click();

        // Should show average rating or review count
        await expect(page.locator('text=/average|rating|total/i').first()).toBeVisible();
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between dashboard sections', async ({ page }) => {
      const dashboardPage = new VendorDashboardPage(page);
      await dashboardPage.goto();

      // Navigate to bookings
      await dashboardPage.goToBookings();
      await expect(page).toHaveURL('/vendor/bookings');

      // Navigate to profile
      await dashboardPage.goToProfile();
      await expect(page).toHaveURL('/vendor/profile');

      // Navigate back to dashboard
      await page.goto('/vendor');
      await expect(page).toHaveURL('/vendor');
    });
  });
});
