import { useEffect, useState } from "react";
import { API_URL } from "../../config/api";

function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPendingReviews();
  }, [page]);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/reviews/admin/pending?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch reviews");
      }

      setReviews(data.reviews || []);
      setTotalPages(data.pagination?.pages || 1);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    if (!window.confirm("Are you sure you want to approve this review?")) return;

    try {
      setProcessing(true);
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/moderate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "approve",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to approve review");
      }

      fetchPendingReviews();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (review) => {
    setSelectedReview(review);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessing(true);
      const res = await fetch(
        `${API_URL}/api/reviews/${selectedReview._id}/moderate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "reject",
            reason: rejectReason,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reject review");
      }

      setShowRejectModal(false);
      setSelectedReview(null);
      setRejectReason("");
      fetchPendingReviews();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={i < rating ? "text-amber-400" : "text-stone-300"}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="spinner-luxury mx-auto mb-4"></div>
          <p className="text-stone-500 font-medium">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
            Admin Panel
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-slate-800 mt-2">
            Review Moderation
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-4"></div>
          <p className="text-stone-500 mt-3">
            Approve or reject pending reviews before they are published.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-luxury-xl shadow-soft">
            <div className="text-5xl mb-4">✓</div>
            <p className="text-stone-500 font-medium">No pending reviews</p>
            <p className="text-stone-400 text-sm mt-1">
              All reviews have been moderated
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-luxury-xl shadow-soft overflow-hidden border border-stone-100"
              >
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium">
                          {review.user?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {review.user?.name || "Anonymous"}
                          </h3>
                          <p className="text-sm text-stone-500">
                            {review.user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-lg">
                        {renderStars(review.rating)}
                        <span className="text-sm text-stone-500 ml-1">
                          ({review.rating}/5)
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-stone-500">
                        Vendor:{" "}
                        <span className="font-medium text-slate-700">
                          {review.vendor?.name || "Unknown"}
                        </span>
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Review Content */}
                  {review.title && (
                    <h4 className="font-medium text-slate-800 mb-2">
                      {review.title}
                    </h4>
                  )}
                  <p className="text-slate-600 mb-4">{review.comment}</p>

                  {/* Booking Info */}
                  {review.booking && (
                    <div className="bg-stone-50 rounded-lg p-3 mb-4 text-sm">
                      <span className="text-stone-500">Booking: </span>
                      <span className="text-slate-700">
                        {review.booking.service || "Service"} -{" "}
                        {review.booking.status}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-stone-100">
                    <button
                      onClick={() => handleApprove(review._id)}
                      disabled={processing}
                      className="flex-1 px-4 py-2.5 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(review)}
                      disabled={processing}
                      className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white border border-stone-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white border border-stone-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <div
              className="bg-white rounded-luxury-xl shadow-luxury-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-stone-200">
                <h2 className="text-xl font-serif text-slate-800">
                  Reject Review
                </h2>
              </div>

              <div className="p-6">
                <p className="text-stone-600 mb-4">
                  Please provide a reason for rejecting this review. This will
                  be sent to the user.
                </p>

                <div className="mb-4">
                  <label className="text-sm font-medium text-slate-600 block mb-1.5">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="4"
                    placeholder="e.g., Review contains inappropriate content, spam, or violates our guidelines..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-200/50 focus:border-orange-400 transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 px-6 py-3 bg-stone-100 text-slate-700 rounded-full font-medium hover:bg-stone-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processing || !rejectReason.trim()}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? "Rejecting..." : "Reject Review"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ManageReviews;
