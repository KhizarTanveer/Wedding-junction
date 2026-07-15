import { Page, Locator, expect } from '@playwright/test';

export class PaymentSuccessPage {
  readonly page: Page;

  // Success elements
  readonly successIcon: Locator;
  readonly successMessage: Locator;
  readonly bookingId: Locator;
  readonly bookingDetails: Locator;

  // Navigation buttons
  readonly viewBookingsButton: Locator;
  readonly downloadReceiptButton: Locator;
  readonly homeButton: Locator;

  // Booking confirmation details
  readonly vendorName: Locator;
  readonly eventDate: Locator;
  readonly totalPaid: Locator;
  readonly confirmationNumber: Locator;

  constructor(page: Page) {
    this.page = page;

    // Success indicators
    this.successIcon = page.locator('svg').filter({ has: page.locator('path[d*="checkmark"], path[d*="check"]') }).or(
      page.locator('.text-green-500, .text-green-600').filter({ has: page.locator('svg') })
    );
    this.successMessage = page.locator('h1, h2').filter({ hasText: /Success|Payment.*Complete|Confirmed|Thank You/i });

    // Booking reference
    this.bookingId = page.locator('p, span').filter({ hasText: /Booking.*ID|Reference|Confirmation/i }).or(
      page.locator('[data-testid="booking-id"]')
    );
    this.confirmationNumber = page.locator('p, span').filter({ hasText: /#|WJ-/i });

    // Booking details section
    this.bookingDetails = page.locator('div').filter({ hasText: /Booking Details|Summary/i }).first();
    this.vendorName = page.locator('p, span').filter({ hasText: /Vendor|Provider/i }).or(
      this.bookingDetails.locator('h3').first()
    );
    this.eventDate = page.locator('p, span').filter({ hasText: /Date|Event/i });
    this.totalPaid = page.locator('p, span').filter({ hasText: /Total|Amount|Paid/i });

    // Action buttons
    this.viewBookingsButton = page.getByRole('link', { name: /View.*Booking|My Booking/i }).or(
      page.getByRole('button', { name: /View.*Booking|My Booking/i })
    );
    this.downloadReceiptButton = page.getByRole('button', { name: /Download.*Receipt|Receipt/i }).or(
      page.getByRole('link', { name: /Download.*Receipt|Receipt/i })
    );
    this.homeButton = page.getByRole('link', { name: /Home|Back to Home/i }).or(
      page.getByRole('button', { name: /Home|Back to Home/i })
    );
  }

  async expectSuccess(): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 15000 });
  }

  async expectSuccessIcon(): Promise<void> {
    // Look for any success indicator (green checkmark, success text, etc.)
    const successIndicator = this.page.locator('.text-green-500, .text-green-600, .bg-green-100').first();
    await expect(successIndicator.or(this.successMessage)).toBeVisible({ timeout: 15000 });
  }

  async getBookingId(): Promise<string> {
    // Try multiple selectors for booking ID
    const bookingIdElement = this.page.locator('[data-testid="booking-id"]').or(
      this.page.locator('p, span').filter({ hasText: /WJ-|#|Booking.*:/i })
    );

    const text = await bookingIdElement.first().textContent();
    if (text) {
      // Extract booking ID pattern (e.g., WJ-123456 or alphanumeric ID)
      const match = text.match(/(?:WJ-)?([A-Za-z0-9]+)/);
      return match ? match[0] : text.trim();
    }
    return '';
  }

  async getBookingDetails(): Promise<{
    vendor: string;
    date: string;
    amount: string;
    confirmationNumber: string;
  }> {
    const vendor = (await this.vendorName.textContent()) || '';
    const date = (await this.eventDate.textContent()) || '';
    const amount = (await this.totalPaid.textContent()) || '';
    const confirmation = (await this.confirmationNumber.first().textContent()) || '';

    return {
      vendor: vendor.trim(),
      date: date.trim(),
      amount: amount.trim(),
      confirmationNumber: confirmation.trim(),
    };
  }

  async clickViewBookings(): Promise<void> {
    await this.viewBookingsButton.click();
    await expect(this.page).toHaveURL(/booking/i);
  }

  async clickDownloadReceipt(): Promise<void> {
    // Set up download listener
    const downloadPromise = this.page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
    await this.downloadReceiptButton.click();
    const download = await downloadPromise;
    if (download) {
      // Optionally verify download
      const filename = download.suggestedFilename();
      expect(filename).toMatch(/receipt|invoice|booking/i);
    }
  }

  async clickHome(): Promise<void> {
    await this.homeButton.click();
    await expect(this.page).toHaveURL('/');
  }

  async isViewBookingsButtonVisible(): Promise<boolean> {
    return await this.viewBookingsButton.isVisible();
  }

  async isDownloadReceiptButtonVisible(): Promise<boolean> {
    return await this.downloadReceiptButton.isVisible();
  }

  async isHomeButtonVisible(): Promise<boolean> {
    return await this.homeButton.isVisible();
  }

  async expectPageLoaded(): Promise<void> {
    await this.expectSuccess();
    await expect(this.viewBookingsButton.or(this.homeButton)).toBeVisible({ timeout: 10000 });
  }
}
