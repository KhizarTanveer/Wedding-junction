import { useNavigate, useParams } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 flex items-center justify-center px-4 sm:px-6 pt-20">
      <div className="bg-white rounded-luxury-xl shadow-luxury-lg p-10 md:p-14 max-w-lg w-full text-center border border-stone-100 animate-fade-up">
        {/* Success Icon with Animation */}
        <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 animate-success-bounce">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-soft">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Header */}
        <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
          Booking Confirmed
        </span>
        <h1 className="text-3xl md:text-4xl font-serif text-slate-800 mt-3 mb-4">
          Payment Successful
        </h1>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>

        <p className="text-stone-600 mb-8 leading-relaxed">
          Your booking has been confirmed successfully.
          <br />
          We'll take care of the rest and ensure your special day is perfect.
        </p>

        {/* Booking ID Card */}
        <div className="bg-stone-50 rounded-luxury p-6 mb-8 border border-stone-100">
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-2">
            Booking Reference
          </p>
          <p className="font-serif text-lg text-slate-800 break-all">
            {bookingId}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/bookings")}
            className="w-full py-3.5 rounded-full font-medium text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-soft hover:shadow-soft-md hover:-translate-y-0.5"
          >
            View My Bookings
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full py-3.5 rounded-full font-medium text-slate-700 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 pt-6 border-t border-stone-100">
          <p className="text-xs text-stone-400">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </section>
  );
}

export default PaymentSuccess;
