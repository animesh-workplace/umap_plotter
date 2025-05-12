import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  css: ['@/assets/css/main.css'],
  devtools: { enabled: true },
  primevue: { options: { ripple: true, theme: { preset: Aura, options: { darkModeSelector: '.dark' } } } },
  modules: [
    '@nuxt/icon',
    '@nuxt/fonts',
    '@pinia/nuxt',
    'nuxt-echarts',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    'motion-v/nuxt',
    '@nuxtjs/tailwindcss',
    '@primevue/nuxt-module',
  ],
  echarts: {
    ssr: true,
    renderer: ['canvas'],
    charts: ['ScatterChart'],
    features: ['UniversalTransition'],
    components: [
      'GridComponent',
      'TitleComponent',
      'DatasetComponent',
      'TooltipComponent',
      'ToolboxComponent',
      'VisualMapComponent'
    ],
  },
})