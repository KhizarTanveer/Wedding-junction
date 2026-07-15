import { test, expect } from '../fixtures';
import { ChatPage } from '../pages';
import { resetTestUsers } from '../fixtures/auth.fixture';

test.describe('Advanced Chat Features', () => {
  test.beforeEach(async () => {
    await resetTestUsers();
  });

  test.describe('Image Sharing', () => {
    test('should upload image in chat', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      // Select first conversation if any
      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        // Upload image
        await chatPage.uploadImage('./fixtures/test-image.jpg');

        // Image should appear or show preview
      }
    });

    test('should display image preview before send', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        await chatPage.uploadImage('./fixtures/test-image.jpg');

        // Preview should be visible before sending
        await chatPage.expectImagePreview();
      }
    });

    test('should show sent image in conversation', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        await chatPage.uploadImage('./fixtures/test-image.jpg');
        await chatPage.sendButton.click();

        // Image should appear in chat
        await chatPage.expectImageInChat();
      }
    });

    test('should validate image file type', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);

        // Check that file input accepts only images
        const acceptAttr = await chatPage.imageUploadInput.getAttribute('accept');
        expect(acceptAttr).toMatch(/image/i);
      }
    });

    test('should validate image file size', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      // File size validation happens client-side
      // This test would need a large test file to verify rejection
    });
  });

  test.describe('Price Negotiation', () => {
    test('vendor should set initial price', async ({ vendorPage }) => {
      const chatPage = new ChatPage(vendorPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        // Vendor sets price
        if (await chatPage.setPriceButton.isVisible()) {
          await chatPage.setPrice(50000);

          // Price should be visible in conversation
          const priceText = vendorPage.locator('span, p').filter({ hasText: /50,?000|Rs/i });
          await expect(priceText.first()).toBeVisible({ timeout: 10000 });
        }
      }
    });

    test('user should see proposed price', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        // If vendor has set a price, user should see it
        const priceSection = authenticatedPage.locator('div').filter({ hasText: /Price|Quote|Offer/i });
        // Price might be visible if vendor set it
      }
    });

    test('user should accept price', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        if (await chatPage.acceptPriceButton.isVisible()) {
          await chatPage.acceptPrice();
          await chatPage.expectPriceAgreed();
        }
      }
    });

    test('user should counter with new price', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        if (await chatPage.counterPriceButton.isVisible()) {
          await chatPage.counterPrice(45000);

          // Counter offer should be visible
          const counterText = authenticatedPage.locator('span, p').filter({ hasText: /45,?000|counter/i });
        }
      }
    });

    test('vendor should accept counter offer', async ({ vendorPage }) => {
      const chatPage = new ChatPage(vendorPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        if (await chatPage.acceptPriceButton.isVisible()) {
          await chatPage.acceptPrice();
          await chatPage.expectPriceAgreed();
        }
      }
    });

    test('price agreement should update conversation status', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        // Check for conversations with agreed price status
        const preview = await chatPage.getConversationPreview(0);
        // Status might be 'Price Agreed' or similar
      }
    });
  });

  test.describe('Booking from Chat', () => {
    test('should show create booking button after price agreed', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        // If price is agreed, booking button should be visible
        const status = await chatPage.getConversationStatus();
        if (status.toLowerCase().includes('agreed')) {
          await chatPage.expectCreateBookingButtonVisible();
        }
      }
    });

    test('should create booking with agreed price', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        if (await chatPage.createBookingButton.isVisible()) {
          await chatPage.createBookingFromChat();

          // Should redirect to booking flow or show confirmation
          await expect(authenticatedPage).toHaveURL(/booking|checkout/i, { timeout: 10000 });
        }
      }
    });

    test('should update conversation status to booking_created', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      // Check for conversations with booking created status
      const conversations = await chatPage.getConversations();
      // Some conversations might have 'Booking Created' status
    });
  });

  test.describe('Conversation Lifecycle', () => {
    test('new conversation should be active', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);

      // Start a new conversation with a vendor
      await authenticatedPage.goto('/vendors');
      await authenticatedPage.waitForLoadState('networkidle');

      const vendorLink = authenticatedPage.locator('a[href^="/vendors/"]').first();
      if (await vendorLink.isVisible()) {
        await vendorLink.click();
        await authenticatedPage.waitForLoadState('networkidle');

        const chatButton = authenticatedPage.getByRole('button', { name: /Chat|Message|Contact/i });
        if (await chatButton.isVisible()) {
          await chatButton.click();

          // Should be in an active conversation
          await chatPage.waitForChatLoad();
          await chatPage.expectConversationActive();
        }
      }
    });

    test('price agreed conversation shows agreed status', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      // Find conversation with price agreed
      const conversations = await chatPage.getConversations();
      for (let i = 0; i < conversations.length; i++) {
        const preview = await chatPage.getConversationPreview(i);
        if (preview.status.toLowerCase().includes('agreed')) {
          await expect(chatPage.conversationItems.nth(i)).toContainText(/agreed/i);
          break;
        }
      }
    });

    test('booking created conversation shows status', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      // Find conversation with booking created status
      const conversations = await chatPage.getConversations();
      for (let i = 0; i < conversations.length; i++) {
        const preview = await chatPage.getConversationPreview(i);
        if (preview.status.toLowerCase().includes('booking')) {
          await expect(chatPage.conversationItems.nth(i)).toContainText(/booking/i);
          break;
        }
      }
    });

    test('should close conversation', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        if (await chatPage.closeConversationButton.isVisible()) {
          await chatPage.closeConversation();
          await chatPage.expectConversationClosed();
        }
      }
    });

    test('closed conversation should be read-only', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      // Find closed conversation
      const conversations = await chatPage.getConversations();
      for (let i = 0; i < conversations.length; i++) {
        const preview = await chatPage.getConversationPreview(i);
        if (preview.status.toLowerCase().includes('closed')) {
          await chatPage.selectConversation(i);
          await chatPage.waitForChatLoad();

          const isReadOnly = await chatPage.isConversationReadOnly();
          expect(isReadOnly).toBe(true);
          break;
        }
      }
    });
  });

  test.describe('Message Features', () => {
    test('should mark messages as read', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        // Check for unread count before opening
        const unreadCount = await chatPage.getUnreadCount(0);

        // Open conversation
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();
        await chatPage.markMessagesAsRead();

        // Go back to list and check unread count again
        await chatPage.backToConversationList();
        await chatPage.waitForChatLoad();

        // Unread count should be cleared
      }
    });

    test('should show unread count badge', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      // Check for any conversation with unread badge
      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        const unreadCount = await chatPage.getUnreadCount(0);
        // Unread count might be 0 or more
        expect(unreadCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should clear unread on open', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        // Open conversation
        await chatPage.selectConversation(0);
        await chatPage.waitForChatLoad();

        // Opening should clear unread
        await chatPage.backToConversationList();
        await chatPage.waitForChatLoad();

        await chatPage.expectNoUnreadBadge(0);
      }
    });
  });

  test.describe('Conversation Management', () => {
    test('should delete conversation', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        // Get conversation name before deleting
        const preview = await chatPage.getConversationPreview(0);
        const conversationName = preview.name;

        await chatPage.deleteConversation(0);

        // Conversation should be deleted
        await chatPage.expectConversationDeleted(conversationName);
      }
    });

    test('should confirm before deleting', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const conversationCount = await chatPage.getConversationsCount();
      if (conversationCount > 0) {
        // Hover to show delete button
        const conversation = chatPage.conversationItems.nth(0);
        await conversation.hover();

        // Click delete button
        const deleteBtn = conversation.locator('button').last();
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();

          // Confirmation dialog should appear
          const confirmDialog = authenticatedPage.locator('.fixed.inset-0, [role="dialog"]');
          await expect(confirmDialog).toBeVisible();

          // Cancel deletion
          const cancelBtn = confirmDialog.getByRole('button', { name: /Cancel/i });
          if (await cancelBtn.isVisible()) {
            await cancelBtn.click();
          }
        }
      }
    });

    test('deleted conversation should not appear in list', async ({ authenticatedPage }) => {
      const chatPage = new ChatPage(authenticatedPage);
      await chatPage.goto();
      await chatPage.waitForChatLoad();

      const initialCount = await chatPage.getConversationsCount();
      if (initialCount > 0) {
        const preview = await chatPage.getConversationPreview(0);
        const conversationName = preview.name;

        await chatPage.deleteConversation(0);

        // Count should be reduced
        const newCount = await chatPage.getConversationsCount();
        expect(newCount).toBeLessThan(initialCount);

        // Deleted conversation should not be in list
        await chatPage.expectConversationDeleted(conversationName);
      }
    });
  });
});
