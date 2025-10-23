<template>
	<div class="w-full flex justify-center">
		<VChart ref="chart" :option="chartOption" class="chart" autoresize />
	</div>
</template>

<script setup>
import { use } from 'echarts/core'
import { ScatterGLChart } from 'echarts-gl/charts'

// Register the components
use([ScatterGLChart])

const props = defineProps({
	colorBy: { type: String, default: '' },
	colorScheme: { type: String, default: '#5470c6' },
	scatterData: { type: Array, required: true, default: () => [] },
})

const clusterNewNameMap = {
	'CAF-1': 'quiCAF',
	'CAF-2': 'apCAF',
	'CAF-3': 'actCAF',
	'CAF-4': 'periCAF',
	'CAF-5': 'meCAF',
	'CAF-6': 'vsmCAF',
	'CAF-7': 'infCAF',
	'CAF-8': 'msCAF',
	'CAF-9': 'pCAF',
}

// Add a watcher to log the data when it changes
watch(
	() => props.scatterData,
	(newValue) => {
		updateChart()
	},
	{ deep: true },
)

watch(
	() => props.colorBy,
	(newValue) => {
		updateChart()
	},
)

const getExpressionRange = () => {
	const values = props.scatterData.map((item) => item[5])
	return [Math.min(...values), Math.ceil(Math.max(...values))]
}

const updateChart = () => {
	if (props.colorBy == 'Gene' || props.colorBy == 'Lineage') {
		// Calculate expression range for visualMap
		const [min, max] = getExpressionRange()
		// Make sure min and max are valid numbers and not the same value
		const validMin = isFinite(min) ? min : 0
		const validMax = isFinite(max) && max > validMin ? max : validMin + 1

		chartOption.value = {
			...chartOption.value,
			visualMap: {
				show: true,
				bottom: 10,
				dimension: 5,
				min: validMin,
				max: validMax,
				left: 'center',
				hoverLink: false,
				calculable: true,
				type: 'continuous',
				orient: 'horizontal',
				inRange: { color: ['#d3d3d3', props.colorScheme] },
				textStyle: { fontFamily: 'Lexend Deca', fontWeight: 500 },
			},
		}
	} else {
		const { visualMap, ...rest } = chartOption.value
		chartOption.value = rest
	}
	chartOption.value.series[0].data = [...props.scatterData]
}

const chartOption = ref({
	animation: true,
	dataZoom: [
		{ type: 'inside', xAxisIndex: [0] },
		{ type: 'inside', yAxisIndex: [0] },
		{ type: 'slider', xAxisIndex: [0], show: false },
		{ type: 'slider', yAxisIndex: [0], show: false },
	],
	yAxis: {
		type: 'value',
		axisLabel: { fontFamily: 'Lexend Deca', fontWeight: 500 },
	},
	xAxis: {
		type: 'value',
		axisLabel: { fontFamily: 'Lexend Deca', fontWeight: 500 },
	},
	tooltip: {
		trigger: 'axis',
		zlevel: 100,
		axisPointer: { type: 'cross', label: { fontFamily: 'Lexend Deca', fontWeight: 500 } },
		textStyle: { fontFamily: 'Lexend Deca', fontWeight: 500 },
		formatter: function (params) {
			if (!params.length) return ''
			const expressionText = params[0].value[5] !== 0 ? `Expression: ${params[0].value[5].toFixed(2)}` : ''
			return (
				`X: ${params[0].value[0].toFixed(2)}<br/>` +
				`Y: ${params[0].value[1].toFixed(2)}<br/>` +
				`Cell: ${params[0].value[2]}<br/>` +
				`Cluster: ${clusterNewNameMap[params[0].value[4]]}<br/>` +
				`${expressionText}`
			)
		},
	},
	grid: {
		top: '0%',
		left: '0%',
		right: '0%',
		bottom: '0%',
		containLabel: true,
	},
	series: [
		{
			symbolSize: 4,
			type: 'scatterGL',
			data: props.scatterData,
			itemStyle: {
				opacity: 0.8,
				color: (params) => {
					const sourceColors = {
						Choi: '#c026d3',
						Peng: '#451a03',
						Kurten: '#b91c1c',
						Puram2017: '#4d7c0f',
						Puram2023: '#047857',
						Kurkalang: '#6d28d9',
					}

					const clusterColors = {
						'CAF-1': '#F08080',
						'CAF-2': '#32CD32',
						'CAF-3': '#A0522D',
						'CAF-4': '#4682B4',
						'CAF-5': '#556B2F',
						'CAF-6': '#708090',
						'CAF-7': '#CC5500',
						'CAF-8': '#008080',
						'CAF-9': '#9B1B30',
					}
					if (props.colorBy == 'Source') {
						const source_id = params.data[3]
						return sourceColors[source_id]
					} else if (props.colorBy == 'Cluster') {
						const cluster_id = params.data[4]
						return clusterColors[cluster_id]
					}
					return props.colorScheme
				},
			},
		},
	],
})

onMounted(() => {
	nextTick(() => {
		updateChart()
	})
})

defineExpose({
	updateChart,
	updatePointColors: (colors) => {
		chartOption.value.series[0].itemStyle.color = (params) => {
			return colors[params.dataIndex]
		}
	},
})
</script>

<style scoped>
.chart {
	width: 100%;
	height: 34rem;
}
</style>
