// https://nuxt.com/docs/guide/directory-structure/nuxt.config
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],

  i18n: {
    baseUrl: 'http://localhost:3000',
    locales: [
      {
        code: 'en',
        iso: 'en',
        name: 'English'
      },
      {
        code: 'fr',
        iso: 'fr-FR',
        name: 'Français'
      }
    ],
    defaultLocale: 'en',
    detectBrowserLanguage: false,
    lazy: false,
    vueI18n: {
      legacy: false,
      messages: {
        fr: {
          home: 'Accueil',
          about: 'À propos',
          posts: 'Articles',
          dynamic: 'Dynamique'
        },
        en: {
          home: 'Homepage',
          about: 'About us',
          posts: 'Posts',
          dynamic: 'Dynamic'
        }
      },
      fallbackLocale: 'en'
    }
  }
})
