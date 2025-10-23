<template>
	<div>
		<client-only>
			<VChart :option="chartOption" class="chart" autoresize />
		</client-only>
	</div>
</template>

<script setup>
import { use } from 'echarts/core'
import { Scatter3DChart } from 'echarts-gl/charts'
import { Grid3DComponent } from 'echarts-gl/components'

// Register the components
use([Grid3DComponent, Scatter3DChart])

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
	(newValue, oldValue) => {
		updateChart()
	},
)

const getExpressionRange = () => {
	const values = props.scatterData.map((item) => item[6])
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
				right: -6,
				dimension: 6,
				top: 'center',
				min: validMin,
				max: validMax,
				hoverLink: false,
				calculable: true,
				type: 'continuous',
				orient: 'vertical',
				inRange: {
					color:
						props.colorBy == 'Gene'
							? ['#d3d3d3', props.colorScheme]
							: [
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
									// '#FCFDBF',
									// '#F6F1B5',
									// '#FEC287',
									// '#FB8861',
									// '#E55063',
									// '#B5367A',
									// '#812581',
									// '#4F116F',
									// '#1B0C41',
									// '#000004',
							  ],
				},
				textStyle: { fontFamily: 'Lexend Deca', fontWeight: 500 },
			},
		}
	} else {
		const { visualMap, ...rest } = chartOption.value
		chartOption.value = rest
	}
	chartOption.value.series[0].data = [...props.scatterData]
}

// Chart options as a computed property
const chartOption = ref({
	xAxis3D: {
		type: 'value',
		axisLabel: { fontFamily: 'Lexend Deca', fontWeight: 500 },
		nameTextStyle: { fontFamily: 'Lexend Deca', fontWeight: 500 },
	},
	yAxis3D: {
		type: 'value',
		axisLabel: { fontFamily: 'Lexend Deca', fontWeight: 500 },
		nameTextStyle: { fontFamily: 'Lexend Deca', fontWeight: 500 },
	},
	zAxis3D: {
		type: 'value',
		axisLabel: { fontFamily: 'Lexend Deca', fontWeight: 500 },
		nameTextStyle: { fontFamily: 'Lexend Deca', fontWeight: 500 },
	},
	tooltip: {
		textStyle: { fontFamily: 'Lexend Deca', fontWeight: 500 },
		formatter: (params) => {
			return (
				`X: ${params.data[0].toFixed(2)}<br/>` +
				`Y: ${params.data[1].toFixed(2)}<br/>` +
				`Z: ${params.data[2].toFixed(2)}<br/>` +
				`Cell ID: ${params.data[3]}<br/>` +
				`Cluster: ${clusterNewNameMap[params.data[5]]}`
			)
		},
	},
	grid3D: {
		top: '0%',
		left: '0%',
		right: '0%',
		bottom: '0%',
		viewControl: {
			beta: 40,
			alpha: 20,
			distance: 220,
			autoRotate: true,
			autoRotateSpeed: 5,
		},
		axisLabel: { show: true },
		light: {
			main: { intensity: 0.1 },
			ambient: { intensity: 1.2 },
		},
		// splitLine: { show: true, lineStyle: { opacity: 0.9 } },
	},
	series: [
		{
			symbolSize: 4,
			animation: true,
			type: 'scatter3D',
			data: props.scatterData,
			animationDurationUpdate: 200,
			emphasis: { itemStyle: { opacity: 1 } },
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
						const source_id = params.data[4]
						return sourceColors[source_id]
					} else if (props.colorBy == 'Cluster') {
						const cluster_id = params.data[5]
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
