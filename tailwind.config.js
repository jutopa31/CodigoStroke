/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fef2f2',
          300: '#f0a0a0',
          500: '#c0392b',
          600: '#9b2c2c',
          700: '#7f2424',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['DM Serif Display', 'serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-active': '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        'modal': '0 20px 60px rgba(0,0,0,0.25)',
        'timer': '0 2px 8px rgba(0,0,0,0.12)',
      },
      animation: {
        'slide-down': 'slideDown 0.45s ease-out',
        'slide-up':   'slideUp 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        'confirm-flash': 'confirmFlash 0.8s ease-out',
      },
      keyframes: {
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(60px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        confirmFlash: {
          '0%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgb(236 253 245)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
    },
  },
  plugins: [],
}
