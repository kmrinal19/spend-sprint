<script lang="ts">
	import type { CategorySpend } from '$lib/stores/dashboard.svelte.js';
	import { formatCurrency } from '$lib/utils/currency.js';

	let { data }: { data: CategorySpend[] } = $props();
</script>

<div class="space-y-2">
	<h3 class="text-sm font-semibold text-(--app-text)">By Category</h3>
	{#if data.length === 0}
		<p class="text-sm text-(--app-text-secondary)">No expenses in this period.</p>
	{:else}
		{#each data as cat (cat.categoryId)}
			<div class="flex items-center gap-2">
				<span class="w-6 text-center">{cat.icon}</span>
				<span class="w-20 truncate text-xs text-(--app-text)">{cat.name}</span>
				<div class="h-5 flex-1 overflow-hidden rounded-full bg-(--app-input-bg)">
					<div
						class="h-full rounded-full transition-all duration-500"
						style="width: {cat.percentage}%; background-color: {cat.color}"
					></div>
				</div>
				<span class="w-16 text-right text-xs font-medium text-(--app-text)">
					{formatCurrency(cat.amount)}
				</span>
			</div>
		{/each}
	{/if}
</div>
