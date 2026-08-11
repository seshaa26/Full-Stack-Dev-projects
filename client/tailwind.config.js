/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f8fd',
          100: '#e5f0fb',
          200: '#c5def6',
          300: '#94c2ee',
          400: '#5ca2e5',
          500: '#0077b5', // LinkedIn bug blue
          600: '#0a66c2', // LinkedIn primary
          700: '#08539c',
          800: '#094580',
          900: '#0b3968',
          950: '#082547',
        },
        violet: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        surface: {
          950: '#f8fafc', /* Main Bg */
          900: '#f1f5f9', /* Alt Bg */
          850: '#ffffff',
          800: '#ffffff', /* Card Bg */
          700: '#cbd5e1', /* Borders (Slate 300) */
          600: '#94a3b8',
          500: '#64748b',
          400: '#475569', /* Muted Text (Slate 600 - Softer) */
          300: '#334155',
          200: '#1e293b', /* Secondary Text (Slate 800) */
          100: '#0f172a', /* Primary Text (Slate 900 - Softer) */
          50: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'float': 'float 12s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(14, 165, 233, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
          '25%': { transform: 'translate(20px, -20px) rotate(2deg)' },
          '50%': { transform: 'translate(0px, -30px) rotate(0deg)' },
          '75%': { transform: 'translate(-20px, -15px) rotate(-2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'glass-lg': '0 16px 64px rgba(0, 0, 0, 0.16)',
        'neon': '0 0 20px rgba(10, 102, 194, 0.4), 0 0 60px rgba(10, 102, 194, 0.1)',
        'neon-cyan': '0 0 20px rgba(0, 119, 181, 0.4), 0 0 60px rgba(0, 119, 181, 0.1)',
      },
    },
  },
  plugins: [],
}
