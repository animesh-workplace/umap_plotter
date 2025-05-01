<template>
    <div>
      <div ref="plot"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  
  const props = defineProps({
    data: {
      type: Array,
      required: true
    }
  })
  
  const plot = ref(null)
  const PlotlyRef = ref(null)
  
  function renderPlot(Plotly) {
    if (!props.data || !props.data.length || !plot.value) return
  
    const trace = {
      x: props.data.map(d => d.x),
      y: props.data.map(d => d.y),
      text: props.data.map(d => d.cell_id),
      mode: 'markers',
      type: 'scatter',
      marker: { size: 6 }
    }
  
    const layout = {
      title: 'UMAP Projection',
      xaxis: { title: 'UMAP-1' },
      yaxis: { title: 'UMAP-2' },
      height: 800
    }
  
    Plotly.newPlot(plot.value, [trace], layout)
  }
  
  onMounted(async () => {
    if (process.client) {
      PlotlyRef.value = await import('plotly.js-dist')
      if (props.data?.length) renderPlot(PlotlyRef.value)
    }
  })
  
  watch(() => props.data, () => {
    if (process.client && PlotlyRef.value && props.data?.length) {
      renderPlot(PlotlyRef.value)
    }
  })
  </script>
  