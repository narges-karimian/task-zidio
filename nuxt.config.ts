import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-11-05',
  modules: ['@nuxtjs/supabase'],
  supabase: {
    redirect: true,
    clientOptions: {
      auth: {
        // Callback pages exchange PKCE codes themselves so recovery can be verified.
        detectSessionInUrl: false,
      },
    },
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: ['/dashboard', '/tasks/**'],
      saveRedirectToCookie: true,
    },
    types: false,
  },
  routeRules: {
    '/reset-password': { ssr: false },
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: {
        lang: 'fa',
        dir: 'rtl',
      },
      title: 'مدیریت وظایف شخصی',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
