<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <NuxtRouteAnnouncer />
  </div>
</template>

<script setup>
import { useGeneOptionsStore } from '@/stores/geneInfo'
import { useUmapDataStore } from '@/stores/umapData'

const umapStore = useUmapDataStore()
const store = useGeneOptionsStore()

await Promise.all([
  store.fetchGenes(),
  umapStore.fetchUmapData()
])
</script>
