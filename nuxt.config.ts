import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  primevue: { options: { ripple: true, theme: { preset: Aura } } },
  modules: [
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxt/image',
    'nuxt-echarts',
    '@nuxt/eslint',
    '@nuxt/scripts',
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