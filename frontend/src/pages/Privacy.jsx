function Privacy() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-800 mt-3 mb-4">
            Privacy Policy
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-luxury-xl shadow-soft p-8 md:p-12 border border-stone-100">
          <div className="prose prose-stone max-w-none">
            <p className="text-stone-600 leading-relaxed mb-6">
              Last updated: January 2025
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">1. Information We Collect</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support. This may include your name, email address, phone number, and payment information.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">2. How We Use Your Information</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              We use the information we collect to provide, maintain, and improve our services, process transactions, send you related information including booking confirmations and updates, and communicate with you about products, services, and events.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">3. Information Sharing</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              We may share your information with vendors you choose to book through our platform to facilitate your wedding planning. We do not sell your personal information to third parties for marketing purposes.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">4. Data Security</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access. All data transmissions are encrypted using SSL technology.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">5. Your Rights</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              You have the right to access, correct, or delete your personal information. You may also opt out of receiving promotional communications from us by following the instructions in those messages.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">6. Cookies</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              We use cookies and similar tracking technologies to collect and track information about your browsing activities. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">7. Contact Us</h2>
            <p className="text-stone-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@weddingjunction.com" className="text-orange-600 hover:text-orange-700">
                privacy@weddingjunction.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Privacy;
