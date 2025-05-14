<template>
	<div>
		<client-only>
			<VChart :option="chartOption" class="w-full h-[45rem]" />
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
	colorScheme: { type: String, default: '#5470c6' },
	colorByCluster: { type: Boolean, default: false },
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
	() => props.colorByCluster,
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
		formatter: (params) => {
			return (
				`X: ${params.data[0].toFixed(2)}<br/>` +
				`Y: ${params.data[1].toFixed(2)}<br/>` +
				`Z: ${params.data[2].toFixed(2)}<br/>` +
				`Cell ID: ${params.data[3]}<br/>` +
				`Cluster: ${params.data[4]}`
			)
		},
	},
	grid3D: {
		viewControl: {
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
			symbolSize: 5,
			animation: true,
			type: 'scatter3D',
			data: props.scatterData,
			animationDurationUpdate: 200,
			emphasis: { itemStyle: { opacity: 1 } },
			itemStyle: {
				opacity: 0.8,
				color: (params) => {
					const groupColors = {
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
					const cluster_id = params.data[4]
					return props.colorByCluster ? groupColors[cluster_id] : props.colorScheme
				},
			},
		},
	],
})
</script>
