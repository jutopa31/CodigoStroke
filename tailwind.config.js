/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        neutral: {
          300: '#A3A3A3',
          400: '#707070',
          500: '#525252',
          600: '#404040',
          700: '#2F2F2F',
          800: '#1F1F1F',
          900: '#171717',
          950: '#0A0A0A',
        },
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
        },
        stroke: {
          navy: '#132B58',
          navyDeep: '#10264F',
          line: '#29416D',
          panel: '#3B4D73',
          icon: '#244B99',
          iconActive: '#5C7AEA',
          textMuted: '#A8B6D6',
        },
        // Semantic status tokens — use these instead of raw Tailwind color names
        // to keep mobile/desktop and all contexts visually consistent.
        status: {
          // warning (amber) — caution: CI relativas, partial tab, BP/glucose alerts
          warning: {
            DEFAULT: '#D97706',  // amber-600
            muted:   '#FFFBEB',  // amber-50
            border:  '#FCD34D',  // amber-300
            badge:   '#F59E0B',  // amber-500
            strong:  '#92400E',  // amber-800
          },
          // info (blue) — clinical info: TA readings, general hints
          info: {
            DEFAULT: '#2563EB',  // blue-600
            muted:   '#EFF6FF',  // blue-50
            border:  '#BFDBFE',  // blue-200
            badge:   '#3B82F6',  // blue-500
          },
          // critical (dark navy) — severe values: NIHSS ≥21, BP >185, absolute CIs
          critical: {
            DEFAULT: '#1E3A8A',  // blue-900
          },
          // glucose (violet) — dedicated channel for glycemia readings
          glucose: {
            DEFAULT: '#7C3AED',  // violet-600
            muted:   '#F5F3FF',  // violet-50
            border:  '#DDD6FE',  // violet-200
            badge:   '#8B5CF6',  // violet-500
          },
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#FAFAFA',
          elevated: '#FFFFFF',
        },
        border: {
          DEFAULT: '#F0F0F0',
          muted: '#F5F5F5',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['0.875rem',  { lineHeight: '1.25rem',  letterSpacing: '-0.01em'  }],  // 14px (era 12)
        'sm':   ['1rem',      { lineHeight: '1.5rem',   letterSpacing: '-0.01em'  }],  // 16px (era 14)
        'base': ['1.125rem',  { lineHeight: '1.75rem',  letterSpacing: '-0.011em' }],  // 18px (era 16)
        'lg':   ['1.25rem',   { lineHeight: '1.875rem', letterSpacing: '-0.014em' }],  // 20px (era 18)
        'xl':   ['1.5rem',    { lineHeight: '2rem',     letterSpacing: '-0.017em' }],  // 24px (era 20)
        '2xl':  ['1.75rem',   { lineHeight: '2.25rem',  letterSpacing: '-0.019em' }],  // 28px (era 24)
        '3xl':  ['2rem',      { lineHeight: '2.5rem',   letterSpacing: '-0.021em' }],  // 32px (era 30)
        '4xl':  ['2.5rem',    { lineHeight: '3rem',     letterSpacing: '-0.022em' }],  // 40px (era 36)
      },
      boxShadow: {
        'minimal': '0 1px 2px rgba(0,0,0,0.04)',
        'card': '0 1px 3px rgba(0,0,0,0.04)',
        'elevated': '0 4px 12px rgba(0,0,0,0.06)',
        'modal': '0 16px 48px rgba(0,0,0,0.12)',
        'timer': '0 2px 8px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      animation: {
        'slide-down': 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.25s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
