export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  typescript: { strict: true, typeCheck: true },
  runtimeConfig: {
    // server-only: Rust API base URL (K8s DNS in cluster, localhost in local dev)
    apiBase: process.env.API_BASE_URL ?? 'http://localhost:3000',
  },
  nitro: {
    routeRules: {
      // proxy /backend/** server-side to Rust API — client never talks to Rust directly
      '/backend/**': {
        proxy: `${process.env.API_BASE_URL ?? 'http://localhost:3000'}/**`,
      },
    },
  },
})
