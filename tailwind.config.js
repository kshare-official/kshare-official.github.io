/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './*.html',
    './_pages/**/*.html',
    './blog/**/*.html',
    './assets/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        'primary-dark': '#4c1d95',
        secondary: '#7e22ce',
      },
      fontFamily: {
        sans: ['Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

