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
const validMax = ref(0)
const chartRef = ref(null)
const isLoading = ref(false)
const originalImageWidth = 778
const originalImageHeight = 768

const props = defineProps({
	imageURL: { type: String, default: '' },
	colorScheme: { type: String, default: '#5470c6' },
	scatterData: { type: Array, required: true, default: () => [] },
})

const chartOption = ref({
	visualMap: {
		right: 0,
		show: false,
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
		axisLabel: { lineStyle: { color: 'red' } },
		splitLine: { lineStyle: { color: 'red' } },
	},
	yAxis: {
		min: 0,
		show: false,
		type: 'value',
		inverse: true, // Top-down coordinate system
		splitNumber: 40,
		max: originalImageHeight * 0.795,
		splitLine: { lineStyle: { color: 'red' } },
	},
	graphic: {
		z: -10,
		top: 0,
		left: 0,
		type: 'image',
		style: {
			image: '',
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
			data: [], // Add points here
			symbolSize: 8,
			type: 'scatter',
			itemStyle: { color: 'green' },
		},
	],
})
</script>

<style scoped></style>
