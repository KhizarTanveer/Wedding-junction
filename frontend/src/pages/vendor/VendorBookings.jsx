import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../config/api";

// All booking status configurations
const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    color: "bg-stone-100 text-stone-600 border-stone-200",
    description: "Booking is being prepared",
  },
  requested: {
    label: "Requested",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    description: "Awaiting your response",
    actions: ["accept", "decline", "counter_offer"],
  },
  vendor_accepted: {
    label: "Accepted",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Waiting for customer payment",
  },
  vendor_declined: {
    label: "Declined",
    color: "bg-red-100 text-red-700 border-red-200",
    description: "You declined this booking",
  },
  payment_pending: {
    label: "Payment Pending",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    description: "Waiting for customer payment",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    description: "Booking confirmed",
    actions: ["start", "cancel"],
  },
  in_progress: {
    label: "In Progress",
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    description: "Service is being delivered",
    actions: ["complete"],
  },
  completed: {
    label: "Completed",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Service has been delivered",
  },
  cancelled_by_user: {
    label: "Cancelled by User",
    color: "bg-red-100 text-red-600 border-red-200",
    description: "Customer cancelled this booking",
  },
  cancelled_by_vendor: {
    label: "Cancelled by Vendor",
    color: "bg-red-100 text-red-600 border-red-200",
    description: "You cancelled this booking",
  },
  refund_pending: {
    label: "Refund Pending",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    description: "Refund is being processed",
  },
  refunded: {
    label: "Refunded",
    color: "bg-stone-100 text-stone-600 border-stone-200",
    description: "Payment has been refunded",
  },
  disputed: {
    label: "Disputed",
    color: "bg-red-100 text-red-700 border-red-200",
    description: "Customer raised a dispute",
    actions: ["resolve_dispute"],
  },
  resolved: {
    label: "Resolved",
    color: "bg-teal-100 text-teal-700 border-teal-200",
    description: "Dispute has been resolved",
  },
  closed: {
    label: "Closed",
    color: "bg-stone-100 text-stone-600 border-stone-200",
    description: "Booking is closed",
  },
  expired: {
    label: "Expired",
    color: "bg-stone-100 text-stone-500 border-stone-200",
    description: "Booking request expired",
  },
};

// Filter groups
const FILTER_GROUPS = [
  { value: "all", label: "All Bookings" },
  { value: "action_required", label: "Action Required", highlight: true },
  { value: "requested", label: "New Requests" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "disputed", label: "Disputed" },
];

function VendorBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [modalState, setModalState] = useState({ type: null, booking: null });
  const [counterOfferPrice, setCounterOfferPrice] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [disputeResponse, setDisputeResponse] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      let queryParam = filter;
      if (filter === "action_required") {
        queryParam = "requested,disputed";
      } else if (filter === "cancelled") {
        queryParam = "cancelled_by_user,cancelled_by_vendor";
      }

      const res = await fetch(
        `${API_URL}/api/vendor/bookings?status=${queryParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (data.status === "success") {
        setBookings(data.bookings);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (bookingId, action, payload = {}) => {
    try {
      setActionLoading(bookingId);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/vendor/bookings/${bookingId}/${action}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (data.status === "success") {
        // Refresh bookings after action
        fetchBookings();
        closeModal();
      } else {
        alert(data.message || `Failed to ${action} booking`);
      }
    } catch (err) {
      alert(`Failed to ${action} booking`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = (bookingId) => handleAction(bookingId, "accept");

  const handleDecline = (bookingId) => {
    if (!declineReason.trim()) {
      alert("Please provide a reason for declining");
      return;
    }
    handleAction(bookingId, "decline", { reason: declineReason });
  };

  const handleCounterOffer = (bookingId) => {
    const price = parseFloat(counterOfferPrice);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price");
      return;
    }
    handleAction(bookingId, "counter-offer", { counterOfferPrice: price });
  };

  const handleStart = (bookingId) => handleAction(bookingId, "start");

  const handleComplete = (bookingId) => handleAction(bookingId, "complete");

  const handleCancel = (bookingId) => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }
    handleAction(bookingId, "cancel", { reason: cancelReason });
  };

  const handleResolveDispute = (bookingId) => {
    if (!disputeResponse.trim()) {
      alert("Please provide a response");
      return;
    }
    handleAction(bookingId, "resolve-dispute", { response: disputeResponse });
  };

  const openModal = (type, booking) => {
    setModalState({ type, booking });
    setCounterOfferPrice(booking.price?.toString() || "");
    setDeclineReason("");
    setCancelReason("");
    setDisputeResponse("");
  };

  const closeModal = () => {
    setModalState({ type: null, booking: null });
    setCounterOfferPrice("");
    setDeclineReason("");
    setCancelReason("");
    setDisputeResponse("");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="spinner-luxury mx-auto mb-4"></div>
          <p className="text-stone-500 font-medium">Loading bookings...</p>
        </div>
      </div>
    );
  }

  const actionRequiredCount = bookings.filter(
    (b) => b.status === "requested" || b.status === "disputed"
  ).length;

  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link
            to="/vendor"
            className="text-sm text-orange-600 hover:text-orange-700 mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif text-slate-800 mt-2">
            Manage Bookings
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-4"></div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTER_GROUPS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all relative ${
                filter === f.value
                  ? "bg-orange-500 text-white"
                  : "bg-white text-stone-600 hover:bg-orange-50 border border-stone-200"
              }`}
            >
              {f.label}
              {f.value === "action_required" && actionRequiredCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {actionRequiredCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Bookings List */}
        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.draft;
              const isExpanded = expandedBooking === booking._id;

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-luxury-xl shadow-soft border border-stone-100 overflow-hidden"
                >
                  {/* Main Content */}
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="font-mono text-sm text-slate-600 bg-stone-100 px-2 py-1 rounded">
                            {booking.bookingId || `#${booking._id.slice(-8).toUpperCase()}`}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          {booking.isUrgent && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Urgent
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-medium text-slate-800 mb-1">
                          {booking.userName}
                        </h3>
                        <p className="text-stone-500 text-sm mb-2">{booking.userEmail}</p>
                        <p className="text-slate-700">{booking.service}</p>

                        {/* Price Display */}
                        <div className="mt-3">
                          <p className="text-xl font-semibold text-orange-600">
                            Rs. {booking.price?.toLocaleString("en-IN")}
                          </p>
                          {booking.vendorResponse?.counterOffer && (
                            <p className="text-sm text-stone-500">
                              Counter offer: Rs. {booking.vendorResponse.counterOffer.toLocaleString("en-IN")}
                            </p>
                          )}
                          {booking.payment?.status === "paid" && (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 mt-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Payment received
                            </span>
                          )}
                        </div>

                        {/* Status Description */}
                        <p className="text-sm text-stone-500 mt-2 italic">
                          {statusConfig.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {booking.status === "requested" && (
                          <>
                            <button
                              onClick={() => handleAccept(booking._id)}
                              disabled={actionLoading === booking._id}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 text-sm font-medium"
                            >
                              {actionLoading === booking._id ? "..." : "Accept"}
                            </button>
                            <button
                              onClick={() => openModal("counter_offer", booking)}
                              disabled={actionLoading === booking._id}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm font-medium"
                            >
                              Counter Offer
                            </button>
                            <button
                              onClick={() => openModal("decline", booking)}
                              disabled={actionLoading === booking._id}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm font-medium"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {booking.status === "confirmed" && (
                          <>
                            <button
                              onClick={() => handleStart(booking._id)}
                              disabled={actionLoading === booking._id}
                              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 text-sm font-medium"
                            >
                              {actionLoading === booking._id ? "..." : "Start Service"}
                            </button>
                            <button
                              onClick={() => openModal("cancel", booking)}
                              disabled={actionLoading === booking._id}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {booking.status === "in_progress" && (
                          <button
                            onClick={() => handleComplete(booking._id)}
                            disabled={actionLoading === booking._id}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm font-medium"
                          >
                            {actionLoading === booking._id ? "..." : "Mark Complete"}
                          </button>
                        )}

                        {booking.status === "disputed" && (
                          <button
                            onClick={() => openModal("dispute", booking)}
                            disabled={actionLoading === booking._id}
                            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 text-sm font-medium"
                          >
                            Respond to Dispute
                          </button>
                        )}

                        {booking.conversation && (
                          <Link
                            to={`/chat/${booking.conversation}`}
                            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm font-medium"
                          >
                            View Chat
                          </Link>
                        )}

                        <button
                          onClick={() => setExpandedBooking(isExpanded ? null : booking._id)}
                          className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors text-sm font-medium"
                        >
                          {isExpanded ? "Hide Details" : "View Details"}
                        </button>
                      </div>
                    </div>

                    {/* Event Details Summary */}
                    {booking.clientDetails && (
                      <div className="mt-4 pt-4 border-t border-stone-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-stone-400">Event Date</span>
                            <p className="text-slate-700 font-medium">
                              {formatDate(booking.clientDetails.eventDate)}
                            </p>
                          </div>
                          <div>
                            <span className="text-stone-400">Event Type</span>
                            <p className="text-slate-700">{booking.clientDetails.eventType || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-stone-400">Guests</span>
                            <p className="text-slate-700">{booking.clientDetails.guestCount || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-stone-400">Phone</span>
                            <p className="text-slate-700">{booking.clientDetails.phone}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="bg-stone-50 border-t border-stone-100 p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Client Details */}
                        <div>
                          <h4 className="font-medium text-slate-800 mb-3">Client Details</h4>
                          <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-stone-500">Name</dt>
                              <dd className="text-slate-700">{booking.userName}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-stone-500">Email</dt>
                              <dd className="text-slate-700">{booking.userEmail}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-stone-500">Phone</dt>
                              <dd className="text-slate-700">{booking.clientDetails?.phone || "N/A"}</dd>
                            </div>
                            {booking.clientDetails?.address && (
                              <div className="flex justify-between">
                                <dt className="text-stone-500">Address</dt>
                                <dd className="text-slate-700 text-right">{booking.clientDetails.address}</dd>
                              </div>
                            )}
                          </dl>

                          {/* Special Requests */}
                          {booking.clientDetails?.specialRequests && (
                            <div className="mt-4">
                              <h5 className="text-stone-500 text-sm mb-1">Special Requests</h5>
                              <p className="text-slate-700 text-sm bg-white p-3 rounded-lg">
                                {booking.clientDetails.specialRequests}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Status History */}
                        <div>
                          <h4 className="font-medium text-slate-800 mb-3">Status History</h4>
                          {booking.statusHistory?.length > 0 ? (
                            <div className="space-y-3">
                              {booking.statusHistory.slice().reverse().map((history, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5"></div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700">
                                      {history.status?.replace(/_/g, " ")}
                                    </p>
                                    <p className="text-xs text-stone-500">
                                      {formatDateTime(history.changedAt)}
                                    </p>
                                    {history.reason && (
                                      <p className="text-xs text-stone-600 mt-1">
                                        Reason: {history.reason}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-stone-500 text-sm">No status history available</p>
                          )}
                        </div>
                      </div>

                      {/* Dispute Information */}
                      {booking.dispute && (
                        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
                          <h4 className="font-medium text-red-700 mb-2">Dispute Information</h4>
                          <p className="text-sm text-red-600 mb-2">
                            <span className="font-medium">Reason:</span> {booking.dispute.reason}
                          </p>
                          {booking.dispute.description && (
                            <p className="text-sm text-red-600">
                              <span className="font-medium">Description:</span> {booking.dispute.description}
                            </p>
                          )}
                          {booking.dispute.resolution && (
                            <div className="mt-3 pt-3 border-t border-red-200">
                              <p className="text-sm text-teal-600">
                                <span className="font-medium">Resolution:</span> {booking.dispute.resolution.outcome}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Vendor Response */}
                      {booking.vendorResponse?.declineReason && (
                        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                          <h4 className="font-medium text-amber-700 mb-2">Decline Reason</h4>
                          <p className="text-sm text-amber-600">{booking.vendorResponse.declineReason}</p>
                        </div>
                      )}

                      {/* Cancellation Info */}
                      {booking.cancellation && (
                        <div className="mt-6 p-4 bg-stone-100 rounded-lg">
                          <h4 className="font-medium text-slate-700 mb-2">Cancellation Details</h4>
                          <p className="text-sm text-stone-600">
                            <span className="font-medium">Cancelled by:</span> {booking.cancellation.cancelledBy}
                          </p>
                          {booking.cancellation.reason && (
                            <p className="text-sm text-stone-600">
                              <span className="font-medium">Reason:</span> {booking.cancellation.reason}
                            </p>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-stone-400 mt-4">
                        Created: {formatDateTime(booking.createdAt)}
                        {booking.expiresAt && (
                          <span className="ml-4">
                            Expires: {formatDateTime(booking.expiresAt)}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-luxury-xl shadow-soft p-12 text-center">
            <svg
              className="w-16 h-16 text-stone-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-stone-500">No bookings found</p>
            <p className="text-sm text-stone-400 mt-2">
              {filter !== "all" && "Try changing your filter or "}
              check back later for new bookings
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalState.type && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-luxury-xl shadow-elegant max-w-md w-full p-6">
            {/* Counter Offer Modal */}
            {modalState.type === "counter_offer" && (
              <>
                <h3 className="text-xl font-serif text-slate-800 mb-4">Make Counter Offer</h3>
                <p className="text-stone-500 text-sm mb-4">
                  Original price: Rs. {modalState.booking?.price?.toLocaleString("en-IN")}
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Counter Offer Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">Rs.</span>
                    <input
                      type="number"
                      value={counterOfferPrice}
                      onChange={(e) => setCounterOfferPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your price"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCounterOffer(modalState.booking._id)}
                    disabled={actionLoading === modalState.booking._id}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {actionLoading === modalState.booking._id ? "Sending..." : "Send Offer"}
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Decline Modal */}
            {modalState.type === "decline" && (
              <>
                <h3 className="text-xl font-serif text-slate-800 mb-4">Decline Booking</h3>
                <p className="text-stone-500 text-sm mb-4">
                  Please provide a reason for declining this booking request.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reason for Declining
                  </label>
                  <textarea
                    name="rejectionReason"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder="e.g., Date is not available, Outside service area..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDecline(modalState.booking._id)}
                    disabled={actionLoading === modalState.booking._id}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    {actionLoading === modalState.booking._id ? "..." : "Decline Booking"}
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200"
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {/* Cancel Modal */}
            {modalState.type === "cancel" && (
              <>
                <h3 className="text-xl font-serif text-slate-800 mb-4">Cancel Booking</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-amber-700 text-sm">
                    Cancelling confirmed bookings may affect your vendor rating and could result in refund obligations.
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reason for Cancellation
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder="Please provide a detailed reason..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCancel(modalState.booking._id)}
                    disabled={actionLoading === modalState.booking._id}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    {actionLoading === modalState.booking._id ? "..." : "Cancel Booking"}
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200"
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {/* Dispute Response Modal */}
            {modalState.type === "dispute" && (
              <>
                <h3 className="text-xl font-serif text-slate-800 mb-4">Respond to Dispute</h3>
                {modalState.booking?.dispute && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                    <p className="text-red-700 text-sm font-medium">Customer&apos;s Concern:</p>
                    <p className="text-red-600 text-sm mt-1">{modalState.booking.dispute.reason}</p>
                    {modalState.booking.dispute.description && (
                      <p className="text-red-600 text-sm mt-1">{modalState.booking.dispute.description}</p>
                    )}
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={disputeResponse}
                    onChange={(e) => setDisputeResponse(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={4}
                    placeholder="Provide your response to the dispute..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleResolveDispute(modalState.booking._id)}
                    disabled={actionLoading === modalState.booking._id}
                    className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
                  >
                    {actionLoading === modalState.booking._id ? "..." : "Submit Response"}
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default VendorBookings;
