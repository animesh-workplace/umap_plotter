<template>
	<div>
		<Skeleton height="40rem" v-if="isLoading" />
		<VChart
			v-else
			autoresize
			ref="chartRef"
			:option="violinChartOption"
			class="h-[40rem] backdrop-blur rounded-lg font-[Averta]"
		/>
	</div>
</template>

<script setup>
import { graphic } from 'echarts'
const isLoading = ref(false)

const violinChartOption = {
	title: {
		text: 'Violin Plot with Box Overlay',
	},
	tooltip: {
		trigger: 'item',
		formatter: (params) => `Value: ${params.value}`,
	},
	xAxis: {
		type: 'category',
		data: ['Group A', 'Group B', 'Group C'],
	},
	yAxis: {
		type: 'value',
	},
	series: [
		{
			z: -1,
			name: 'BoxPlot',
			type: 'boxplot',
			data: [
				[850, 940, 960, 980, 1100],
				[740, 800, 850, 870, 890],
				[780, 800, 820, 840, 860],
			],
		},
		{
			z: 1,
			name: 'Violin',
			type: 'custom',
			renderItem: (params, api) => {
				const categoryIndex = api.value(0)
				const start = api.coord([categoryIndex, api.value(1)[0]])
				const end = api.coord([categoryIndex, api.value(1)[1]])

				const shape = {
					points: [
						[start[0], start[1]],
						[end[0], end[1]],
						[end[0] + 10, end[1] - 20],
						[start[0] + 10, start[1] + 20],
					],
				}

				return {
					type: 'polygon',
					shape: shape,
					style: api.style({
						fill: '#7b9ce1',
						opacity: 0.6,
					}),
				}
			},
			encode: { x: 1, y: 1 },
			data: [
				[0, [800, 1100]],
				[1, [740, 890]],
				[2, [780, 860]],
			],
		},
	],
}
</script>

<style scoped></style>
