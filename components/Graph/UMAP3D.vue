<template>
	<div>
		<client-only>
			<VChart :option="chartOption" class="w-full h-[40rem]" />
		</client-only>
	</div>
</template>

<script setup>
import { use } from 'echarts/core'
import { Scatter3DChart } from 'echarts-gl/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { TooltipComponent } from 'echarts/components'
import { Grid3DComponent } from 'echarts-gl/components'

// Register the components
use([Grid3DComponent, Scatter3DChart, TooltipComponent, CanvasRenderer])

const props = defineProps({
	colorBy: { type: String, default: '' },
	colorScheme: { type: String, default: '#5470c6' },
	scatterData: { type: Array, required: true, default: () => [] },
})

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

const updateChart = () => {
	chartOption.value.series[0].data = [...props.scatterData]
}

// Chart options as a computed property
const chartOption = ref({
	xAxis3D: { type: 'value' },
	yAxis3D: { type: 'value' },
	zAxis3D: { type: 'value' },
	tooltip: {
		textStyle: { fontFamily: 'Averta', fontWeight: 500 },
		formatter: (params) => {
			return (
				`X: ${params.data[0].toFixed(2)}<br/>` +
				`Y: ${params.data[1].toFixed(2)}<br/>` +
				`Z: ${params.data[2].toFixed(2)}<br/>` +
				`Cell ID: ${params.data[3]}<br/>` +
				`Cluster: ${params.data[5]}`
			)
		},
	},
	grid3D: {
		top: '0%',
		left: '0%',
		right: '0%',
		bottom: '0%',
		viewControl: {
			alpha: 20,
			beta: 40,
			distance: 220,
			autoRotate: false,
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
						Kurten: '#b91c1c',
						Choi: '#c2410c',
						Peng: '#a16207',
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

defineExpose({
	updateChart,
})
</script>
