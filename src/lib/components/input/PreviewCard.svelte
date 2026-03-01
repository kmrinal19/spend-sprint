<script lang="ts">
	import type { ParsedExpense } from '$lib/types/index.js';
	import { formatCurrency } from '$lib/utils/currency.js';
	import { formatDateRelative } from '$lib/utils/date.js';
	import { getCategoryById } from '$lib/stores/categories.svelte.js';
	import { PAYMENT_METHOD_LABELS, CREDIT_CARD_LABELS } from '$lib/types/index.js';
	import CategoryBar from './CategoryBar.svelte';

	let {
		parsed,
		onconfirm,
		ondismiss,
		onupdate
	}: {
		parsed: ParsedExpense;
		onconfirm: () => void;
		ondismiss: () => void;
		onupdate: (patch: Partial<ParsedExpense>) => void;
	} = $props();

	let category = $derived(parsed.category !== null ? getCategoryById(parsed.category) : null);
	let showCategoryBar = $state(false);
</script>

<div class="animate-slide-up rounded-2xl bg-(--app-card) p-4 shadow-lg ring-1 ring-(--app-border)">
	<!-- Amount & Type -->
	<div class="flex items-center justify-between">
		<div class="text-2xl font-bold">
			{#if parsed.amount !== null}
				<span class={parsed.type === 'credit' ? 'text-income' : 'text-(--app-text)'}>
					{parsed.type === 'credit' ? '+' : ''}{formatCurrency(parsed.amount)}
				</span>
			{/if}
		</div>
		<button
			class="rounded-lg px-3 py-1 text-sm font-medium tap-transparent
				{parsed.type === 'credit'
				? 'bg-income/10 text-income'
				: 'bg-expense/10 text-expense'}"
			onclick={() => onupdate({ type: parsed.type === 'debit' ? 'credit' : 'debit' })}
		>
			{parsed.type === 'debit' ? 'Debit' : 'Credit'}
		</button>
	</div>

	<!-- Details -->
	<div class="mt-3 space-y-1.5 text-sm text-(--app-text-secondary)">
		{#if parsed.merchant}
			<div class="flex items-center gap-2">
				<span class="w-5 text-center">🏪</span>
				<span>{parsed.merchant}</span>
			</div>
		{/if}

		{#if parsed.date}
			<div class="flex items-center gap-2">
				<span class="w-5 text-center">📅</span>
				<span>{formatDateRelative(parsed.date)}</span>
			</div>
		{/if}

		{#if parsed.paymentMethod}
			<div class="flex items-center gap-2">
				<span class="w-5 text-center">💳</span>
				<span>
					{PAYMENT_METHOD_LABELS[parsed.paymentMethod]}
					{#if parsed.creditCard}
						({CREDIT_CARD_LABELS[parsed.creditCard]})
					{/if}
				</span>
			</div>
		{/if}

		<!-- Category -->
		<button
			class="flex items-center gap-2 tap-transparent"
			onclick={() => (showCategoryBar = !showCategoryBar)}
		>
			<span class="w-5 text-center">{category?.icon ?? '📦'}</span>
			<span>{category?.name ?? 'Select category'}</span>
		</button>
	</div>

	{#if showCategoryBar}
		<div class="mt-2">
			<CategoryBar
				selectedId={parsed.category}
				onselect={(id) => {
					onupdate({ category: id });
					showCategoryBar = false;
				}}
			/>
		</div>
	{/if}

	<!-- Actions -->
	<div class="mt-4 flex gap-2">
		<button
			class="flex-1 rounded-xl bg-primary py-2.5 text-center font-medium text-white tap-transparent active:bg-primary/80"
			onclick={onconfirm}
		>
			Add Expense
		</button>
		<button
			class="rounded-xl px-4 py-2.5 text-(--app-text-secondary) tap-transparent active:bg-(--app-input-bg)"
			onclick={ondismiss}
		>
			Cancel
		</button>
	</div>
</div>
