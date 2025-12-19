/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Add this section:
      keyframes: {
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(-30%)' },
          '100%': { transform: 'translateX(0%)' },
        }
      },
      animation: {
        'progress-fast': 'progress 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}