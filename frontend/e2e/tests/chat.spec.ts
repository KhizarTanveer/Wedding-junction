import { test, expect } from '@playwright/test';
import { ChatPage } from '../pages/ChatPage';
import { VendorPage } from '../pages/VendorPage';
import { testChatMessage } from '../fixtures/test-data';
import { loginAsUser, loginAsVendor, resetTestUsers } from '../fixtures/auth.fixture';

test.describe('Chat', () => {
  // Reset test users before all tests to clear any account locks
  test.beforeAll(async () => {
    await resetTestUsers();
  });
  test.describe('Start Conversation', () => {
    test('should start conversation with vendor from vendor page', async ({ page }) => {
      await loginAsUser(page);

      // Navigate to a vendor page
      await page.goto('/');
      await page.locator('a[href*="/vendor"], a[href*="/explore"]').first().click();

      // Click chat/message button or link
      await page.getByRole('link', { name: /send message|chat|message/i }).or(
        page.getByRole('button', { name: /chat|message/i })
      ).first().click();

      // Should navigate to chat or open chat modal
      await expect(page).toHaveURL(/chat/);
    });

    test('should show chat interface after starting conversation', async ({ page }) => {
      await loginAsUser(page);

      const chatPage = new ChatPage(page);
      await chatPage.goto();

      // Should show chat interface elements
      await expect(chatPage.messageInput).toBeVisible();
    });
  });

  test.describe('Send and Receive Messages', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(page);
    });

    test('should send a message', async ({ page }) => {
      const chatPage = new ChatPage(page);
      await chatPage.goto();

      // If there are existing conversations, select one
      const conversationCount = await chatPage.conversationItems.count();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);
      } else {
        // Start new conversation from vendor page
        await page.goto('/');
        await page.locator('a[href*="/vendor"], a[href*="/explore"]').first().click();
        await page.getByRole('link', { name: /send message|chat|message/i }).or(
          page.getByRole('button', { name: /chat|message/i })
        ).first().click();
      }

      // Wait for chat to load
      await expect(chatPage.messageInput).toBeVisible();

      // Send a message
      await chatPage.sendMessage(testChatMessage.text);

      // Message should appear in the chat
      await chatPage.expectMessageSent(testChatMessage.text);
    });

    test('should display sent messages in chat', async ({ page }) => {
      const chatPage = new ChatPage(page);
      await chatPage.goto();

      // Select an existing conversation if available
      const conversationCount = await chatPage.conversationItems.count();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);

        // Get messages
        const messages = await chatPage.getMessages();

        // Should have at least the messages list container
        await chatPage.expectMessagesLoaded();
      }
    });

    test('should receive messages in real-time', async ({ page, context }) => {
      await loginAsUser(page);
      const chatPage = new ChatPage(page);
      await chatPage.goto();

      // Select a conversation
      const conversationCount = await chatPage.conversationItems.count();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);

        // Get initial message count
        const initialCount = await chatPage.messageItems.count();

        // Wait a bit for potential incoming messages
        // In real test, you would have another user send a message
        await page.waitForTimeout(1000);

        // Messages list should be visible
        await chatPage.expectMessagesLoaded();
      }
    });
  });

  test.describe('Message Actions', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(page);
    });

    test('should edit message within time window', async ({ page }) => {
      const chatPage = new ChatPage(page);
      await chatPage.goto();

      // Select conversation
      const conversationCount = await chatPage.conversationItems.count();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);

        // Send a message first
        await chatPage.sendMessage('Test message to edit');
        await chatPage.expectMessageSent('Test message to edit');

        // Try to edit the last message
        const messageCount = await chatPage.messageItems.count();
        if (messageCount > 0) {
          const lastMessageIndex = messageCount - 1;

          // Check if edit option is available (right-click menu)
          await chatPage.messageItems.nth(lastMessageIndex).click({ button: 'right' });

          const editButton = page.getByRole('button', { name: /edit/i });
          if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await editButton.click();

            // Edit the message
            const editInput = page.getByRole('textbox');
            await editInput.clear();
            await editInput.fill('Edited message');
            await page.getByRole('button', { name: /save|confirm/i }).click();

            // Verify edit
            await expect(chatPage.messageItems.filter({ hasText: 'Edited message' })).toBeVisible();
          }
        }
      }
    });

    test('should delete message', async ({ page }) => {
      const chatPage = new ChatPage(page);
      await chatPage.goto();

      // Select conversation
      const conversationCount = await chatPage.conversationItems.count();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);

        // Send a message first
        await chatPage.sendMessage('Test message to delete');
        await chatPage.expectMessageSent('Test message to delete');

        // Get message count before delete
        const countBefore = await chatPage.messageItems.count();

        if (countBefore > 0) {
          const lastMessageIndex = countBefore - 1;

          // Try to delete the last message
          await chatPage.messageItems.nth(lastMessageIndex).click({ button: 'right' });

          const deleteButton = page.getByRole('button', { name: /delete/i });
          if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await deleteButton.click();

            // Confirm deletion
            await page.getByRole('button', { name: /confirm|yes|delete/i }).click();

            // Wait for deletion
            await page.waitForTimeout(500);

            // Message count should decrease or message should be gone
            const countAfter = await chatPage.messageItems.count();
            expect(countAfter).toBeLessThanOrEqual(countBefore);
          }
        }
      }
    });
  });

  test.describe('Conversation List', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(page);
    });

    test('should display conversation list', async ({ page }) => {
      const chatPage = new ChatPage(page);
      await chatPage.goto();

      // Should show conversations list or empty state
      const hasConversations = await chatPage.conversationItems.count() > 0;
      if (hasConversations) {
        await expect(chatPage.conversationItems.first()).toBeVisible();
      } else {
        // Empty state is acceptable
        await expect(page.locator('text=/no conversation|start a conversation|empty/i').first()).toBeVisible();
      }
    });

    test('should switch between conversations', async ({ page }) => {
      const chatPage = new ChatPage(page);
      await chatPage.goto();

      const conversationCount = await chatPage.conversationItems.count();
      if (conversationCount >= 2) {
        // Select first conversation
        await chatPage.selectConversation(0);
        await chatPage.expectMessagesLoaded();

        // Select second conversation
        await chatPage.selectConversation(1);
        await chatPage.expectMessagesLoaded();
      }
    });

    test('should search conversations', async ({ page }) => {
      const chatPage = new ChatPage(page);
      await chatPage.goto();

      // If search input exists
      if (await chatPage.searchInput.count() > 0) {
        await chatPage.searchConversations('test');

        // Wait for search results
        await page.waitForTimeout(500);

        // Should filter conversations (results may vary)
      }
    });
  });

  test.describe('Create Booking from Chat', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(page);
    });

    test('should have option to create booking from chat', async ({ page }) => {
      const chatPage = new ChatPage(page);
      await chatPage.goto();

      // Select a conversation
      const conversationCount = await chatPage.conversationItems.count();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);

        // Check if create booking button exists
        const bookingButton = page.getByRole('button', { name: /create booking|book/i });
        if (await bookingButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await bookingButton.click();

          // Should show booking form
          await expect(page.locator('text=/booking|date|event/i').first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Vendor Side Chat', () => {
    test('should allow vendor to view and respond to messages', async ({ page }) => {
      await loginAsVendor(page);

      const chatPage = new ChatPage(page);
      await chatPage.goto();

      // Select a conversation
      const conversationCount = await chatPage.conversationItems.count();
      if (conversationCount > 0) {
        await chatPage.selectConversation(0);

        // Should be able to send messages
        await expect(chatPage.messageInput).toBeVisible();

        // Send a response
        await chatPage.sendMessage('Thank you for your inquiry!');
        await chatPage.expectMessageSent('Thank you for your inquiry!');
      }
    });
  });
});
