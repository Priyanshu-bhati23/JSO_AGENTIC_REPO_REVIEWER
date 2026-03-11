/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0D0D0D',
          50: '#F5F5F3',
          100: '#E8E8E4',
          200: '#CDCDC5',
          300: '#A8A89C',
          500: '#6B6B60',
          700: '#3D3D35',
          900: '#1A1A16',
        },
        jade: {
          DEFAULT: '#00B37D',
          light: '#00D496',
          dark: '#007A55',
          muted: '#E6F7F2',
        },
        amber: {
          DEFAULT: '#F5A623',
          light: '#FFC85C',
          dark: '#C07800',
          muted: '#FEF6E4',
        },
        crimson: {
          DEFAULT: '#E53935',
          muted: '#FDECEA',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
        'scan-line': 'scanLine 2s linear infinite',
        'score-fill': 'scoreFill 1.2s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.5' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        scoreFill: {
          from: { strokeDashoffset: '440' },
          to: { strokeDashoffset: 'var(--target-offset)' },
        },
      },
    },
  },
  plugins: [],
}
