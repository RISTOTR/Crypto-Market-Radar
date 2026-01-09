/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
    './app.{vue,js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        'cmr-bg': '#020617',     // fondo general
        'cmr-card': 'rgba(15,23,42,0.9)' // tarjetas
      }
    }
  },
  plugins: []
}
