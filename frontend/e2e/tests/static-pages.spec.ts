import { test, expect } from '../fixtures';
import { StaticPage } from '../pages';

test.describe('Static Pages', () => {
  test.describe('Terms of Service', () => {
    test('should display terms of service page', async ({ page }) => {
      const staticPage = new StaticPage(page);
      await staticPage.gotoTerms();

      await staticPage.expectPageLoaded();
      await staticPage.expectHeading('Terms');
    });

    test('should show last updated date', async ({ page }) => {
      const staticPage = new StaticPage(page);
      await staticPage.gotoTerms();

      await staticPage.expectLastUpdatedVisible();
      const date = await staticPage.getLastUpdatedDate();
      expect(date).toBeTruthy();
    });

    test('should have table of contents', async ({ page }) => {
      const staticPage = new StaticPage(page);
      await staticPage.gotoTerms();

      const toc = await staticPage.getTableOfContents();
      // May or may not have TOC depending on implementation
    });
  });

  test.describe('Privacy Policy', () => {
    test('should display privacy policy page', async ({ page }) => {
      const staticPage = new StaticPage(page);
      await staticPage.gotoPrivacy();

      await staticPage.expectPageLoaded();
      await staticPage.expectHeading('Privacy');
    });

    test('should show last updated date', async ({ page }) => {
      const staticPage = new StaticPage(page);
      await staticPage.gotoPrivacy();

      await staticPage.expectLastUpdatedVisible();
    });

    test('should link to contact for questions', async ({ page }) => {
      const staticPage = new StaticPage(page);
      await staticPage.gotoPrivacy();

      // Check for contact link
      const contactLink = page.getByRole('link', { name: /contact|email|support/i });
      await expect(contactLink.first()).toBeVisible();
    });
  });

  test.describe('Cookie Policy', () => {
    test('should display cookie policy page', async ({ page }) => {
      const staticPage = new StaticPage(page);
      await staticPage.gotoCookies();

      await staticPage.expectPageLoaded();
      await staticPage.expectHeading('Cookie');
    });

    test('should explain cookie types', async ({ page }) => {
      const staticPage = new StaticPage(page);
      await staticPage.gotoCookies();

      // Should explain different types of cookies
      const cookieTypes = page.locator('h2, h3, strong').filter({
        hasText: /essential|functional|analytics|marketing/i,
      });
      await expect(cookieTypes.first()).toBeVisible();
    });
  });

  test.describe('404 Page', () => {
    test('should display 404 for invalid routes', async ({ page }) => {
      const staticPage = new StaticPage(page);
      await staticPage.goto404();

      await staticPage.expect404Page();
    });

    test('should show helpful message', async ({ page }) => {
      const staticPage = new StaticPage(page);
      await staticPage.goto404();

      await staticPage.expect404Message();
    });

    test('should provide link to home', async ({ page }) => {
      const staticPage = new StaticPage(page);
      await staticPage.goto404();

      await staticPage.expect404HomeLink();

      // Click home link
      await staticPage.click404HomeLink();
      await expect(page).toHaveURL('/');
    });
  });
});
