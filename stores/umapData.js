import { defineStore } from 'pinia'

export const useUmapDataStore = defineStore('umapData', {
    state: () => ({
        umapPoints: [],
        geneExpression: null
    }),
    actions: {
        async fetchUmapData() {
            try {
                const res = await fetch('http://localhost:8000/api/umap/')
                if (!res.ok) throw new Error(`HTTP error: ${res.statusText}`)

                const data = await res.json()
                this.umapPoints = data.map(item => [item.x, item.y, item.cell_id, 0])
            } catch (err) {
                console.error('Failed to fetch UMAP data:', err)
                this.umapPoints = []
            }
        },
        updateUmapPoints(points) {
            this.umapPoints = points
        },
        updateGeneExpression(expressionData) {
            this.geneExpression = expressionData
        }
    },
})
