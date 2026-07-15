import { useEffect, useRef } from "react";

function Hero() {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const particlesRef = useRef(null);

  // Parallax & video zoom effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (videoRef.current) {
        videoRef.current.style.transform = `scale(1.05) translateY(${scrollY * 0.15}px)`;
      }
      if (overlayRef.current) {
        overlayRef.current.style.transform = `translateY(${scrollY * 0.08}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Particle animation - reduced count for elegance
  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    const particleCount = 25;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      container.appendChild(particle);
      particles.push(particle);
    }

    return () => {
      particles.forEach((p) => container.removeChild(p));
    };
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover brightness-75 will-change-transform transition-transform duration-700 ease-out"
        src="https://cdn.pixabay.com/video/2024/05/20/212698_tiny.mp4"
        type="video/mp4"
      />

      {/* Particle Overlay */}
      <div
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      ></div>

      {/* Dark Overlay with Gradient */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-slate-900/40 to-slate-900/80 flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-16 sm:pt-20"
      >
        {/* Decorative Element */}
        <div className="mb-8 opacity-0 animate-fade-up" style={{ animationDelay: "0ms" }}>
          <span className="inline-flex items-center gap-4 text-amber-200 text-xs md:text-sm font-medium uppercase tracking-luxury">
            <span className="w-8 sm:w-12 md:w-16 h-px bg-gradient-to-r from-transparent to-amber-300/60"></span>
            Est. 2024
            <span className="w-8 sm:w-12 md:w-16 h-px bg-gradient-to-l from-transparent to-amber-300/60"></span>
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-semibold text-white mb-6 tracking-tight leading-tight opacity-0 animate-fade-up" style={{ animationDelay: "150ms" }}>
          Your Dream Wedding,
          <span className="block mt-2 font-light italic text-white/95">Perfectly Planned</span>
        </h1>

        {/* Subheading */}
        <p className="text-white/95 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-8 font-light tracking-wide opacity-0 animate-fade-up" style={{ animationDelay: "300ms" }}>
          Explore top vendors, luxurious venues, and bespoke services designed
          to make your special day unforgettable.
        </p>

        {/* Highlight phrase with decorative lines */}
        <div className="opacity-0 animate-fade-up" style={{ animationDelay: "450ms" }}>
          <span className="inline-flex items-center gap-4 text-amber-200 text-sm md:text-base font-medium uppercase tracking-widest">
            <span className="w-8 md:w-12 h-px bg-amber-300/50"></span>
            Elegance in Every Detail
            <span className="w-8 md:w-12 h-px bg-amber-300/50"></span>
          </span>
        </div>

        {/* CTA Button */}
        <div className="mt-10 opacity-0 animate-fade-up" style={{ animationDelay: "600ms" }}>
          <a
            href="#featured"
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-medium tracking-wide transition-all duration-400 hover:bg-white/20 hover:border-white/30 hover:shadow-lg group"
          >
            Discover More
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>

    </section>
  );
}

export default Hero;
