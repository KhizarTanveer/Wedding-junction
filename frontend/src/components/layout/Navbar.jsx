import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();
  const { clearChatState, totalUnread } = useChat();

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    // Clear chat state first
    clearChatState();
    // Then logout (clears auth state and localStorage)
    logout();
    // Navigate to login
    navigate("/login");
  };

  const MenuLinks = ({ mobile = false }) => (
    <>
      <Link
        className={mobile ? "block py-2 text-slate-700 font-medium hover:text-orange-600 transition-colors" : "nav-link py-1"}
        to="/"
        onClick={() => mobile && setIsOpen(false)}
      >
        Home
      </Link>
      <Link
        className={mobile ? "block py-2 text-slate-700 font-medium hover:text-orange-600 transition-colors" : "nav-link py-1"}
        to="/services"
        onClick={() => mobile && setIsOpen(false)}
      >
        Services
      </Link>
      <Link
        className={mobile ? "block py-2 text-slate-700 font-medium hover:text-orange-600 transition-colors" : "nav-link py-1"}
        to="/vendors"
        onClick={() => mobile && setIsOpen(false)}
      >
        Vendors
      </Link>
      {isAuthenticated && (
        <Link
          className={mobile ? "block py-2 text-slate-700 font-medium hover:text-orange-600 transition-colors" : "nav-link py-1"}
          to="/bookings"
          onClick={() => mobile && setIsOpen(false)}
        >
          Bookings
        </Link>
      )}
      {isAuthenticated && (
        <Link
          className={mobile ? "block py-2 text-slate-700 font-medium hover:text-orange-600 transition-colors relative" : "nav-link py-1 relative"}
          to="/chat"
          onClick={() => mobile && setIsOpen(false)}
        >
          Messages
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-3 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </Link>
      )}
      {isAuthenticated && user?.role === "user" && (
        <Link
          className={mobile ? "block py-2 text-orange-600 font-medium hover:text-orange-700 transition-colors" : "nav-link py-1 text-orange-600"}
          to="/become-vendor"
          onClick={() => mobile && setIsOpen(false)}
        >
          Become a Vendor
        </Link>
      )}
      {user?.role === "vendor" && (
        <Link
          className={mobile ? "block py-2 text-orange-600 font-medium hover:text-orange-700 transition-colors" : "nav-link py-1 text-orange-600"}
          to="/vendor"
          onClick={() => mobile && setIsOpen(false)}
        >
          Dashboard
        </Link>
      )}
      {user?.role === "admin" && (
        <Link
          className={mobile ? "block py-2 text-orange-600 font-medium hover:text-orange-700 transition-colors" : "nav-link py-1 text-orange-600"}
          to="/admin"
          onClick={() => mobile && setIsOpen(false)}
        >
          Admin
        </Link>
      )}
    </>
  );

  const AuthButtons = ({ mobile = false }) =>
    isAuthenticated ? (
      <div className={`flex items-center ${mobile ? "flex-col gap-3 pt-4 border-t border-stone-200 mt-2" : "gap-4"}`}>
        <span className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 px-4 py-1.5 rounded-full text-sm font-medium border border-orange-200/50">
          {user?.name}
        </span>
        <button
          onClick={() => {
            handleLogout();
            mobile && setIsOpen(false);
          }}
          className={`${mobile ? "w-full" : ""} bg-slate-800 text-white px-5 py-2 rounded-full font-medium shadow-soft transition-all duration-300 hover:bg-slate-700 hover:shadow-soft-md hover:-translate-y-0.5`}
        >
          Logout
        </button>
      </div>
    ) : (
      <div className={`flex items-center ${mobile ? "flex-col gap-3 pt-4 border-t border-stone-200 mt-2" : "gap-3"}`}>
        <Link
          to="/login"
          onClick={() => mobile && setIsOpen(false)}
          className={`${mobile ? "w-full text-center" : ""} text-slate-700 font-medium px-4 py-2 hover:text-orange-700 transition-colors duration-300`}
        >
          Sign In
        </Link>
        <Link
          to="/signup"
          onClick={() => mobile && setIsOpen(false)}
          className={`${mobile ? "w-full text-center" : ""} bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-2.5 rounded-full font-medium shadow-soft transition-all duration-300 hover:from-orange-700 hover:to-orange-800 hover:shadow-soft-md hover:-translate-y-0.5`}
        >
          Get Started
        </Link>
      </div>
    );

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      scrolled
        ? "bg-white/95 backdrop-blur-md shadow-soft-md border-b border-stone-100"
        : "bg-gradient-to-r from-warm-50 via-champagne-50/30 to-warm-50"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 items-center">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-amber-400 rounded-xl flex items-center justify-center shadow-soft transition-all duration-300 group-hover:shadow-gold group-hover:scale-105">
              <span className="font-serif text-slate-800 font-bold text-lg">W</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium leading-none">The</span>
              <h1 className="text-lg sm:text-xl font-serif font-semibold text-slate-800 tracking-tight leading-tight">
                Wedding Junction
              </h1>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              <MenuLinks />
            </div>
            <AuthButtons />
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className="text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 p-2 rounded-xl hover:bg-orange-100/50 transition-all duration-300"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between" aria-hidden="true">
                <span className={`block h-0.5 w-6 bg-current rounded-full transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""}`}></span>
                <span className={`block h-0.5 w-6 bg-current rounded-full transition-all duration-300 ${isOpen ? "opacity-0" : ""}`}></span>
                <span className={`block h-0.5 w-6 bg-current rounded-full transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        role="navigation"
        aria-label="Mobile navigation"
        className={`md:hidden bg-white/98 backdrop-blur-md border-t border-stone-100 overflow-hidden transition-all duration-400 ease-luxury ${
          isOpen ? "max-h-[80vh] sm:max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          <MenuLinks mobile />
          <AuthButtons mobile />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
