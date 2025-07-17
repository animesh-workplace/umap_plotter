<template>
	<div class="w-full flex justify-center">
		<VChart ref="chart" :option="chartOption" class="h-[30rem]" autoresize />
	</div>
</template>

<script setup>
import { use } from 'echarts/core'
import { CustomChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, DatasetComponent } from 'echarts/components'
import * as kde from 'fast-kde'

// Register the components
use([CustomChart, GridComponent, TooltipComponent, DatasetComponent])

const props = defineProps({
	plotData: { type: Array, required: true, default: () => [] },
	bandwidth: { type: Number, default: null }, // If null, we compute Silverman's
	adjust: { type: Number, default: 1 }, // Adjusts bandwidth
	cut: { type: Number, default: 3 }, // KDE tail padding
	thresholds: { type: Number, default: 40 }, // KDE resolution
})

// Median
const calculateMedian = (arr) => {
	const sorted = [...arr].sort((a, b) => a - b)
	const mid = Math.floor(sorted.length / 2)
	return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

// Quartiles
const calculateQuartiles = (arr) => {
	const sorted = [...arr].sort((a, b) => a - b)
	const q1 = calculateMedian(sorted.slice(0, Math.floor(sorted.length / 2)))
	const q3 = calculateMedian(sorted.slice(Math.ceil(sorted.length / 2)))
	return [q1, q3]
}

// Silverman's Rule (approx.)
const computeSilvermanBandwidth = (data) => {
	if (data.length < 2) return 1
	const mean = data.reduce((sum, v) => sum + v, 0) / data.length
	const stdDev = Math.sqrt(data.reduce((sum, v) => sum + (v - mean) ** 2, 0) / data.length)
	const sorted = [...data].sort((a, b) => a - b)
	const q1 = calculateMedian(sorted.slice(0, Math.floor(sorted.length / 2)))
	const q3 = calculateMedian(sorted.slice(Math.ceil(sorted.length / 2)))
	const iqr = q3 - q1
	return 0.9 * Math.min(stdDev, iqr / 1.34) * Math.pow(data.length, -1 / 5)
}

// KDE using fast-kde
const calculateKDE = (data, baseBandwidth, thresholds, adjust, cut) => {
	if (data.length < 2) return []

	const bw = (baseBandwidth ?? computeSilvermanBandwidth(data)) * adjust
	const min = Math.min(...data)
	const max = Math.max(...data)

	const kdeMin = min - cut * bw
	const kdeMax = max + cut * bw

	const densities = kde.density1d(data, {
		bandwidth: bw,
		bins: thresholds,
		range: [kdeMin, kdeMax],
	})

	return Array.from(densities).map(({ x, y }) => [x, y])
}

// Compute processed data
const processedData = computed(() => {
	return props.plotData.map(([category, values]) => {
		const min = Math.min(...values)
		const max = Math.max(...values)
		const median = calculateMedian(values)
		const [q1, q3] = calculateQuartiles(values)
		const kde = calculateKDE(values, props.bandwidth, props.thresholds, props.adjust, props.cut)
		return {
			name: category,
			value: [category, min, q1, median, q3, max],
			rawData: values,
			kde: kde,
		}
	})
})

// Custom renderer
const renderItem = (params, api) => {
	const x = api.value(0)
	const min = api.value(1)
	const q1 = api.value(2)
	const median = api.value(3)
	const q3 = api.value(4)
	const max = api.value(5)
	const kde = processedData.value[params.dataIndex].kde

	if (!kde || kde.length === 0) return null

	const coordX = api.coord([x, 0])[0]
	const maxDensity = Math.max(...kde.map((d) => d[1]))
	const categoryWidth = api.size([1, 0])[0] * 0.7
	const violinWidth = categoryWidth * 0.5

	const leftPoints = []
	const rightPoints = []

	kde.forEach(([value, density]) => {
		const yCoord = api.coord([0, value])[1]
		const normalizedDensity = density / maxDensity
		const halfWidth = normalizedDensity * violinWidth * 0.5
		leftPoints.push([coordX - halfWidth, yCoord])
		rightPoints.push([coordX + halfWidth, yCoord])
	})
	rightPoints.reverse()
	const violinPoints = [...leftPoints, ...rightPoints]

	const coordMin = api.coord([x, min])
	const coordQ1 = api.coord([x, q1])
	const coordMedian = api.coord([x, median])
	const coordQ3 = api.coord([x, q3])
	const coordMax = api.coord([x, max])
	const boxWidth = categoryWidth * 0.08

	return {
		type: 'group',
		children: [
			{
				type: 'polygon',
				shape: { points: violinPoints },
				style: {
					fill: 'rgba(145, 204, 117, 0.7)',
					stroke: 'rgba(145, 204, 117, 0.8))',
					lineWidth: 1,
				},
			},
			{
				type: 'line',
				shape: { x1: coordX, y1: coordMin[1], x2: coordX, y2: coordQ1[1] },
				style: { stroke: '#333', lineWidth: 1 },
			},
			{
				type: 'line',
				shape: { x1: coordX, y1: coordMax[1], x2: coordX, y2: coordQ3[1] },
				style: { stroke: '#333', lineWidth: 1 },
			},
			{
				type: 'rect',
				shape: {
					x: coordX - boxWidth / 2,
					y: coordQ3[1],
					width: boxWidth,
					height: coordQ1[1] - coordQ3[1],
				},
				style: { stroke: '#333', fill: 'rgba(255, 255, 255, 0.8)', lineWidth: 1.5 },
			},
			{
				type: 'line',
				shape: {
					x1: coordX - boxWidth / 2,
					y1: coordMedian[1],
					x2: coordX + boxWidth / 2,
					y2: coordMedian[1],
				},
				style: { stroke: '#333', lineWidth: 2 },
			},
			{
				type: 'line',
				shape: {
					x1: coordX - boxWidth / 3,
					y1: coordMin[1],
					x2: coordX + boxWidth / 3,
					y2: coordMin[1],
				},
				style: { stroke: '#333', lineWidth: 1 },
			},
			{
				type: 'line',
				shape: {
					x1: coordX - boxWidth / 3,
					y1: coordMax[1],
					x2: coordX + boxWidth / 3,
					y2: coordMax[1],
				},
				style: { stroke: '#333', lineWidth: 1 },
			},
		],
	}
}

// Chart option
const chartOption = ref({
	tooltip: {
		trigger: 'item',
		axisPointer: { type: 'shadow' },
		formatter: function (params) {
			const data = params.value
			const rawData = processedData.value.find((item) => item.name === data[0])?.rawData || []
			return (
				`<strong>${data[0]}</strong><br/>` +
				`Count: ${rawData.length}<br/>` +
				`Min: ${data[1].toFixed(2)}<br/>` +
				`Q1: ${data[2].toFixed(2)}<br/>` +
				`Median: ${data[3].toFixed(2)}<br/>` +
				`Q3: ${data[4].toFixed(2)}<br/>` +
				`Max: ${data[5].toFixed(2)}`
			)
		},
	},
	grid: {
		left: '10%',
		right: '10%',
		bottom: '15%',
		top: '10%',
		containLabel: true,
	},
	xAxis: {
		type: 'category',
		data: processedData.value.map((item) => item.name),
		boundaryGap: true,
		nameGap: 30,
		axisLine: { lineStyle: { color: '#666' } },
		axisTick: { lineStyle: { color: '#666' } },
		axisLabel: { color: '#666' },
		splitLine: { show: false },
	},
	yAxis: {
		type: 'value',
		name: 'Value',
		max: 150,
		min: -50,
		nameTextStyle: { color: '#666' },
		axisLine: { lineStyle: { color: '#666' } },
		axisTick: { lineStyle: { color: '#666' } },
		axisLabel: { color: '#666' },
		splitLine: {
			lineStyle: {
				color: '#e6e6e6',
				type: 'solid',
			},
		},
	},
	series: [
		{
			name: 'Violin Plot',
			type: 'custom',
			renderItem: renderItem,
			encode: { x: 0, y: [1, 2, 3, 4, 5] },
			data: processedData.value.map((item) => item.value),
		},
	],
})

// Reactive watch on props
watch(
	() => props.plotData,
	() => {
		chartOption.value.series[0].data = processedData.value.map((item) => item.value)
		chartOption.value.xAxis.data = processedData.value.map((item) => item.name)
	},
	{ deep: true },
)
</script>

<style scoped></style>
