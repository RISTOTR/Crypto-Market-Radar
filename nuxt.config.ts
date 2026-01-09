// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/tailwind.css'],

  typescript: {
    strict: true
  },

  app: {
    head: {
      title: 'Crypto Market Radar',
      meta: [
        { name: 'description', content: 'Visual crypto market screener built with Nuxt 3.' }
      ]
    }
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  }
})
