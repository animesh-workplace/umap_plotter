<template>
  <div>
    <Skeleton class="mb-2" height="24rem" v-if="isLoading" />
    <VChart ref="chart" class="w-[22rem] h-96 chart-container" :option="graph_options" :class="{ hidden: isLoading }" />
  </div>
</template>

<script setup>
const props = defineProps({
  data: { type: Array, required: true }
})
const chart = useTemplateRef('chart')
const graph_options = ref({
  animation: true,
  yAxis: {
    type: 'value',
    axisLabel: {
      fontFamily: 'Averta',
      fontWeight: 500,
    },
  },
  xAxis: {
    type: 'value',
    axisLabel: {
      fontFamily: 'Averta',
      fontWeight: 500,
    },
  },
  tooltip: {
    trigger: 'item',
    axisPointer: { type: 'cross' },
    textStyle: {
      fontFamily: 'Averta',
      fontWeight: 500,
    },
    formatter: function (params) {
      return `X: ${params.value[0]}<br/>Y: ${params.value[1]}<br/>Value: ${params.value[2]}`;
    }
    // renderMode: 'richText',
    // borderColor: '#fff',
    // order: 'valueDesc',
  },
  // grid: {
  //   left: '0%',
  //   right: '0%',
  //   bottom: '0%',
  //   containLabel: true,
  // },
  series: [{ type: 'scatter', data: props.data, symbolSize: 5, itemStyle: { color: '#40a9ff' } }],
  visualMap: {
    calculable: false, top: 'center', right: 0, inRange: {
      color: ['#40a9ff', '#002766']
    },
  }
})

const isLoading = ref(true)

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      isLoading.value = false
      // chart.$forceUpdate()
      console.log(chart)
    }, 1000)
  })
})
</script>

<style scoped>
.chart-container {
  width: 50%;
  height: 800px;
}
</style>
