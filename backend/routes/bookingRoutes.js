const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validateMiddleware");
const { validateObjectId } = require("../middlewares/validateObjectId");

const {
  createBooking,
  getBookings,
  getBookingById,
  deleteBooking,
  confirmBooking,
} = require("../controllers/bookingController");

// All booking routes require authentication
router.post("/bookings", protect, validate("booking"), createBooking);
router.get("/bookings", protect, getBookings);
router.get("/bookings/:id", protect, validateObjectId("id"), getBookingById);
router.delete("/bookings/:id", protect, validateObjectId("id"), deleteBooking);
router.put("/bookings/:id", protect, validateObjectId("id"), confirmBooking);

module.exports = router;
