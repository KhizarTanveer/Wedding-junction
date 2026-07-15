import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-slate-900 text-stone-300 mt-auto">
      {/* Upper Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10 sm:pb-12 border-b border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-amber-400 rounded-xl flex items-center justify-center">
                <span className="font-serif text-slate-800 font-bold text-lg">W</span>
              </div>
              <span className="font-serif text-xl text-white">Wedding Junction</span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              Curating exceptional wedding experiences with trusted vendors,
              stunning venues, and bespoke services tailored to your vision.
            </p>
          </div>

          {/* Newsletter */}
          <div className="max-w-md w-full">
            <h4 className="text-white font-medium mb-3">Stay Inspired</h4>
            <p className="text-stone-400 text-sm mb-4">
              Subscribe to receive wedding tips, trends, and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/50 transition-colors rounded-lg sm:rounded-l-lg sm:rounded-r-none"
              />
              <button className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-6 py-3 font-medium hover:from-amber-500 hover:to-amber-600 transition-all rounded-lg sm:rounded-l-none sm:rounded-r-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Services */}
        <div>
          <h4 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Services</h4>
          <ul className="space-y-2">
            <li><Link to="/vendors" className="text-stone-300 hover:text-amber-300 text-sm transition-colors">Vendors</Link></li>
            <li><Link to="/services" className="text-stone-300 hover:text-amber-300 text-sm transition-colors">All Services</Link></li>
            <li><Link to="/explore/Venues" className="text-stone-300 hover:text-amber-300 text-sm transition-colors">Venues</Link></li>
            <li><Link to="/explore/Photography" className="text-stone-300 hover:text-amber-300 text-sm transition-colors">Photography</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Company</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="text-stone-300 hover:text-amber-300 text-sm transition-colors">About Us</Link></li>
            <li><Link to="/" className="text-stone-300 hover:text-amber-300 text-sm transition-colors">Careers</Link></li>
            <li><Link to="/" className="text-stone-300 hover:text-amber-300 text-sm transition-colors">Press</Link></li>
            <li><Link to="/" className="text-stone-300 hover:text-amber-300 text-sm transition-colors">Blog</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Support</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="text-stone-300 hover:text-amber-300 text-sm transition-colors">Help Center</Link></li>
            <li><Link to="/" className="text-stone-300 hover:text-amber-300 text-sm transition-colors">Contact Us</Link></li>
            <li><Link to="/" className="text-stone-300 hover:text-amber-300 text-sm transition-colors">FAQs</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Contact</h4>
          <ul className="space-y-2 text-sm text-stone-400">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              info@weddingjunction.com
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +92 300 1234567
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              123 Wedding Street, Lahore
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-500">
          <span>&copy; 2025 The Wedding Junction. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-stone-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-stone-300 transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-stone-300 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
