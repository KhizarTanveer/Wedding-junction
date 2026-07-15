function Cookies() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 pt-24 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-luxury text-stone-500 font-medium">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-slate-800 mt-3 mb-4">
            Cookie Policy
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-luxury-xl shadow-soft p-8 md:p-12 border border-stone-100">
          <div className="prose prose-stone max-w-none">
            <p className="text-stone-600 leading-relaxed mb-6">
              Last updated: January 2025
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">What Are Cookies</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              Cookies are small text files that are stored on your computer or mobile device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">Types of Cookies We Use</h2>

            <h3 className="text-xl font-serif text-slate-700 mb-3">Essential Cookies</h3>
            <p className="text-stone-600 leading-relaxed mb-4">
              These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website.
            </p>

            <h3 className="text-xl font-serif text-slate-700 mb-3">Performance Cookies</h3>
            <p className="text-stone-600 leading-relaxed mb-4">
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve how the website works.
            </p>

            <h3 className="text-xl font-serif text-slate-700 mb-3">Functionality Cookies</h3>
            <p className="text-stone-600 leading-relaxed mb-4">
              These cookies allow the website to remember choices you make (such as your language preference) and provide enhanced, more personal features.
            </p>

            <h3 className="text-xl font-serif text-slate-700 mb-3">Marketing Cookies</h3>
            <p className="text-stone-600 leading-relaxed mb-6">
              These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant ads on other sites.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">Managing Cookies</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or delete certain cookies. However, if you block or delete cookies, some features of our website may not work properly.
            </p>

            <h2 className="text-2xl font-serif text-slate-800 mb-4">Contact Us</h2>
            <p className="text-stone-600 leading-relaxed">
              If you have any questions about our use of cookies, please contact us at{" "}
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

export default Cookies;
