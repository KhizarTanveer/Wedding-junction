import { Page, Locator, expect } from '@playwright/test';
import { testPayment } from '../fixtures/test-data';

export class PaymentPage {
  readonly page: Page;

  // Booking summary
  readonly bookingSummary: Locator;
  readonly vendorName: Locator;
  readonly eventDate: Locator;
  readonly totalAmount: Locator;
  readonly serviceName: Locator;

  // Payment form
  readonly cardholderNameInput: Locator;
  readonly cardNumberInput: Locator;
  readonly expiryInput: Locator;
  readonly cvvInput: Locator;
  readonly payButton: Locator;
  readonly processingIndicator: Locator;

  // Error states
  readonly errorMessage: Locator;
  readonly cardholderNameError: Locator;
  readonly cardNumberError: Locator;
  readonly expiryError: Locator;
  readonly cvvError: Locator;

  // Page elements
  readonly pageTitle: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page elements
    this.pageTitle = page.locator('h1, h2').filter({ hasText: /Payment|Checkout/i }).first();
    this.backButton = page.getByRole('button', { name: /Back|Cancel/i });

    // Booking summary section
    this.bookingSummary = page.locator('div').filter({ hasText: /Booking Summary|Order Summary/i }).first();
    this.vendorName = page.locator('h2, h3').filter({ hasText: /Vendor|Provider/i }).or(
      this.bookingSummary.locator('h2, h3').first()
    );
    this.eventDate = page.locator('p, span').filter({ hasText: /Date|Event/i });
    this.totalAmount = page.locator('p, span, div').filter({ hasText: /Rs\.|Total|Amount/i });
    this.serviceName = page.locator('p, span').filter({ hasText: /Service/i });

    // Payment form inputs
    this.cardholderNameInput = page.locator('input[name="name"], input[name="cardholderName"]').or(
      page.getByLabel(/Cardholder Name|Name on Card/i)
    );
    this.cardNumberInput = page.locator('input[name="number"], input[name="cardNumber"]').or(
      page.getByLabel(/Card Number/i)
    );
    this.expiryInput = page.locator('input[name="expiry"], input[name="expiryDate"]').or(
      page.getByLabel(/Expiry|Expiration/i)
    );
    this.cvvInput = page.locator('input[name="cvv"], input[name="cvc"]').or(
      page.getByLabel(/CVV|CVC|Security Code/i)
    );

    // Submit button
    this.payButton = page.getByRole('button', { name: /Pay|Confirm Payment|Complete Payment/i });
    this.processingIndicator = page.locator('.animate-spin, [role="progressbar"]').or(
      page.locator('button:has-text("Processing")')
    );

    // Error messages
    this.errorMessage = page.locator('.bg-red-50, [role="alert"]');
    this.cardholderNameError = page.locator('[data-error="cardholderName"], .text-red-500').filter({
      hasText: /name/i,
    });
    this.cardNumberError = page.locator('[data-error="cardNumber"], .text-red-500').filter({
      hasText: /card number|invalid card/i,
    });
    this.expiryError = page.locator('[data-error="expiry"], .text-red-500').filter({
      hasText: /expiry|expired/i,
    });
    this.cvvError = page.locator('[data-error="cvv"], .text-red-500').filter({
      hasText: /cvv|security code/i,
    });
  }

  async goto(bookingId: string): Promise<void> {
    await this.page.goto(`/payment/${bookingId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoCheckout(): Promise<void> {
    await this.page.goto('/checkout');
    await this.page.waitForLoadState('networkidle');
  }

  async getBookingSummary(): Promise<{ vendor: string; date: string; amount: string }> {
    const vendor = (await this.vendorName.textContent()) || '';
    const date = (await this.eventDate.textContent()) || '';
    const amount = (await this.totalAmount.textContent()) || '';

    return {
      vendor: vendor.trim(),
      date: date.trim(),
      amount: amount.trim(),
    };
  }

  async fillPaymentDetails(data: typeof testPayment): Promise<void> {
    await this.cardholderNameInput.fill(data.cardholderName);
    await this.cardNumberInput.fill(data.cardNumber);
    await this.expiryInput.fill(data.expiry);
    await this.cvvInput.fill(data.cvv);
  }

  async fillCardholderName(name: string): Promise<void> {
    await this.cardholderNameInput.fill(name);
  }

  async fillCardNumber(number: string): Promise<void> {
    await this.cardNumberInput.fill(number);
  }

  async fillExpiry(expiry: string): Promise<void> {
    await this.expiryInput.fill(expiry);
  }

  async fillCvv(cvv: string): Promise<void> {
    await this.cvvInput.fill(cvv);
  }

  async submitPayment(): Promise<void> {
    await this.payButton.click();
  }

  async expectProcessing(): Promise<void> {
    await expect(
      this.processingIndicator.or(this.page.locator('button:disabled'))
    ).toBeVisible({ timeout: 5000 });
  }

  async expectCardholderNameError(): Promise<void> {
    const error = this.page.locator('.text-red-500, .text-red-600').filter({
      hasText: /name.*required|enter.*name/i,
    });
    await expect(error).toBeVisible({ timeout: 5000 });
  }

  async expectCardNumberError(): Promise<void> {
    const error = this.page.locator('.text-red-500, .text-red-600').filter({
      hasText: /card number|invalid card/i,
    });
    await expect(error).toBeVisible({ timeout: 5000 });
  }

  async expectExpiryError(): Promise<void> {
    const error = this.page.locator('.text-red-500, .text-red-600').filter({
      hasText: /expiry|expired/i,
    });
    await expect(error).toBeVisible({ timeout: 5000 });
  }

  async expectCvvError(): Promise<void> {
    const error = this.page.locator('.text-red-500, .text-red-600').filter({
      hasText: /cvv|security code/i,
    });
    await expect(error).toBeVisible({ timeout: 5000 });
  }

  async expectPaymentFailed(reason?: string): Promise<void> {
    if (reason) {
      await expect(this.errorMessage.filter({ hasText: reason })).toBeVisible({ timeout: 10000 });
    } else {
      await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
    }
  }

  async expectPaymentFormVisible(): Promise<void> {
    await expect(this.cardNumberInput).toBeVisible({ timeout: 10000 });
  }

  async isPayButtonDisabled(): Promise<boolean> {
    return await this.payButton.isDisabled();
  }

  async getTotalAmount(): Promise<string> {
    const text = await this.totalAmount.textContent();
    // Extract number from text like "Rs. 50,000" or "Total: Rs. 50000"
    const match = text?.match(/[\d,]+/);
    return match ? match[0].replace(/,/g, '') : '';
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
  }
}
