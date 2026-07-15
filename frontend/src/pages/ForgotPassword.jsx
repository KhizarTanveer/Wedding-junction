import { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      setMessage("Password reset link has been sent to your email.");
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 flex items-center justify-center px-4 pt-20">
      <div className="bg-white shadow-soft rounded-luxury-xl p-10 max-w-md w-full border border-stone-100">

        {/* HEADER */}
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
            Account Recovery
          </span>
          <h1 className="text-3xl font-serif text-slate-800 mt-2 mb-2">
            Forgot Password
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4"></div>
          <p className="text-stone-600">
            We'll help you reset it securely
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-luxury mb-5 text-center border border-red-100">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {message && (
          <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-luxury mb-5 text-center border border-emerald-100">
            {message}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-stone-600">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-luxury border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-full font-medium text-white transition-all duration-300 ${
              loading
                ? "bg-orange-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-soft hover:shadow-soft-md hover:-translate-y-0.5"
            }`}
          >
            {loading ? "Sending reset link..." : "Send Reset Link"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="mt-6 text-center text-stone-600">
          Remember your password?{" "}
          <Link to="/login" className="text-orange-600 font-medium hover:text-orange-700 transition-colors">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
