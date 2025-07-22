import { defineStore } from 'pinia'

export const useHeatmapStore = defineStore('heatmap', {
	state: () => ({
		selectedCells: new Set(),
	}),
	actions: {
		toggleCell(cellKey) {
			if (this.selectedCells.has(cellKey)) {
				this.selectedCells.delete(cellKey)
			} else {
				this.selectedCells.add(cellKey)
			}
		},
	},
})
