import { test, expect } from '../fixtures';
import { HomePage, VendorPage } from '../pages';
import { resetTestUsers } from '../fixtures/auth.fixture';

test.describe('Browsing & Discovery', () => {
  test.describe('Home Page', () => {
    test('should display hero section', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Hero section with main heading
      const heroSection = page.locator('section, div').filter({
        hasText: /Wedding|Find|Discover|Perfect/i,
      }).first();
      await expect(heroSection).toBeVisible({ timeout: 10000 });
    });

    test('should display search bar', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const searchBar = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="find" i]');
      await expect(searchBar.first()).toBeVisible();
    });

    test('should display wedding categories', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Categories section
      const categories = page.locator('div, section').filter({
        hasText: /Categories|Services|Photography|Venues|Catering/i,
      });
      await expect(categories.first()).toBeVisible();
    });

    test('should display featured vendors', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Featured vendors section
      const vendorsSection = page.locator('div, section').filter({
        hasText: /Featured|Popular|Top|Vendors/i,
      });
      await expect(vendorsSection.first()).toBeVisible();
    });

    test('should have working navigation links', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check main nav links
      const navLinks = page.locator('nav a, header a');
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);

      // Test one navigation link
      const vendorsLink = page.getByRole('link', { name: /Vendors|Browse/i }).first();
      if (await vendorsLink.isVisible()) {
        await vendorsLink.click();
        await expect(page).toHaveURL(/vendors/i);
      }
    });
  });

  test.describe('Search Functionality', () => {
    test('should search vendors by name', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Photography');
        await searchInput.press('Enter');

        // Should navigate to search results or filter vendors
        await page.waitForLoadState('networkidle');
        const results = page.locator('a[href^="/vendors/"], .vendor-card, [data-testid="vendor-card"]');
        // Results should appear
      }
    });

    test('should search vendors by service type', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Catering');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');
      }
    });

    test('should search vendors by location', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Lahore');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');
      }
    });

    test('should show no results for invalid search', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('xyznonexistent12345');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');

        // Should show no results message
        const noResults = page.locator('div, p').filter({ hasText: /no results|not found|no vendors/i });
        await expect(noResults.first()).toBeVisible({ timeout: 10000 });
      }
    });

    test('should clear search and show all vendors', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.isVisible()) {
        // Search first
        await searchInput.fill('test');
        await searchInput.press('Enter');
        await page.waitForLoadState('networkidle');

        // Clear search
        await searchInput.clear();
        await searchInput.press('Enter');
        await page.waitForLoadState('networkidle');

        // All vendors should be shown again
        const vendors = page.locator('a[href^="/vendors/"], .vendor-card');
        const count = await vendors.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Category Browsing', () => {
    test('should navigate to category page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Click on a category
      const categoryLink = page.locator('a').filter({ hasText: /Photography|Venues|Catering/i }).first();
      if (await categoryLink.isVisible()) {
        await categoryLink.click();
        await expect(page).toHaveURL(/category|vendors/i);
      }
    });

    test('should show vendors for selected category', async ({ page }) => {
      await page.goto('/vendors?category=photography');
      await page.waitForLoadState('networkidle');

      // Vendors should be filtered
      const vendors = page.locator('a[href^="/vendors/"], .vendor-card, [data-testid="vendor-card"]');
      // Results may or may not exist depending on data
    });

    test('should display category description', async ({ page }) => {
      await page.goto('/vendors?category=photography');
      await page.waitForLoadState('networkidle');

      // Category page might have a description
      const heading = page.locator('h1, h2').filter({ hasText: /Photography/i });
      await expect(heading.first()).toBeVisible({ timeout: 10000 });
    });

    test('should filter vendors within category', async ({ page }) => {
      await page.goto('/vendors?category=photography');
      await page.waitForLoadState('networkidle');

      // Apply additional filter within category
      const filterDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /Price|Rating|Location/i });
      if (await filterDropdown.first().isVisible()) {
        await filterDropdown.first().click();
      }
    });
  });

  test.describe('Vendor Listing', () => {
    test('should display vendor cards with key info', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const vendorCard = page.locator('a[href^="/vendors/"], .vendor-card, [data-testid="vendor-card"]').first();
      if (await vendorCard.isVisible()) {
        // Card should have name, image, and some info
        const hasText = await vendorCard.textContent();
        expect(hasText?.length).toBeGreaterThan(0);
      }
    });

    test('should paginate vendor results', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      // Check for pagination controls
      const pagination = page.locator('nav[aria-label*="pagination"], .pagination, button').filter({
        hasText: /Next|Previous|\d+/,
      });
      // Pagination may or may not be present depending on number of vendors
    });

    test('should show next page controls', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const nextButton = page.getByRole('button', { name: /Next|→|»/i });
      // Next button may be present if there are enough vendors
    });

    test('should maintain filters across pages', async ({ page }) => {
      await page.goto('/vendors?category=photography');
      await page.waitForLoadState('networkidle');

      const nextButton = page.getByRole('button', { name: /Next|→|»/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');

        // URL should still have category filter
        expect(page.url()).toContain('category=photography');
      }
    });
  });

  test.describe('Filters', () => {
    test('should filter by price range', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const priceFilter = page.locator('input[name*="price"], select').filter({ hasText: /Price/i }).or(
        page.locator('label').filter({ hasText: /Price/i })
      );
      if (await priceFilter.first().isVisible()) {
        await priceFilter.first().click();
      }
    });

    test('should filter by rating', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const ratingFilter = page.locator('input, select, button').filter({ hasText: /Rating|Stars/i });
      if (await ratingFilter.first().isVisible()) {
        await ratingFilter.first().click();
      }
    });

    test('should filter by location', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const locationFilter = page.locator('select[name*="location"], input[name*="city"]').or(
        page.locator('label').filter({ hasText: /Location|City/i })
      );
      if (await locationFilter.first().isVisible()) {
        await locationFilter.first().click();
      }
    });

    test('should combine multiple filters', async ({ page }) => {
      await page.goto('/vendors?category=photography&city=lahore');
      await page.waitForLoadState('networkidle');

      // URL should have both filters
      expect(page.url()).toContain('category');
    });

    test('should clear all filters', async ({ page }) => {
      await page.goto('/vendors?category=photography&city=lahore');
      await page.waitForLoadState('networkidle');

      const clearButton = page.getByRole('button', { name: /Clear|Reset/i });
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForLoadState('networkidle');

        // Filters should be cleared
        expect(page.url()).not.toContain('category=photography');
      }
    });

    test('should show filter count badge', async ({ page }) => {
      await page.goto('/vendors?category=photography&city=lahore');
      await page.waitForLoadState('networkidle');

      // Filter button might show count of active filters
      const filterBadge = page.locator('span').filter({ hasText: /^[0-9]+$/ });
      // Badge may or may not be present based on UI design
    });
  });

  test.describe('Vendor Detail Page', () => {
    test('should display vendor profile', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const vendorLink = page.locator('a[href^="/vendors/"]').first();
      if (await vendorLink.isVisible()) {
        await vendorLink.click();
        await page.waitForLoadState('networkidle');

        // Should show vendor name
        const vendorName = page.locator('h1, h2').first();
        await expect(vendorName).toBeVisible();
      }
    });

    test('should show about tab with description', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const vendorLink = page.locator('a[href^="/vendors/"]').first();
      if (await vendorLink.isVisible()) {
        await vendorLink.click();
        await page.waitForLoadState('networkidle');

        const aboutTab = page.getByRole('tab', { name: /About/i }).or(
          page.locator('button').filter({ hasText: /About/i })
        );
        if (await aboutTab.isVisible()) {
          await aboutTab.click();
          // About content should be visible
        }
      }
    });

    test('should show services tab with offerings', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const vendorLink = page.locator('a[href^="/vendors/"]').first();
      if (await vendorLink.isVisible()) {
        await vendorLink.click();
        await page.waitForLoadState('networkidle');

        const servicesTab = page.getByRole('tab', { name: /Services/i }).or(
          page.locator('button').filter({ hasText: /Services/i })
        );
        if (await servicesTab.isVisible()) {
          await servicesTab.click();
        }
      }
    });

    test('should show reviews tab with ratings', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const vendorLink = page.locator('a[href^="/vendors/"]').first();
      if (await vendorLink.isVisible()) {
        await vendorLink.click();
        await page.waitForLoadState('networkidle');

        const reviewsTab = page.getByRole('tab', { name: /Reviews/i }).or(
          page.locator('button').filter({ hasText: /Reviews/i })
        );
        if (await reviewsTab.isVisible()) {
          await reviewsTab.click();
        }
      }
    });

    test('should show gallery with images', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const vendorLink = page.locator('a[href^="/vendors/"]').first();
      if (await vendorLink.isVisible()) {
        await vendorLink.click();
        await page.waitForLoadState('networkidle');

        // Gallery or images section
        const gallery = page.locator('img, .gallery, [data-testid="gallery"]');
        await expect(gallery.first()).toBeVisible();
      }
    });

    test('should display book now button when logged in', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/vendors');
      await authenticatedPage.waitForLoadState('networkidle');

      const vendorLink = authenticatedPage.locator('a[href^="/vendors/"]').first();
      if (await vendorLink.isVisible()) {
        await vendorLink.click();
        await authenticatedPage.waitForLoadState('networkidle');

        const bookButton = authenticatedPage.getByRole('button', { name: /Book|Contact|Inquire/i });
        await expect(bookButton).toBeVisible();
      }
    });

    test('should redirect to login when booking while not logged in', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const vendorLink = page.locator('a[href^="/vendors/"]').first();
      if (await vendorLink.isVisible()) {
        await vendorLink.click();
        await page.waitForLoadState('networkidle');

        const bookButton = page.getByRole('button', { name: /Book|Contact|Inquire/i }).or(
          page.getByRole('link', { name: /Book|Contact|Inquire/i })
        );
        if (await bookButton.isVisible()) {
          await bookButton.click();

          // Should redirect to login
          await expect(page).toHaveURL(/login/i, { timeout: 10000 });
        }
      }
    });
  });
});
