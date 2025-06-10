import { defineStore } from 'pinia'

export const useGeneralDataStore = defineStore('GeneralDataStore', {
	state: () => ({
		navBarPosition: 'Spatial Localization',
	}),
	actions: {
		updateNavBarPosition(position) {
			this.navBarPosition = position
		},
	},
})
