// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import Aura from '@primeuix/themes/aura';
import ptBR from "primelocale/pt-BR.json";
export default defineNuxtConfig({
  //ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['@primevue/nuxt-module', '@nuxt/eslint', '@nuxt/icon'],
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'system',
          cssLayer: false
        }
      },
      locale: ptBR["pt-BR"],
    }
  },
  devServer: {
    host: '127.0.0.1'
  }
})