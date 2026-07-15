import { useParams, useNavigate } from "react-router-dom";
import { useVendorsByCategory } from "../hooks/useApi";

function ExploreCategory() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { data: items, loading, error } = useVendorsByCategory(categoryName);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Loading {categoryName}...</p>
        </div>
      </div>
    );
  }

  if (error || !items?.length) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-slate-800 mb-2">
            No Options Found
          </h2>
          <p className="text-stone-500">We couldn't find any options for this category.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
            Browse Options
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-slate-800 mt-3 mb-4">
            Explore{" "}
            <span className="text-orange-600">{categoryName}</span>
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            Discover our curated selection of premium {categoryName?.toLowerCase()} services for your special day.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-luxury-xl overflow-hidden shadow-soft border border-stone-100 transition-all duration-500 ease-luxury hover:shadow-elegant hover:-translate-y-2 cursor-pointer group"
              onClick={() =>
                navigate(`/explore/vendor-details`, {
                  state: { vendor: item },
                })
              }
            >
              {/* Image */}
              <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

                {/* Hover Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="bg-white text-slate-800 px-6 py-3 rounded-full font-medium shadow-luxury text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    View Details
                  </span>
                </div>

                {/* Bottom Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h2 className="text-xl font-serif mb-1">{item.name}</h2>
                  <p className="text-sm text-white/80 line-clamp-2">{item.description}</p>
                </div>
              </div>

              {/* Price Tag */}
              <div className="p-5 flex items-center justify-between border-t border-stone-100">
                <span className="text-xs uppercase tracking-wider text-stone-500">Starting from</span>
                <span className="text-lg font-serif text-slate-800">
                  Rs. {item.price?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="flex justify-center mt-16">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-medium text-slate-700 bg-white border border-stone-300 hover:border-orange-400 hover:text-orange-600 transition-all duration-300 shadow-soft"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Categories
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExploreCategory;
