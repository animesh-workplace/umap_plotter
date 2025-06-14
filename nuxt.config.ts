import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({
	devtools: { enabled: true },
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
		charts: ['ScatterChart', 'HeatmapChart'],
		components: [
			'GridComponent',
			'TitleComponent',
			'LegendComponent',
			'DatasetComponent',
			'TooltipComponent',
			'ToolboxComponent',
			'DataZoomComponent',
			'VisualMapComponent',
		],
	},
})
