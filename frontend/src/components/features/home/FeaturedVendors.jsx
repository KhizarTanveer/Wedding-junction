import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFeaturedVendors } from "../../../hooks/useApi";

// Memoized Star Rating component
const StarRating = memo(function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? "text-amber-400" : "text-stone-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.967c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.176 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.95-.69l1.287-3.967z" />
        </svg>
      ))}
      <span className="text-stone-500 text-sm ml-2">
        ({rating}.0)
      </span>
    </div>
  );
});

// Memoized Vendor Card component
const VendorCard = memo(function VendorCard({ vendor, index, onExplore }) {
  return (
    <div
      className={`flex flex-col ${index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} bg-white rounded-luxury-xl shadow-soft overflow-hidden transition-all duration-500 ease-luxury hover:shadow-elegant-lg group border border-stone-100`}
    >
      {/* Vendor Image */}
      <div className="md:w-1/2 w-full h-48 sm:h-64 md:h-72 lg:h-96 overflow-hidden relative">
        <img
          src={vendor.image}
          alt={vendor.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Vendor Details */}
      <div className="md:w-1/2 w-full p-4 sm:p-6 md:p-8 lg:p-12 bg-stone-50 flex flex-col justify-center">
        <span className="text-orange-600 text-xs uppercase tracking-widest mb-3 font-medium">
          {vendor.service}
        </span>
        <h3 className="text-2xl md:text-3xl font-serif font-medium mb-3 text-slate-800">
          {vendor.name}
        </h3>
        <p className="text-stone-600 text-base leading-relaxed mb-6">
          {vendor.description}
        </p>

        {/* Star Rating */}
        <StarRating rating={vendor.rating} />

        {/* Explore Button */}
        <button
          onClick={() => onExplore(vendor._id)}
          className="inline-flex items-center gap-2 text-orange-600 font-medium tracking-wide hover:text-orange-700 transition-colors duration-300 group/btn w-max"
        >
          Explore Vendor
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
});

function FeaturedVendors() {
  const navigate = useNavigate();
  const { data: vendors, loading, error } = useFeaturedVendors();

  const handleExplore = useCallback((vendorId) => {
    navigate(`/explorevendor/${vendorId}`);
  }, [navigate]);

  if (loading) {
    return (
      <section className="py-24 px-6 bg-gradient-to-b from-warm-50 via-white to-warm-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Loading featured vendors...</p>
        </div>
      </section>
    );
  }

  if (error || !vendors?.length) {
    return null;
  }

  return (
    <section id="featured" className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-warm-50 via-white to-warm-50">
      {/* Section Header */}
      <div className="text-center mb-16">
        <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
          Curated Excellence
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-800 mt-3">
          Featured Vendors
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-6"></div>
      </div>

      {/* Vendor Cards */}
      <div className="max-w-6xl mx-auto flex flex-col gap-6 md:gap-12 lg:gap-16">
        {vendors.map((vendor, index) => (
          <VendorCard
            key={vendor._id}
            vendor={vendor}
            index={index}
            onExplore={handleExplore}
          />
        ))}
      </div>
    </section>
  );
}

export default memo(FeaturedVendors);
