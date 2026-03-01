<script lang="ts">
	import type { MerchantSpend } from '$lib/stores/dashboard.svelte.js';
	import { formatCurrency } from '$lib/utils/currency.js';

	let { data }: { data: MerchantSpend[] } = $props();
</script>

<div class="space-y-2">
	<h3 class="text-sm font-semibold text-(--app-text)">Top Merchants</h3>
	{#if data.length === 0}
		<p class="text-sm text-(--app-text-secondary)">No merchant data yet.</p>
	{:else}
		{#each data as m, i (m.merchant)}
			<div class="flex items-center gap-3">
				<span class="w-5 text-center text-xs text-(--app-text-secondary)">{i + 1}</span>
				<span class="flex-1 truncate text-sm text-(--app-text) capitalize">{m.merchant}</span>
				<span class="text-xs text-(--app-text-secondary)">{m.count}x</span>
				<span class="text-sm font-medium text-(--app-text)">{formatCurrency(m.amount)}</span>
			</div>
		{/each}
	{/if}
</div>
