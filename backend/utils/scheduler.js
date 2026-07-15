const cron = require("node-cron");
const Booking = require("../models/booking");
const VendorApplication = require("../models/vendorApplication");

/**
 * Initialize scheduled tasks
 */
const initScheduler = () => {
  console.log("Initializing scheduler...");

  // Expire bookings every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    try {
      const expiredCount = await Booking.expireBookings();
      if (expiredCount > 0) {
        console.log(`[Scheduler] Expired ${expiredCount} bookings`);
      }
    } catch (error) {
      console.error("[Scheduler] Error expiring bookings:", error.message);
    }
  });

  // Clean up draft vendor applications daily at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await VendorApplication.deleteMany({
        status: "draft",
        createdAt: { $lt: thirtyDaysAgo },
      });

      if (result.deletedCount > 0) {
        console.log(`[Scheduler] Cleaned up ${result.deletedCount} draft applications`);
      }
    } catch (error) {
      console.error("[Scheduler] Error cleaning draft applications:", error.message);
    }
  });

  // Clean up expired booking drafts daily at 1 AM
  cron.schedule("0 1 * * *", async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await Booking.updateMany(
        {
          status: "draft",
          createdAt: { $lt: sevenDaysAgo },
        },
        {
          $set: {
            status: "expired",
            statusHistory: {
              $push: {
                status: "expired",
                changedAt: new Date(),
                reason: "Draft booking expired due to inactivity",
              },
            },
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`[Scheduler] Expired ${result.modifiedCount} draft bookings`);
      }
    } catch (error) {
      console.error("[Scheduler] Error expiring draft bookings:", error.message);
    }
  });

  console.log("Scheduler initialized with the following jobs:");
  console.log("  - Expire bookings: every 15 minutes");
  console.log("  - Clean draft applications: daily at midnight");
  console.log("  - Expire draft bookings: daily at 1 AM");
};

module.exports = { initScheduler };
