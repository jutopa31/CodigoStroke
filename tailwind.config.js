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
          // CSS vars → adapts to data-theme="light" / "dark" automatically
          bg:        'rgb(var(--tw-stroke-bg) / <alpha-value>)',
          text:      'rgb(var(--tw-stroke-text) / <alpha-value>)',
          navy:      'rgb(var(--tw-stroke-surface) / <alpha-value>)',
          line:      'rgb(var(--tw-stroke-line) / <alpha-value>)',
          panel:     'rgb(var(--tw-stroke-panel) / <alpha-value>)',
          iconActive:'rgb(var(--tw-stroke-accent) / <alpha-value>)',
          textMuted: 'rgb(var(--tw-stroke-text-muted) / <alpha-value>)',
          // Fixed — not used in theme-sensitive contexts
          navyDeep: '#10264F',
          icon: '#244B99',
        },
        // Semantic status tokens — use these instead of raw Tailwind color names
        // to keep mobile/desktop and all contexts visually consistent.
        status: {
          // warning (amber) — dark-UI: light text, translucent border/muted
          warning: {
            DEFAULT: '#FBBF24',  // amber-400 (readable on navy)
            muted:   'rgba(245,158,11,0.12)',
            border:  'rgba(245,158,11,0.35)',
            badge:   '#F59E0B',  // amber-500
            strong:  '#FCD34D',  // amber-300
          },
          // info (blue) — clinical info: TA readings, general hints
          info: {
            DEFAULT: '#93C5FD',  // blue-300 (readable on navy)
            muted:   'rgba(59,130,246,0.12)',
            border:  'rgba(96,165,250,0.35)',
            badge:   '#3B82F6',  // blue-500
          },
          // critical (red) — severe values: NIHSS ≥21, BP >185, absolute CIs
          critical: {
            DEFAULT: '#EF4444',  // red-500
            muted:   'rgba(239,68,68,0.12)',
            border:  'rgba(239,68,68,0.35)',
          },
          // glucose (violet) — dedicated channel for glycemia readings
          glucose: {
            DEFAULT: '#C4B5FD',  // violet-300 (readable on navy)
            muted:   'rgba(139,92,246,0.12)',
            border:  'rgba(139,92,246,0.35)',
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
        // DESIGN.md type system: DM Sans (UI/headers), Source Sans 3 (clinical body), Geist Mono (numbers/timer)
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['Source Sans 3', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
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
      // Role-based radius scale (single source — see DESIGN.md → Layout).
      // Same role uses the same token on mobile AND desktop. Values match the
      // de-facto usage already in the code, so this documents reality, not churn.
      //   sm  → badges, chips, small status tags
      //   md  → inputs, small secondary controls
      //   lg  → nested panels, list rows
      //   xl  → cards, buttons, primary containers   (dominant token)
      //   2xl → large surfaces, FABs, modals
      //   full→ circles, pills, avatars
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      // Motion tokens (single source — see DESIGN.md → Motion). Setting DEFAULT
      // makes every `transition-*` without an explicit value use the app's
      // signature expo-out curve + a 200ms base, so state changes feel fluid
      // everywhere with no per-component churn.
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.16, 1, 0.3, 1)', // expo-out — enters & state changes
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'snappy': 'cubic-bezier(0.4, 0, 0.2, 1)',  // exits & quick toggles
      },
      transitionDuration: {
        DEFAULT: '200ms',
        'fast': '150ms',
        'base': '250ms',
        'slow': '350ms',
      },
      animation: {
        'slide-down': 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.25s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
        'step-pop': 'stepPop 0.3s ease-out',
        'pending-pulse': 'pendingPulse 1.8s ease-in-out infinite',
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
        stepPop: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.18)' },
        },
        pendingPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0)' },
          '50%': { boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.28)' },
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
