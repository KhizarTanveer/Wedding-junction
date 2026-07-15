import { useEffect, useState } from "react";
import { API_URL } from "../config/api";

// Default fallback image
const defaultImage = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80";

function Services() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/api/services`);
        if (!res.ok) throw new Error("Failed to load services");
        const data = await res.json();
        setServices(data.data || data);
        setLoading(false);
      } catch (error) {
        setError("Unable to load services. Please try again later.");
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500 font-medium">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
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
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6 min-h-screen">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto text-center mb-20">
        <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
          What We Offer
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-slate-800 mt-3 mb-4">
          Our Premium Services
        </h1>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
        <p className="text-stone-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Explore our wide range of services crafted to make your wedding day extraordinary.
        </p>
      </div>

      {/* Services Cards - Same layout as FeaturedVendors */}
      <div className="flex flex-col gap-6 md:gap-12 lg:gap-16 max-w-6xl mx-auto">
        {services.map((service, index) => (
          <div
            key={service._id || service.id}
            className={`flex flex-col ${index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} bg-white rounded-luxury-xl shadow-soft overflow-hidden transition-all duration-500 ease-luxury hover:shadow-elegant-lg group border border-stone-100`}
          >
            {/* Service Image */}
            <div className="md:w-1/2 w-full h-48 sm:h-64 md:h-72 lg:h-96 overflow-hidden relative">
              <img
                src={service.image || defaultImage}
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Service Details */}
            <div className="md:w-1/2 w-full p-4 sm:p-6 md:p-8 lg:p-12 bg-stone-50 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{service.icon}</span>
                <span className="text-orange-600 text-xs uppercase tracking-widest font-medium">
                  Premium Service
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-medium mb-3 text-slate-800">
                {service.title}
              </h2>
              <p className="text-stone-600 text-base leading-relaxed mb-6">
                {service.description}
              </p>

              {/* Learn More Button */}
              <button
                onClick={() => setSelectedService(service)}
                className="inline-flex items-center gap-2 text-orange-600 font-medium tracking-wide hover:text-orange-700 transition-colors duration-300 group/btn w-max"
              >
                Learn More
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
        ))}
      </div>

      {/* Modal */}
      {selectedService && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="bg-white rounded-luxury-xl shadow-luxury-lg max-w-sm sm:max-w-lg w-full p-4 sm:p-6 md:p-8 mx-4 animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-4">{selectedService.icon}</div>
            <h2 className="text-2xl font-serif text-slate-800 mb-4">
              {selectedService.title}
            </h2>
            <p className="text-stone-600 mb-8 leading-relaxed">
              {selectedService.details}
            </p>
            <button
              className="bg-slate-800 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 hover:bg-slate-700 hover:shadow-soft-md block mx-auto"
              onClick={() => setSelectedService(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Services;
