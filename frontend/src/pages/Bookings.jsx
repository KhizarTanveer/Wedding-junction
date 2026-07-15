import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { showError, showSuccess } from "../utils/toast";
import { classifyError } from "../utils/apiError";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [showConfirmForm, setShowConfirmForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const navigate = useNavigate();

  const [clientDetails, setClientDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    guestCount: "",
    address: "",
    specialRequests: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const classified = classifyError(null, res, data);
          throw new Error(classified.message);
        }

        const data = await res.json();
        // Validate response has expected bookings array
        const bookingsData = Array.isArray(data.bookings) ? data.bookings : [];
        setBookings(bookingsData);
      } catch (err) {
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const setButtonLoading = (id, isLoading) => {
    setActionLoading((prev) => ({ ...prev, [id]: isLoading }));
  };

  const handleRemove = async (_id) => {
    if (actionLoading[_id]) return;

    setButtonLoading(_id, true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/bookings/${_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const classified = classifyError(null, res, data);
        throw new Error(classified.message);
      }

      setBookings((prev) => prev.filter((b) => b._id !== _id));
      setShowRemovePopup(true);
      setTimeout(() => setShowRemovePopup(false), 1100);
    } catch (err) {
      showError(err.message || "Failed to remove booking");
    } finally {
      setButtonLoading(_id, false);
    }
  };

  const handleOpenConfirm = (_id) => {
    setCurrentBookingId(_id);
    setClientDetails({
      fullName: "",
      email: "",
      phone: "",
      eventType: "",
      eventDate: "",
      guestCount: "",
      address: "",
      specialRequests: "",
    });
    setError("");
    setShowConfirmForm(true);
  };

  const handleConfirmDone = async () => {
    if (actionLoading.confirm) return;

    setButtonLoading("confirm", true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/bookings/${currentBookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientDetails,
          status: "payment_pending",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const classified = classifyError(null, res, data);
        throw new Error(classified.message);
      }

      // Validate response contains expected data
      if (!data.booking && !data.status) {
        throw new Error("Invalid server response. Please try again.");
      }

      setShowConfirmForm(false);
      showSuccess("Booking details confirmed");
      // Navigate to the dedicated payment page
      navigate(`/payment/${currentBookingId}`);
    } catch (err) {
      setError(err.message || "Failed to confirm booking");
    } finally {
      setButtonLoading("confirm", false);
    }
  };

  const handleViewDetails = (booking) => {
    setActiveBooking(booking);
    setShowDetails(true);
  };

  const handleChange = (e) =>
    setClientDetails({ ...clientDetails, [e.target.name]: e.target.value });

  const handleRetry = () => {
    setError("");
    setLoading(true);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-luxury mx-auto mb-4"></div>
          <p className="text-stone-500 font-medium">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6 relative">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-20">
        <span className="inline-block mb-4 px-4 py-1.5 border border-amber-300 text-amber-700 font-medium text-xs uppercase tracking-widest rounded-full">
          Wedding Dashboard
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-slate-800 mb-4">
          Your Bookings
        </h1>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
        <p className="text-stone-600 text-lg max-w-2xl mx-auto">
          View, manage and confirm your wedding vendors with ease.
        </p>
      </div>

      {/* Persistent Error Display with Retry */}
      {error && !showConfirmForm && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button
              onClick={handleRetry}
              className="text-sm font-medium text-red-700 hover:text-red-800 ml-4"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Confirm Form Modal */}
      {showConfirmForm && (
        <Modal title="Confirm Booking Details" onClose={() => setShowConfirmForm(false)}>
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 text-center">
              {error}
            </div>
          )}

          <FormGrid>
            <Input label="Full Name" name="fullName" value={clientDetails.fullName} onChange={handleChange} required disabled={actionLoading.confirm} />
            <Input label="Email" name="email" type="email" value={clientDetails.email} onChange={handleChange} required disabled={actionLoading.confirm} />
            <Input label="Phone Number" name="phone" value={clientDetails.phone} onChange={handleChange} required disabled={actionLoading.confirm} />
            <Input label="Event Type" name="eventType" value={clientDetails.eventType} onChange={handleChange} required disabled={actionLoading.confirm} />
            <Input type="date" label="Event Date" name="eventDate" value={clientDetails.eventDate} onChange={handleChange} required disabled={actionLoading.confirm} />
            <Input type="number" label="Guest Count" name="guestCount" value={clientDetails.guestCount} onChange={handleChange} disabled={actionLoading.confirm} />
            <Input label="Address / Venue" name="address" value={clientDetails.address} onChange={handleChange} disabled={actionLoading.confirm} />
          </FormGrid>

          <div className="mb-6">
            <label className="text-sm font-medium text-slate-600 block mb-1.5">Special Requests</label>
            <textarea
              name="specialRequests"
              value={clientDetails.specialRequests}
              onChange={handleChange}
              rows="3"
              disabled={actionLoading.confirm}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-200/50 focus:border-orange-400 transition-all disabled:opacity-50 disabled:bg-stone-50"
              placeholder="Any special requirements..."
            />
          </div>

          <div className="flex gap-3">
            <PrimaryBtn onClick={handleConfirmDone} disabled={actionLoading.confirm}>
              {actionLoading.confirm ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Proceed to Payment"
              )}
            </PrimaryBtn>
            <SecondaryBtn onClick={() => setShowConfirmForm(false)} disabled={actionLoading.confirm}>
              Back
            </SecondaryBtn>
          </div>
        </Modal>
      )}

      {/* View Details Modal */}
      {showDetails && activeBooking && (
        <Modal title="Booking Details" onClose={() => setShowDetails(false)}>
          <div className="space-y-4 text-stone-700 mb-6">
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="text-stone-500">Vendor</span>
              <span className="font-medium">{activeBooking.userName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="text-stone-500">Service</span>
              <span className="font-medium">{activeBooking.service}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="text-stone-500">Status</span>
              <span className={`font-medium capitalize ${activeBooking.status === 'confirmed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {activeBooking.status || "pending"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-stone-500">Price</span>
              <span className="font-serif text-lg text-slate-800">Rs. {activeBooking.price?.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <SecondaryBtn onClick={() => setShowDetails(false)}>
            Close
          </SecondaryBtn>
        </Modal>
      )}

      {/* Remove Popup */}
      {showRemovePopup && (
        <Popup
          title="Booking Removed"
          text="The booking has been removed successfully."
          color="red"
        />
      )}

      {/* Bookings Grid */}
      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-stone-500 text-lg">You haven't booked any vendors yet</p>
          <p className="text-stone-400 text-sm mt-1">Explore our vendors to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-7xl mx-auto">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-luxury-xl shadow-soft overflow-hidden border border-stone-100 transition-all duration-500 ease-luxury hover:shadow-elegant group">
              {booking.image && (
                <div className="h-40 sm:h-48 overflow-hidden">
                  <img
                    src={booking.image}
                    alt={booking.userName}
                    className="w-full h-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-serif text-slate-800 mb-1">
                  {booking.userName}
                </h2>
                <p className="text-stone-500 text-sm mb-4">{booking.service}</p>

                <p className="text-2xl font-serif text-slate-800 mb-6">
                  Rs. {booking.price?.toLocaleString("en-IN")}
                </p>

                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handleViewDetails(booking)}
                    className="flex-1 border border-stone-300 text-slate-700 py-2.5 rounded-full font-medium text-sm hover:border-orange-400 hover:text-orange-600 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenConfirm(booking._id)}
                    disabled={actionLoading[booking._id]}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-2.5 rounded-full font-medium text-sm hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50"
                  >
                    Confirm
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(booking._id)}
                  disabled={actionLoading[booking._id]}
                  className="w-full text-red-500 py-2 text-sm font-medium hover:text-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading[booking._id] ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Removing...
                    </>
                  ) : (
                    "Remove Booking"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* Reusable UI Components */

const Modal = ({ title, children, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div
      className="bg-white rounded-luxury-xl shadow-luxury-lg w-full max-w-sm sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 mx-4 animate-modal-enter"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 id="modal-title" className="text-2xl font-serif text-slate-800 mb-6 text-center">{title}</h2>
      {children}
    </div>
  </div>
);

const FormGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">{children}</div>
);

const Input = ({ label, name, disabled, ...props }) => {
  const inputId = `booking-input-${name || label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div>
      <label htmlFor={inputId} className="text-sm font-medium text-slate-600 block mb-1.5">{label}</label>
      <input
        id={inputId}
        name={name}
        aria-label={label}
        disabled={disabled}
        {...props}
        className={`w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-200/50 focus:border-orange-400 transition-all text-slate-800 ${disabled ? 'opacity-50 bg-stone-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
};

const PrimaryBtn = ({ children, disabled, ...props }) => (
  <button
    type="button"
    disabled={disabled}
    {...props}
    className={`w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-3.5 rounded-full font-medium transition-all shadow-soft hover:shadow-soft-md ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

const SecondaryBtn = ({ children, disabled, ...props }) => (
  <button
    type="button"
    disabled={disabled}
    {...props}
    className={`w-full bg-stone-100 hover:bg-stone-200 text-slate-700 py-3.5 rounded-full font-medium transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

function Popup({ title, text, color }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white px-10 py-8 rounded-luxury-xl shadow-luxury-lg text-center max-w-sm animate-modal-enter">
        <div className={`w-12 h-12 ${color === "red" ? "bg-red-50" : "bg-emerald-50"} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {color === "red" ? (
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <h2 className={`text-xl font-serif ${color === "red" ? "text-red-600" : "text-emerald-600"}`}>
          {title}
        </h2>
        <p className="text-stone-600 mt-2 text-sm">{text}</p>
      </div>
    </div>
  );
}

export default Bookings;
