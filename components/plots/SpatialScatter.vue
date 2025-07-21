<template>
	<div>
		<Skeleton height="40rem" v-if="isLoading" />
		<VChart
			v-else
			autoresize
			ref="chartRef"
			:option="chartOption"
			class="h-[40rem] backdrop-blur rounded-lg font-[Averta]"
		/>
	</div>
</template>

<script setup>
const chartRef = ref(null)
const isLoading = ref(true)
const originalImageWidth = 778
const originalImageHeight = 768
const currentImageWidth = ref(0)
const currentImageHeight = ref(0)

const props = defineProps({
	clusterSelected: { type: Boolean },
	imageURL: { type: String, default: '' },
	colorScheme: { type: String, default: '' },
	scatterData: { type: Array, required: true, default: () => [] },
})

const chartOption = ref({
	animation: true,
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
		max: originalImageWidth,
	},
	yAxis: {
		min: 0,
		show: false,
		type: 'value',
		inverse: true,
		splitNumber: 40,
		max: originalImageHeight,
	},
	tooltip: {
		formatter: (p) => `${p.data.cell_id}<br/>x: ${p.data.x}, y: ${p.data.y}, expression: ${p.data.expression}`,
	},
	graphic: {
		z: -10,
		type: 'text',
		top: 'center',
		left: 'center',
		style: {
			textAlign: 'center',
			font: 'bold 20px Averta',
			text: 'Please Select Image',
			textVerticalAlign: 'middle',
		},
	},
})

const calculateDimensions = () => {
	if (!chartRef.value?.$el) return
	currentImageWidth.value = chartRef.value.$el.clientWidth
	currentImageHeight.value = chartRef.value.$el.clientHeight
}

const getExpressionRange = () => {
	const values = props.scatterData.map((item) => item.expression)
	const min = Math.min(...values)
	const max = Math.max(...values)
	return [isFinite(min) ? min : 0, isFinite(max) && max > min ? max : min + 1]
}

const updateChart = () => {
	if (!props.scatterData.length) return

	calculateDimensions()
	const [min, max] = getExpressionRange()

	if (props.clusterSelected && props.colorScheme == '') {
		chartOption.value = {
			...chartOption.value,
			visualMap: {
				min,
				max,
				right: 5,
				show: true,
				dimension: 2,
				top: 'center',
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
				textStyle: {
					fontFamily: 'Averta',
					fontWeight: 500,
				},
			},
			series: [
				{
					symbolSize: 8,
					type: 'scatter',
					data: props.scatterData,
					itemStyle: { color: 'green' },
				},
			],
		}
	} else if (
		props.clusterSelected &&
		(props.colorScheme == 'Pathologist Annotation' || props.colorScheme == 'TE Annotation')
	) {
		const annotationKey = props.colorScheme === 'Pathologist Annotation' ? 'path_annotation' : 'te_annotation'
		const sourceColors = {
			null: '#D9D9D9',
			SCC: '#EE6363',
			Core: '#00FFFF',
			Stroma: '#FFEC8B',
			Transitory: '#EE9572',
			'Leading Edge': '#8B1C62',
			'Artifact/Fold': '#838B83',
		}

		const groupedData = props.scatterData.reduce((acc, item) => {
			const key = item[annotationKey]
			if (!acc[key]) {
				acc[key] = []
			}
			acc[key].push(item)
			return acc
		}, {})

		const series = Object.keys(groupedData).map((key) => ({
			name: key,
			type: 'scatter',
			data: groupedData[key],
			symbolSize: 8,
			itemStyle: {
				color: sourceColors[key],
			},
		}))

		chartOption.value = {
			...chartOption.value,
			visualMap: null,
			legend: {
				top: 10,
				shadowBlur: 1,
				right: 'center',
				borderRadius: 5,
				width: originalImageWidth,
				backgroundColor: 'white',
				data: Object.keys(sourceColors),
				textStyle: { fontFamily: 'Averta', fontWeight: 700, fontSize: 15 },
			},
			tooltip: {
				formatter: (p) =>
					`${p.data.cell_id}<br/>x: ${p.data.x}, y: ${p.data.y}, expression: ${p.data.expression} <br/> Annotation: ${p.data[annotationKey]}`,
			},
			series,
		}
	} else {
		chartOption.value = {
			...chartOption.value,
			visualMap: undefined,
			series: undefined,
			legend: undefined,
		}
	}

	chartOption.value.xAxis.max = currentImageWidth.value
	chartOption.value.yAxis.max = currentImageHeight.value * 0.956

	if (props.imageURL) {
		chartOption.value.graphic = {
			z: -10,
			top: 0,
			left: 0,
			type: 'image',
			style: {
				image: props.imageURL,
				width: currentImageWidth.value,
				height: currentImageHeight.value,
			},
		}
	}
}

watchEffect(() => {
	updateChart()
})

onMounted(() => {
	nextTick(() => {
		isLoading.value = false
		setTimeout(updateChart, 50)
	})
})
</script>

<style scoped></style>
