/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: '#f0f5ff',
          100: '#dbe6ff',
          200: '#b6ccff',
          300: '#8ba8ff',
          400: '#5a7eff',
          500: '#165DFF',
          600: '#0e48d9',
          700: '#0b3aab',
          800: '#0F3460',
          900: '#0a2242',
          950: '#06152a'
        },
        brand: {
          50: '#eef4ff',
          100: '#dae7ff',
          500: '#165DFF',
          600: '#0e48d9',
          700: '#0b3aab',
          900: '#0F3460'
        },
        slatePlus: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        }
      },
      fontFamily: {
        display: ['"Noto Serif SC"', 'serif'],
        sans: ['"PingFang SC"', '"Helvetica Neue"', 'Arial', 'sans-serif']
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(15, 52, 96, 0.04), 0 4px 16px -2px rgba(15, 52, 96, 0.06)',
        'card-hover': '0 4px 12px -2px rgba(15, 52, 96, 0.10), 0 16px 40px -8px rgba(15, 52, 96, 0.12)',
        'glow': '0 0 30px -4px rgba(22, 93, 255, 0.35)'
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        }
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fade-in-up 0.45s ease-out both',
        'slide-in': 'slide-in 0.35s ease-out both',
        'shimmer': 'shimmer 2s linear infinite'
      },
      backgroundImage: {
        'grid-slate': "linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)",
        'hero-gradient': 'radial-gradient(ellipse at top left, rgba(22,93,255,0.14), transparent 55%), radial-gradient(ellipse at bottom right, rgba(15,52,96,0.12), transparent 55%)'
      }
    },
  },
  plugins: [],
};
