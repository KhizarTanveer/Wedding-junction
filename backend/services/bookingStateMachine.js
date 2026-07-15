const Booking = require("../models/booking");
const Vendor = require("../models/vendor");
const { VALID_TRANSITIONS, BOOKING_STATUSES } = require("../models/booking");

/**
 * Booking State Machine Service
 * Handles all booking state transitions with proper validation and side effects
 */

class BookingStateMachine {
  /**
   * Check if a transition is valid
   * @param {string} currentStatus - Current booking status
   * @param {string} newStatus - Desired new status
   * @returns {boolean}
   */
  static canTransition(currentStatus, newStatus) {
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    return allowed.includes(newStatus);
  }

  /**
   * Get valid transitions for a status
   * @param {string} status - Current status
   * @returns {string[]} Array of valid next statuses
   */
  static getValidTransitions(status) {
    return VALID_TRANSITIONS[status] || [];
  }

  /**
   * Transition a booking to a new status
   * @param {Object} booking - Booking document
   * @param {string} newStatus - New status to transition to
   * @param {string} userId - User making the change
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Updated booking
   */
  static async transitionBooking(booking, newStatus, userId, options = {}) {
    if (!this.canTransition(booking.status, newStatus)) {
      throw new Error(
        `Invalid status transition: ${booking.status} -> ${newStatus}`
      );
    }

    const previousStatus = booking.status;

    // Apply transition
    booking.transitionTo(newStatus, userId, options);

    // Handle side effects
    await this.handleStatusSideEffects(booking, previousStatus, newStatus, userId, options);

    // Save the booking
    await booking.save();

    // Emit events for notifications (can be handled by event listeners)
    this.emitStatusChangeEvent(booking, previousStatus, newStatus, userId);

    return booking;
  }

  /**
   * Handle side effects of status changes
   * @param {Object} booking - Booking document
   * @param {string} from - Previous status
   * @param {string} to - New status
   * @param {string} userId - User making the change
   * @param {Object} options - Additional options
   */
  static async handleStatusSideEffects(booking, from, to, userId, options = {}) {
    switch (to) {
      case "requested":
        // Set expiry for vendor response (48 hours)
        booking.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
        break;

      case "vendor_accepted":
        booking.vendorResponse = {
          respondedAt: new Date(),
          accepted: true,
        };
        // Set expiry for payment (24 hours)
        booking.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        // Update vendor metrics
        await this.updateVendorMetrics(booking.vendor, "accepted");
        break;

      case "vendor_declined":
        booking.vendorResponse = {
          respondedAt: new Date(),
          accepted: false,
          declineReason: options.reason,
        };
        // Update vendor metrics
        await this.updateVendorMetrics(booking.vendor, "declined");
        break;

      case "payment_pending":
        // Set payment deadline
        booking.payment = booking.payment || {};
        booking.payment.status = "pending";
        break;

      case "confirmed":
        booking.isConfirmed = true;
        booking.payment = booking.payment || {};
        booking.payment.status = "completed";
        // Schedule event reminders
        this.scheduleEventReminders(booking);
        // Update vendor total bookings
        await this.updateVendorMetrics(booking.vendor, "confirmed");
        break;

      case "in_progress":
        // Nothing specific needed
        break;

      case "completed":
        booking.completedAt = new Date();
        booking.completedBy = userId;
        // Update vendor metrics
        await this.updateVendorMetrics(booking.vendor, "completed", booking);
        // Schedule review reminder
        booking.scheduleReminder("review", new Date(Date.now() + 24 * 60 * 60 * 1000), "email");
        break;

      case "cancelled_by_user":
      case "cancelled_by_vendor":
        booking.cancellation = {
          cancelledBy: userId,
          cancelledAt: new Date(),
          reason: options.reason,
          policy: booking.calculateRefundPolicy(),
        };
        // Update vendor metrics
        await this.updateVendorMetrics(booking.vendor, "cancelled");
        break;

      case "refund_pending":
        // Process refund (integrate with payment gateway)
        break;

      case "refunded":
        booking.payment = booking.payment || {};
        booking.payment.status = "refunded";
        break;

      case "disputed":
        booking.dispute = {
          ...booking.dispute,
          raisedBy: userId,
          raisedAt: new Date(),
          reason: options.reason,
          description: options.description,
          evidence: options.evidence || [],
        };
        break;

      case "resolved":
        booking.dispute = {
          ...booking.dispute,
          resolution: {
            resolvedBy: userId,
            resolvedAt: new Date(),
            decision: options.decision,
            refundAmount: options.refundAmount || 0,
          },
        };
        break;

      case "expired":
        // Nothing specific needed
        break;

      case "closed":
        // Final state, cleanup if needed
        break;
    }
  }

  /**
   * Update vendor metrics based on booking action
   * @param {string} vendorId - Vendor ID
   * @param {string} action - Action type
   * @param {Object} booking - Booking document (for completed bookings)
   */
  static async updateVendorMetrics(vendorId, action, booking = null) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return;

      switch (action) {
        case "accepted":
          // Update accept rate
          break;

        case "declined":
          // Update decline count
          break;

        case "confirmed":
          vendor.metrics.totalBookings = (vendor.metrics.totalBookings || 0) + 1;
          break;

        case "completed":
          vendor.metrics.completedBookings = (vendor.metrics.completedBookings || 0) + 1;
          vendor.metrics.totalRevenue =
            (vendor.metrics.totalRevenue || 0) + (booking?.finalPrice || 0);
          // Update completion rate
          if (vendor.metrics.totalBookings > 0) {
            vendor.metrics.completionRate =
              (vendor.metrics.completedBookings / vendor.metrics.totalBookings) * 100;
          }
          // Update events completed
          vendor.experienceDetails = vendor.experienceDetails || {};
          vendor.experienceDetails.eventsCompleted =
            (vendor.experienceDetails.eventsCompleted || 0) + 1;
          break;

        case "cancelled":
          vendor.metrics.cancelledBookings = (vendor.metrics.cancelledBookings || 0) + 1;
          break;
      }

      await vendor.save();
    } catch (error) {
      console.error("Error updating vendor metrics:", error);
    }
  }

  /**
   * Schedule reminders for an event
   * @param {Object} booking - Booking document
   */
  static scheduleEventReminders(booking) {
    const eventDate = booking.clientDetails?.eventDate || booking.event?.date;
    if (!eventDate) return;

    const reminderTimes = [
      { days: 7, type: "event" },
      { days: 3, type: "event" },
      { days: 1, type: "event" },
    ];

    reminderTimes.forEach(({ days, type }) => {
      const reminderDate = new Date(eventDate);
      reminderDate.setDate(reminderDate.getDate() - days);

      if (reminderDate > new Date()) {
        booking.scheduleReminder(type, reminderDate, "email");
      }
    });
  }

  /**
   * Emit status change event (for notification service)
   * @param {Object} booking - Booking document
   * @param {string} from - Previous status
   * @param {string} to - New status
   * @param {string} userId - User who made the change
   */
  static emitStatusChangeEvent(booking, from, to, userId) {
    // This can be integrated with an event emitter or message queue
    // For now, just log the event
    console.log(`Booking ${booking.bookingId}: ${from} -> ${to} by ${userId}`);

    // In a real implementation:
    // eventEmitter.emit('booking:statusChanged', { booking, from, to, userId });
  }

  /**
   * Process expired bookings
   * @returns {Promise<number>} Number of expired bookings
   */
  static async processExpiredBookings() {
    const expiredBookings = await Booking.find({
      status: { $in: ["requested", "payment_pending", "vendor_accepted"] },
      expiresAt: { $lt: new Date() },
    });

    let count = 0;
    for (const booking of expiredBookings) {
      try {
        await this.transitionBooking(booking, "expired", null, {
          reason: "Booking expired due to no response or payment",
        });
        count++;
      } catch (error) {
        console.error(`Error expiring booking ${booking._id}:`, error);
      }
    }

    return count;
  }

  /**
   * Batch close old completed/cancelled bookings
   * @param {number} daysOld - Close bookings older than this many days
   * @returns {Promise<number>} Number of closed bookings
   */
  static async closeOldBookings(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const bookingsToClose = await Booking.find({
      status: {
        $in: ["completed", "refunded", "resolved", "vendor_declined", "expired"],
      },
      updatedAt: { $lt: cutoffDate },
    });

    let count = 0;
    for (const booking of bookingsToClose) {
      try {
        await this.transitionBooking(booking, "closed", null, {
          reason: "Auto-closed after completion",
        });
        count++;
      } catch (error) {
        console.error(`Error closing booking ${booking._id}:`, error);
      }
    }

    return count;
  }

  /**
   * Get booking statistics by status
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Statistics object
   */
  static async getStatusStatistics(filters = {}) {
    const stats = await Booking.aggregate([
      { $match: filters },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {};
    BOOKING_STATUSES.forEach((status) => {
      result[status] = 0;
    });

    stats.forEach((stat) => {
      result[stat._id] = stat.count;
    });

    return result;
  }
}

module.exports = BookingStateMachine;
