<template>
    <div>
        <h1>UMAP Dummy Visualization</h1>
        <UMAPPlot :data="umapData" />
    </div>
</template>

<script setup>
const umapData = ref([])

onMounted(async () => {
  const res = await fetch('/data/embeddings.json')
  umapData.value = await res.json()
})
</script>