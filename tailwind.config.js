/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: '#4299e1',  // Blue color we've been using
        'primary-dark': '#3182ce',
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        dark: {
          background: '#191919',
          sidebar: '#202020',
          text: '#F1FFFC',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system', 
          'BlinkMacSystemFont', 
          '"Segoe UI"', 
          'Roboto', 
          'Oxygen', 
          'Ubuntu', 
          'Cantarell', 
          '"Open Sans"', 
          '"Helvetica Neue"', 
          'sans-serif',
        ],
        mono: [
          'Monaco',
          'Menlo',
          '"Ubuntu Mono"',
          'Consolas',
          'monospace',
        ],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      textOpacity: {
        '87': '0.87',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
    },
  },
  plugins: [],
} 