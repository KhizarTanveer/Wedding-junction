import { Page, Locator, expect } from '@playwright/test';

export class ChatPage {
  readonly page: Page;

  // Conversation list
  readonly conversationsList: Locator;
  readonly conversationItems: Locator;
  readonly emptyConversationsState: Locator;

  // Chat area
  readonly chatHeader: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly messagesList: Locator;
  readonly messageItems: Locator;
  readonly ownMessages: Locator;
  readonly otherMessages: Locator;
  readonly emptyState: Locator;
  readonly searchInput: Locator;

  // Booking actions
  readonly createBookingButton: Locator;
  readonly setPriceButton: Locator;
  readonly priceInput: Locator;
  readonly confirmPriceButton: Locator;

  // Advanced features
  readonly imageUploadButton: Locator;
  readonly imageUploadInput: Locator;
  readonly priceNegotiationSection: Locator;
  readonly agreedPriceBadge: Locator;
  readonly conversationStatus: Locator;
  readonly closeConversationButton: Locator;
  readonly acceptPriceButton: Locator;
  readonly counterPriceButton: Locator;
  readonly counterPriceInput: Locator;
  readonly submitCounterButton: Locator;
  readonly deleteConversationButton: Locator;
  readonly confirmDeleteConversationButton: Locator;

  // Message actions (edit/delete)
  readonly editMessageButton: Locator;
  readonly deleteMessageButton: Locator;
  readonly editMessageInput: Locator;
  readonly saveEditButton: Locator;
  readonly cancelEditButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Conversation list in sidebar - using h2 "Messages" as anchor
    this.conversationsList = page.locator('div').filter({ has: page.locator('h2:has-text("Messages")') }).first();
    this.conversationItems = page.locator('a[href^="/chat/"]');
    this.emptyConversationsState = page.locator('div').filter({ hasText: /No conversations yet/i });

    // Chat header
    this.chatHeader = page.locator('div.bg-white.border-b').first();

    // Message input and send button - actual placeholders/names from Chat.jsx
    this.messageInput = page.getByPlaceholder(/Type your message/i);
    this.sendButton = page.getByRole('button', { name: /^Send$/i }).or(
      page.locator('button:has-text("Send")').last()
    );

    // Messages area
    this.messagesList = page.locator('div.flex-1.overflow-y-auto');
    this.messageItems = page.locator('p.whitespace-pre-wrap');
    // Own messages are on the right (justify-end)
    this.ownMessages = page.locator('.justify-end').filter({ has: page.locator('.px-4.py-3') });
    // Other messages are on the left (justify-start)
    this.otherMessages = page.locator('.justify-start').filter({ has: page.locator('.px-4.py-3') });

    // Empty/search states
    this.emptyState = page.locator('div').filter({ hasText: /Select a conversation|No conversations yet/i });
    this.searchInput = page.getByPlaceholder(/search/i);

    // Booking actions from chat
    this.createBookingButton = page.getByRole('button', { name: /Create Booking/i });
    this.setPriceButton = page.getByRole('button', { name: /Set Price/i });
    this.priceInput = page.locator('input[type="number"]').or(page.getByPlaceholder(/Enter price/i));
    this.confirmPriceButton = page.getByRole('button', { name: /Confirm Price/i });

    // Advanced features
    this.imageUploadButton = page.getByRole('button', { name: /Attach|Image|Photo|Upload/i }).or(
      page.locator('button').filter({ has: page.locator('svg path[d*="clip"], svg path[d*="image"]') })
    );
    this.imageUploadInput = page.locator('input[type="file"]');
    this.priceNegotiationSection = page.locator('div').filter({ hasText: /Price|Negotiation|Quote/i }).first();
    this.agreedPriceBadge = page.locator('span.bg-emerald-100, span.bg-green-100').filter({
      hasText: /Rs\.|Agreed|Price/i,
    });
    this.conversationStatus = page.locator('span').filter({
      hasText: /Active|Price Agreed|Booking Created|Closed/i,
    });
    this.closeConversationButton = page.getByRole('button', { name: /Close.*Conversation|End Chat/i });
    this.acceptPriceButton = page.getByRole('button', { name: /Accept.*Price|Accept/i });
    this.counterPriceButton = page.getByRole('button', { name: /Counter|Make.*Offer|Negotiate/i });
    this.counterPriceInput = page.locator('.fixed.inset-0, [role="dialog"]').locator('input[type="number"]');
    this.submitCounterButton = page.locator('.fixed.inset-0, [role="dialog"]').getByRole('button', {
      name: /Submit|Send.*Offer/i,
    });
    this.deleteConversationButton = page.getByRole('button', { name: /Delete.*Conversation/i });
    this.confirmDeleteConversationButton = page.locator('.fixed.inset-0, [role="dialog"]').getByRole('button', {
      name: /Delete|Confirm/i,
    }).last();

    // Message actions - these appear on hover over own messages
    this.editMessageButton = page.locator('button[title="Edit message"]').or(
      page.locator('button').filter({ has: page.locator('svg path[d*="M11 5H6"]') })
    );
    this.deleteMessageButton = page.locator('button[title="Delete message"]').or(
      page.locator('button').filter({ has: page.locator('svg path[d*="M19 7l-.867"]') })
    );
    this.editMessageInput = page.locator('.fixed.inset-0 textarea');
    this.saveEditButton = page.getByRole('button', { name: /Save/i });
    this.cancelEditButton = page.locator('.fixed.inset-0').getByRole('button', { name: /Cancel/i });
    this.confirmDeleteButton = page.locator('.fixed.inset-0').getByRole('button', { name: /Delete/i }).last();
  }

  async goto(): Promise<void> {
    await this.page.goto('/chat');
  }

  async gotoConversation(conversationId: string): Promise<void> {
    await this.page.goto(`/chat/${conversationId}`);
  }

  async waitForChatLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  // Conversation list methods
  async getConversationsCount(): Promise<number> {
    return await this.conversationItems.count();
  }

  async getConversations(): Promise<string[]> {
    const count = await this.conversationItems.count();
    const conversations: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await this.conversationItems.nth(i).textContent();
      if (text) conversations.push(text.trim());
    }
    return conversations;
  }

  async selectConversation(index: number): Promise<void> {
    await this.conversationItems.nth(index).click();
  }

  async selectConversationByName(name: string): Promise<void> {
    await this.page.locator('a[href^="/chat/"]').filter({ hasText: name }).first().click();
  }

  async searchConversations(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async deleteConversation(index: number): Promise<void> {
    // Hover over conversation to show delete button
    const conversation = this.conversationItems.nth(index);
    await conversation.hover();
    // Click delete button (appears on hover)
    await conversation.locator('button').last().click();
    // Confirm deletion
    await this.page.locator('.fixed.inset-0').getByRole('button', { name: /Delete/i }).click();
  }

  async getConversationPreview(index: number): Promise<{
    name: string;
    lastMessage: string;
    status: string;
  }> {
    const conversation = this.conversationItems.nth(index);
    const name = (await conversation.locator('h3').textContent()) || '';
    const lastMessage = (await conversation.locator('p.text-xs.text-stone-600').textContent()) || '';
    const status = (await conversation.locator('span').filter({ hasText: /Active|Price Agreed|Booking Created|Closed/i }).textContent()) || '';

    return { name: name.trim(), lastMessage: lastMessage.trim(), status: status.trim() };
  }

  // Message methods
  async sendMessage(text: string): Promise<void> {
    await this.messageInput.fill(text);
    await this.sendButton.click();
  }

  async getMessagesCount(): Promise<number> {
    return await this.messageItems.count();
  }

  async getMessages(): Promise<string[]> {
    await this.page.waitForLoadState('networkidle');
    const count = await this.messageItems.count();
    const messages: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await this.messageItems.nth(i).textContent();
      if (text) messages.push(text.trim());
    }
    return messages;
  }

  async getLastMessage(): Promise<string> {
    const count = await this.messageItems.count();
    if (count === 0) return '';
    return (await this.messageItems.last().textContent()) || '';
  }

  // Message edit/delete
  async editMessage(messageIndex: number, newText: string): Promise<void> {
    // Hover over own message to show edit/delete buttons
    const msgContainers = this.ownMessages;
    const msgContainer = msgContainers.nth(messageIndex);
    await msgContainer.hover();

    // Click edit button (first button in the hidden group)
    const editBtn = msgContainer.locator('button').first();
    await editBtn.click();

    // Fill new text in modal
    await this.editMessageInput.clear();
    await this.editMessageInput.fill(newText);

    // Save
    await this.saveEditButton.click();
  }

  async deleteMessage(messageIndex: number): Promise<void> {
    // Hover over own message to show edit/delete buttons
    const msgContainers = this.ownMessages;
    const msgContainer = msgContainers.nth(messageIndex);
    await msgContainer.hover();

    // Click delete button (last button in the hidden group)
    const deleteBtn = msgContainer.locator('button').last();
    await deleteBtn.click();

    // Confirm deletion
    await this.confirmDeleteButton.click();
  }

  // Price negotiation (vendor only)
  async setPrice(price: number): Promise<void> {
    await this.setPriceButton.click();
    await this.priceInput.fill(price.toString());
    await this.confirmPriceButton.click();
  }

  // Create booking from chat (user only, when price agreed)
  async createBookingFromChat(): Promise<void> {
    await this.createBookingButton.click();
  }

  // Start conversation with vendor
  async startConversationWithVendor(vendorId: string): Promise<void> {
    await this.page.goto(`/chat?vendor=${vendorId}`);
    await this.page.waitForLoadState('networkidle');
  }

  // Typing indicator
  async waitForTypingIndicator(): Promise<void> {
    await expect(this.page.locator('div').filter({ hasText: /is typing/i })).toBeVisible({ timeout: 5000 });
  }

  // Unread count badge
  async getUnreadCount(index: number): Promise<number> {
    const conversation = this.conversationItems.nth(index);
    const badge = conversation.locator('span.bg-orange-500');
    try {
      const text = await badge.textContent({ timeout: 2000 });
      return parseInt(text || '0');
    } catch {
      return 0;
    }
  }

  // Message status (read indicator)
  async isMessageRead(messageIndex: number): Promise<boolean> {
    const msgContainer = this.ownMessages.nth(messageIndex);
    // Check for read indicator (double checkmark "✓✓")
    const text = await msgContainer.textContent();
    return text?.includes('✓✓') || false;
  }

  async expectMessagesLoaded(): Promise<void> {
    await expect(this.messageInput).toBeVisible({ timeout: 10000 });
  }

  async expectEmptyConversation(): Promise<void> {
    await expect(this.emptyState).toBeVisible({ timeout: 10000 });
  }

  async expectMessageSent(text: string): Promise<void> {
    await expect(this.messageItems.filter({ hasText: text })).toBeVisible({ timeout: 10000 });
  }

  async waitForNewMessage(): Promise<void> {
    const initialCount = await this.messageItems.count();
    await expect(async () => {
      const newCount = await this.messageItems.count();
      expect(newCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 10000 });
  }

  // Check for "This message was deleted" indicator
  async isMessageDeleted(messageIndex: number): Promise<boolean> {
    const text = await this.messageItems.nth(messageIndex).textContent();
    return text?.includes('This message was deleted') || false;
  }

  // Check if message shows "(edited)"
  async isMessageEdited(messageIndex: number): Promise<boolean> {
    const msgContainers = this.page.locator('.px-4.py-3');
    const msg = msgContainers.nth(messageIndex);
    const text = await msg.textContent();
    return text?.includes('(edited)') || false;
  }

  async getAgreedPrice(): Promise<string> {
    // Agreed price is shown in a green badge in header area
    const priceElement = this.page.locator('span.bg-emerald-100');
    try {
      return (await priceElement.first().textContent()) || '';
    } catch {
      return '';
    }
  }

  async backToConversationList(): Promise<void> {
    // On mobile, click back button
    const backButton = this.page.locator('button').filter({ has: this.page.locator('svg path[d*="15 19l-7-7"]') });
    if (await backButton.isVisible()) {
      await backButton.click();
    } else {
      await this.page.goto('/chat');
    }
  }

  // Advanced feature methods

  async uploadImage(filePath: string): Promise<void> {
    // Click the upload button to trigger file input
    if (await this.imageUploadButton.isVisible()) {
      await this.imageUploadButton.click();
    }
    // Set file on the hidden input
    await this.imageUploadInput.setInputFiles(filePath);
  }

  async acceptPrice(): Promise<void> {
    await this.acceptPriceButton.click();
    // Wait for status to update
    await this.page.waitForLoadState('networkidle');
  }

  async counterPrice(newPrice: number): Promise<void> {
    await this.counterPriceButton.click();
    await expect(this.counterPriceInput).toBeVisible({ timeout: 5000 });
    await this.counterPriceInput.fill(newPrice.toString());
    await this.submitCounterButton.click();
  }

  async closeConversation(): Promise<void> {
    await this.closeConversationButton.click();
    // Confirm if a dialog appears
    const confirmButton = this.page.locator('.fixed.inset-0, [role="dialog"]').getByRole('button', {
      name: /Confirm|Close|Yes/i,
    });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
  }

  async getConversationStatus(): Promise<string> {
    try {
      const text = await this.conversationStatus.first().textContent();
      return (text || '').trim();
    } catch {
      return '';
    }
  }

  async expectPriceAgreed(price?: number): Promise<void> {
    await expect(this.agreedPriceBadge).toBeVisible({ timeout: 10000 });
    if (price !== undefined) {
      await expect(this.agreedPriceBadge).toContainText(price.toString());
    }
  }

  async expectConversationClosed(): Promise<void> {
    const closedIndicator = this.page.locator('span, p').filter({ hasText: /Closed/i });
    await expect(closedIndicator.first()).toBeVisible({ timeout: 10000 });
  }

  async expectConversationActive(): Promise<void> {
    const activeIndicator = this.page.locator('span').filter({ hasText: /Active/i });
    await expect(activeIndicator.first()).toBeVisible({ timeout: 10000 });
  }

  async expectBookingCreatedStatus(): Promise<void> {
    const statusIndicator = this.page.locator('span').filter({ hasText: /Booking.*Created/i });
    await expect(statusIndicator.first()).toBeVisible({ timeout: 10000 });
  }

  async expectCreateBookingButtonVisible(): Promise<void> {
    await expect(this.createBookingButton).toBeVisible({ timeout: 10000 });
  }

  async expectCreateBookingButtonHidden(): Promise<void> {
    await expect(this.createBookingButton).not.toBeVisible({ timeout: 5000 });
  }

  async isConversationReadOnly(): Promise<boolean> {
    // Check if message input is disabled or hidden
    const isInputDisabled = await this.messageInput.isDisabled().catch(() => true);
    const isInputHidden = !(await this.messageInput.isVisible().catch(() => false));
    return isInputDisabled || isInputHidden;
  }

  async expectMessageInputDisabled(): Promise<void> {
    const isDisabled = await this.messageInput.isDisabled();
    expect(isDisabled).toBe(true);
  }

  async markMessagesAsRead(): Promise<void> {
    // Simply clicking on the conversation marks messages as read
    await this.page.waitForLoadState('networkidle');
  }

  async expectUnreadCountBadge(index: number, count?: number): Promise<void> {
    const badge = this.conversationItems.nth(index).locator('span.bg-orange-500, span.bg-red-500');
    await expect(badge).toBeVisible({ timeout: 5000 });
    if (count !== undefined) {
      await expect(badge).toContainText(count.toString());
    }
  }

  async expectNoUnreadBadge(index: number): Promise<void> {
    const badge = this.conversationItems.nth(index).locator('span.bg-orange-500, span.bg-red-500');
    await expect(badge).not.toBeVisible({ timeout: 5000 });
  }

  async deleteConversationPermanently(index: number): Promise<void> {
    // Navigate to the conversation
    await this.selectConversation(index);
    await this.page.waitForLoadState('networkidle');

    // Click delete button
    if (await this.deleteConversationButton.isVisible()) {
      await this.deleteConversationButton.click();
      // Confirm deletion
      await expect(this.confirmDeleteConversationButton).toBeVisible({ timeout: 5000 });
      await this.confirmDeleteConversationButton.click();
    }
  }

  async expectConversationDeleted(conversationName: string): Promise<void> {
    const conversation = this.page.locator('a[href^="/chat/"]').filter({ hasText: conversationName });
    await expect(conversation).not.toBeVisible({ timeout: 10000 });
  }

  async expectImageInChat(): Promise<void> {
    const image = this.page.locator('.px-4.py-3 img, .message img');
    await expect(image.first()).toBeVisible({ timeout: 10000 });
  }

  async expectImagePreview(): Promise<void> {
    const preview = this.page.locator('img').filter({ has: this.page.locator('[alt*="preview" i]') }).or(
      this.page.locator('.preview img')
    );
    await expect(preview.first()).toBeVisible({ timeout: 5000 });
  }

  async cancelImageUpload(): Promise<void> {
    const cancelButton = this.page.getByRole('button', { name: /Cancel|Remove|X/i }).filter({
      has: this.page.locator('svg'),
    });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
    }
  }
}
