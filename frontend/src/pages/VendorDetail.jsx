import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import { ReviewList } from "../components/features/reviews";

function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("success");
  const [isBooked, setIsBooked] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    fetch(`${API_URL}/api/vendors/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Vendor not found");
        return res.json();
      })
      .then((data) => setVendor(data.vendor))
      .catch((err) => setFetchError(err.message || "Failed to load vendor"));
  }, [id]);

  if (fetchError) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{fetchError}</p>
          <button
            onClick={() => navigate("/vendors")}
            className="mt-4 px-6 py-2 bg-stone-100 hover:bg-stone-200 rounded-full text-slate-700 font-medium transition-colors"
          >
            Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-luxury mx-auto mb-4"></div>
          <p className="text-stone-500 font-medium">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  const formatINR = (amount) =>
    `Rs. ${Number(amount).toLocaleString("en-IN")}`;

  const handleBooking = async () => {
    if (isBooked) return;

    try {
      const token = localStorage.getItem("token");
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

      if (!token || !currentUser.id) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vendorId: vendor._id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          service: vendor.service,
          price: vendor.price,
          image: vendor.image,
        }),
      });

      if (!res.ok) throw new Error("Booking failed");

      await res.json();

      setIsBooked(true);
      setPopupType("success");
    } catch (error) {
      setPopupType("error");
    }

    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 1200);
  };

  const metrics = vendor.metrics || {};
  const rating = vendor.rating || metrics.averageRating || 0;
  const totalReviews = metrics.totalReviews || 0;
  const isVerified = vendor.verification?.isVerified;

  const tabs = [
    { id: "about", label: "About" },
    { id: "services", label: "Services" },
    { id: "reviews", label: `Reviews (${totalReviews})` },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 pb-16 px-6">
      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white px-10 py-8 rounded-luxury-xl shadow-luxury-lg text-center max-w-sm animate-modal-enter">
            <div className={`w-12 h-12 ${popupType === "success" ? "bg-emerald-50" : "bg-red-50"} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {popupType === "success" ? (
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h2 className={`text-xl font-serif ${popupType === "success" ? "text-emerald-600" : "text-red-600"}`}>
              {popupType === "success" ? "Booking Confirmed" : "Booking Failed"}
            </h2>
            <p className="text-stone-600 mt-2 text-sm">
              {popupType === "success"
                ? "Your booking has been added successfully."
                : "You have already booked this service."}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-orange-600 hover:text-orange-700 mb-6 inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-luxury-xl shadow-soft overflow-hidden border border-stone-100">
              {/* Image Section */}
              <div className="relative h-80 md:h-96 overflow-hidden">
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

                {/* Service Badge */}
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-slate-700 shadow-soft">
                    {vendor.service}
                  </span>
                  {isVerified && (
                    <span className="px-3 py-2 bg-emerald-500/90 backdrop-blur-sm rounded-full text-sm font-medium text-white shadow-soft flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>

                {/* Vendor Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">
                    {vendor.businessInfo?.name || vendor.name}
                  </h1>
                  {vendor.location && (
                    <p className="text-white/80 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {vendor.location.city}, {vendor.location.state}
                    </p>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-stone-100">
                <div className="flex gap-1 px-6 pt-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 font-medium text-sm transition-all border-b-2 -mb-px ${
                        activeTab === tab.id
                          ? "text-orange-600 border-orange-500"
                          : "text-stone-500 border-transparent hover:text-stone-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 md:p-8">
                {/* About Tab */}
                {activeTab === "about" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-slate-800 mb-3">About</h3>
                      <p className="text-stone-600 leading-relaxed">
                        {vendor.description || vendor.businessInfo?.description || "No description available."}
                      </p>
                    </div>

                    {/* Business Details */}
                    {vendor.businessInfo && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {vendor.businessInfo.experience && (
                          <div className="bg-stone-50 rounded-xl p-4">
                            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Experience</span>
                            <p className="text-slate-800 font-medium mt-1">{vendor.businessInfo.experience} years</p>
                          </div>
                        )}
                        {vendor.contact?.email && (
                          <div className="bg-stone-50 rounded-xl p-4">
                            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Contact Email</span>
                            <p className="text-slate-800 font-medium mt-1">{vendor.contact.email}</p>
                          </div>
                        )}
                        {vendor.contact?.phone && (
                          <div className="bg-stone-50 rounded-xl p-4">
                            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Phone</span>
                            <p className="text-slate-800 font-medium mt-1">{vendor.contact.phone}</p>
                          </div>
                        )}
                        {vendor.contact?.website && (
                          <div className="bg-stone-50 rounded-xl p-4">
                            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Website</span>
                            <a href={vendor.contact.website} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 font-medium mt-1 block">
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Service Areas */}
                    {vendor.location?.serviceAreas?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Service Areas</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendor.location.serviceAreas.map((area, idx) => (
                            <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Media */}
                    {vendor.contact?.socialMedia && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Connect With Us</h4>
                        <div className="flex gap-3">
                          {vendor.contact.socialMedia.instagram && (
                            <a href={vendor.contact.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-orange-100 hover:text-orange-600 transition-colors">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </a>
                          )}
                          {vendor.contact.socialMedia.facebook && (
                            <a href={vendor.contact.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-orange-100 hover:text-orange-600 transition-colors">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Services Tab */}
                {activeTab === "services" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-slate-800 mb-3">Services Offered</h3>

                    {vendor.serviceDetails?.servicesOffered?.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {vendor.serviceDetails.servicesOffered.map((service, idx) => (
                          <div key={idx} className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                            <h4 className="font-medium text-slate-800">{service.name}</h4>
                            {service.description && (
                              <p className="text-sm text-stone-500 mt-1">{service.description}</p>
                            )}
                            {service.price && (
                              <p className="text-orange-600 font-medium mt-2">
                                Starting at {formatINR(service.price)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
                        <p className="text-slate-700 font-medium">{vendor.service}</p>
                        <p className="text-2xl font-serif text-orange-600 mt-2">
                          Starting at {formatINR(vendor.price)}
                        </p>
                      </div>
                    )}

                    {/* Pricing Info */}
                    {vendor.serviceDetails?.pricingModel && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <p className="text-sm text-amber-700">
                          <span className="font-medium">Pricing Model:</span> {vendor.serviceDetails.pricingModel}
                        </p>
                        {vendor.serviceDetails.pricing && (
                          <p className="text-sm text-amber-700 mt-1">
                            <span className="font-medium">Range:</span> {formatINR(vendor.serviceDetails.pricing.min)} - {formatINR(vendor.serviceDetails.pricing.max)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                  <div>
                    <ReviewList vendorId={id} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100 sticky top-24">
              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-stone-200"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  ))}
                </div>
                <span className="font-medium text-slate-800">{rating.toFixed(1)}</span>
                <span className="text-stone-500 text-sm">({totalReviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Starting Price</span>
                <p className="text-3xl font-serif text-slate-800 mt-1">{formatINR(vendor.price)}</p>
              </div>

              {/* Performance Metrics */}
              {metrics.responseRate > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  <div className="bg-stone-50 rounded-lg p-3">
                    <span className="text-stone-500">Response Rate</span>
                    <p className="font-medium text-slate-800">{metrics.responseRate}%</p>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-3">
                    <span className="text-stone-500">Completion Rate</span>
                    <p className="font-medium text-slate-800">{metrics.completionRate}%</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBooking}
                  disabled={isBooked}
                  className={`w-full py-3.5 rounded-full font-medium transition-all duration-300 ${
                    isBooked
                      ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-soft hover:shadow-elegant hover:-translate-y-0.5"
                  }`}
                >
                  {isBooked ? "Already Booked" : "Book Now"}
                </button>

                <Link
                  to={`/chat?vendor=${id}`}
                  className="w-full py-3.5 rounded-full font-medium text-center block border border-stone-200 text-slate-700 hover:bg-stone-50 transition-colors"
                >
                  Send Message
                </Link>
              </div>

              {/* Availability Notice */}
              {vendor.availability?.isAvailable === false && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-sm text-amber-700">
                    This vendor is currently not accepting new bookings.
                  </p>
                </div>
              )}
            </div>

            {/* Badges */}
            {vendor.badges?.length > 0 && (
              <div className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Achievements</h4>
                <div className="flex flex-wrap gap-2">
                  {vendor.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-sm font-medium"
                    >
                      {badge.type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default VendorDetail;
