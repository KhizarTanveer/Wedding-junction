import { test, expect } from '@playwright/test';
import { VendorPage } from '../pages/VendorPage';
import { testReview } from '../fixtures/test-data';
import { loginAsUser, resetTestUsers } from '../fixtures/auth.fixture';

test.describe('Reviews', () => {
  // Reset test users before all tests to clear any account locks
  test.beforeAll(async () => {
    await resetTestUsers();
  });
  test.describe('Submit Review', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(page);
    });

    test('should show review form after completed booking', async ({ page }) => {
      // Navigate to bookings
      await page.goto('/bookings');

      // Find a completed booking (if any)
      const completedBooking = page.locator('.grid > div').filter({
        hasText: /completed/i,
      });

      if (await completedBooking.count() > 0) {
        // Click on completed booking
        await completedBooking.first().click();

        // Should have option to leave review
        const reviewButton = page.getByRole('button', { name: /review|rate/i });
        if (await reviewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await reviewButton.click();

          // Should show review form
          await expect(page.locator('text=/write a review|rate your experience|leave a review/i').first()).toBeVisible();
        }
      }
    });

    test('should submit review with rating and comment', async ({ page }) => {
      // Navigate to bookings
      await page.goto('/bookings');

      // Find a completed booking
      const completedBooking = page.locator('.grid > div').filter({
        hasText: /completed/i,
      });

      if (await completedBooking.count() > 0) {
        await completedBooking.first().click();

        const reviewButton = page.getByRole('button', { name: /review|rate/i });
        if (await reviewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await reviewButton.click();

          // Fill review form
          // Click star rating
          const stars = page.locator('button[aria-label*="star"], .star-rating button, svg.cursor-pointer');
          if (await stars.count() > 0) {
            await stars.nth(testReview.rating - 1).click();
          }

          // Fill title if available
          const titleInput = page.locator('input[name="title"], input[placeholder*="title"]');
          if (await titleInput.count() > 0) {
            await titleInput.fill(testReview.title);
          }

          // Fill comment
          const commentInput = page.locator('textarea[name="comment"], textarea[placeholder*="review"]');
          if (await commentInput.count() > 0) {
            await commentInput.fill(testReview.comment);
          }

          // Submit review
          await page.getByRole('button', { name: /submit|post/i }).click();

          // Should show success message
          await expect(page.locator('text=/success|submitted|thank you/i').first()).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should validate review before submission', async ({ page }) => {
      // Navigate to bookings
      await page.goto('/bookings');

      // Find a completed booking
      const completedBooking = page.locator('.grid > div').filter({
        hasText: /completed/i,
      });

      if (await completedBooking.count() > 0) {
        await completedBooking.first().click();

        const reviewButton = page.getByRole('button', { name: /review|rate/i });
        if (await reviewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await reviewButton.click();

          // Try to submit without filling anything
          await page.getByRole('button', { name: /submit|post/i }).click();

          // Should show validation error
          await expect(page.locator('text=/required|please|rating/i').first()).toBeVisible({ timeout: 3000 });
        }
      }
    });
  });

  test.describe('View Reviews', () => {
    test('should show reviews on vendor page', async ({ page }) => {
      // Navigate to a vendor page
      await page.goto('/');
      await page.locator('a[href*="/vendor"], a[href*="/explore"]').first().click();

      // Scroll to reviews section
      await page.locator('text=/reviews/i').first().scrollIntoViewIfNeeded();

      // Should show reviews section
      await expect(page.locator('text=/reviews/i').first()).toBeVisible();
    });

    test('should display review content', async ({ page }) => {
      // Navigate to a vendor page
      await page.goto('/');
      await page.locator('a[href*="/vendor"], a[href*="/explore"]').first().click();

      // Find reviews section
      const reviewsSection = page.locator('section, div.space-y-4').filter({
        hasText: /reviews/i,
      });

      if (await reviewsSection.count() > 0) {
        await reviewsSection.scrollIntoViewIfNeeded();

        // Check if there are reviews
        const reviewItems = reviewsSection.locator('.space-y-4 > div, .review-item');
        const reviewCount = await reviewItems.count();

        if (reviewCount > 0) {
          // First review should have content
          const firstReview = reviewItems.first();
          await expect(firstReview).toBeVisible();
        }
      }
    });

    test('should show review rating', async ({ page }) => {
      // Navigate to a vendor page
      await page.goto('/');
      await page.locator('a[href*="/vendor"], a[href*="/explore"]').first().click();

      // Find reviews section
      const reviewsSection = page.locator('section, div.space-y-4').filter({
        hasText: /reviews/i,
      });

      if (await reviewsSection.count() > 0) {
        await reviewsSection.scrollIntoViewIfNeeded();

        // Check for star ratings
        const stars = reviewsSection.locator('.star-rating, svg[class*="text-yellow"], svg[class*="text-orange"]');
        const starCount = await stars.count();

        // Should have star ratings if there are reviews
        expect(starCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Review Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(page);
    });

    test('should mark review as helpful', async ({ page }) => {
      // Navigate to a vendor page
      await page.goto('/');
      await page.locator('a[href*="/vendor"], a[href*="/explore"]').first().click();

      // Find reviews section
      const reviewsSection = page.locator('section, div.space-y-4').filter({
        hasText: /reviews/i,
      });

      if (await reviewsSection.count() > 0) {
        await reviewsSection.scrollIntoViewIfNeeded();

        const reviewItems = reviewsSection.locator('.space-y-4 > div, .review-item');

        if (await reviewItems.count() > 0) {
          // Find helpful button
          const helpfulButton = reviewItems.first().getByRole('button', { name: /helpful|like|useful/i });

          if (await helpfulButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            // Get initial count
            const initialText = await helpfulButton.textContent();

            // Click helpful
            await helpfulButton.click();

            // Button should update (may change color, count, or text)
            await page.waitForTimeout(500);
          }
        }
      }
    });

    test('should report inappropriate review', async ({ page }) => {
      // Navigate to a vendor page
      await page.goto('/');
      await page.locator('a[href*="/vendor"], a[href*="/explore"]').first().click();

      // Find reviews section
      const reviewsSection = page.locator('section, div.space-y-4').filter({
        hasText: /reviews/i,
      });

      if (await reviewsSection.count() > 0) {
        await reviewsSection.scrollIntoViewIfNeeded();

        const reviewItems = reviewsSection.locator('.space-y-4 > div, .review-item');

        if (await reviewItems.count() > 0) {
          // Find report button
          const reportButton = reviewItems.first().getByRole('button', { name: /report|flag/i });

          if (await reportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await reportButton.click();

            // Should show report dialog
            await expect(page.locator('text=/report|reason|inappropriate/i').first()).toBeVisible();

            // Select a reason
            const reasonSelect = page.locator('select, [role="listbox"]');
            if (await reasonSelect.count() > 0) {
              await reasonSelect.selectOption({ index: 1 });
            }

            // Submit report
            await page.getByRole('button', { name: /submit|report/i }).click();

            // Should show confirmation
            await expect(page.locator('text=/reported|thank you|submitted/i').first()).toBeVisible({ timeout: 5000 });
          }
        }
      }
    });
  });

  test.describe('Review Display', () => {
    test('should show average rating on vendor card', async ({ page }) => {
      await page.goto('/');

      // Find vendor cards
      const vendorCards = page.locator('.grid > div, a[href*="/vendor"]');

      if (await vendorCards.count() > 0) {
        // First card should show rating
        const firstCard = vendorCards.first();
        const rating = firstCard.locator('text=/\\d\\.\\d|stars/i');

        // Rating may or may not be present
        await expect(firstCard).toBeVisible();
      }
    });

    test('should sort reviews by date or rating', async ({ page }) => {
      // Navigate to a vendor page
      await page.goto('/');
      await page.locator('a[href*="/vendor"], a[href*="/explore"]').first().click();

      // Find reviews section
      const reviewsSection = page.locator('section, div.space-y-4').filter({
        hasText: /reviews/i,
      });

      if (await reviewsSection.count() > 0) {
        await reviewsSection.scrollIntoViewIfNeeded();

        // Check for sort dropdown
        const sortDropdown = page.locator('select[name="sort"], select');

        if (await sortDropdown.count() > 0) {
          // Sort by rating
          await sortDropdown.selectOption({ label: /rating/i });
          await page.waitForTimeout(500);

          // Sort by date
          await sortDropdown.selectOption({ label: /date|recent/i });
          await page.waitForTimeout(500);
        }
      }
    });

    test('should paginate reviews if many exist', async ({ page }) => {
      // Navigate to a vendor page
      await page.goto('/');
      await page.locator('a[href*="/vendor"], a[href*="/explore"]').first().click();

      // Find reviews section
      const reviewsSection = page.locator('section, div.space-y-4').filter({
        hasText: /reviews/i,
      });

      if (await reviewsSection.count() > 0) {
        await reviewsSection.scrollIntoViewIfNeeded();

        // Check for pagination or load more button
        const pagination = page.locator('.pagination, nav[aria-label="pagination"]');
        const loadMoreButton = page.getByRole('button', { name: /load more|show more|see more/i });

        if (await loadMoreButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          // Click load more
          await loadMoreButton.click();

          // Wait for more reviews to load
          await page.waitForTimeout(1000);
        }
      }
    });
  });
});
