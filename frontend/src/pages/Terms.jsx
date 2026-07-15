function Terms() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-800 mt-3 mb-4">
            Terms of Service
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-luxury-xl shadow-soft p-8 md:p-12 border border-stone-100">
          <div className="prose prose-stone max-w-none">
            <p className="text-stone-600 leading-relaxed mb-6">
              Last updated: January 2025
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              By accessing and using Wedding Junction, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">2. Services Description</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              Wedding Junction is a platform that connects couples with wedding vendors and service providers. We facilitate the discovery, comparison, and booking of wedding-related services including but not limited to venues, photographers, caterers, decorators, and entertainment.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">3. User Responsibilities</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">4. Booking and Payments</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              All bookings made through our platform are subject to vendor availability and confirmation. Payment terms are established between the user and the vendor. Wedding Junction acts as an intermediary and is not responsible for the quality of services provided by vendors.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">5. Cancellation Policy</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              Cancellation policies vary by vendor. Please review the specific cancellation terms provided by each vendor before making a booking. Wedding Junction is not responsible for any cancellation fees imposed by vendors.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">6. Limitation of Liability</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              Wedding Junction shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">7. Contact Information</h2>
            <p className="text-stone-600 leading-relaxed">
              For questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:info@weddingjunction.com" className="text-orange-600 hover:text-orange-700">
                info@weddingjunction.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Terms;
