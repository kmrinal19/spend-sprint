<script lang="ts">
	import type { BudgetStatus } from '$lib/db/budgets.js';
	import { getCategoryById } from '$lib/stores/categories.svelte.js';
	import { formatCurrency } from '$lib/utils/currency.js';

	let { budgets }: { budgets: BudgetStatus[] } = $props();

	function getColor(pct: number): string {
		if (pct >= 100) return 'bg-danger';
		if (pct >= 80) return 'bg-warning';
		return 'bg-income';
	}
</script>

<div class="space-y-2">
	<h3 class="text-sm font-semibold text-(--app-text)">Budget Progress</h3>
	{#if budgets.length === 0}
		<p class="text-sm text-(--app-text-secondary)">No budgets set up yet.</p>
	{:else}
		{#each budgets as b (b.budget.id)}
			{@const cat = b.budget.category !== null ? getCategoryById(b.budget.category) : null}
			<div>
				<div class="flex justify-between text-xs mb-1">
					<span class="text-(--app-text)">
						{cat ? `${cat.icon} ${cat.name}` : '💰 Overall'}
					</span>
					<span class="text-(--app-text-secondary)">
						{formatCurrency(b.spent)} / {formatCurrency(b.budget.limit)}
					</span>
				</div>
				<div class="h-2 overflow-hidden rounded-full bg-(--app-input-bg)">
					<div
						class="h-full rounded-full transition-all duration-500 {getColor(b.percentage)}"
						style="width: {Math.min(b.percentage, 100)}%"
					></div>
				</div>
			</div>
		{/each}
	{/if}
</div>
