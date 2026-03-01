<script lang="ts">
	import type { Expense } from '$lib/types/index.js';
	import { formatCurrency } from '$lib/utils/currency.js';
	import { formatTime } from '$lib/utils/date.js';
	import { getCategoryById } from '$lib/stores/categories.svelte.js';

	let {
		expense,
		onclick
	}: {
		expense: Expense;
		onclick: () => void;
	} = $props();

	let category = $derived(getCategoryById(expense.category));
</script>

<button
	class="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 tap-transparent active:bg-(--app-input-bg) transition-colors"
	{onclick}
>
	<span class="text-xl">{category?.icon ?? '📦'}</span>
	<div class="flex-1 text-left">
		<div class="text-sm font-medium text-(--app-text)">
			{expense.merchant || (expense.source === 'manual' ? 'Manual entry' : category?.name || 'Expense')}
		</div>
		<div class="text-xs text-(--app-text-secondary)">
			{formatTime(expense.createdAt)}
			{#if expense.isRecurring}
				<span class="ml-1">🔄</span>
			{/if}
		</div>
	</div>
	<span
		class="text-sm font-semibold {expense.type === 'credit' ? 'text-income' : 'text-(--app-text)'}"
	>
		{expense.type === 'credit' ? '+' : ''}{formatCurrency(expense.amount)}
	</span>
</button>
