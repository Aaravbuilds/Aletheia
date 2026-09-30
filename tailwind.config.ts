import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1360px' },
    },
    extend: {
      colors: {
        /* Aletheia core palette — docs/04-UI-UX-SYSTEM.md */
        canvas: '#F7F3EA',
        surface: '#FFFDF9',
        parchment: '#EDE4D4',
        sand: '#E3D7C2',
        line: '#DFD4C0',
        ink: '#241F1B',
        muted: '#746C64',
        maroon: {
          DEFAULT: '#651F2A',
          dark: '#4E1720',
          light: '#8C3440',
          wash: '#F3E4E3',
        },
        clay: '#A9553C',
        moss: '#4F6B4A',
        amber: '#B57A21',
        slate: '#4A5A68',
        status: {
          success: '#4F6B4A',
          warning: '#B57A21',
          error: '#A3402F',
          info: '#4A5A68',
        },
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['clamp(2.25rem, 1.6rem + 2.6vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-2': ['clamp(1.75rem, 1.4rem + 1.4vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(36, 31, 27, 0.04), 0 8px 24px -16px rgba(36, 31, 27, 0.18)',
        lift: '0 2px 6px rgba(36, 31, 27, 0.06), 0 18px 40px -24px rgba(36, 31, 27, 0.30)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out both',
        'rise-in': 'rise-in 260ms ease-out both',
        'slide-in-right': 'slide-in-right 220ms ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
