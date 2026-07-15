import { useParams, useNavigate } from "react-router-dom";
import { useCategoryByName } from "../hooks/useApi";

function CategoryDetails() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { data: category, loading, error } = useCategoryByName(categoryName);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-slate-800 mb-2">Category not found</h2>
          <p className="text-stone-600 mb-6">The category you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-18">
      {/* Hero Image with overlay */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
        <img
          src={category.image}
          alt={categoryName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 to-slate-900/70 flex items-center justify-center">
          <div className="text-center">
            <span className="text-xs uppercase tracking-luxury text-amber-200 font-medium">
              Explore
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mt-2 drop-shadow-lg">
              {category.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        {/* Description */}
        <div className="bg-white rounded-luxury-xl shadow-soft p-8 border border-stone-100">
          <p className="text-stone-600 text-lg leading-relaxed">{category.description}</p>
        </div>

        {/* Highlights */}
        {category.details?.highlights?.length > 0 && (
          <div className="bg-white rounded-luxury-xl shadow-soft p-8 border border-stone-100">
            <h2 className="text-2xl font-serif text-slate-800 mb-6">Highlights</h2>
            <ul className="grid md:grid-cols-2 gap-4">
              {category.details.highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-stone-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Services Included */}
        {category.details?.services?.length > 0 && (
          <div className="bg-white rounded-luxury-xl shadow-soft p-8 border border-stone-100">
            <h2 className="text-2xl font-serif text-slate-800 mb-6">Services Included</h2>
            <ul className="grid md:grid-cols-2 gap-4">
              {category.details.services.map((service) => (
                <li key={service} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-stone-600">{service}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Why Choose Us */}
        {category.details?.whyChoose?.length > 0 && (
          <div className="bg-white rounded-luxury-xl shadow-soft p-8 border border-stone-100">
            <h2 className="text-2xl font-serif text-slate-800 mb-6">Why Choose Us</h2>
            <ul className="grid md:grid-cols-2 gap-4">
              {category.details.whyChoose.map((reason) => (
                <li key={reason} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-stone-600">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Testimonial */}
        {category.details?.testimonial && (
          <div className="bg-stone-50 rounded-luxury-xl p-8 border-l-4 border-amber-400">
            <svg className="w-8 h-8 text-amber-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-stone-700 italic text-lg leading-relaxed">{category.details.testimonial}</p>
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-3.5 rounded-full font-medium transition-all duration-300 hover:from-orange-700 hover:to-orange-800 shadow-soft hover:shadow-soft-md hover:-translate-y-0.5"
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

export default CategoryDetails;
