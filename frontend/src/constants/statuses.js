export const BOOKING_STATUSES = {
  DRAFT: "draft",
  REQUESTED: "requested",
  VENDOR_ACCEPTED: "vendor_accepted",
  VENDOR_DECLINED: "vendor_declined",
  PAYMENT_PENDING: "payment_pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED_BY_USER: "cancelled_by_user",
  CANCELLED_BY_VENDOR: "cancelled_by_vendor",
  REFUND_PENDING: "refund_pending",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
  RESOLVED: "resolved",
  EXPIRED: "expired",
  CLOSED: "closed",
};

export const BOOKING_STATUS_BADGES = {
  [BOOKING_STATUSES.DRAFT]: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  [BOOKING_STATUSES.REQUESTED]: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Requested" },
  [BOOKING_STATUSES.VENDOR_ACCEPTED]: { bg: "bg-blue-100", text: "text-blue-700", label: "Accepted" },
  [BOOKING_STATUSES.VENDOR_DECLINED]: { bg: "bg-red-100", text: "text-red-700", label: "Declined" },
  [BOOKING_STATUSES.PAYMENT_PENDING]: { bg: "bg-orange-100", text: "text-orange-700", label: "Payment Pending" },
  [BOOKING_STATUSES.CONFIRMED]: { bg: "bg-green-100", text: "text-green-700", label: "Confirmed" },
  [BOOKING_STATUSES.IN_PROGRESS]: { bg: "bg-indigo-100", text: "text-indigo-700", label: "In Progress" },
  [BOOKING_STATUSES.COMPLETED]: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed" },
  [BOOKING_STATUSES.CANCELLED_BY_USER]: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
  [BOOKING_STATUSES.CANCELLED_BY_VENDOR]: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled by Vendor" },
  [BOOKING_STATUSES.REFUND_PENDING]: { bg: "bg-amber-100", text: "text-amber-700", label: "Refund Pending" },
  [BOOKING_STATUSES.REFUNDED]: { bg: "bg-teal-100", text: "text-teal-700", label: "Refunded" },
  [BOOKING_STATUSES.DISPUTED]: { bg: "bg-rose-100", text: "text-rose-700", label: "Disputed" },
  [BOOKING_STATUSES.RESOLVED]: { bg: "bg-cyan-100", text: "text-cyan-700", label: "Resolved" },
  [BOOKING_STATUSES.EXPIRED]: { bg: "bg-stone-100", text: "text-stone-600", label: "Expired" },
  [BOOKING_STATUSES.CLOSED]: { bg: "bg-slate-100", text: "text-slate-600", label: "Closed" },
};

export const CONVERSATION_STATUSES = {
  ACTIVE: "active",
  AGREED: "agreed",
  BOOKING_CREATED: "booking_created",
  CLOSED: "closed",
};

export const CONVERSATION_STATUS_BADGES = {
  [CONVERSATION_STATUSES.ACTIVE]: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Active" },
  [CONVERSATION_STATUSES.AGREED]: { bg: "bg-blue-100", text: "text-blue-700", label: "Price Agreed" },
  [CONVERSATION_STATUSES.BOOKING_CREATED]: { bg: "bg-violet-100", text: "text-violet-700", label: "Booking Created" },
  [CONVERSATION_STATUSES.CLOSED]: { bg: "bg-stone-100", text: "text-stone-600", label: "Closed" },
};

export const PAYMENT_STATUSES = {
  PENDING: "pending",
  PARTIAL: "partial",
  COMPLETED: "completed",
  REFUNDED: "refunded",
  FAILED: "failed",
};
