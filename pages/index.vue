<template>
  <div>
    <h1 class="text-2xl text-center">UMAP Dummy Visualization</h1>
    <UMAPPlot :data="umapData" />
  </div>
</template>

<script setup>
const umapData = ref([])

onBeforeMount(async () => {
  const res = await fetch('http://localhost:8000/api/umap-embeddings/');

  if (res.ok) {
    const data = await res.json();
    // Extract only the x, y, and cell_id fields
    umapData.value = data.map(item => [item.x, item.y, item.cell_id])
  } else {
    console.error('Failed to fetch data:', res.statusText)
  }
});
</script>