<script lang="ts">
	import type { ParsedExpense, PaymentMethod } from '$lib/types/index.js';
	import { formatCurrency, parseAmount } from '$lib/utils/currency.js';
	import { formatDateRelative, today } from '$lib/utils/date.js';
	import { getCategoryById } from '$lib/stores/categories.svelte.js';
	import { PAYMENT_METHOD_LABELS, CREDIT_CARD_LABELS } from '$lib/types/index.js';
	import CategoryBar from './CategoryBar.svelte';

	let {
		parsed,
		note = '',
		onconfirm,
		ondismiss,
		onupdate,
		onnotechange
	}: {
		parsed: ParsedExpense;
		note?: string;
		onconfirm: () => void;
		ondismiss: () => void;
		onupdate: (patch: Partial<ParsedExpense>) => void;
		onnotechange?: (note: string) => void;
	} = $props();

	let editingField = $state<'amount' | 'merchant' | 'date' | 'payment' | null>(null);
	let editValue = $state('');
	let showCategoryBar = $state(false);
	let showNote = $state(false);

	let category = $derived(parsed.category !== null ? getCategoryById(parsed.category) : null);
	let canConfirm = $derived(parsed.amount !== null);

	// Auto-open amount editing for manual entry (amount is null)
	$effect(() => {
		if (parsed.amount === null && parsed.source === 'manual') {
			editingField = 'amount';
			editValue = '';
		}
	});

	// Auto-show category bar when amount is set but no category
	$effect(() => {
		if (parsed.amount !== null && parsed.category === null) {
			showCategoryBar = true;
		}
	});

	function autoFocus(node: HTMLElement) {
		node.focus();
	}

	function startEdit(field: 'amount' | 'merchant' | 'date' | 'payment') {
		editingField = field;
		switch (field) {
			case 'amount':
				editValue = parsed.amount !== null ? String(parsed.amount / 100) : '';
				break;
			case 'merchant':
				editValue = parsed.merchant ?? '';
				break;
			case 'date':
				editValue = parsed.date ?? today();
				break;
			case 'payment':
				editValue = parsed.paymentMethod ?? 'other';
				break;
		}
	}

	function commitEdit() {
		if (editingField === null) return;
		switch (editingField) {
			case 'amount': {
				let amt = parseAmount(editValue);
				if (amt === null && editValue.trim()) {
					const num = parseFloat(editValue.trim());
					if (!isNaN(num) && isFinite(num) && num > 0) amt = Math.round(num * 100);
				}
				if (amt !== null) onupdate({ amount: amt });
				break;
			}
			case 'merchant':
				onupdate({ merchant: editValue.trim() || null });
				break;
			case 'date':
				if (editValue) onupdate({ date: editValue });
				break;
			case 'payment':
				onupdate({ paymentMethod: editValue as PaymentMethod });
				break;
		}
		editingField = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			commitEdit();
		}
		if (e.key === 'Escape') editingField = null;
	}

	const paymentMethods = Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][];
</script>

<div class="animate-slide-up rounded-2xl bg-(--app-card) p-4 shadow-lg ring-1 ring-(--app-border)">
	<!-- Amount & Type -->
	<div class="flex items-center justify-between">
		<div class="text-2xl font-bold">
			{#if editingField === 'amount'}
				<input
					type="number"
					inputmode="decimal"
					bind:value={editValue}
					onblur={commitEdit}
					onkeydown={handleKeydown}
					placeholder="0.00"
					class="w-32 bg-transparent text-2xl font-bold outline-none text-(--app-text) border-b-2 border-primary"
					use:autoFocus
				/>
			{:else}
				<button class="min-h-8 tap-transparent" onclick={() => startEdit('amount')}>
					{#if parsed.amount !== null}
						<span class={parsed.type === 'credit' ? 'text-income' : 'text-(--app-text)'}>
							{parsed.type === 'credit' ? '+' : ''}{formatCurrency(parsed.amount)}
						</span>
					{:else}
						<span class="text-(--app-text-secondary)/50">₹0.00</span>
					{/if}
				</button>
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
		<!-- Merchant -->
		<div class="flex items-center gap-2">
			<span class="w-5 text-center">🏪</span>
			{#if editingField === 'merchant'}
				<input
					type="text"
					bind:value={editValue}
					onblur={commitEdit}
					onkeydown={handleKeydown}
					placeholder="Merchant name"
					class="flex-1 bg-transparent outline-none text-(--app-text) border-b border-primary"
					use:autoFocus
				/>
			{:else}
				<button class="min-h-8 tap-transparent" onclick={() => startEdit('merchant')}>
					{parsed.merchant || '+ Add merchant'}
				</button>
			{/if}
		</div>

		<!-- Date -->
		<div class="flex items-center gap-2">
			<span class="w-5 text-center">📅</span>
			{#if editingField === 'date'}
				<input
					type="date"
					bind:value={editValue}
					onblur={commitEdit}
					onkeydown={handleKeydown}
					max={today()}
					class="flex-1 bg-transparent outline-none text-(--app-text) border-b border-primary"
					use:autoFocus
				/>
			{:else}
				<button class="min-h-8 tap-transparent" onclick={() => startEdit('date')}>
					{parsed.date ? formatDateRelative(parsed.date) : 'Today'}
				</button>
			{/if}
		</div>

		<!-- Payment Method -->
		<div class="flex items-center gap-2">
			<span class="w-5 text-center">💳</span>
			{#if editingField === 'payment'}
				<select
					bind:value={editValue}
					onchange={commitEdit}
					onblur={commitEdit}
					class="flex-1 bg-transparent outline-none text-(--app-text) border-b border-primary"
					use:autoFocus
				>
					{#each paymentMethods as [value, label]}
						<option {value}>{label}</option>
					{/each}
				</select>
			{:else}
				<button class="min-h-8 tap-transparent" onclick={() => startEdit('payment')}>
					{#if parsed.paymentMethod}
						{PAYMENT_METHOD_LABELS[parsed.paymentMethod]}
						{#if parsed.creditCard}
							({CREDIT_CARD_LABELS[parsed.creditCard]})
						{/if}
					{:else}
						+ Add payment method
					{/if}
				</button>
			{/if}
		</div>

		<!-- Category -->
		<button
			class="flex min-h-8 items-center gap-2 tap-transparent"
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

	<!-- Note -->
	<div class="mt-2">
		{#if showNote || note}
			<textarea
				value={note}
				oninput={(e) => onnotechange?.((e.target as HTMLTextAreaElement).value)}
				placeholder="Add a note..."
				rows="2"
				class="w-full rounded-lg bg-(--app-input-bg) px-3 py-2 text-sm text-(--app-text) placeholder:text-(--app-text-secondary)/50 outline-none resize-none"
			></textarea>
		{:else}
			<button
				class="text-sm text-(--app-text-secondary) tap-transparent"
				onclick={() => (showNote = true)}
			>
				+ Add note
			</button>
		{/if}
	</div>

	<!-- Actions -->
	<div class="mt-4 flex gap-2">
		<button
			class="flex-1 rounded-xl py-2.5 text-center font-medium tap-transparent
				{canConfirm
				? 'bg-primary text-white active:bg-primary/80'
				: 'bg-primary/30 text-white/50 pointer-events-none'}"
			onclick={onconfirm}
			disabled={!canConfirm}
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
