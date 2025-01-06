import { resolve } from "node:path";

export default defineNuxtConfig({
  srcDir: 'src',
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss'],
  tailwindcss: {
    cssPath: ['~/assets/css/tailwind.css'],
  },
  content: {
    documentDriven: true,
    sources: {
      'kontent': {
        driver: resolve('src', 'driver', 'kontent-ai.mjs'),
        prefix: '/', // we mount our driver on the root
        driverOptions: {
          projectId: process.env.KONTENT_AI_PROJECT_ID,
          apiKey: process.env.KONTENT_AI_API_KEY,
        },
      },
    }
  },

  compatibilityDate: '2024-12-01'
})
