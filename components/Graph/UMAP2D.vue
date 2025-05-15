<template>
	<div class="w-full mt-3 flex justify-center">
		<VChart ref="chart" :option="chartOption" class="h-[45rem]" />
	</div>
</template>

<script setup>
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

const chartOption = ref({
	animation: true,
	yAxis: {
		type: 'value',
		axisLabel: { fontFamily: 'Averta', fontWeight: 500 },
	},
	xAxis: {
		type: 'value',
		axisLabel: { fontFamily: 'Averta', fontWeight: 500 },
	},
	tooltip: {
		trigger: 'item',
		axisPointer: { type: 'cross' },
		textStyle: { fontFamily: 'Averta', fontWeight: 500 },
		formatter: function (params) {
			if (!params) {
				return ''
			}
			const expressionText = params.value[4] !== 0 ? `Expression: ${params.value[4].toFixed(2)}` : ''
			return (
				`X: ${params.value[0].toFixed(2)}<br/>` +
				`Y: ${params.value[1].toFixed(2)}<br/>` +
				`Cell: ${params.value[2]}<br/>` +
				`${expressionText}`
			)
		},
		borderColor: '#fff',
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
			type: 'scatter',
			data: props.scatterData,
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
					const cluster_id = params.data[3]
					return props.colorByCluster ? groupColors[cluster_id] : props.colorScheme
				},
			},
		},
	],
})

defineExpose({
	updateChart,
})
</script>

<style></style>
