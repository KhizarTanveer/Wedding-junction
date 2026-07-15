/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Luxury Color Palette
      colors: {
        // Gold accents for luxury feel
        gold: {
          50:  '#FBF8F1',
          100: '#F7F0E3',
          200: '#EFE1C7',
          300: '#E4CCA0',
          400: '#D4B06A',
          500: '#C9A227',
          600: '#B8922A',
          700: '#9A7B23',
          800: '#7C631C',
          900: '#5E4A15',
        },
        // Warm neutral backgrounds
        warm: {
          50:  '#FDFCFB',
          100: '#FAF8F5',
          200: '#F5F0EA',
          300: '#EDE4D9',
          400: '#D9CEC0',
          500: '#C4B5A3',
          600: '#A69680',
          700: '#8A7A66',
          800: '#6E614F',
          900: '#524839',
        },
        // Champagne tones
        champagne: {
          50:  '#FFFDF8',
          100: '#FEF9EE',
          200: '#FCF2DC',
          300: '#F9E8C4',
          400: '#F5D89A',
          500: '#F0C770',
        },
        // Deep espresso for text
        espresso: {
          800: '#615145',
          900: '#51443A',
          950: '#2B231C',
        },
      },
      // Typography
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'Cambria', 'serif'],
        sans: ['Lato', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      letterSpacing: {
        'luxury': '0.2em',
        'elegant': '0.15em',
      },
      // Spacing
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      // Border Radius
      borderRadius: {
        'luxury': '1rem',
        'luxury-lg': '1.25rem',
        'luxury-xl': '1.5rem',
        'luxury-2xl': '2rem',
      },
      // Luxury Shadows
      boxShadow: {
        'soft': '0 4px 8px -1px rgba(82, 68, 58, 0.05), 0 2px 4px -1px rgba(82, 68, 58, 0.03)',
        'soft-md': '0 6px 12px -2px rgba(82, 68, 58, 0.06), 0 4px 6px -2px rgba(82, 68, 58, 0.03)',
        'soft-lg': '0 10px 20px -3px rgba(82, 68, 58, 0.07), 0 4px 8px -2px rgba(82, 68, 58, 0.04)',
        'elegant': '0 4px 16px -2px rgba(82, 68, 58, 0.08), 0 2px 8px -2px rgba(201, 162, 39, 0.04)',
        'elegant-lg': '0 8px 32px -4px rgba(82, 68, 58, 0.10), 0 4px 16px -2px rgba(201, 162, 39, 0.06)',
        'luxury': '0 20px 40px -8px rgba(82, 68, 58, 0.12), 0 8px 16px -4px rgba(82, 68, 58, 0.06)',
        'luxury-lg': '0 25px 50px -12px rgba(82, 68, 58, 0.15), 0 12px 24px -8px rgba(82, 68, 58, 0.08)',
        'gold': '0 4px 20px -4px rgba(201, 162, 39, 0.20), 0 2px 8px -2px rgba(201, 162, 39, 0.12)',
        'gold-lg': '0 8px 32px -4px rgba(201, 162, 39, 0.25), 0 4px 12px -2px rgba(201, 162, 39, 0.15)',
      },
      // Transitions
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'elegant': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      // Animations
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'modal-enter': {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-particle': {
          '0%': { transform: 'translateY(100vh) scale(0.3)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-10vh) scale(0.8)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-up-delay': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'modal-enter': 'modal-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-particle': 'float-particle 12s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
