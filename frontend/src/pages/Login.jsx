import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get the page user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Use generic error message for all auth failures to prevent enumeration
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Use AuthContext login to set state
      login(data.user, data.token);

      // Redirect to originally requested page or home
      navigate(from, { replace: true });
    } catch (err) {
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-champagne-50 flex items-center justify-center px-4 pt-20 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-amber-100/40 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-orange-50/40 to-transparent pointer-events-none"></div>

      <div className="bg-white shadow-luxury-lg rounded-luxury-xl p-6 sm:p-8 md:p-10 max-w-md w-full relative z-10 border border-stone-100">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-amber-400 rounded-xl flex items-center justify-center shadow-soft">
            <span className="font-serif text-slate-800 font-bold text-xl">W</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-stone-500 text-sm">
            Sign in to manage your wedding bookings
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 text-center animate-fade-up">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-luxury"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-luxury pr-16"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-500 hover:text-orange-600 transition-colors font-medium"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-stone-300 text-orange-600 focus:ring-orange-400 focus:ring-offset-0"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-full font-medium text-white transition-all duration-300 shadow-soft ${
              loading
                ? "bg-stone-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 hover:shadow-soft-md hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-stone-200"></div>
          <span className="text-stone-400 text-xs uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-stone-200"></div>
        </div>

        {/* Footer */}
        <p className="text-center text-stone-600 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
