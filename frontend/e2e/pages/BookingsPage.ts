import { Page, Locator, expect } from '@playwright/test';

export class BookingsPage {
  readonly page: Page;
  readonly bookingsList: Locator;
  readonly emptyState: Locator;
  readonly bookingCards: Locator;
  readonly filterDropdown: Locator;

  // Booking form elements (when creating a booking)
  readonly eventDateInput: Locator;
  readonly eventTypeInput: Locator;
  readonly notesInput: Locator;
  readonly guestCountInput: Locator;
  readonly clientNameInput: Locator;
  readonly clientPhoneInput: Locator;
  readonly clientEmailInput: Locator;
  readonly clientAddressInput: Locator;
  readonly confirmBookingButton: Locator;
  readonly cancelButton: Locator;
  readonly proceedToPaymentButton: Locator;

  // Status transition elements
  readonly statusBadge: Locator;
  readonly cancelBookingButton: Locator;
  readonly disputeButton: Locator;
  readonly cancelReasonInput: Locator;
  readonly disputeReasonInput: Locator;
  readonly disputeDescriptionInput: Locator;
  readonly confirmCancelButton: Locator;
  readonly submitDisputeButton: Locator;
  readonly cancelModal: Locator;
  readonly disputeModal: Locator;

  constructor(page: Page) {
    this.page = page;

    // Bookings grid container
    this.bookingsList = page.locator('.grid').first();

    // Empty state - shown when no bookings
    this.emptyState = page.locator('div').filter({ hasText: /haven't booked any vendors yet/i });

    // Booking cards in grid
    this.bookingCards = page.locator('.grid > div').filter({ has: page.locator('h2') });

    this.filterDropdown = page.locator('select[name="status-filter"]');

    // Confirm Booking Modal form elements
    this.eventDateInput = page.locator('input[type="date"], input[name="eventDate"]');
    this.eventTypeInput = page.locator('input[name="eventType"]');
    this.notesInput = page.locator('textarea[name="specialRequests"]');
    this.guestCountInput = page.locator('input[name="guestCount"]');
    this.clientNameInput = page.locator('input[name="fullName"]').or(
      page.getByLabel(/Full Name/i)
    );
    this.clientPhoneInput = page.locator('input[name="phone"]').or(
      page.getByLabel(/Phone/i)
    );
    this.clientEmailInput = page.locator('input[name="email"]').or(
      page.getByLabel(/Email/i)
    );
    this.clientAddressInput = page.locator('input[name="address"]').or(
      page.getByLabel(/Address|Venue/i)
    );
    this.confirmBookingButton = page.getByRole('button', { name: /Confirm|Proceed to Payment/i });
    this.cancelButton = page.getByRole('button', { name: /Back|Cancel/i });
    this.proceedToPaymentButton = page.getByRole('button', { name: /Proceed to Payment|Pay & Confirm/i });

    // Status transition elements
    this.statusBadge = page.locator('span').filter({
      hasText: /draft|requested|accepted|declined|pending|confirmed|in.progress|completed|closed|cancelled|refund|disputed|resolved|expired/i,
    });
    this.cancelBookingButton = page.getByRole('button', { name: /Cancel Booking|Cancel/i });
    this.disputeButton = page.getByRole('button', { name: /Raise Dispute|Dispute|Report Issue/i });

    // Cancel modal
    this.cancelModal = page.locator('.fixed.inset-0, [role="dialog"]').filter({
      hasText: /Cancel Booking|Cancellation/i,
    });
    this.cancelReasonInput = page.locator('textarea[name="cancelReason"], input[name="cancelReason"]').or(
      page.getByPlaceholder(/reason|why/i)
    );
    this.confirmCancelButton = page.locator('.fixed.inset-0, [role="dialog"]').getByRole('button', {
      name: /Confirm Cancel|Yes.*Cancel/i,
    });

    // Dispute modal
    this.disputeModal = page.locator('.fixed.inset-0, [role="dialog"]').filter({
      hasText: /Dispute|Report/i,
    });
    this.disputeReasonInput = page.locator('select[name="disputeReason"]').or(
      page.getByLabel(/Reason.*Dispute|Issue Type/i)
    );
    this.disputeDescriptionInput = page.locator('textarea[name="disputeDescription"]').or(
      page.getByPlaceholder(/describe|details/i)
    );
    this.submitDisputeButton = page.locator('.fixed.inset-0, [role="dialog"]').getByRole('button', {
      name: /Submit Dispute|Report|Submit/i,
    });
  }

  async goto(): Promise<void> {
    await this.page.goto('/bookings');
  }

  async getBookingsList(): Promise<string[]> {
    const cards = this.page.locator('.grid > div').filter({ has: this.page.locator('h2') });
    const count = await cards.count();
    const bookings: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).textContent();
      if (text) bookings.push(text.trim());
    }
    return bookings;
  }

  async getBookingsCount(): Promise<number> {
    const cards = this.page.locator('.grid > div').filter({ has: this.page.locator('h2') });
    return await cards.count();
  }

  async clickBooking(index: number): Promise<void> {
    const cards = this.page.locator('.grid > div').filter({ has: this.page.locator('h2') });
    await cards.nth(index).click();
  }

  async clickBookingById(bookingId: string): Promise<void> {
    const card = this.page.locator('div').filter({ hasText: bookingId }).first();
    await card.click();
  }

  async clickViewDetails(index: number): Promise<void> {
    const cards = this.page.locator('.grid > div').filter({ has: this.page.locator('h2') });
    const card = cards.nth(index);
    await card.getByRole('button', { name: /View Details/i }).click();
  }

  async clickConfirm(index: number): Promise<void> {
    const cards = this.page.locator('.grid > div').filter({ has: this.page.locator('h2') });
    const card = cards.nth(index);
    await card.getByRole('button', { name: /Confirm/i }).click();
  }

  async clickRemoveBooking(index: number): Promise<void> {
    const cards = this.page.locator('.grid > div').filter({ has: this.page.locator('h2') });
    const card = cards.nth(index);
    await card.getByRole('button', { name: /Remove Booking/i }).click();
  }

  async fillClientDetails(data: {
    name: string;
    phone: string;
    email: string;
    address?: string;
    eventType?: string;
    eventDate?: string;
    guestCount?: number;
    specialRequests?: string;
  }): Promise<void> {
    if (data.name) {
      await this.clientNameInput.fill(data.name);
    }
    if (data.email) {
      await this.clientEmailInput.fill(data.email);
    }
    if (data.phone) {
      await this.clientPhoneInput.fill(data.phone);
    }
    if (data.address) {
      await this.clientAddressInput.fill(data.address);
    }
    if (data.eventType) {
      await this.eventTypeInput.fill(data.eventType);
    }
    if (data.eventDate) {
      await this.eventDateInput.fill(data.eventDate);
    }
    if (data.guestCount) {
      await this.guestCountInput.fill(data.guestCount.toString());
    }
    if (data.specialRequests) {
      await this.notesInput.fill(data.specialRequests);
    }
  }

  async fillBookingDetails(data: {
    eventDate: string;
    eventType?: string;
    notes?: string;
    guestCount?: number;
  }): Promise<void> {
    await this.eventDateInput.fill(data.eventDate);
    if (data.eventType) {
      if (await this.eventTypeInput.isVisible()) {
        await this.eventTypeInput.fill(data.eventType);
      }
    }
    if (data.notes) {
      await this.notesInput.fill(data.notes);
    }
    if (data.guestCount) {
      await this.guestCountInput.fill(data.guestCount.toString());
    }
  }

  async confirmBooking(): Promise<void> {
    await this.confirmBookingButton.click();
  }

  async proceedToPayment(): Promise<void> {
    await this.proceedToPaymentButton.click();
  }

  async cancelBooking(): Promise<void> {
    await this.cancelButton.click();
  }

  async filterByStatus(status: string): Promise<void> {
    await this.filterDropdown.selectOption(status);
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible({ timeout: 10000 });
  }

  async expectBookingsVisible(): Promise<void> {
    const cards = this.page.locator('.grid > div').filter({ has: this.page.locator('h2') });
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  }

  async getBookingStatus(index: number): Promise<string> {
    const cards = this.page.locator('.grid > div').filter({ has: this.page.locator('h2') });
    const card = cards.nth(index);
    // Status might be shown as badge or text
    const statusBadge = card.locator('span').filter({ hasText: /pending|confirmed|completed|cancelled/i });
    try {
      return (await statusBadge.first().textContent()) || '';
    } catch {
      return '';
    }
  }

  async getBookingDetails(index: number): Promise<{
    vendorName: string;
    date: string;
    status: string;
    price: string;
  }> {
    const cards = this.page.locator('.grid > div').filter({ has: this.page.locator('h2') });
    const card = cards.nth(index);

    const vendorName = (await card.locator('h2').textContent()) || '';
    const priceText = (await card.locator('p').filter({ hasText: /Rs\./ }).textContent()) || '';

    // Try to get status
    let status = '';
    try {
      const statusElement = card.locator('span').filter({ hasText: /pending|confirmed|completed/i });
      status = (await statusElement.first().textContent()) || '';
    } catch {
      status = '';
    }

    return {
      vendorName: vendorName.trim(),
      date: '', // Date might not be visible in card
      status: status.trim(),
      price: priceText.trim(),
    };
  }

  // Payment form methods
  async fillPaymentDetails(data: {
    cardholderName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
  }): Promise<void> {
    await this.page.locator('input[name="name"]').or(
      this.page.getByLabel(/Cardholder Name/i)
    ).fill(data.cardholderName);

    await this.page.locator('input[name="number"]').or(
      this.page.getByLabel(/Card Number/i)
    ).fill(data.cardNumber);

    await this.page.locator('input[name="expiry"]').or(
      this.page.getByLabel(/Expiry/i)
    ).fill(data.expiry);

    await this.page.locator('input[name="cvv"]').or(
      this.page.getByLabel(/CVV/i)
    ).fill(data.cvv);
  }

  async submitPayment(): Promise<void> {
    await this.page.getByRole('button', { name: /Pay & Confirm/i }).click();
  }

  async closeModal(): Promise<void> {
    // Click outside the modal or the backdrop
    await this.page.locator('.fixed.inset-0').first().click({ position: { x: 10, y: 10 } });
  }

  async expectPageLoaded(): Promise<void> {
    await expect(this.page.locator('h1').filter({ hasText: /Your Bookings/i })).toBeVisible({ timeout: 10000 });
  }

  // Status transition methods
  async getBookingStatusByIndex(index: number): Promise<string> {
    const cards = this.page.locator('.grid > div').filter({ has: this.page.locator('h2') });
    const card = cards.nth(index);
    const statusElement = card.locator('span').filter({
      hasText: /draft|requested|accepted|declined|pending|confirmed|in.progress|completed|closed|cancelled|refund|disputed|resolved|expired/i,
    });
    try {
      return ((await statusElement.first().textContent()) || '').trim().toLowerCase();
    } catch {
      return '';
    }
  }

  async cancelBookingWithReason(index: number, reason: string): Promise<void> {
    const cards = this.page.locator('.grid > div').filter({ has: this.page.locator('h2') });
    const card = cards.nth(index);

    // Click on the card to open details or find cancel button
    await card.click();

    // Wait for cancel button to be available (might be in a detail view or modal)
    await this.cancelBookingButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    if (await this.cancelBookingButton.isVisible()) {
      await this.cancelBookingButton.click();
    }

    // Fill reason if modal appears
    if (await this.cancelReasonInput.isVisible()) {
      await this.cancelReasonInput.fill(reason);
    }

    // Confirm cancellation
    await this.confirmCancelButton.click();
  }

  async raiseDispute(index: number, reason: string, description: string): Promise<void> {
    const cards = this.page.locator('.grid > div').filter({ has: this.page.locator('h2') });
    const card = cards.nth(index);

    // Click on the card to open details
    await card.click();

    // Wait for dispute button
    await this.disputeButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    if (await this.disputeButton.isVisible()) {
      await this.disputeButton.click();
    }

    // Fill dispute form
    await expect(this.disputeModal).toBeVisible({ timeout: 5000 });

    // Select or fill reason
    if (await this.disputeReasonInput.isVisible()) {
      // If it's a select, try to select by value/text
      const tagName = await this.disputeReasonInput.evaluate((el) => el.tagName.toLowerCase());
      if (tagName === 'select') {
        await this.disputeReasonInput.selectOption({ label: reason });
      } else {
        await this.disputeReasonInput.fill(reason);
      }
    }

    // Fill description
    if (await this.disputeDescriptionInput.isVisible()) {
      await this.disputeDescriptionInput.fill(description);
    }

    // Submit dispute
    await this.submitDisputeButton.click();
  }

  async expectStatus(index: number, status: string): Promise<void> {
    const actualStatus = await this.getBookingStatusByIndex(index);
    expect(actualStatus.toLowerCase()).toContain(status.toLowerCase());
  }

  async expectStatusBadgeVisible(status: string): Promise<void> {
    const badge = this.page.locator('span').filter({ hasText: new RegExp(status, 'i') });
    await expect(badge.first()).toBeVisible({ timeout: 5000 });
  }

  async getBookingCardByStatus(status: string): Promise<Locator> {
    const cards = this.page.locator('.grid > div').filter({ has: this.page.locator('h2') });
    return cards.filter({
      has: this.page.locator('span').filter({ hasText: new RegExp(status, 'i') }),
    }).first();
  }

  async clickBookingWithStatus(status: string): Promise<void> {
    const card = await this.getBookingCardByStatus(status);
    await card.click();
  }

  async expectCancelModalVisible(): Promise<void> {
    await expect(this.cancelModal).toBeVisible({ timeout: 5000 });
  }

  async expectDisputeModalVisible(): Promise<void> {
    await expect(this.disputeModal).toBeVisible({ timeout: 5000 });
  }

  async dismissCancelModal(): Promise<void> {
    const closeButton = this.cancelModal.getByRole('button', { name: /Close|Cancel|X/i }).first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Click outside modal
      await this.page.locator('.fixed.inset-0').first().click({ position: { x: 10, y: 10 } });
    }
  }

  async dismissDisputeModal(): Promise<void> {
    const closeButton = this.disputeModal.getByRole('button', { name: /Close|Cancel|X/i }).first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Click outside modal
      await this.page.locator('.fixed.inset-0').first().click({ position: { x: 10, y: 10 } });
    }
  }

  async gotoBookingDetails(bookingId: string): Promise<void> {
    await this.page.goto(`/bookings/${bookingId}`);
    await this.page.waitForLoadState('networkidle');
  }
}
