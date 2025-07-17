<template>
	<div v-if="!noFilter">
		<div v-if="selectedFilterOption == 'Source'" class="flex gap-3 items-center mb-4 mt-2 justify-center px-4">
			<motion.div :index="celltype.index" :while-hover="{ scale: 0.97 }" v-for="celltype in cellTypes">
				<Tag
					rounded
					:value="celltype.name"
					class="cursor-pointer"
					@click="FilterCellType(celltype.index)"
					:severity="celltype.active ? 'success' : 'danger'"
				>
					<template #icon>
						<Icon
							v-if="celltype.active"
							class="w-4 h-4 text-green-500"
							name="akar-icons:tetragon-fill"
						/>
						<Icon v-else class="w-4 h-4 text-rose-500" name="akar-icons:tetragon" />
					</template>
				</Tag>
			</motion.div>
		</div>

		<div v-if="selectedFilterOption == 'Cluster'">
			<Carousel :value="clusters" :numVisible="6" :showIndicators="false">
				<template #item="slotProp">
					<motion.div :while-hover="{ scale: 0.95 }" class="py-2 px-2">
						<Tag
							rounded
							:value="slotProp.data.name"
							class="cursor-pointer w-full px-2"
							@click="FilterCluster(slotProp.data.index)"
							:severity="slotProp.data.active ? 'success' : 'danger'"
						>
							<template #icon>
								<Icon
									v-if="slotProp.data.active"
									class="w-4 h-4 text-green-500"
									name="akar-icons:tetragon-fill"
								/>
								<Icon v-else class="w-4 h-4 text-rose-500" name="akar-icons:tetragon" />
							</template>
						</Tag>
					</motion.div>
				</template>
			</Carousel>
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
