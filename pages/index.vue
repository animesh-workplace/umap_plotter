<template>
  <div>
    <h1 class="text-2xl text-center mb-2">UMAP Visualization</h1>
    <div class="flex justify-center z-10">
      <GeneSearch />
    </div>
    <UMAPPlot :data="umapData" class="-mt-8" />
  </div>
</template>

<script setup>
import { useUmapDataStore } from '@/stores/umapData'

const store = useUmapDataStore()
const umapData = computed(() => store.umapPoints)
</script>