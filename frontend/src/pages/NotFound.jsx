import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 flex items-center justify-center px-4 sm:px-6 pt-20">
      <div className="text-center max-w-lg">
        {/* 404 Number */}
        <div className="relative mb-8">
          <span className="text-[150px] md:text-[200px] font-serif font-bold text-stone-100 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center shadow-soft">
              <svg
                className="w-12 h-12 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-serif text-slate-800 mb-4">
          Page Not Found
        </h1>
        <p className="text-stone-500 mb-8 leading-relaxed">
          Oops! The page you're looking for seems to have wandered off.
          It might have been moved, deleted, or perhaps never existed.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-3 rounded-full font-medium shadow-soft hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-300"
          >
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-white border border-stone-200 text-slate-700 rounded-full font-medium hover:bg-stone-50 transition-all duration-300"
          >
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-stone-200">
          <p className="text-sm text-stone-400 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/vendors" className="text-orange-600 hover:text-orange-700 hover:underline">
              Browse Vendors
            </Link>
            <Link to="/services" className="text-orange-600 hover:text-orange-700 hover:underline">
              Our Services
            </Link>
            <Link to="/login" className="text-orange-600 hover:text-orange-700 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
