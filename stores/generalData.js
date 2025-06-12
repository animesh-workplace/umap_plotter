import { defineStore } from 'pinia'

export const useGeneralDataStore = defineStore('GeneralDataStore', {
	state: () => ({
		navBarPosition: '',
	}),
	actions: {
		updateNavBarPosition(position) {
			this.navBarPosition = position
		},
	},
})
