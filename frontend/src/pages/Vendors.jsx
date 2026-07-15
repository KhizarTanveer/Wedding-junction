import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../config/api";

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/vendors`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load vendors");
        return res.json();
      })
      .then((data) => {
        setVendors(data.vendors || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Unable to load vendors. Please try again later.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="bg-warm-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-luxury mx-auto mb-4"></div>
          <p className="text-stone-500 font-medium">Loading vendors...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-warm-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-warm-50 to-white pt-24 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6 min-h-screen">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto text-center mb-20">
        <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
          Premium Selection
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-slate-800 mt-3 mb-4">
          Our Trusted Vendors
        </h1>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
        <p className="text-stone-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Discover our handpicked vendors to make your wedding day extraordinary.
        </p>
      </div>

      <div className="flex flex-col gap-6 md:gap-12 lg:gap-16 max-w-6xl mx-auto">
        {vendors.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500 text-lg">No vendors available right now.</p>
          </div>
        ) : (
          vendors.map((vendor, index) => (
            <div
              key={vendor.id}
              className={`flex flex-col ${index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} bg-white rounded-luxury-xl shadow-soft overflow-hidden transition-all duration-500 ease-luxury hover:shadow-elegant-lg group border border-stone-100`}
            >
              {/* Vendor Image */}
              <div className="md:w-1/2 w-full h-48 sm:h-64 md:h-72 lg:h-96 overflow-hidden relative">
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              {/* Vendor Details */}
              <div className="md:w-1/2 w-full p-4 sm:p-6 md:p-8 lg:p-12 bg-stone-50 flex flex-col justify-center">
                <span className="text-orange-600 text-xs uppercase tracking-widest font-medium mb-3">
                  {vendor.service}
                </span>
                <h2 className="text-2xl md:text-3xl font-serif text-slate-800 mb-3">
                  {vendor.name}
                </h2>
                <p className="text-stone-600 mb-6 leading-relaxed">
                  {vendor.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < vendor.rating ? "text-amber-400" : "text-stone-200"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.967c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.176 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.95-.69l1.287-3.967z" />
                    </svg>
                  ))}
                  <span className="text-stone-500 text-sm ml-2">
                    ({vendor.rating}.0)
                  </span>
                </div>

                <Link
                  to={`/vendors/${vendor.id}`}
                  className="inline-flex items-center gap-2 text-orange-600 font-medium tracking-wide hover:text-orange-700 transition-colors duration-300 group/btn w-max"
                >
                  View Profile
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Vendors;
