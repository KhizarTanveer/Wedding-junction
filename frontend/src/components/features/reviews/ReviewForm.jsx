import { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { API_URL } from "../../../config/api";

const RATING_CATEGORIES = [
  { key: "overall", label: "Overall Experience", required: true },
  { key: "quality", label: "Quality of Service", required: true },
  { key: "communication", label: "Communication", required: true },
  { key: "punctuality", label: "Punctuality", required: true },
  { key: "valueForMoney", label: "Value for Money", required: true },
];

function StarRating({ rating, onRate, size = "lg" }) {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClasses = size === "lg" ? "w-8 h-8" : "w-6 h-6";

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <svg
            className={`${sizeClasses} ${
              star <= (hoverRating || rating)
                ? "text-amber-400 fill-amber-400"
                : "text-stone-300"
            } transition-colors`}
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
        </button>
      ))}
    </div>
  );
}

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  onRate: PropTypes.func.isRequired,
  size: PropTypes.string,
};

function ReviewForm({ bookingId, vendorName, onSuccess, onCancel }) {
  const [ratings, setRatings] = useState({
    overall: 0,
    quality: 0,
    communication: 0,
    punctuality: 0,
    valueForMoney: 0,
  });
  const [content, setContent] = useState({
    title: "",
    text: "",
    pros: "",
    cons: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use refs to avoid stale closure issues in async operations
  const ratingsRef = useRef(ratings);
  const contentRef = useRef(content);

  const handleRatingChange = useCallback((category, value) => {
    setRatings((prev) => {
      const newRatings = { ...prev, [category]: value };
      ratingsRef.current = newRatings;
      return newRatings;
    });
  }, []);

  const handleContentChange = useCallback((field, value) => {
    setContent((prev) => {
      const newContent = { ...prev, [field]: value };
      contentRef.current = newContent;
      return newContent;
    });
  }, []);

  const validateForm = useCallback(() => {
    // Use refs to get the latest state values
    const currentRatings = ratingsRef.current;
    const currentContent = contentRef.current;

    // Check all required ratings
    for (const category of RATING_CATEGORIES) {
      if (category.required && currentRatings[category.key] === 0) {
        setError(`Please rate ${category.label}`);
        return false;
      }
    }

    // Check review text
    if (currentContent.text.trim().length < 20) {
      setError("Please write at least 20 characters in your review");
      return false;
    }

    return true;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    // Use refs to get the latest state values at submission time
    const currentRatings = ratingsRef.current;
    const currentContent = contentRef.current;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          ratings: currentRatings,
          content: {
            title: currentContent.title.trim(),
            text: currentContent.text.trim(),
            pros: currentContent.pros
              .split("\n")
              .map((p) => p.trim())
              .filter((p) => p),
            cons: currentContent.cons
              .split("\n")
              .map((c) => c.trim())
              .filter((c) => c),
          },
        }),
      });

      const data = await res.json();

      // Check HTTP status first, then response body
      if (!res.ok) {
        // Handle 409 Conflict (already reviewed) specifically
        if (res.status === 409) {
          setError("You have already submitted a review for this booking.");
        } else {
          setError(data.message || "Failed to submit review");
        }
        return;
      }

      if (data.status === "success") {
        onSuccess?.(data.data);
      } else {
        setError(data.message || "Failed to submit review");
      }
    } catch (err) {
      setError("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (rating) => {
    if (rating === 0) return "";
    if (rating === 1) return "Poor";
    if (rating === 2) return "Fair";
    if (rating === 3) return "Good";
    if (rating === 4) return "Very Good";
    return "Excellent";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif text-slate-800">
          Review Your Experience
        </h2>
        <p className="text-stone-500 mt-1">
          Share your experience with <span className="font-medium">{vendorName}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Ratings Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-slate-800">Rate Your Experience</h3>

        {RATING_CATEGORIES.map((category) => (
          <div
            key={category.key}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-warm-50 rounded-xl"
          >
            <div>
              <label className="font-medium text-slate-700">
                {category.label}
                {category.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {ratings[category.key] > 0 && (
                <p className="text-sm text-orange-600 font-medium">
                  {getRatingLabel(ratings[category.key])}
                </p>
              )}
            </div>
            <StarRating
              rating={ratings[category.key]}
              onRate={(value) => handleRatingChange(category.key, value)}
            />
          </div>
        ))}
      </div>

      {/* Written Review Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800">Write Your Review</h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Review Title (Optional)
          </label>
          <input
            type="text"
            value={content.title}
            onChange={(e) => handleContentChange("title", e.target.value)}
            className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Summarize your experience in a few words"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content.text}
            onChange={(e) => handleContentChange("text", e.target.value)}
            className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={5}
            placeholder="Tell others about your experience. What did you like? Would you recommend this vendor?"
            maxLength={2000}
          />
          <p className="text-xs text-stone-400 mt-1">
            {content.text.length}/2000 characters (minimum 20)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Pros (Optional)
            </label>
            <textarea
              value={content.pros}
              onChange={(e) => handleContentChange("pros", e.target.value)}
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="What did you like?&#10;Enter each point on a new line"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cons (Optional)
            </label>
            <textarea
              value={content.cons}
              onChange={(e) => handleContentChange("cons", e.target.value)}
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="What could be improved?&#10;Enter each point on a new line"
            />
          </div>
        </div>
      </div>

      {/* Overall Score Preview */}
      {ratings.overall > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {(
                  Object.values(ratings).reduce((a, b) => a + b, 0) /
                  Object.values(ratings).filter((r) => r > 0).length
                ).toFixed(1)}
              </span>
            </div>
            <div>
              <p className="font-medium text-slate-800">Your Overall Rating</p>
              <p className="text-sm text-stone-500">
                Based on your ratings across all categories
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-stone-50 rounded-xl p-4 text-sm text-stone-600">
        <h4 className="font-medium text-slate-700 mb-2">Review Guidelines</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li>Be honest and specific about your experience</li>
          <li>Focus on the service quality, not personal matters</li>
          <li>Your review will be moderated before publishing</li>
          <li>The vendor may respond to your review</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Review"
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

ReviewForm.propTypes = {
  bookingId: PropTypes.string.isRequired,
  vendorName: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};

export default ReviewForm;
