<template>
	<div class="w-full flex justify-center">
		<Skeleton height="30rem" v-if="isLoading" />
		<VChart :option="chartOption" class="h-[30rem]" autoresize v-else />
	</div>
</template>

<script setup>
const isLoading = ref(true)
const colorGrid = ref([])

// Initialize the heatmap with four corner colors
const initializeHeatmap = () => {
	const grid = []

	// Define corner colors
	const bottomRight = '#ca8a04'
	const bottomLeft = '#0284c7'
	const topRight = '#9d174d'
	const topLeft = '#808080'

	for (let y = 0; y < 8; y++) {
		const row = []
		for (let x = 0; x < 5; x++) {
			// Calculate interpolation factors (0 to 1)
			// 0 at left, 1 at right
			const xFactor = x / 5
			// 0 at top, 1 at bottom
			const yFactor = y / 7

			// Top edge: interpolate between green (top-left) and yellow (top-right)
			const topColor = interpolateColor(topLeft, topRight, xFactor)
			// Bottom edge: interpolate between grey (bottom-left) and red (bottom-right)
			const bottomColor = interpolateColor(bottomLeft, bottomRight, xFactor)
			// Final color: interpolate between top and bottom colors
			const finalColor = interpolateColor(topColor, bottomColor, yFactor)

			row.push(finalColor)
		}
		grid.push(row)
	}
	colorGrid.value = grid
}

// Helper function to interpolate between two colors
const interpolateColor = (color1, color2, factor) => {
	// Convert hex to RGB
	const rgb1 = hexToRgb(color1)
	const rgb2 = hexToRgb(color2)

	// Interpolate each channel
	const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor)
	const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor)
	const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor)

	// Convert back to hex
	return rgbToHex(r, g, b)
}

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: null
}

// Helper function to convert RGB to hex
const rgbToHex = (r, g, b) => {
	return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// Chart configuration
const chartOption = ref({
	visualMap: { show: false },
	grid: {
		top: '0%',
		left: '0%',
		right: '0%',
		bottom: '0%',
		containLabel: true,
	},
	xAxis: {
		type: 'category',
		splitArea: { show: false },
		axisLabel: { fontSize: 12 },
		data: Array.from({ length: 5 }, (_, i) => (i + 1).toString()),
	},
	yAxis: {
		type: 'category',
		splitArea: { show: false },
		axisLabel: { fontSize: 12 },
		data: Array.from({ length: 8 }, (_, i) => (i + 1).toString()),
	},
	series: [
		{
			data: [],
			name: 'Heatmap',
			type: 'heatmap',
			label: { show: false },
			emphasis: {
				itemStyle: {
					shadowBlur: 0,
					shadowColor: 'rgba(0, 0, 0, 0.5)',
				},
			},
		},
	],
})

// Initialize on mount
defineExpose({ colorGrid })
onMounted(() => {
	nextTick(() => {
		isLoading.value = false
		initializeHeatmap()

		const data = []
		for (let y = 0; y < 8; y++) {
			for (let x = 0; x < 5; x++) {
				data.push({
					// [x, y, value]
					value: [x, y, 1],
					itemStyle: {
						borderWidth: 0,
						borderColor: '#fff',
						color: colorGrid.value[y][x],
					},
				})
			}
		}

		chartOption.value.series[0].data = data
	})
})
</script>

<style scoped></style>
