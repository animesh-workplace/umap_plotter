import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({
				devServer: { port: 3010 },
				devtools: { enabled: true },
				runtimeConfig: {
								public: {
												API_BASE_URL: process.env.API_BASE_URL || 'http://10.10.6.80/fibrohub/api',
								},
				},
				app: {
								baseURL: process.env.ROUTER_BASE || '/fibrohub/',
								head: {
												title: 'FibroHub | National Institute of Biomedical Genomics',
												meta: [],
												link: [],
								},
				},
				compatibilityDate: '2024-11-01',
				css: ['@/assets/css/main.css'],
				icon: { clientBundle: { scan: true }, serverBundle: { collections: ['akar-icons', 'tabler', 'solar'] } },
				primevue: {
								options: {
												ripple: true,
												theme: { preset: Aura, options: { darkModeSelector: '.dark' } },
								},
								components: {
												include: [
																'Select',
																'Button',
																'Menubar',
																'Carousel',
																'Skeleton',
																'FloatLabel',
																'ToggleSwitch',
																'Autocomplete',
																'SelectButton',
												],
								},
				},
				build: { transpile: ['echarts', 'echarts-gl', 'zrender'] },
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
								features: ['UniversalTransition'],
								charts: ['ScatterChart', 'HeatmapChart', 'CustomChart', 'ThemeRiverChart', 'BoxplotChart'],
								components: [
												'GridComponent',
												'TitleComponent',
												'LegendComponent',
												'GraphicComponent',
												'DatasetComponent',
												'TooltipComponent',
												'ToolboxComponent',
												'DataZoomComponent',
												'VisualMapComponent',
												'SingleAxisComponent',
								],
				},
})
