/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#07070a',
          surface: '#0d0d14',
          card: '#12121c',
          cardHover: '#181825',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(99, 102, 241, 0.35)',
          muted: '#8b8fa3',
          subtle: '#52556b',
        },
        electric: {
          blue: '#38bdf8',
          cyan: '#06b6d4',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        // Universal Roboto Typography
        heading: ['var(--font-heading)', 'Roboto', 'sans-serif'],
        display: ['var(--font-heading)', 'Roboto', 'sans-serif'],
        sans: ['var(--font-body)', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['var(--font-body)', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-mono)', 'Roboto', 'monospace'],
      },
      backgroundImage: {
        'cinematic-glow': 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15), transparent 70%)',
        'radial-electric': 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.12), rgba(139, 92, 246, 0.08) 50%, transparent 100%)',
        'subtle-grid': 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-spin': 'spin 12s linear infinite',
      },
      boxShadow: {
        'electric-glow': '0 0 35px -5px rgba(99, 102, 241, 0.3)',
        'cyan-glow': '0 0 30px -5px rgba(56, 189, 248, 0.25)',
        'card-glow': '0 10px 40px -10px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
