<template>
	<div class="min-w-full">
		<div v-if="!noFilter">
			<Skeleton height="3rem" v-if="isLoading && !noFilter" class="mb-4 mt-2" />

			<div
				class="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-3 grid grid-cols-2 gap-1 items-center justify-between mb-2 pl-4 backdrop-blur rounded-lg"
				:class="{
					'xl:grid-cols-3 xl:col-start-4 lg:grid-cols-3': noColorBy,
					'xl:grid-cols-4 xl:col-start-3 lg:grid-cols-3': !noColorBy,
				}"
				v-else
			>
				<div class="flex gap-2 items-center" id="ThreeModeFilter">
					<ToggleSwitch :model-value="activate3DMode" @update:model-value="handle3DMode" />
					<Icon class="w-5 h-5 text-slate-500" name="akar-icons:augmented-reality" />
					<div class="text-sm">3D Mode</div>
				</div>

				<FloatLabel variant="on" id="PlotTypeFilter">
					<Select
						fluid
						size="small"
						inputId="Visualization-Type"
						:options="visualizationTypes"
						:model-value="selectedVisualizationType"
						@value-change="handleVisualizationChange"
						@update:model-value="$emit('update:selectedVisualizationType', $event)"
					/>
					<label for="Visualization-Type" class="flex items-center gap-2">
						<Icon class="w-4 h-4 text-slate-500" name="tabler:chart-dots" /> Plot type
					</label>
				</FloatLabel>

				<FloatLabel variant="on" v-if="!noColorBy" id="ColorFilter">
					<Select
						fluid
						showClear
						size="small"
						inputId="Color-Filter"
						:options="colorMethods"
						:model-value="selectedColorOption"
						@update:model-value="handleColorOption"
					/>
					<label for="Color-Filter" class="flex items-center gap-2">
						<Icon class="w-4 h-4 text-slate-500" name="tabler:color-filter" /> Color by
					</label>
				</FloatLabel>

				<FloatLabel variant="on" id="DataFilter">
					<Select
						fluid
						showClear
						size="small"
						inputId="Data-Filter"
						:options="filterMethods"
						@value-change="resetFilter"
						:model-value="selectedFilterOption"
						@update:model-value="handleFilterOption"
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
const route = useRoute()
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
	umami.track('plot-type', { plot: value, page: route.path })
	emit('visualization-changed', value)
}

const handle3DMode = (value) => {
	umami.track('3d-view', { mode: value, page: route.path })
	emit('update:activate3DMode', value)
}

const handleColorOption = (value) => {
	umami.track('color-by', { selected: value, page: route.path })
	emit('update:selectedColorOption', value)
}

const handleFilterOption = (value) => {
	umami.track('filter-by', { selected: value, page: route.path })
	emit('update:selectedFilterOption', value)
}

const resetFilter = () => {
	emit('filter-reset')
}

const emit = defineEmits([
	'filter-reset',
	'visualization-changed',
	'update:activate3DMode',
	'update:selectedColorOption',
	'update:selectedFilterOption',
	'update:selectedVisualizationType',
])
</script>
