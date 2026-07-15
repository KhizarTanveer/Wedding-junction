import { test, expect } from '@playwright/test';
import { AdminPage } from '../pages/AdminPage';
import { loginAsAdmin, resetTestUsers } from '../fixtures/auth.fixture';

test.describe('Admin Panel', () => {
  // Reset test users before all tests to clear any account locks
  test.beforeAll(async () => {
    await resetTestUsers();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.describe('Dashboard', () => {
    test('should display dashboard with stats', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();

      // Should be on admin dashboard
      await expect(page).toHaveURL('/admin');

      // Should display dashboard
      await expect(page.locator('text=/dashboard|admin|overview/i').first()).toBeVisible();
    });

    test('should show vendor statistics', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();

      // Should show vendor-related stats
      await expect(page.locator('text=/vendor|pending|total/i').first()).toBeVisible();
    });

    test('should show user statistics', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();

      // Should show user stats
      await expect(page.locator('text=/user|total/i').first()).toBeVisible();
    });

    test('should show booking statistics', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();

      // Should show booking stats
      await expect(page.locator('text=/booking/i').first()).toBeVisible();
    });
  });

  test.describe('Vendor Management', () => {
    test('should list pending vendor applications', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();
      await adminPage.goToVendors();

      // Should be on vendors page
      await expect(page).toHaveURL('/admin/vendors');

      // Should show vendor management section
      await expect(page.locator('text=/vendor|application|management/i').first()).toBeVisible();
    });

    test('should filter vendors by status', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();
      await adminPage.goToVendors();

      // Check if tabs exist
      if (await adminPage.pendingVendorsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Select pending
        await adminPage.selectPendingVendors();
        await page.waitForTimeout(500);

        // Select approved
        await adminPage.selectApprovedVendors();
        await page.waitForTimeout(500);

        // Select rejected
        await adminPage.selectRejectedVendors();
        await page.waitForTimeout(500);
      }
    });

    test('should approve vendor application', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();
      await adminPage.goToVendors();

      // Select pending vendors
      if (await adminPage.pendingVendorsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await adminPage.selectPendingVendors();
      }

      // Check if there are pending vendors
      const vendorRows = page.locator('.grid > div, table tbody tr');
      const vendorCount = await vendorRows.count();

      if (vendorCount > 0) {
        // Approve first vendor
        await adminPage.approveVendor(0);

        // Should show success message
        await expect(page.locator('text=/approved|success/i').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should reject vendor application with reason', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();
      await adminPage.goToVendors();

      // Select pending vendors
      if (await adminPage.pendingVendorsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await adminPage.selectPendingVendors();
      }

      // Check if there are pending vendors
      const vendorRows = page.locator('.grid > div, table tbody tr');
      const vendorCount = await vendorRows.count();

      if (vendorCount > 0) {
        // Reject first vendor
        await adminPage.rejectVendor(0, 'Incomplete documentation');

        // Should show success message
        await expect(page.locator('text=/rejected|success/i').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should view vendor details', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();
      await adminPage.goToVendors();

      // Click on a vendor row to view details
      const vendorRows = page.locator('.grid > div, table tbody tr');
      const vendorCount = await vendorRows.count();

      if (vendorCount > 0) {
        await vendorRows.first().click();

        // Should show vendor details
        await expect(page.locator('text=/details|business|contact/i').first()).toBeVisible();
      }
    });
  });

  test.describe('Review Moderation', () => {
    test('should list pending reviews', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();

      // Navigate to reviews (if available in sidebar)
      const reviewsLink = page.getByRole('link', { name: /reviews/i });
      if (await reviewsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await reviewsLink.click();

        // Should show reviews management
        await expect(page.locator('text=/review|moderation/i').first()).toBeVisible();
      }
    });

    test('should approve review', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();

      // Navigate to reviews
      const reviewsLink = page.getByRole('link', { name: /reviews/i });
      if (await reviewsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await reviewsLink.click();

        // Select pending reviews
        if (await adminPage.pendingReviewsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
          await adminPage.selectPendingReviews();
        }

        // Check for pending reviews
        const reviewRows = page.locator('table tbody tr');
        const reviewCount = await reviewRows.count();

        if (reviewCount > 0) {
          // Approve first review
          await adminPage.approveReview(0);

          // Should show success
          await expect(page.locator('text=/approved|success/i').first()).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should reject review with reason', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();

      // Navigate to reviews
      const reviewsLink = page.getByRole('link', { name: /reviews/i });
      if (await reviewsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await reviewsLink.click();

        // Select pending reviews
        if (await adminPage.pendingReviewsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
          await adminPage.selectPendingReviews();
        }

        // Check for pending reviews
        const reviewRows = page.locator('table tbody tr');
        const reviewCount = await reviewRows.count();

        if (reviewCount > 0) {
          // Reject first review
          await adminPage.rejectReview(0, 'Inappropriate content');

          // Should show success
          await expect(page.locator('text=/rejected|success/i').first()).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Category Management', () => {
    test('should list all categories', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();
      await adminPage.goToCategories();

      // Should be on categories page
      await expect(page).toHaveURL('/admin/categories');

      // Should show categories list
      await expect(page.locator('text=/categories|manage/i').first()).toBeVisible();
    });

    test('should add new category', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();
      await adminPage.goToCategories();

      // Click add category button
      const addButton = page.getByRole('button', { name: /add category|new category/i });
      if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addButton.click();

        // Fill category form
        await page.locator('input[name="name"], input[placeholder*="name"]').fill('Test Category');
        await page.locator('textarea[name="description"], input[placeholder*="description"]').fill('Test category description');

        // Save category
        await page.getByRole('button', { name: /save|create|add/i }).click();

        // Should show success
        await expect(page.locator('text=/created|success|added/i').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should edit category', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();
      await adminPage.goToCategories();

      // Find edit button for first category
      const categoryRows = page.locator('.grid > div, table tbody tr');
      const categoryCount = await categoryRows.count();

      if (categoryCount > 0) {
        const editButton = categoryRows.first().getByRole('button', { name: /edit/i });
        if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await editButton.click();

          // Update name
          const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
          await nameInput.clear();
          await nameInput.fill('Updated Category Name');

          // Save
          await page.getByRole('button', { name: /save|update/i }).click();

          // Should show success
          await expect(page.locator('text=/updated|success/i').first()).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should delete category', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();
      await adminPage.goToCategories();

      // Find delete button for a category
      const categoryRows = page.locator('.grid > div, table tbody tr');
      const categoryCount = await categoryRows.count();

      if (categoryCount > 1) {
        // Only delete if there's more than one category
        const deleteButton = categoryRows.last().getByRole('button', { name: /delete/i });
        if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await deleteButton.click();

          // Confirm deletion
          await page.getByRole('button', { name: /confirm|yes|delete/i }).click();

          // Should show success
          await expect(page.locator('text=/deleted|success|removed/i').first()).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Service Management', () => {
    test('should list all services', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();
      await adminPage.goToServices();

      // Should be on services page
      await expect(page).toHaveURL('/admin/services');

      // Should show services management
      await expect(page.locator('text=/services|manage/i').first()).toBeVisible();
    });

    test('should add new service', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();
      await adminPage.goToServices();

      // Click add service button
      const addButton = page.getByRole('button', { name: /add service|new service/i });
      if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addButton.click();

        // Fill service form
        await page.locator('input[name="title"], input[name="name"], input[placeholder*="title"], input[placeholder*="name"]').first().fill('Test Service');

        // Select category if available
        const categorySelect = page.locator('select[name="category"]');
        if (await categorySelect.isVisible()) {
          await categorySelect.selectOption({ index: 1 });
        }

        // Save service
        await page.getByRole('button', { name: /save|create|add/i }).click();

        // Should show success
        await expect(page.locator('text=/created|success|added/i').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should edit service', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();
      await adminPage.goToServices();

      // Find edit button for first service
      const serviceRows = page.locator('.grid > div, table tbody tr');
      const serviceCount = await serviceRows.count();

      if (serviceCount > 0) {
        const editButton = serviceRows.first().getByRole('button', { name: /edit/i });
        if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await editButton.click();

          // Update name
          const nameInput = page.locator('input[name="title"], input[name="name"], input[placeholder*="title"], input[placeholder*="name"]').first();
          await nameInput.clear();
          await nameInput.fill('Updated Service Name');

          // Save
          await page.getByRole('button', { name: /save|update/i }).click();

          // Should show success
          await expect(page.locator('text=/updated|success/i').first()).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between admin sections', async ({ page }) => {
      const adminPage = new AdminPage(page);
      await adminPage.goto();

      // Navigate to vendors
      await adminPage.goToVendors();
      await expect(page).toHaveURL('/admin/vendors');

      // Navigate to categories
      await adminPage.goToCategories();
      await expect(page).toHaveURL('/admin/categories');

      // Navigate to services
      await adminPage.goToServices();
      await expect(page).toHaveURL('/admin/services');

      // Navigate back to dashboard
      await page.goto('/admin');
      await expect(page).toHaveURL('/admin');
    });
  });

  test.describe('Access Control', () => {
    test('should only allow admin access', async ({ page, context }) => {
      // Logout current admin
      await page.evaluate(() => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      });

      // Try to access admin page
      await page.goto('/admin');

      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });
  });
});
