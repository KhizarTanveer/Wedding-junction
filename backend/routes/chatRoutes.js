const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { validateObjectId } = require("../middlewares/validateObjectId");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const {
  startConversation,
  getConversations,
  getConversation,
  sendMessage,
  uploadImage,
  updatePrice,
  createBookingFromChat,
  markAsRead,
  closeConversation,
  deleteConversation,
  updateMessage,
  deleteMessage,
} = require("../controllers/chatController");

// All chat routes require authentication
router.post("/start", protect, startConversation);
router.get("/conversations", protect, getConversations);
router.get("/:id", protect, validateObjectId("id"), getConversation);
router.post("/:id/messages", protect, validateObjectId("id"), sendMessage);
router.post("/:id/image", protect, validateObjectId("id"), ...uploadMiddleware.chatImage, uploadImage);
router.patch("/:id/price", protect, validateObjectId("id"), updatePrice);
router.post("/:id/booking", protect, validateObjectId("id"), createBookingFromChat);
router.patch("/:id/read", protect, validateObjectId("id"), markAsRead);
router.patch("/:id/close", protect, validateObjectId("id"), closeConversation);
router.delete("/:id", protect, validateObjectId("id"), deleteConversation);

// Message edit and delete routes
router.patch("/messages/:messageId", protect, validateObjectId("messageId"), updateMessage);
router.delete("/messages/:messageId", protect, validateObjectId("messageId"), deleteMessage);

module.exports = router;
