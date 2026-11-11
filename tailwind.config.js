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
          charcoal: '#0d0d12',
          surface: '#0f0f17',
          card: '#14141e',
          cardHover: '#1c1c28',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 107, 0, 0.45)',
          muted: '#9496a8',
          subtle: '#5a5d72',
          orange: '#ff6b00',
          orangeLight: '#ff8c00',
          amber: '#f59e0b',
        },
        electric: {
          blue: '#38bdf8',
          cyan: '#06b6d4',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          purple: '#a855f7',
          orange: '#ff6b00',
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
        'cinematic-glow': 'radial-gradient(circle at 50% 0%, rgba(255, 107, 0, 0.16), transparent 70%)',
        'radial-electric': 'radial-gradient(circle at 50% 50%, rgba(255, 107, 0, 0.12), rgba(245, 158, 11, 0.08) 50%, transparent 100%)',
        'studio-orange-glow': 'radial-gradient(circle at 75% 20%, rgba(255, 107, 0, 0.18), transparent 60%)',
        'subtle-grid': 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-spin': 'spin 12s linear infinite',
      },
      boxShadow: {
        'electric-glow': '0 0 35px -5px rgba(255, 107, 0, 0.45)',
        'orange-glow': '0 0 35px -5px rgba(255, 107, 0, 0.5)',
        'amber-glow': '0 0 30px -5px rgba(245, 158, 11, 0.35)',
        'cyan-glow': '0 0 30px -5px rgba(56, 189, 248, 0.25)',
        'card-glow': '0 10px 40px -10px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
