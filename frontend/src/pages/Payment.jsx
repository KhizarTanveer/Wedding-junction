import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import {
  validatePaymentCard,
  formatCardNumber,
  formatExpiry,
  detectCardType,
} from "../utils/validation";

function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Ref to prevent double submission
  const isSubmittingRef = useRef(false);

  const [card, setCard] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  const [cardType, setCardType] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        let token;
        try {
          token = localStorage.getItem("token");
        } catch {
          setError("Unable to access local storage");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${API_URL}/api/bookings/${bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error("Failed to fetch booking");
        }
        const data = await res.json();
        setBooking(data.booking);
        setLoading(false);
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === "AbortError") {
          setError("Request timed out. Please check your connection and try again.");
        } else {
          setError("Unable to load booking details");
        }
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === "number") {
      formattedValue = formatCardNumber(value);
      const type = detectCardType(value);
      setCardType(type);
    }

    // Format expiry as MM/YY
    if (name === "expiry") {
      formattedValue = formatExpiry(value);
    }

    // Limit CVV to 4 digits
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setCard({ ...card, [name]: formattedValue });

    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePayment = async () => {
    // Prevent double submission
    if (isSubmittingRef.current || processing) {
      return;
    }

    setError("");
    setFieldErrors({});

    // Validate card using our utility
    const validation = validatePaymentCard(card);

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      // Show first error as main error
      const firstError = Object.values(validation.errors)[0];
      setError(firstError || "Please check your card details");
      return;
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      isSubmittingRef.current = true;
      setProcessing(true);

      let token;
      try {
        token = localStorage.getItem("token");
      } catch {
        setError("Unable to access local storage");
        setProcessing(false);
        isSubmittingRef.current = false;
        return;
      }

      const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "confirmed" }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Payment failed. Please try again.");
        setProcessing(false);
        isSubmittingRef.current = false;
        return;
      }

      // Navigate immediately on success - no setTimeout
      navigate(`/payment-success/${bookingId}`);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        setError("Payment request timed out. Please try again.");
      } else {
        setError("Payment failed. Please check your connection and try again.");
      }
      setProcessing(false);
      isSubmittingRef.current = false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-luxury mx-auto mb-4"></div>
          <p className="text-stone-500 font-medium">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 text-lg font-medium">Booking not found</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
            Final Step
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-slate-800 mt-3">
            Secure Payment
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-6"></div>
        </div>

        <div className="bg-white rounded-luxury-xl shadow-luxury p-4 sm:p-6 md:p-8 lg:p-10 border border-stone-100">
          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-stone-500 text-sm mb-8">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>256-bit SSL Encryption</span>
          </div>

          {/* Order Summary */}
          <div className="bg-stone-50 rounded-luxury p-6 mb-8 border border-stone-100">
            <h3 className="text-sm uppercase tracking-wider text-stone-500 font-medium mb-4">Order Summary</h3>
            <div className="flex justify-between text-stone-700 mb-3">
              <span>{booking.service}</span>
              <span>Rs. {booking.price?.toLocaleString("en-IN")}</span>
            </div>
            <div className="border-t border-stone-200 my-3"></div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-800">Total</span>
              <span className="text-xl font-serif text-slate-800">Rs. {booking.price?.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Card Form */}
          <div className="space-y-5 mb-8">
            <Input
              label="Cardholder Name"
              name="name"
              value={card.name}
              onChange={handleCardChange}
              placeholder="Full name on card"
              error={fieldErrors.name}
            />
            <div className="relative">
              <Input
                label="Card Number"
                name="number"
                value={card.number}
                onChange={handleCardChange}
                placeholder="1234 5678 9012 3456"
                error={fieldErrors.number}
                maxLength={19}
              />
              {cardType && (
                <span className="absolute right-4 top-9 text-xs uppercase font-medium text-stone-400">
                  {cardType}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                name="expiry"
                value={card.expiry}
                onChange={handleCardChange}
                placeholder="MM/YY"
                error={fieldErrors.expiry}
                maxLength={5}
              />
              <Input
                label="CVV"
                name="cvv"
                value={card.cvv}
                onChange={handleCardChange}
                placeholder="123"
                error={fieldErrors.cvv}
                maxLength={4}
                type="password"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 text-center animate-fade-up">
              {error}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={processing}
            className={`w-full py-4 rounded-full font-medium text-white text-lg transition-all duration-300 shadow-soft ${
              processing
                ? "bg-stone-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 hover:shadow-soft-md hover:-translate-y-0.5"
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Processing...
              </span>
            ) : (
              `Pay Rs. ${booking.price?.toLocaleString("en-IN")}`
            )}
          </button>

          {/* Demo Notice */}
          <p className="text-center text-xs text-stone-400 mt-6">
            Demo payment - No real money will be charged
          </p>
        </div>
      </div>
    </section>
  );
}

function Input({ label, name, error, ...props }) {
  const inputId = `payment-${name}`;
  return (
    <div>
      <label htmlFor={inputId} className="text-sm font-medium text-slate-600 block mb-1.5">{label}</label>
      <input
        id={inputId}
        name={name}
        aria-label={label}
        aria-invalid={!!error}
        autoComplete={name === "number" ? "cc-number" : name === "name" ? "cc-name" : name === "expiry" ? "cc-exp" : name === "cvv" ? "cc-csc" : undefined}
        {...props}
        className={`w-full px-4 py-3 rounded-xl border ${
          error
            ? "border-red-300 focus:ring-red-200/50 focus:border-red-400"
            : "border-stone-300 focus:ring-orange-200/50 focus:border-orange-400"
        } focus:outline-none focus:ring-2 transition-all text-slate-800 placeholder-stone-500`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

export default Payment;
