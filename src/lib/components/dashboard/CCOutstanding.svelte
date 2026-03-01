<script lang="ts">
	import type { CCOutstandingItem } from '$lib/stores/dashboard.svelte.js';
	import { formatCurrency } from '$lib/utils/currency.js';
	import { CREDIT_CARD_LABELS } from '$lib/types/index.js';

	let { data }: { data: CCOutstandingItem[] } = $props();
</script>

{#if data.length > 0}
	<div class="space-y-2">
		<h3 class="text-sm font-semibold text-(--app-text)">CC Outstanding</h3>
		{#each data as item (item.card)}
			<div class="flex items-center justify-between rounded-xl bg-expense/5 px-4 py-2.5">
				<span class="text-sm text-(--app-text)">💳 {CREDIT_CARD_LABELS[item.card]}</span>
				<span class="text-sm font-semibold text-expense">{formatCurrency(item.outstanding)}</span>
			</div>
		{/each}
	</div>
{/if}
