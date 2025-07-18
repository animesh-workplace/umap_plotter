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
	const bottomRight = '#FFF94F'
	const bottomLeft = '#16DB93'
	const topRight = '#9d174d'
	const topLeft = '#d3d3d3'

	for (let y = 0; y < 5; y++) {
		const row = []
		for (let x = 0; x < 8; x++) {
			// Calculate interpolation factors (0 to 1)
			let xFactor = x / 7 // 0 at left, 1 at right
			let yFactor = y / 4 // 0 at top, 1 at bottom

			// Remapping functions to create biased gradients
			const biasTowardsEnd = (f) => {
				const norm = (f - 0.5) * 2
				const curved = Math.sqrt(norm)
				return curved / 2 + 0.5
			}
			const biasTowardsStart = (f) => {
				const norm = f * 2
				const curved = norm * norm
				return curved / 2
			}

			// Adjust factors based on the quadrant
			if (xFactor <= 0.5 && yFactor <= 0.5) {
				// Top-Left Quadrant
				xFactor = biasTowardsStart(xFactor)
				yFactor = biasTowardsStart(yFactor)
			} else if (xFactor > 0.5 && yFactor <= 0.5) {
				// Top-Right Quadrant
				xFactor = biasTowardsEnd(xFactor)
				yFactor = biasTowardsStart(yFactor)
			} else if (xFactor <= 0.5 && yFactor > 0.5) {
				// Bottom-Left Quadrant
				xFactor = biasTowardsStart(xFactor)
				yFactor = biasTowardsEnd(yFactor)
			} else {
				// Bottom-Right Quadrant
				xFactor = biasTowardsEnd(xFactor)
				yFactor = biasTowardsEnd(yFactor)
			}

			// Top edge: interpolate between top-left and top-right
			const topColor = interpolateColor(topLeft, topRight, xFactor)
			// Bottom edge: interpolate between bottom-left and bottom-right
			const bottomColor = interpolateColor(bottomLeft, bottomRight, xFactor)
			// Final color: interpolate between top and bottom colors
			const finalColor = interpolateColor(topColor, bottomColor, yFactor)

			row.push(finalColor)
		}
		grid.push(row)
	}
	colorGrid.value = grid
}

/*
// Initialize the heatmap with a single biased quadrant
const initializeHeatmap = () => {
	const grid = []

	// Define corner colors
	const bottomRight = '#FFF94F'
	const bottomLeft = '#16DB93'
	const topRight = '#9d174d'
	const topLeft = '#d3d3d3'

	for (let y = 0; y < 10; y++) {
		const row = []
		for (let x = 0; x < 10; x++) {
			// Calculate interpolation factors (0 to 1)
			let xFactor = x / 9 // 0 at left, 1 at right
			let yFactor = y / 9 // 0 at top, 1 at bottom

			// If in the bottom-right quadrant, adjust factors to bias towards bottom-right color
			if (xFactor > 0.5 && yFactor > 0.5) {
				const remap = (f) => {
					// Remap the factor in the range [0.5, 1] to a curve that biases towards 1
					const norm = (f - 0.5) * 2 // Normalize to [0, 1]
					const curved = Math.sqrt(norm) // Apply a curve (sqrt makes it concave up)
					return curved / 2 + 0.5 // Map back to [0.5, 1]
				}
				xFactor = remap(xFactor)
				yFactor = remap(yFactor)
			}

			// Top edge: interpolate between top-left and top-right
			const topColor = interpolateColor(topLeft, topRight, xFactor)
			// Bottom edge: interpolate between bottom-left and bottom-right
			const bottomColor = interpolateColor(bottomLeft, bottomRight, xFactor)
			// Final color: interpolate between top and bottom colors
			const finalColor = interpolateColor(topColor, bottomColor, yFactor)

			row.push(finalColor)
		}
		grid.push(row)
	}
	colorGrid.value = grid
}
*/

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
		data: Array.from({ length: 8 }, (_, i) => (i + 1).toString()),
	},
	yAxis: {
		type: 'category',
		splitArea: { show: false },
		axisLabel: { fontSize: 12 },
		data: Array.from({ length: 5 }, (_, i) => (i + 1).toString()),
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

defineExpose({ colorGrid })
// Initialize on mount
onMounted(() => {
	nextTick(() => {
		isLoading.value = false
		initializeHeatmap()

		const data = []
		for (let y = 0; y < 5; y++) {
			for (let x = 0; x < 8; x++) {
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
