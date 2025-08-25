<template>
	<div class="mb-2 flex relative" v-if="geneSearch && selectedColorOption == 'Gene'">
		<AutoComplete
			dropdown
			class="w-full"
			@complete="searchGene"
			:model-value="modelValue"
			:suggestions="suggestions"
			@item-select="searchGeneExpression"
			placeholder="Type gene name to search ..."
			@update:model-value="$emit('update:modelValue', $event)"
		/>

		<button class="ml-2" v-if="modelValue" @click="clearGeneSelection">
			<Icon name="akar-icons:circle-x" class="w-5 h-5 text-red-500" />
		</button>
	</div>
</template>

<script setup>
import { useGeneAPI } from '@/api/geneAPI'

const route = useRoute()
const props = defineProps({
	modelValue: { type: String, default: null },
	geneSearch: { type: Boolean, default: true },
	selectedColorOption: { type: String, default: null },
})

const suggestions = ref([])

const searchGene = async (event) => {
	const { getGeneAutocomplete } = useGeneAPI()
	try {
		suggestions.value = (await getGeneAutocomplete(event?.query)) || []
	} catch (err) {
		console.error('Error fetching gene autocomplete:', err)
		suggestions.value = []
	}
}

const searchGeneExpression = (event) => {
	umami.track('gene-search', { gene: event.value, page: route.path })
	emit('gene-selected', event.value)
}

const clearGeneSelection = () => {
	emit('update:modelValue', null)
	emit('gene-cleared')
}

const emit = defineEmits(['gene-selected', 'gene-cleared', 'update:modelValue'])
</script>
