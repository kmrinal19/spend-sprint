<script lang="ts">
	import type { Expense } from '$lib/types/index.js';
	import { getGroupedByDate } from '$lib/stores/expenses.svelte.js';
	import { formatDateRelative } from '$lib/utils/date.js';
	import { formatCurrency } from '$lib/utils/currency.js';
	import ExpenseItem from './ExpenseItem.svelte';
	import ExpenseDetail from './ExpenseDetail.svelte';
	import SwipeableRow from '$lib/components/ui/SwipeableRow.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import { deleteExpense } from '$lib/db/expenses.js';

	let selectedExpense = $state<Expense | null>(null);
	let detailOpen = $state(false);
	let pendingDeleteId = $state<number | null>(null);

	let grouped = $derived(getGroupedByDate());

	function openDetail(expense: Expense) {
		selectedExpense = expense;
		detailOpen = true;
	}

	function getDayTotal(expenses: Expense[]): number {
		return expenses
			.filter((e) => e.type === 'debit' && e.paymentMethod !== 'cc_bill_payment')
			.reduce((sum, e) => sum + e.amount, 0);
	}
</script>

<div class="flex-1 overflow-y-auto pb-safe-16">
	{#if grouped.length === 0}
		<div class="flex flex-col items-center justify-center py-20 text-(--app-text-secondary)">
			<span class="text-4xl mb-3">💸</span>
			<p class="text-sm">No expenses yet</p>
			<p class="text-xs mt-1">Type below or paste an SMS to get started</p>
		</div>
	{:else}
		{#each grouped as group (group.date)}
			<div class="px-4">
				<div class="flex items-center justify-between py-2 text-xs text-(--app-text-secondary)">
					<span class="font-medium uppercase">{formatDateRelative(group.date)}</span>
					<span>{formatCurrency(getDayTotal(group.expenses))}</span>
				</div>
				<div class="space-y-0.5">
					{#each group.expenses as expense (expense.id)}
						<SwipeableRow onswipeleft={() => expense.id !== undefined && (pendingDeleteId = expense.id)}>
							<ExpenseItem {expense} onclick={() => openDetail(expense)} />
						</SwipeableRow>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>

<ExpenseDetail
	expense={selectedExpense}
	open={detailOpen}
	onclose={() => (detailOpen = false)}
/>

<ConfirmDialog
	open={pendingDeleteId !== null}
	title="Delete Expense"
	message="Are you sure you want to delete this expense?"
	onconfirm={async () => {
		if (pendingDeleteId !== null) {
			await deleteExpense(pendingDeleteId);
			pendingDeleteId = null;
		}
	}}
	oncancel={() => (pendingDeleteId = null)}
/>
