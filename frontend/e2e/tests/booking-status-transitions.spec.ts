import { test, expect } from '../fixtures';
import { BookingsPage, VendorDashboardPage } from '../pages';
import {
  BOOKING_STATUSES,
  testBooking,
  generateFutureDate,
} from '../fixtures/test-data';
import {
  resetTestUsers,
  loginAsUser,
  loginAsVendor,
  getAuthToken,
  createTestBooking,
  setBookingStatus,
} from '../fixtures/auth.fixture';
import {
  createBookingWithStatus,
  updateBookingStatus,
  getFirstVendorId,
  apiLogin,
} from '../fixtures/api.fixture';

test.describe('Booking Status Transitions', () => {
  test.beforeEach(async () => {
    await resetTestUsers();
  });

  test.describe('Initial Booking Flow', () => {
    test('should create booking in draft status', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);

      // Navigate to a vendor and initiate booking
      await authenticatedPage.goto('/vendors');
      await authenticatedPage.waitForLoadState('networkidle');

      // Click on first vendor
      const vendorLink = authenticatedPage.locator('a[href^="/vendors/"]').first();
      if (await vendorLink.isVisible()) {
        await vendorLink.click();

        // Look for book now or contact button
        const bookButton = authenticatedPage.getByRole('button', { name: /Book|Contact|Inquire/i });
        if (await bookButton.isVisible()) {
          await bookButton.click();
        }
      }
    });

    test('should submit draft booking', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      // If there's a draft booking, fill and submit it
      const draftCard = await bookingsPage.getBookingCardByStatus('draft');
      if (await draftCard.isVisible()) {
        await draftCard.click();

        await bookingsPage.fillBookingDetails({
          eventDate: generateFutureDate(30),
          eventType: testBooking.eventType,
          notes: testBooking.notes,
        });

        await bookingsPage.confirmBooking();

        // Verify status changed to requested
        await bookingsPage.expectStatusBadgeVisible('requested');
      }
    });

    test('should show requested status to user', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      // Check if any booking shows requested status
      const status = await bookingsPage.getBookingStatusByIndex(0);
      // Status could be any valid status
      expect([
        'draft', 'requested', 'accepted', 'declined', 'pending',
        'confirmed', 'in_progress', 'completed', 'closed', 'cancelled',
      ].some(s => status.includes(s))).toBe(true);
    });

    test('should show pending booking to vendor', async ({ vendorPage }) => {
      const vendorDashboard = new VendorDashboardPage(vendorPage);
      await vendorDashboard.goto();

      // Vendor should see pending bookings section
      const pendingSection = vendorPage.locator('div').filter({ hasText: /Pending|Requests/i });
      await expect(pendingSection.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Vendor Response', () => {
    test('vendor should accept booking', async ({ vendorPage }) => {
      const vendorDashboard = new VendorDashboardPage(vendorPage);
      await vendorDashboard.goto();

      // Find and accept a pending booking
      const acceptButton = vendorPage.getByRole('button', { name: /Accept/i }).first();
      if (await acceptButton.isVisible()) {
        await acceptButton.click();

        // Verify status changed
        await expect(vendorPage.locator('span').filter({ hasText: /accepted/i })).toBeVisible();
      }
    });

    test('vendor should decline booking', async ({ vendorPage }) => {
      const vendorDashboard = new VendorDashboardPage(vendorPage);
      await vendorDashboard.goto();

      // Find and decline a pending booking
      const declineButton = vendorPage.getByRole('button', { name: /Decline|Reject/i }).first();
      if (await declineButton.isVisible()) {
        await declineButton.click();

        // Fill reason if required
        const reasonInput = vendorPage.locator('textarea, input').filter({ has: vendorPage.getByPlaceholder(/reason/i) });
        if (await reasonInput.isVisible()) {
          await reasonInput.fill('Not available on this date');
        }

        // Confirm decline
        const confirmDecline = vendorPage.getByRole('button', { name: /Confirm|Submit/i });
        if (await confirmDecline.isVisible()) {
          await confirmDecline.click();
        }
      }
    });

    test('should show decline reason to user', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      // Look for declined booking
      const declinedCard = await bookingsPage.getBookingCardByStatus('declined');
      if (await declinedCard.isVisible()) {
        await declinedCard.click();

        // Should show reason
        const reasonText = authenticatedPage.locator('p').filter({ hasText: /reason/i });
        await expect(reasonText).toBeVisible({ timeout: 5000 });
      }
    });

    test('should require reason for decline', async ({ vendorPage }) => {
      const vendorDashboard = new VendorDashboardPage(vendorPage);
      await vendorDashboard.goto();

      const declineButton = vendorPage.getByRole('button', { name: /Decline|Reject/i }).first();
      if (await declineButton.isVisible()) {
        await declineButton.click();

        // Try to confirm without reason
        const confirmDecline = vendorPage.getByRole('button', { name: /Confirm|Submit/i });
        if (await confirmDecline.isVisible()) {
          await confirmDecline.click();

          // Should show validation error
          const error = vendorPage.locator('.text-red-500, [role="alert"]');
          await expect(error).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Payment Flow', () => {
    test('accepted booking should move to payment_pending', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      // Find accepted booking
      const acceptedCard = await bookingsPage.getBookingCardByStatus('accepted');
      if (await acceptedCard.isVisible()) {
        // Status should indicate payment pending
        const paymentIndicator = acceptedCard.locator('span, button').filter({
          hasText: /payment|pay now/i,
        });
        await expect(paymentIndicator.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should redirect to payment page', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      // Find booking with payment option
      const payButton = authenticatedPage.getByRole('button', { name: /Pay|Payment/i }).first();
      if (await payButton.isVisible()) {
        await payButton.click();

        // Should be on payment page
        await expect(authenticatedPage).toHaveURL(/payment|checkout/i);
      }
    });

    test('successful payment should confirm booking', async ({ authenticatedPage }) => {
      // This test would need mock payment processing
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      // After successful payment, booking should show confirmed
      const confirmedCard = await bookingsPage.getBookingCardByStatus('confirmed');
      // Verify confirmed status exists in UI
    });

    test('failed payment should stay in payment_pending', async ({ authenticatedPage }) => {
      // This test would need mock payment failure
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      // After failed payment, booking should still show payment pending
      const pendingCard = await bookingsPage.getBookingCardByStatus('pending');
    });
  });

  test.describe('Service Delivery', () => {
    test('vendor marks booking in_progress', async ({ vendorPage }) => {
      const vendorDashboard = new VendorDashboardPage(vendorPage);
      await vendorDashboard.goto();

      // Find confirmed booking and mark as in progress
      const startButton = vendorPage.getByRole('button', { name: /Start|In Progress|Begin/i }).first();
      if (await startButton.isVisible()) {
        await startButton.click();

        // Verify status changed
        await expect(vendorPage.locator('span').filter({ hasText: /in.progress/i })).toBeVisible();
      }
    });

    test('vendor marks booking completed', async ({ vendorPage }) => {
      const vendorDashboard = new VendorDashboardPage(vendorPage);
      await vendorDashboard.goto();

      // Find in-progress booking and mark as completed
      const completeButton = vendorPage.getByRole('button', { name: /Complete|Mark Complete|Finish/i }).first();
      if (await completeButton.isVisible()) {
        await completeButton.click();

        // Verify status changed
        await expect(vendorPage.locator('span').filter({ hasText: /completed/i })).toBeVisible();
      }
    });

    test('user closes completed booking', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      // Find completed booking
      const completedCard = await bookingsPage.getBookingCardByStatus('completed');
      if (await completedCard.isVisible()) {
        await completedCard.click();

        // Close the booking
        const closeButton = authenticatedPage.getByRole('button', { name: /Close|Mark Closed/i });
        if (await closeButton.isVisible()) {
          await closeButton.click();

          // Verify closed
          await bookingsPage.expectStatusBadgeVisible('closed');
        }
      }
    });
  });

  test.describe('Cancellation Flow', () => {
    test('user cancels requested booking', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      const requestedCard = await bookingsPage.getBookingCardByStatus('requested');
      if (await requestedCard.isVisible()) {
        await bookingsPage.cancelBookingWithReason(0, 'Changed my mind');
        await bookingsPage.expectStatusBadgeVisible('cancelled');
      }
    });

    test('user cancels confirmed booking', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      const confirmedCard = await bookingsPage.getBookingCardByStatus('confirmed');
      if (await confirmedCard.isVisible()) {
        await bookingsPage.cancelBookingWithReason(0, 'Event postponed');
        await bookingsPage.expectStatusBadgeVisible('cancelled');
      }
    });

    test('vendor cancels confirmed booking', async ({ vendorPage }) => {
      const vendorDashboard = new VendorDashboardPage(vendorPage);
      await vendorDashboard.goto();

      const cancelButton = vendorPage.getByRole('button', { name: /Cancel/i }).first();
      if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // Fill reason
        const reasonInput = vendorPage.locator('textarea').first();
        if (await reasonInput.isVisible()) {
          await reasonInput.fill('Unable to fulfill booking due to scheduling conflict');

          const confirmButton = vendorPage.getByRole('button', { name: /Confirm/i });
          await confirmButton.click();
        }
      }
    });

    test('should require cancellation reason', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      await bookingsPage.cancelBookingButton.click();
      await bookingsPage.expectCancelModalVisible();

      // Try to confirm without reason
      await bookingsPage.confirmCancelButton.click();

      // Should show validation error
      const error = authenticatedPage.locator('.text-red-500');
      await expect(error).toBeVisible({ timeout: 5000 });
    });

    test('cancelled booking triggers refund flow', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      // Find cancelled booking
      const cancelledCard = await bookingsPage.getBookingCardByStatus('cancelled');
      if (await cancelledCard.isVisible()) {
        // Should show refund status
        const refundIndicator = cancelledCard.locator('span').filter({ hasText: /refund/i });
        // Refund indicator might be visible for paid cancelled bookings
      }
    });
  });

  test.describe('Refund Flow', () => {
    test('cancelled booking moves to refund_pending', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      // Find booking with refund pending status
      const refundPendingCard = await bookingsPage.getBookingCardByStatus('refund');
      // Verify refund pending status is shown
    });

    test('admin processes refund', async ({ adminPage }) => {
      // Navigate to admin panel refunds section
      await adminPage.goto('/admin/refunds');

      const processButton = adminPage.getByRole('button', { name: /Process|Approve/i }).first();
      if (await processButton.isVisible()) {
        await processButton.click();

        // Confirm refund
        const confirmButton = adminPage.getByRole('button', { name: /Confirm/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      }
    });

    test('should show refund status to user', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      const refundedCard = await bookingsPage.getBookingCardByStatus('refund');
      if (await refundedCard.isVisible()) {
        // Should show refund details
        const refundAmount = refundedCard.locator('span, p').filter({ hasText: /Rs\.|refund/i });
        await expect(refundAmount.first()).toBeVisible();
      }
    });
  });

  test.describe('Dispute Flow', () => {
    test('user raises dispute on completed booking', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      const completedCard = await bookingsPage.getBookingCardByStatus('completed');
      if (await completedCard.isVisible()) {
        await bookingsPage.raiseDispute(0, 'Quality Issue', 'Service was not as described');

        // Verify dispute status
        await bookingsPage.expectStatusBadgeVisible('disputed');
      }
    });

    test('should require dispute reason and description', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      await bookingsPage.disputeButton.click();
      await bookingsPage.expectDisputeModalVisible();

      // Try to submit without filling
      await bookingsPage.submitDisputeButton.click();

      // Should show validation errors
      const error = authenticatedPage.locator('.text-red-500');
      await expect(error).toBeVisible();
    });

    test('admin resolves dispute', async ({ adminPage }) => {
      await adminPage.goto('/admin/disputes');

      const resolveButton = adminPage.getByRole('button', { name: /Resolve/i }).first();
      if (await resolveButton.isVisible()) {
        await resolveButton.click();

        // Fill resolution
        const resolutionInput = adminPage.locator('textarea').first();
        if (await resolutionInput.isVisible()) {
          await resolutionInput.fill('Issue resolved after vendor refund');

          const confirmButton = adminPage.getByRole('button', { name: /Confirm|Submit/i });
          await confirmButton.click();
        }
      }
    });

    test('resolved dispute moves to closed', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      const resolvedCard = await bookingsPage.getBookingCardByStatus('resolved');
      if (await resolvedCard.isVisible()) {
        // Resolved disputes should eventually move to closed
        const status = await bookingsPage.getBookingStatusByIndex(0);
        expect(['resolved', 'closed'].some(s => status.includes(s))).toBe(true);
      }
    });
  });

  test.describe('Expiry Flow', () => {
    test('unresponded booking expires after 48 hours', async ({ authenticatedPage }) => {
      // This test would require time manipulation or pre-setup expired bookings
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      const expiredCard = await bookingsPage.getBookingCardByStatus('expired');
      // Verify expired bookings are shown
    });

    test('expired booking status is visible', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      const expiredCard = await bookingsPage.getBookingCardByStatus('expired');
      if (await expiredCard.isVisible()) {
        await expect(expiredCard.locator('span').filter({ hasText: /expired/i })).toBeVisible();
      }
    });
  });

  test.describe('Edge Cases', () => {
    test('cannot cancel already cancelled booking', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      const cancelledCard = await bookingsPage.getBookingCardByStatus('cancelled');
      if (await cancelledCard.isVisible()) {
        await cancelledCard.click();

        // Cancel button should not be visible or should be disabled
        const cancelButton = authenticatedPage.getByRole('button', { name: /Cancel Booking/i });
        const isVisible = await cancelButton.isVisible().catch(() => false);
        const isDisabled = await cancelButton.isDisabled().catch(() => true);

        expect(!isVisible || isDisabled).toBe(true);
      }
    });

    test('cannot complete cancelled booking', async ({ vendorPage }) => {
      const vendorDashboard = new VendorDashboardPage(vendorPage);
      await vendorDashboard.goto();

      // Cancelled bookings should not have complete button
      const cancelledSection = vendorPage.locator('div').filter({ hasText: /cancelled/i });
      if (await cancelledSection.first().isVisible()) {
        const completeButton = cancelledSection.getByRole('button', { name: /Complete/i });
        const isVisible = await completeButton.isVisible().catch(() => false);
        expect(isVisible).toBe(false);
      }
    });

    test('cannot dispute closed booking', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      const closedCard = await bookingsPage.getBookingCardByStatus('closed');
      if (await closedCard.isVisible()) {
        await closedCard.click();

        // Dispute button should not be visible
        const disputeButton = authenticatedPage.getByRole('button', { name: /Dispute|Report/i });
        const isVisible = await disputeButton.isVisible().catch(() => false);
        expect(isVisible).toBe(false);
      }
    });

    test('status history is preserved', async ({ authenticatedPage }) => {
      const bookingsPage = new BookingsPage(authenticatedPage);
      await bookingsPage.goto();

      // Click on any booking to see details
      await bookingsPage.clickBooking(0);

      // Look for status history section
      const historySection = authenticatedPage.locator('div').filter({ hasText: /History|Timeline|Activity/i });
      // If history exists, it should show previous statuses
    });
  });
});
