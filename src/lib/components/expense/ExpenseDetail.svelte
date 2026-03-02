<script lang="ts">
	import type { Expense, PaymentMethod, TransactionType } from '$lib/types/index.js';
	import { formatCurrency } from '$lib/utils/currency.js';
	import { formatDateRelative, formatTime, today } from '$lib/utils/date.js';
	import { getCategoryById } from '$lib/stores/categories.svelte.js';
	import { updateExpense, deleteExpense } from '$lib/db/expenses.js';
	import { PAYMENT_METHOD_LABELS, CREDIT_CARD_LABELS, BANK_ACCOUNT_LABELS } from '$lib/types/index.js';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import CategoryBar from '$lib/components/input/CategoryBar.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

	let {
		expense,
		open,
		onclose
	}: {
		expense: Expense | null;
		open: boolean;
		onclose: () => void;
	} = $props();

	let editing = $state(false);
	let editAmount = $state('');
	let editMerchant = $state('');
	let editDate = $state('');
	let editPaymentMethod = $state<PaymentMethod>('other');
	let editType = $state<TransactionType>('debit');
	let editNote = $state('');
	let showCategoryBar = $state(false);
	let showDeleteConfirm = $state(false);

	$effect(() => {
		if (expense && open) {
			editAmount = String(expense.amount / 100);
			editMerchant = expense.merchant;
			editDate = expense.date;
			editPaymentMethod = expense.paymentMethod;
			editType = expense.type;
			editNote = expense.note ?? '';
			editing = false;
			showCategoryBar = false;
		}
	});

	let category = $derived(expense ? getCategoryById(expense.category) : null);

	const paymentMethods = Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][];

	async function handleSave() {
		if (!expense?.id) return;
		const parsed = parseFloat(editAmount);
		await updateExpense(expense.id, {
			amount: !isNaN(parsed) ? Math.round(parsed * 100) : expense.amount,
			merchant: editMerchant,
			date: editDate,
			paymentMethod: editPaymentMethod,
			type: editType,
			note: editNote
		});
		editing = false;
		onclose();
	}

	async function handleDelete() {
		if (!expense?.id) return;
		showDeleteConfirm = true;
	}

	async function confirmDeleteExpense() {
		if (!expense?.id) return;
		await deleteExpense(expense.id);
		showDeleteConfirm = false;
		onclose();
	}

	async function handleCategoryChange(categoryId: number) {
		if (!expense?.id) return;
		await updateExpense(expense.id, { category: categoryId });
		showCategoryBar = false;
	}
</script>

<BottomSheet {open} {onclose}>
	{#if expense}
		<div class="space-y-4">
			<!-- Amount -->
			<div class="text-center">
				{#if editing}
					<input
						type="number"
						bind:value={editAmount}
						class="w-full text-center text-3xl font-bold bg-transparent outline-none text-(--app-text)"
					/>
				{:else}
					<div
						class="text-3xl font-bold {expense.type === 'credit'
							? 'text-income'
							: 'text-(--app-text)'}"
					>
						{expense.type === 'credit' ? '+' : ''}{formatCurrency(expense.amount)}
					</div>
				{/if}
			</div>

			<!-- Details -->
			<div class="space-y-3 text-sm">
				<div class="flex items-center justify-between">
					<span class="text-(--app-text-secondary)">Merchant</span>
					{#if editing}
						<input
							type="text"
							bind:value={editMerchant}
							class="text-right bg-transparent outline-none text-(--app-text)"
						/>
					{:else}
						<span class="font-medium">{expense.merchant || '—'}</span>
					{/if}
				</div>

				<div class="flex items-center justify-between">
					<span class="text-(--app-text-secondary)">Category</span>
					<button
						class="flex items-center gap-1.5 tap-transparent"
						onclick={() => (showCategoryBar = !showCategoryBar)}
					>
						<span>{category?.icon}</span>
						<span class="font-medium">{category?.name ?? 'None'}</span>
					</button>
				</div>

				{#if showCategoryBar}
					<CategoryBar selectedId={expense.category} onselect={handleCategoryChange} />
				{/if}

				<div class="flex items-center justify-between">
					<span class="text-(--app-text-secondary)">Date</span>
					{#if editing}
						<input
							type="date"
							bind:value={editDate}
							max={today()}
							class="bg-transparent outline-none text-(--app-text) text-right"
						/>
					{:else}
						<span class="font-medium">{formatDateRelative(expense.date)}</span>
					{/if}
				</div>

				<div class="flex items-center justify-between">
					<span class="text-(--app-text-secondary)">Time</span>
					<span class="font-medium">{formatTime(expense.createdAt)}</span>
				</div>

				<div class="flex items-center justify-between">
					<span class="text-(--app-text-secondary)">Payment</span>
					{#if editing}
						<select
							bind:value={editPaymentMethod}
							class="bg-transparent outline-none text-(--app-text) text-right"
						>
							{#each paymentMethods as [value, label]}
								<option {value}>{label}</option>
							{/each}
						</select>
					{:else}
						<span class="font-medium">
							{PAYMENT_METHOD_LABELS[expense.paymentMethod]}
							{#if expense.creditCard}
								({CREDIT_CARD_LABELS[expense.creditCard]})
							{/if}
							{#if expense.bankAccount}
								({BANK_ACCOUNT_LABELS[expense.bankAccount]})
							{/if}
						</span>
					{/if}
				</div>

				<div class="flex items-center justify-between">
					<span class="text-(--app-text-secondary)">Type</span>
					{#if editing}
						<button
							class="rounded-lg px-3 py-1 text-sm font-medium tap-transparent
								{editType === 'credit'
								? 'bg-income/10 text-income'
								: 'bg-expense/10 text-expense'}"
							onclick={() => (editType = editType === 'debit' ? 'credit' : 'debit')}
						>
							{editType === 'debit' ? 'Debit' : 'Credit'}
						</button>
					{:else}
						<span class="font-medium {expense.type === 'credit' ? 'text-income' : ''}">
							{expense.type === 'debit' ? 'Debit' : 'Credit'}
						</span>
					{/if}
				</div>

				<!-- Note -->
				<div class="flex items-start justify-between">
					<span class="text-(--app-text-secondary) pt-1">Note</span>
					{#if editing}
						<textarea
							bind:value={editNote}
							placeholder="Add a note..."
							rows="2"
							class="flex-1 ml-4 rounded-lg bg-(--app-input-bg) px-2 py-1 text-sm text-(--app-text) outline-none resize-none"
						></textarea>
					{:else}
						<span class="font-medium">{expense.note || '—'}</span>
					{/if}
				</div>

				{#if expense.rawSMS}
					<div class="rounded-lg bg-(--app-input-bg) p-3 text-xs text-(--app-text-secondary) break-words">
						{expense.rawSMS}
					</div>
				{/if}
			</div>

			<!-- Actions -->
			<div class="flex gap-2 pt-2">
				{#if editing}
					<button
						class="flex-1 rounded-xl bg-primary py-2.5 font-medium text-white tap-transparent active:bg-primary/80"
						onclick={handleSave}
					>
						Save
					</button>
					<button
						class="rounded-xl px-4 py-2.5 text-(--app-text-secondary) tap-transparent active:bg-(--app-input-bg)"
						onclick={() => (editing = false)}
					>
						Cancel
					</button>
				{:else}
					<button
						class="flex-1 rounded-xl bg-(--app-input-bg) py-2.5 font-medium text-(--app-text) tap-transparent active:bg-(--app-border)"
						onclick={() => (editing = true)}
					>
						Edit
					</button>
					<button
						class="rounded-xl bg-danger/10 px-4 py-2.5 font-medium text-danger tap-transparent active:bg-danger/20"
						onclick={handleDelete}
					>
						Delete
					</button>
				{/if}
			</div>
		</div>
	{/if}
</BottomSheet>

<ConfirmDialog
	open={showDeleteConfirm}
	title="Delete Expense"
	message="Are you sure you want to delete this expense?"
	onconfirm={confirmDeleteExpense}
	oncancel={() => (showDeleteConfirm = false)}
/>
