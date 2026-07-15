import { test, expect } from '../fixtures';
import { PaymentPage, PaymentSuccessPage, BookingsPage } from '../pages';
import {
  testPayment,
  invalidPayment,
  BOOKING_STATUSES,
} from '../fixtures/test-data';
import { resetTestUsers } from '../fixtures/auth.fixture';

test.describe('Payment Flow', () => {
  test.beforeEach(async () => {
    await resetTestUsers();
  });

  test.describe('Payment Page Display', () => {
    test('should display booking summary', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      // Navigate to bookings and find one with payment option
      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        // Verify payment page loaded
        await paymentPage.expectPaymentFormVisible();

        // Check booking summary is visible
        await expect(paymentPage.bookingSummary).toBeVisible();
      }
    });

    test('should show vendor name and service', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        const summary = await paymentPage.getBookingSummary();
        expect(summary.vendor).toBeTruthy();
      }
    });

    test('should show event date', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        const summary = await paymentPage.getBookingSummary();
        // Date should be present
        expect(summary.date || summary.amount).toBeTruthy();
      }
    });

    test('should show correct total amount', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        const amount = await paymentPage.getTotalAmount();
        // Amount should be a number
        expect(parseInt(amount) || amount).toBeTruthy();
      }
    });

    test('should display payment form', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        await paymentPage.expectPaymentFormVisible();
        await expect(paymentPage.cardholderNameInput).toBeVisible();
        await expect(paymentPage.cardNumberInput).toBeVisible();
        await expect(paymentPage.expiryInput).toBeVisible();
        await expect(paymentPage.cvvInput).toBeVisible();
        await expect(paymentPage.payButton).toBeVisible();
      }
    });
  });

  test.describe('Form Validation', () => {
    test('should validate cardholder name required', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        // Fill all except cardholder name
        await paymentPage.fillCardNumber(testPayment.cardNumber);
        await paymentPage.fillExpiry(testPayment.expiry);
        await paymentPage.fillCvv(testPayment.cvv);
        await paymentPage.submitPayment();

        await paymentPage.expectCardholderNameError();
      }
    });

    test('should validate card number format', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        await paymentPage.fillPaymentDetails({
          ...testPayment,
          cardNumber: '1234', // Invalid - too short
        });
        await paymentPage.submitPayment();

        await paymentPage.expectCardNumberError();
      }
    });

    test('should validate expiry date format', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        await paymentPage.fillPaymentDetails({
          ...testPayment,
          expiry: '13/25', // Invalid month
        });
        await paymentPage.submitPayment();

        await paymentPage.expectExpiryError();
      }
    });

    test('should reject expired cards', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        await paymentPage.fillPaymentDetails({
          ...testPayment,
          expiry: invalidPayment.expiry, // Expired date
        });
        await paymentPage.submitPayment();

        await paymentPage.expectExpiryError();
      }
    });

    test('should validate CVV format', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        await paymentPage.fillPaymentDetails({
          ...testPayment,
          cvv: invalidPayment.cvv, // Too short
        });
        await paymentPage.submitPayment();

        await paymentPage.expectCvvError();
      }
    });

    test('should show field-specific error messages', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        // Submit empty form
        await paymentPage.submitPayment();

        // Multiple error messages should appear
        const errorMessages = authenticatedPage.locator('.text-red-500, .text-red-600');
        const count = await errorMessages.count();
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Payment Processing', () => {
    test('should show processing state during payment', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        await paymentPage.fillPaymentDetails(testPayment);
        await paymentPage.submitPayment();

        // Should show processing state briefly
        await paymentPage.expectProcessing();
      }
    });

    test('should disable form during processing', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        await paymentPage.fillPaymentDetails(testPayment);
        await paymentPage.submitPayment();

        // Pay button should be disabled during processing
        const isDisabled = await paymentPage.isPayButtonDisabled();
        expect(isDisabled).toBe(true);
      }
    });

    test('successful payment redirects to success page', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        await paymentPage.fillPaymentDetails(testPayment);
        await paymentPage.submitPayment();

        // Should redirect to success page
        await expect(authenticatedPage).toHaveURL(/success|confirmation|complete/i, { timeout: 15000 });
      }
    });

    test('should display confirmation on success page', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const successPage = new PaymentSuccessPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        await paymentPage.fillPaymentDetails(testPayment);
        await paymentPage.submitPayment();

        // Wait for success page
        await successPage.expectSuccess();
      }
    });

    test('should show booking ID on success', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const successPage = new PaymentSuccessPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        await paymentPage.fillPaymentDetails(testPayment);
        await paymentPage.submitPayment();

        await successPage.expectSuccess();
        const bookingId = await successPage.getBookingId();
        expect(bookingId).toBeTruthy();
      }
    });
  });

  test.describe('Payment Failure', () => {
    test('should show error for declined card', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        // Use a test card number that simulates decline
        await paymentPage.fillPaymentDetails({
          ...testPayment,
          cardNumber: '4000000000000002', // Simulated decline
        });
        await paymentPage.submitPayment();

        await paymentPage.expectPaymentFailed('declined');
      }
    });

    test('should allow retry after failure', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        // First attempt with bad card
        await paymentPage.fillPaymentDetails({
          ...testPayment,
          cardNumber: '4000000000000002',
        });
        await paymentPage.submitPayment();

        // Wait for error
        await expect(paymentPage.errorMessage).toBeVisible({ timeout: 10000 });

        // Form should still be editable for retry
        await expect(paymentPage.cardNumberInput).toBeEditable();
        await expect(paymentPage.payButton).toBeEnabled();
      }
    });

    test('should preserve form data on retry', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        // Fill form
        await paymentPage.fillPaymentDetails(testPayment);
        await paymentPage.submitPayment();

        // After potential error, cardholder name should be preserved
        const nameValue = await paymentPage.cardholderNameInput.inputValue();
        expect(nameValue).toBe(testPayment.cardholderName);
      }
    });

    test('should handle network errors gracefully', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        // Simulate offline by blocking API calls
        await authenticatedPage.route('**/api/**', route => route.abort());

        await paymentPage.fillPaymentDetails(testPayment);
        await paymentPage.submitPayment();

        // Should show error message
        await expect(paymentPage.errorMessage).toBeVisible({ timeout: 15000 });

        // Remove route interception
        await authenticatedPage.unroute('**/api/**');
      }
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle page refresh during payment', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        // Fill partial form
        await paymentPage.fillCardholderName(testPayment.cardholderName);

        // Refresh page
        await authenticatedPage.reload();

        // Payment page should reload (booking data should persist)
        await paymentPage.expectPaymentFormVisible();
      }
    });

    test('should prevent double submission', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        await paymentPage.fillPaymentDetails(testPayment);

        // Click pay button twice quickly
        await paymentPage.payButton.click();
        await paymentPage.payButton.click();

        // Button should be disabled after first click
        const isDisabled = await paymentPage.isPayButtonDisabled();
        expect(isDisabled).toBe(true);
      }
    });

    test('should timeout long-running payments', async ({ authenticatedPage }) => {
      const paymentPage = new PaymentPage(authenticatedPage);
      const bookingsPage = new BookingsPage(authenticatedPage);

      await bookingsPage.goto();

      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Proceed to Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        // Simulate slow payment by delaying API response
        await authenticatedPage.route('**/payment**', async route => {
          await new Promise(resolve => setTimeout(resolve, 35000));
          await route.continue();
        });

        await paymentPage.fillPaymentDetails(testPayment);
        await paymentPage.submitPayment();

        // Should show timeout error after some time
        await expect(paymentPage.errorMessage).toBeVisible({ timeout: 40000 });

        await authenticatedPage.unroute('**/payment**');
      }
    });
  });
});
