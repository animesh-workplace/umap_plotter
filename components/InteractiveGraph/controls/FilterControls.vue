<template>
	<div v-if="!noFilter" class="w-full">
		<div
			id="SourceFilter"
			v-if="selectedFilterOption == 'Source'"
			class="grid grid-cols-3 gap-3 items-center mb-4 mt-2 justify-center px-4"
		>
			<motion.div :index="celltype.index" :while-hover="{ scale: 0.97 }" v-for="celltype in cellTypes">
				<Tag
					rounded
					:value="celltype.name"
					class="cursor-pointer w-full"
					@click="FilterCellType(celltype.index)"
					:severity="celltype.active ? 'success' : 'danger'"
				>
					<template #icon>
						<Icon
							v-if="celltype.active"
							class="!w-4 !h-4 text-green-500"
							name="akar-icons:tetragon-fill"
						/>
						<Icon v-else class="!w-4 !h-4 text-rose-500" name="akar-icons:tetragon" />
					</template>
				</Tag>
			</motion.div>
		</div>

		<!-- <div
			v-if="selectedFilterOption == 'Cluster'"
			class="flex gap-2 items-center mb-2 mt-2 justify-center px-4"
		> -->
		<div
			id="ClusterFilter"
			v-if="selectedFilterOption == 'Cluster'"
			class="grid grid-cols-3 lg:grid-cols-5 lg:max-w-4xl px-4"
		>
			<div v-for="(cluster, index) in clusters" :key="index">
				<motion.div class="p-2" :while-hover="{ scale: 0.95 }">
					<Tag
						rounded
						:value="cluster.pill_name"
						class="cursor-pointer w-full px-2"
						@click="FilterCluster(cluster.index)"
						:severity="cluster.active ? 'success' : 'danger'"
					>
						<template #icon>
							<Icon
								v-if="cluster.active"
								class="w-4 h-4 text-green-500"
								name="akar-icons:tetragon-fill"
							/>
							<Icon v-else class="w-4 h-4 text-rose-500" name="akar-icons:tetragon" />
						</template>
					</Tag>
				</motion.div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { motion } from 'motion-v'

const props = defineProps({
	noFilter: { type: Boolean, default: false },
	clusters: { type: Array, default: () => [] },
	cellTypes: { type: Array, default: () => [] },
	selectedFilterOption: { type: String, default: null },
})

const FilterCellType = (index) => {
	emit('cell-type-filtered', index)
}

const FilterCluster = (index) => {
	emit('cluster-filtered', index)
}

const emit = defineEmits(['cell-type-filtered', 'cluster-filtered'])
</script>
