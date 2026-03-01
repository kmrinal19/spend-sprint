<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db/index.js';
	import { pauseRecurring, resumeRecurring, deleteRecurring } from '$lib/db/recurring.js';
	import { getCategoryById } from '$lib/stores/categories.svelte.js';
	import { formatCurrency } from '$lib/utils/currency.js';
	import { FREQUENCY_LABELS } from '$lib/types/index.js';
	import type { RecurringExpense } from '$lib/types/index.js';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

	let rules = $state<RecurringExpense[]>([]);
	let deleteId = $state<number | null>(null);

	$effect(() => {
		const sub = liveQuery(() => db.recurring.toArray()).subscribe((result) => {
			rules = result;
		});
		return () => sub.unsubscribe();
	});
</script>

<div class="space-y-3">
	<h3 class="text-sm font-semibold text-(--app-text)">Recurring Expenses</h3>

	{#if rules.length === 0}
		<p class="text-sm text-(--app-text-secondary)">No recurring expenses set up yet.</p>
	{:else}
		<div class="space-y-2">
			{#each rules as rule (rule.id)}
				{@const category = getCategoryById(rule.category)}
				<div
					class="flex items-center gap-3 rounded-xl bg-(--app-input-bg) p-3 {rule.isActive
						? ''
						: 'opacity-50'}"
				>
					<span class="text-lg">{category?.icon ?? '📦'}</span>
					<div class="flex-1">
						<div class="text-sm font-medium text-(--app-text)">
							{rule.merchant || category?.name}
						</div>
						<div class="text-xs text-(--app-text-secondary)">
							{formatCurrency(rule.amount)} · {FREQUENCY_LABELS[rule.frequency]}
						</div>
					</div>
					<button
						class="rounded-lg px-2 py-1 text-xs font-medium tap-transparent
							{rule.isActive
							? 'text-warning active:bg-warning/10'
							: 'text-income active:bg-income/10'}"
						onclick={() =>
							rule.id !== undefined && (rule.isActive ? pauseRecurring(rule.id) : resumeRecurring(rule.id))}
					>
						{rule.isActive ? 'Pause' : 'Resume'}
					</button>
					<button
						class="rounded-lg px-2 py-1 text-xs text-danger tap-transparent active:bg-danger/10"
						onclick={() => (deleteId = rule.id ?? null)}
					>
						Delete
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<ConfirmDialog
	open={deleteId !== null}
	title="Delete Recurring"
	message="This will stop future auto-creation. Past expenses won't be affected."
	onconfirm={async () => {
		if (deleteId !== null) {
			await deleteRecurring(deleteId);
			deleteId = null;
		}
	}}
	oncancel={() => (deleteId = null)}
/>
