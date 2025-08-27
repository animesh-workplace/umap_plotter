import Aura from '@primeuix/themes/aura'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
	devServer: { port: 3010 },
	devtools: { enabled: true },
	css: ['@/assets/css/main.css'],
	compatibilityDate: '2024-11-01',
	googleFonts: {
		preload: true,
		prefetch: true,
		useStylesheet: true,
		outputDir: 'assets',
		families: { Poppins: true, 'Lexend+Deca': { wght: '100..900' } },
	},
	vite: { plugins: [tailwindcss()] },
	build: { transpile: ['echarts', 'echarts-gl', 'zrender'] },
	runtimeConfig: {
		public: { API_BASE_URL: process.env.API_BASE_URL || 'http://10.10.6.80/fibrohub/api' },
	},
	app: {
		baseURL: process.env.ROUTER_BASE || '/fibroscape/',
		head: {
			title: 'FibroScape | National Institute of Biomedical Genomics',
			meta: [],
			link: [
				{ rel: 'icon', href: '/fibroscape/favicon.ico' },
				{ rel: 'manifest', href: '/fibroscape/site.webmanifest' },
				{ rel: 'apple-touch-icon', sizes: '180x180', href: '/fibroscape/apple-touch-icon.png' },
				{ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/fibroscape/favicon-32x32.png' },
				{ rel: 'icon', type: 'image/png', sizes: '16x16', href: '/fibroscape/favicon-16x16.png' },
			],
			script: [
				{
					async: true,
					defer: true,
					type: 'text/javascript',
					src: 'https://research.nibmg.ac.in/umami/script.js',
					'data-website-id': '3bc8fee8-9a14-49c8-9f7a-d1e1e33381a7',
				},
			],
		},
	},
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
	modules: [
		'nuxt-tour',
		'@nuxt/icon',
		'@pinia/nuxt',
		'nuxt-echarts',
		'@nuxt/eslint',
		'@vueuse/nuxt',
		'motion-v/nuxt',
		'@nuxtjs/google-fonts',
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
