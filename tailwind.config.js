/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0806',
        'dark-text': '#f4e6d3',
        'accent': '#ff6b35',
        'accent-hover': '#e55a2b',
        'bronze': {
          600: '#8b6541',
        },
      },
      fontFamily: {
        'garamond': ['EB Garamond', 'Georgia', 'Times New Roman', 'serif'],
        'italic': ['Noto Sans Old Italic', 'Aegean', 'serif'],
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'panel': '0 -4px 20px rgba(0, 0, 0, 0.3)',
        'modal': '0 8px 32px rgba(0, 0, 0, 0.6)',
        'badge': '0 3px 8px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
