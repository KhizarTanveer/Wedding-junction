import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { API_URL } from "../../../config/api";

function StarDisplay({ rating, size = "sm" }) {
  const sizeClasses = size === "lg" ? "w-5 h-5" : "w-4 h-4";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClasses} ${
            star <= rating ? "text-amber-400 fill-amber-400" : "text-stone-200"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ))}
    </div>
  );
}

StarDisplay.propTypes = {
  rating: PropTypes.number.isRequired,
  size: PropTypes.string,
};

function RatingSummary({ summary }) {
  if (!summary) return null;

  const { averageRating, totalReviews, distribution } = summary;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-slate-800">
            {averageRating?.toFixed(1) || "N/A"}
          </div>
          <div className="mt-2">
            <StarDisplay rating={Math.round(averageRating || 0)} size="lg" />
          </div>
          <p className="text-sm text-stone-500 mt-2">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution?.[stars] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-2 mb-1">
                <span className="text-sm text-stone-600 w-3">{stars}</span>
                <svg
                  className="w-4 h-4 text-amber-400 fill-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-stone-500 w-8">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Category Ratings */}
        {summary.categoryAverages && (
          <div className="border-l border-orange-200 pl-6 hidden lg:block">
            <h4 className="text-sm font-medium text-slate-700 mb-2">By Category</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(summary.categoryAverages).map(([category, avg]) => (
                <div key={category} className="flex justify-between gap-4">
                  <span className="text-stone-500 capitalize">
                    {category.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="font-medium text-slate-700">{avg.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

RatingSummary.propTypes = {
  summary: PropTypes.shape({
    averageRating: PropTypes.number,
    totalReviews: PropTypes.number,
    distribution: PropTypes.object,
    categoryAverages: PropTypes.object,
  }),
};

function ReviewCard({ review, onHelpful, onReport }) {
  const [showFullReview, setShowFullReview] = useState(false);
  const [helpfulLoading, setHelpfulLoading] = useState(false);

  const isLongReview = review.content?.text?.length > 300;
  const displayText = showFullReview
    ? review.content?.text
    : review.content?.text?.slice(0, 300);

  const handleHelpful = async () => {
    setHelpfulLoading(true);
    await onHelpful?.(review._id);
    setHelpfulLoading(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl border border-stone-100 p-6">
      {/* Reviewer Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
            <span className="text-orange-600 font-medium">
              {review.reviewer?.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <p className="font-medium text-slate-800">
              {review.reviewer?.name || "Anonymous"}
            </p>
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <span>{formatDate(review.createdAt)}</span>
              {review.isVerifiedBooking && (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Verified Booking
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2">
            <StarDisplay rating={review.ratings?.overall || 0} />
            <span className="font-medium text-slate-800">
              {review.ratings?.overall || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Review Title */}
      {review.content?.title && (
        <h4 className="font-medium text-slate-800 mb-2">{review.content.title}</h4>
      )}

      {/* Review Text */}
      <p className="text-stone-600 leading-relaxed">
        {displayText}
        {isLongReview && !showFullReview && "..."}
      </p>
      {isLongReview && (
        <button
          onClick={() => setShowFullReview(!showFullReview)}
          className="text-orange-600 text-sm font-medium mt-2 hover:text-orange-700"
        >
          {showFullReview ? "Show less" : "Read more"}
        </button>
      )}

      {/* Pros & Cons */}
      {(review.content?.pros?.length > 0 || review.content?.cons?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {review.content?.pros?.length > 0 && (
            <div className="bg-emerald-50 rounded-lg p-3">
              <h5 className="text-sm font-medium text-emerald-700 mb-2">Pros</h5>
              <ul className="space-y-1">
                {review.content.pros.map((pro, idx) => (
                  <li key={idx} className="text-sm text-emerald-600 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {review.content?.cons?.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <h5 className="text-sm font-medium text-red-700 mb-2">Cons</h5>
              <ul className="space-y-1">
                {review.content.cons.map((con, idx) => (
                  <li key={idx} className="text-sm text-red-600 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Category Ratings */}
      {review.ratings && Object.keys(review.ratings).length > 1 && (
        <div className="mt-4 pt-4 border-t border-stone-100">
          <div className="flex flex-wrap gap-4 text-sm">
            {Object.entries(review.ratings)
              .filter(([key]) => key !== "overall")
              .map(([key, value]) => (
                <div key={key} className="flex items-center gap-1">
                  <span className="text-stone-500 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}:
                  </span>
                  <span className="font-medium text-slate-700">{value}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Vendor Response */}
      {review.response?.text && (
        <div className="mt-4 bg-stone-50 rounded-lg p-4 border-l-4 border-orange-400">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-slate-700">Vendor Response</span>
            <span className="text-xs text-stone-500">
              {formatDate(review.response.respondedAt)}
            </span>
          </div>
          <p className="text-sm text-stone-600">{review.response.text}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleHelpful}
            disabled={helpfulLoading}
            className={`flex items-center gap-1 text-sm ${
              review.isHelpful
                ? "text-orange-600 font-medium"
                : "text-stone-500 hover:text-orange-600"
            } transition-colors`}
          >
            <svg
              className={`w-4 h-4 ${review.isHelpful ? "fill-current" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            <span>Helpful ({review.helpful?.count || 0})</span>
          </button>
        </div>

        <button
          onClick={() => onReport?.(review._id)}
          className="text-sm text-stone-400 hover:text-red-500 transition-colors"
        >
          Report
        </button>
      </div>
    </div>
  );
}

ReviewCard.propTypes = {
  review: PropTypes.shape({
    _id: PropTypes.string,
    reviewer: PropTypes.shape({
      name: PropTypes.string,
    }),
    createdAt: PropTypes.string,
    isVerifiedBooking: PropTypes.bool,
    ratings: PropTypes.object,
    content: PropTypes.shape({
      title: PropTypes.string,
      text: PropTypes.string,
      pros: PropTypes.arrayOf(PropTypes.string),
      cons: PropTypes.arrayOf(PropTypes.string),
    }),
    response: PropTypes.shape({
      text: PropTypes.string,
      respondedAt: PropTypes.string,
    }),
    helpful: PropTypes.shape({
      count: PropTypes.number,
    }),
    isHelpful: PropTypes.bool,
  }).isRequired,
  onHelpful: PropTypes.func,
  onReport: PropTypes.func,
};

function ReviewList({ vendorId }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("-createdAt");
  const [filterRating, setFilterRating] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [vendorId, page, sortBy, filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sort: sortBy,
      });

      if (filterRating) {
        queryParams.append("rating", filterRating);
      }

      const res = await fetch(
        `${API_URL}/api/reviews/vendors/${vendorId}/reviews?${queryParams}`
      );

      const data = await res.json();

      if (data.status === "success") {
        setReviews(data.data.reviews);
        setSummary(data.data.summary);
        setTotalPages(data.data.pagination?.totalPages || 1);
      } else {
        setError(data.message || "Failed to load reviews");
      }
    } catch (err) {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to mark reviews as helpful");
        return;
      }

      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.status === "success") {
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId
              ? {
                  ...r,
                  helpful: { count: data.data.helpfulCount },
                  isHelpful: data.data.isHelpful,
                }
              : r
          )
        );
      }
    } catch (err) {
      console.error("Failed to mark helpful:", err);
    }
  };

  const handleReport = async (reviewId) => {
    const reason = window.prompt("Please provide a reason for reporting this review:");
    if (!reason) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to report reviews");
        return;
      }

      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (data.status === "success") {
        alert("Review reported successfully");
      } else {
        alert(data.message || "Failed to report review");
      }
    } catch (err) {
      alert("Failed to report review");
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner-luxury"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <RatingSummary summary={summary} />

      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterRating("")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filterRating === ""
                ? "bg-orange-500 text-white"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-orange-50"
            }`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilterRating(rating.toString())}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                filterRating === rating.toString()
                  ? "bg-orange-500 text-white"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-orange-50"
              }`}
            >
              {rating}
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="-createdAt">Most Recent</option>
          <option value="createdAt">Oldest First</option>
          <option value="-ratings.overall">Highest Rated</option>
          <option value="ratings.overall">Lowest Rated</option>
          <option value="-helpful.count">Most Helpful</option>
        </select>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onHelpful={handleHelpful}
              onReport={handleReport}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-stone-50 rounded-xl">
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-stone-500">No reviews yet</p>
          <p className="text-sm text-stone-400 mt-1">
            Be the first to review this vendor
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-stone-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-stone-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-stone-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

ReviewList.propTypes = {
  vendorId: PropTypes.string.isRequired,
};

export default ReviewList;
