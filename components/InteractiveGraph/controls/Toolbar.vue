<template>
	<div class="min-w-full">
		<div v-if="!noFilter">
			<Skeleton height="3rem" v-if="isLoading && !noFilter" class="mb-4 mt-2" />

			<div
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-3 grid grid-cols-2 gap-1 items-center justify-between mb-2 px-2 xl:px-4 backdrop-blur rounded-lg"
				:class="{
					'xl:grid-cols-3 xl:col-start-4': noColorBy,
					'xl:grid-cols-4 xl:col-start-3': !noColorBy,
				}"
				v-else
			>
				<div class="flex gap-2 items-center">
					<ToggleSwitch
						:model-value="activate3DMode"
						@update:model-value="$emit('update:activate3DMode', $event)"
					/>
					<Icon class="w-5 h-5 text-slate-500" name="akar-icons:augmented-reality" />
					<div class="text-sm">3D Mode</div>
				</div>

				<FloatLabel variant="on">
					<Select
						fluid
						size="small"
						inputId="Visualization-Type"
						:options="visualizationTypes"
						:model-value="selectedVisualizationType"
						@update:model-value="$emit('update:selectedVisualizationType', $event)"
						@value-change="handleVisualizationChange"
					/>
					<label for="Visualization-Type" class="flex items-center gap-2">
						<Icon class="w-4 h-4 text-slate-500" name="tabler:chart-dots" /> Plot type
					</label>
				</FloatLabel>

				<FloatLabel variant="on" v-if="!noColorBy">
					<Select
						fluid
						showClear
						size="small"
						inputId="Color-Filter"
						:options="colorMethods"
						:model-value="selectedColorOption"
						@update:model-value="$emit('update:selectedColorOption', $event)"
					/>
					<label for="Color-Filter" class="flex items-center gap-2">
						<Icon class="w-4 h-4 text-slate-500" name="tabler:color-filter" /> Color by
					</label>
				</FloatLabel>

				<FloatLabel variant="on">
					<Select
						fluid
						showClear
						size="small"
						inputId="Data-Filter"
						:options="filterMethods"
						@value-change="resetFilter"
						:model-value="selectedFilterOption"
						@update:model-value="$emit('update:selectedFilterOption', $event)"
					/>
					<label for="Data-Filter" class="flex items-center gap-2">
						<Icon class="w-4 h-4 text-slate-500" name="akar-icons:filter" /> Filter by
					</label>
				</FloatLabel>
			</div>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	noFilter: { type: Boolean, default: false },
	isLoading: { type: Boolean, default: false },
	noColorBy: { type: Boolean, default: false },
	activate3DMode: { type: Boolean, default: false },
	selectedColorOption: { type: String, default: null },
	selectedFilterOption: { type: String, default: null },
	selectedVisualizationType: { type: String, default: 'UMAP' },
})

const filterMethods = ref(['Source', 'Cluster'])
const visualizationTypes = ref(['UMAP', 't-SNE'])
const colorMethods = ref(['Source', 'Cluster', 'Gene'])

const handleVisualizationChange = (value) => {
	emit('visualization-changed', value)
}

const resetFilter = () => {
	emit('filter-reset')
}

const emit = defineEmits([
	'visualization-changed',
	'filter-reset',
	'update:activate3DMode',
	'update:selectedVisualizationType',
	'update:selectedColorOption',
	'update:selectedFilterOption',
])
</script>
