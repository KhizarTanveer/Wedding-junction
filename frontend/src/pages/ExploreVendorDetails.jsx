import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../config/api";
import { classifyError, ErrorTypes } from "../utils/apiError";

function ExploreVendorDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorInfo, setErrorInfo] = useState({ title: "", message: "", type: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const vendor = location.state?.vendor || {
    name: "Elegant Weddings",
    price: 200000,
    contact: "+92 300 1234567",
    email: "contact@elegantweddings.pk",
    location: "Karachi",
    image:
      "https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=800&q=80",
    description: "Luxurious palace-style hall with grand interiors.",
    service: "Wedding Planner",
  };

  const formatPrice = (amount) =>
    `Rs. ${Number(amount).toLocaleString("en-IN")}`;

  const getErrorDisplay = (classifiedError) => {
    switch (classifiedError.type) {
      case ErrorTypes.CONFLICT_ERROR:
        return {
          title: "Already Booked",
          message: "You have already booked this service.",
          icon: "duplicate",
        };
      case ErrorTypes.AUTH_ERROR:
        return {
          title: "Login Required",
          message: "Please log in to book this service.",
          icon: "auth",
        };
      case ErrorTypes.NETWORK_ERROR:
        return {
          title: "Connection Error",
          message: "Please check your internet connection and try again.",
          icon: "network",
        };
      case ErrorTypes.SERVER_ERROR:
        return {
          title: "Server Error",
          message: "Something went wrong. Please try again later.",
          icon: "server",
        };
      default:
        return {
          title: "Booking Failed",
          message: classifiedError.message || "Unable to complete booking. Please try again.",
          icon: "error",
        };
    }
  };

  const handleBooking = async () => {
    if (isBooked || isBooking) return;

    setIsBooking(true);
    let response = null;
    let responseBody = null;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        const authError = { type: ErrorTypes.AUTH_ERROR };
        const errorDisplay = getErrorDisplay(authError);
        setErrorInfo(errorDisplay);
        setShowErrorModal(true);
        setTimeout(() => setShowErrorModal(false), 2500);
        setIsBooking(false);
        return;
      }

      response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vendorId: vendor._id,
          userName: vendor.name,
          userEmail: vendor.contact?.email || vendor.email,
          service: vendor.service,
          price: vendor.price,
          image: vendor.image,
        }),
      });

      responseBody = await response.json();

      if (!response.ok) {
        const classifiedError = classifyError(null, response, responseBody);
        const errorDisplay = getErrorDisplay(classifiedError);
        setErrorInfo(errorDisplay);
        setShowErrorModal(true);
        setTimeout(() => setShowErrorModal(false), 2500);
        setIsBooking(false);
        return;
      }

      setIsBooked(true);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 1300);
    } catch (error) {
      // Network error or other fetch failure
      const classifiedError = classifyError(error, response, responseBody);
      const errorDisplay = getErrorDisplay(classifiedError);
      setErrorInfo(errorDisplay);
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 2500);
    } finally {
      setIsBooking(false);
    }
  };

  const getErrorIcon = (iconType) => {
    switch (iconType) {
      case "duplicate":
        return (
          <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "auth":
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case "network":
        return (
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
    }
  };

  const getErrorBgColor = (iconType) => {
    switch (iconType) {
      case "duplicate":
        return "bg-amber-50";
      case "auth":
        return "bg-blue-50";
      case "network":
        return "bg-orange-50";
      default:
        return "bg-red-50";
    }
  };

  const getErrorTextColor = (iconType) => {
    switch (iconType) {
      case "duplicate":
        return "text-amber-600";
      case "auth":
        return "text-blue-600";
      case "network":
        return "text-orange-600";
      default:
        return "text-red-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-luxury-xl shadow-luxury overflow-hidden border border-stone-100">
        {/* Hero Image */}
        <div className="relative h-80 w-full overflow-hidden">
          <img
            src={vendor.image}
            alt={vendor.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-slate-700 px-4 py-2 rounded-full font-medium text-sm hover:bg-white transition-colors shadow-soft"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          {/* Service Badge */}
          {vendor.service && (
            <div className="absolute top-6 right-6">
              <span className="px-4 py-2 bg-amber-400 text-slate-800 rounded-full text-sm font-medium shadow-soft">
                {vendor.service}
              </span>
            </div>
          )}

          {/* Title Overlay */}
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl md:text-4xl font-serif text-white">
              {vendor.name}
            </h1>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-8 space-y-6">
          {/* Description */}
          {vendor.description && (
            <p className="text-stone-600 leading-relaxed text-lg">
              {vendor.description}
            </p>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoBox title="Price" value={formatPrice(vendor.price)} highlight />
            <InfoBox title="Phone" value={vendor.contact?.phone} />
            <InfoBox title="Email" value={vendor.contact?.email || vendor.email} />
            <InfoBox title="Location" value={vendor.location} />
          </div>

          {/* Booking Button */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={handleBooking}
              disabled={isBooked || isBooking}
              className={`px-10 py-4 rounded-full font-medium text-lg transition-all duration-300 ${
                isBooked
                  ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                  : isBooking
                  ? "bg-stone-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 shadow-soft hover:shadow-soft-md hover:-translate-y-0.5"
              }`}
            >
              {isBooking ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Booking...
                </span>
              ) : isBooked ? (
                "Already Booked"
              ) : (
                "Book Now"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white px-10 py-8 rounded-luxury-xl shadow-luxury-lg text-center max-w-sm animate-modal-enter">
            <div className={`w-12 h-12 ${getErrorBgColor(errorInfo.icon)} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {getErrorIcon(errorInfo.icon)}
            </div>
            <h2 className={`text-xl font-serif ${getErrorTextColor(errorInfo.icon)}`}>
              {errorInfo.title}
            </h2>
            <p className="text-stone-600 mt-2 text-sm">
              {errorInfo.message}
            </p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white px-10 py-8 rounded-luxury-xl shadow-luxury-lg text-center max-w-sm animate-modal-enter">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-serif text-emerald-600">
              Booking Confirmed
            </h2>
            <p className="text-stone-600 mt-2 text-sm">
              Your booking has been added successfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ title, value, highlight = false }) {
  return (
    <div className={`rounded-luxury p-5 border ${highlight ? 'bg-amber-50 border-amber-100' : 'bg-stone-50 border-stone-100'}`}>
      <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">{title}</span>
      <p className={`mt-1 ${highlight ? 'text-2xl font-serif text-slate-800' : 'text-slate-800 font-medium'}`}>
        {value}
      </p>
    </div>
  );
}

export default ExploreVendorDetails;
