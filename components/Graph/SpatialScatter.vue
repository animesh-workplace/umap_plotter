<template>
	<div>
		<Skeleton height="40rem" v-if="isLoading" />
		<VChart
			v-else
			autoresize
			ref="chartRef"
			:option="chartOption"
			class="h-[40rem] backdrop-blur rounded-lg"
		/>
	</div>
</template>

<script setup>
const validMin = ref(0)
const validMax = ref(1)
const chartRef = ref(null)
const isLoading = ref(true)
const originalImageWidth = 778
const originalImageHeight = 768
const currentImageWidth = ref(0)
const currentImageHeight = ref(0)

const props = defineProps({
	imageURL: { type: String, default: '' },
	colorScheme: { type: String, default: '#5470c6' },
	scatterData: { type: Array, required: true, default: () => [] },
})

// watch(
// 	() => props.scatterData,
// 	(newValue) => {
// 		updateChart()
// 	},
// 	{ deep: true },
// )

watch(
	() => props.imageURL,
	(newValue) => {
		updateChart()
	},
	{ deep: true },
)

const getExpressionRange = () => {
	const values = props.scatterData.map((item) => item[5])
	return [Math.min(...values), Math.ceil(Math.max(...values))]
}

const calculateDimensions = () => {
	if (!chartRef.value) return

	const chartContainer = chartRef.value.$el
	currentImageWidth.value = chartContainer.clientWidth
	currentImageHeight.value = chartContainer.clientHeight
}

const updateChart = () => {
	// Calculate expression range for visualMap
	const [min, max] = getExpressionRange()
	// Calculate the dimensions of the image
	calculateDimensions()
	// Make sure min and max are valid numbers and not the same value
	const validMin = isFinite(min) ? min : 0
	const validMax = isFinite(max) && max > validMin ? max : validMin + 1

	chartOption.value = {
		...chartOption.value,
		visualMap: {
			show: true,
			right: 5,
			dimension: 5,
			top: 'center',
			min: validMin,
			max: validMax,
			hoverLink: false,
			calculable: true,
			type: 'continuous',
			orient: 'vertical',
			inRange: {
				color: [
					'#000004',
					'#1B0C41',
					'#4F116F',
					'#812581',
					'#B5367A',
					'#E55063',
					'#FB8861',
					'#FEC287',
					'#F6F1B5',
					'#FCFDBF',
				],
			},
			textStyle: { fontFamily: 'Averta', fontWeight: 500 },
		},
	}
	chartOption.value.series[0].data = [...props.scatterData]
	chartOption.value.graphic.style = {
		image: props.imageURL,
		width: currentImageWidth.value,
		height: currentImageHeight.value,
	}
}

const chartOption = ref({
	visualMap: {
		right: 5,
		show: true,
		dimension: 2,
		top: 'center',
		min: validMin,
		max: validMax,
		hoverLink: false,
		calculable: true,
		type: 'continuous',
		orient: 'vertical',
		inRange: {
			color: [
				'#000004',
				'#1B0C41',
				'#4F116F',
				'#812581',
				'#B5367A',
				'#E55063',
				'#FB8861',
				'#FEC287',
				'#F6F1B5',
				'#FCFDBF',
			],
		},
		textStyle: { fontFamily: 'Averta', fontWeight: 500 },
	},
	grid: {
		top: '0%',
		left: '0%',
		right: '0%',
		bottom: '0%',
	},
	xAxis: {
		min: 0,
		show: false,
		type: 'value',
		inverse: false,
		splitNumber: 40,
		max: originalImageWidth * 0.77,
	},
	yAxis: {
		min: 0,
		show: false,
		type: 'value',
		inverse: true, // Top-down coordinate system
		splitNumber: 40,
		max: originalImageHeight * 0.795,
	},
	graphic: {
		z: -10,
		top: 0,
		left: 0,
		type: 'image',
		style: {
			image: props.imageURL,
			width: originalImageWidth,
			height: originalImageHeight,
		},
	},
	tooltip: {
		formatter: (p) =>
			`${p.data.cell}<br/>x: ${p.data.x}, y: ${p.data.y}, a: ${p.data.a}, expression: ${p.data.expression}`,
	},
	series: [
		{
			symbolSize: 8,
			type: 'scatter',
			data: props.scatterData,
			itemStyle: { color: 'green' },
		},
	],
})

onMounted(() => {
	nextTick(() => {
		try {
			isLoading.value = false
			setTimeout(() => {
				updateChart()
			}, 50)
		} catch (err) {
			console.log(err)
		}
	})
})
</script>

<style scoped></style>
