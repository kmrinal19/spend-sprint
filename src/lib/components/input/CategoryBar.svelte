<script lang="ts">
	import CategoryChip from '$lib/components/ui/CategoryChip.svelte';
	import { getCategories } from '$lib/stores/categories.svelte.js';

	let {
		selectedId = null,
		onselect
	}: {
		selectedId?: number | null;
		onselect: (id: number) => void;
	} = $props();

	let categories = $derived(getCategories());
</script>

<div class="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-none">
	{#each categories as cat (cat.id)}
		<CategoryChip
			icon={cat.icon}
			name={cat.name}
			color={cat.color}
			selected={selectedId === cat.id}
			onclick={() => cat.id !== undefined && onselect(cat.id)}
		/>
	{/each}
</div>
