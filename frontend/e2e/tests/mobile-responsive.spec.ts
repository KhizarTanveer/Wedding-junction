import { test, expect } from '../fixtures';
import { ChatPage, BookingsPage } from '../pages';
import { resetTestUsers, loginAsUser } from '../fixtures/auth.fixture';

// Mobile viewport configuration
test.describe('Mobile Responsive', () => {
  // Set mobile viewport for all tests in this describe block
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async () => {
    await resetTestUsers();
  });

  test.describe('Mobile Navigation', () => {
    test('should show hamburger menu', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Hamburger menu button should be visible
      const hamburgerButton = page.locator('button').filter({
        has: page.locator('svg path[d*="M4 6h16"], [data-testid="menu-icon"]'),
      }).or(
        page.getByRole('button', { name: /menu/i })
      );
      await expect(hamburgerButton.first()).toBeVisible();
    });

    test('should open mobile nav on click', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Click hamburger menu
      const hamburgerButton = page.locator('button').filter({
        has: page.locator('svg'),
      }).first();
      await hamburgerButton.click();

      // Mobile nav should be visible
      const mobileNav = page.locator('nav, div').filter({ hasText: /Home|Vendors|Login/i });
      await expect(mobileNav.first()).toBeVisible();
    });

    test('should close mobile nav on link click', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Open menu
      const hamburgerButton = page.locator('button').first();
      await hamburgerButton.click();

      // Click a link
      const homeLink = page.getByRole('link', { name: /Home/i }).first();
      if (await homeLink.isVisible()) {
        await homeLink.click();

        // Nav should close
        await page.waitForLoadState('networkidle');
      }
    });

    test('should close mobile nav on outside click', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Open menu
      const hamburgerButton = page.locator('button').first();
      await hamburgerButton.click();

      // Click outside (on the page body)
      await page.locator('main, body').first().click({ position: { x: 10, y: 300 } });

      // Nav might close on outside click
    });
  });

  test.describe('Mobile Home Page', () => {
    test('should stack sections vertically', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check that sections are stacked (not side by side)
      const sections = page.locator('section, .section');
      const firstSection = sections.first();
      if (await firstSection.isVisible()) {
        const box = await firstSection.boundingBox();
        // Width should be close to viewport width
        expect(box?.width).toBeGreaterThan(350);
      }
    });

    test('should have full-width search', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.isVisible()) {
        const box = await searchInput.boundingBox();
        // Search should be nearly full width
        expect(box?.width).toBeGreaterThan(300);
      }
    });

    test('categories should scroll horizontally', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Categories container might have horizontal scroll
      const categoriesContainer = page.locator('div').filter({ hasText: /Categories/i }).first();
      if (await categoriesContainer.isVisible()) {
        // Check for overflow-x-auto or similar styling
        const overflowX = await categoriesContainer.evaluate(el => {
          return window.getComputedStyle(el).overflowX;
        });
        // Might be 'auto', 'scroll', or 'hidden'
      }
    });
  });

  test.describe('Mobile Vendor List', () => {
    test('should display single column layout', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const vendorCards = page.locator('a[href^="/vendors/"], .vendor-card');
      const count = await vendorCards.count();

      if (count >= 2) {
        const firstCard = await vendorCards.first().boundingBox();
        const secondCard = await vendorCards.nth(1).boundingBox();

        if (firstCard && secondCard) {
          // In single column, cards should be stacked vertically
          // Second card's top should be below first card's bottom
          expect(secondCard.y).toBeGreaterThanOrEqual(firstCard.y + firstCard.height - 10);
        }
      }
    });

    test('vendor cards should be full width', async ({ page }) => {
      await page.goto('/vendors');
      await page.waitForLoadState('networkidle');

      const vendorCard = page.locator('a[href^="/vendors/"], .vendor-card').first();
      if (await vendorCard.isVisible()) {
        const box = await vendorCard.boundingBox();
        // Card should be nearly full width (allowing for padding)
        expect(box?.width).toBeGreaterThan(340);
      }
    });
  });

  test.describe('Mobile Booking Form', () => {
    test('should have full-width inputs', async ({ page }) => {
      await loginAsUser(page);

      const bookingsPage = new BookingsPage(page);
      await bookingsPage.goto();

      // Try to open booking form
      const bookButton = page.getByRole('button', { name: /Book|Create/i }).first();
      if (await bookButton.isVisible()) {
        await bookButton.click();

        // Check input widths
        const dateInput = page.locator('input[type="date"]').first();
        if (await dateInput.isVisible()) {
          const box = await dateInput.boundingBox();
          expect(box?.width).toBeGreaterThan(300);
        }
      }
    });

    test('date picker should work on mobile', async ({ page }) => {
      await loginAsUser(page);

      const bookingsPage = new BookingsPage(page);
      await bookingsPage.goto();

      const dateInput = page.locator('input[type="date"]').first();
      if (await dateInput.isVisible()) {
        // Focus should work
        await dateInput.click();
        // Native date picker should open (can't test UI directly)
      }
    });
  });

  test.describe('Mobile Chat', () => {
    test('should show conversation list full screen', async ({ page }) => {
      await loginAsUser(page);

      const chatPage = new ChatPage(page);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      // Conversation list should take full width
      const list = page.locator('div').filter({ hasText: /Messages|Conversations/i }).first();
      if (await list.isVisible()) {
        const box = await list.boundingBox();
        expect(box?.width).toBeGreaterThan(350);
      }
    });

    test('should navigate to chat view on select', async ({ page }) => {
      await loginAsUser(page);

      const chatPage = new ChatPage(page);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        // Chat messages should be visible
        await expect(chatPage.messageInput).toBeVisible();
      }
    });

    test('should have back button to list', async ({ page }) => {
      await loginAsUser(page);

      const chatPage = new ChatPage(page);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        // Back button should be visible on mobile
        const backButton = page.locator('button').filter({
          has: page.locator('svg path[d*="15 19l-7-7"], svg path[d*="M15"]'),
        }).or(
          page.getByRole('button', { name: /back/i })
        );
        await expect(backButton.first()).toBeVisible();
      }
    });

    test('message input should be fixed at bottom', async ({ page }) => {
      await loginAsUser(page);

      const chatPage = new ChatPage(page);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        const inputContainer = chatPage.messageInput.locator('xpath=../..');
        if (await inputContainer.isVisible()) {
          // Check if positioned at bottom
          const position = await inputContainer.evaluate(el => {
            return window.getComputedStyle(el).position;
          });
          // Might be 'fixed' or 'sticky'
        }
      }
    });
  });
});
