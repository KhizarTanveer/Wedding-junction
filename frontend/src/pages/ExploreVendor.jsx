import { useParams, useNavigate } from "react-router-dom";
import { useVendorById } from "../hooks/useApi";

function ExploreVendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: vendorData, loading, error } = useVendorById(id);

  // Handle data shape - could be { vendor: {...} } or direct vendor object
  const vendor = vendorData?.vendor || vendorData;

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-slate-800 mb-2">
            Vendor Not Found
          </h2>
          <p className="text-stone-500 mb-6">We couldn't find this vendor.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-full font-medium text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-luxury-xl shadow-luxury overflow-hidden border border-stone-100 flex flex-col md:flex-row">
          {/* Vendor Image */}
          <div className="md:w-2/5 w-full h-80 md:h-auto relative overflow-hidden">
            {vendor.image ? (
              <img
                src={vendor.image}
                alt={vendor.name || "Vendor"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f5f5f4' width='400' height='300'/%3E%3Ctext fill='%23a8a29e' font-family='sans-serif' font-size='14' text-anchor='middle' x='200' y='150'%3EImage not available%3C/text%3E%3C/svg%3E";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                <span className="text-6xl font-serif text-orange-400">
                  {vendor.name?.charAt(0)?.toUpperCase() || "V"}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-slate-900/10"></div>

            {/* Service Badge */}
            <div className="absolute bottom-4 left-4">
              <span className="px-4 py-2 bg-amber-400 text-slate-800 rounded-full text-sm font-medium shadow-soft">
                {vendor.service}
              </span>
            </div>
          </div>

          {/* Vendor Details */}
          <div className="md:w-3/5 w-full p-8 md:p-10 flex flex-col">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-serif text-slate-800 mb-3">
                {vendor.name}
              </h1>
              <p className="text-stone-600 leading-relaxed">{vendor.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg
                    key={index}
                    className={`w-5 h-5 ${
                      index < vendor.rating ? "text-amber-400" : "text-stone-200"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.967c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.176 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.95-.69l1.287-3.967z" />
                  </svg>
                ))}
              </div>
              <span className="text-stone-500 text-sm">({vendor.rating}.0)</span>
            </div>

            {/* Details */}
            {vendor.details && (
              <p className="text-stone-600 leading-relaxed mb-6">{vendor.details}</p>
            )}

            {/* Experience */}
            {vendor.experience && (
              <div className="bg-stone-50 rounded-luxury p-5 border border-stone-100 mb-6">
                <h2 className="text-sm uppercase tracking-wider text-stone-500 font-medium mb-2">Experience</h2>
                <p className="text-slate-800">{vendor.experience}</p>
              </div>
            )}

            {/* Services */}
            {vendor.servicesOffered?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm uppercase tracking-wider text-stone-500 font-medium mb-3">Services Offered</h2>
                <ul className="space-y-2">
                  {vendor.servicesOffered.map((service) => (
                    <li key={service} className="flex items-center gap-2 text-stone-700">
                      <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact Info */}
            {vendor.contact && (
              <div className="bg-stone-50 rounded-luxury p-5 border border-stone-100 mb-8">
                <h2 className="text-sm uppercase tracking-wider text-stone-500 font-medium mb-3">Contact Information</h2>
                <div className="space-y-2 text-stone-700">
                  {vendor.contact.phone && (
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {vendor.contact.phone}
                    </p>
                  )}
                  {vendor.contact.email && (
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {vendor.contact.email}
                    </p>
                  )}
                  {vendor.contact.website && (
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      {vendor.contact.website}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-slate-700 bg-amber-400 hover:bg-amber-500 transition-colors w-max shadow-soft"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExploreVendor;
