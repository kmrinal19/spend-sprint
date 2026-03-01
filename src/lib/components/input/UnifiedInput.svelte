<script lang="ts">
	import { parseInput } from '$lib/parsers/index.js';
	import { addExpense, checkDuplicate, checkDuplicateByRef, checkManualDuplicate } from '$lib/db/expenses.js';
	import { updateMerchantMapping } from '$lib/db/merchants.js';
	import { today } from '$lib/utils/date.js';
	import { readClipboard } from '$lib/utils/clipboard.js';
	import {
		getInputText,
		setInputText,
		getPreview,
		setPreview,
		clearInput,
		getIsProcessing,
		setIsProcessing
	} from '$lib/stores/input.svelte.js';
	import { getCurrentMonth } from '$lib/stores/expenses.svelte.js';
	import type { ParsedExpense, NewExpense } from '$lib/types/index.js';
	import PreviewCard from './PreviewCard.svelte';
	import DuplicateWarning from './DuplicateWarning.svelte';

	let {
		onexpenseadded
	}: {
		onexpenseadded?: (date: string) => void;
	} = $props();

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let inputEl: HTMLInputElement | undefined = $state();
	let isDuplicate = $state(false);

	let text = $derived(getInputText());
	let preview = $derived(getPreview());
	let isProcessing = $derived(getIsProcessing());

	function handleInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		setInputText(value);
		isDuplicate = false;

		clearTimeout(debounceTimer);
		if (!value.trim()) {
			setPreview(null);
			return;
		}

		debounceTimer = setTimeout(async () => {
			setIsProcessing(true);
			const result = await parseInput(value);
			setPreview(result);
			setIsProcessing(false);
		}, 200);
	}

	async function handlePaste() {
		const clipText = await readClipboard();
		if (!clipText) return;

		setInputText(clipText);
		setIsProcessing(true);
		isDuplicate = false;

		const result = await parseInput(clipText);
		setPreview(result);

		// Check for duplicate SMS
		if (result?.source === 'clipboard') {
			const dup = await checkDuplicate(clipText);
			if (dup) {
				isDuplicate = true;
			} else if (result.reference) {
				const refDup = await checkDuplicateByRef(result.reference);
				if (refDup) isDuplicate = true;
			}
		}

		setIsProcessing(false);
	}

	function handleUpdatePreview(patch: Partial<ParsedExpense>) {
		const current = getPreview();
		if (current) {
			setPreview({ ...current, ...patch });
		}
	}

	async function confirmExpense() {
		const p = getPreview();
		if (!p || p.amount === null) return;

		const expense: NewExpense = {
			amount: p.amount,
			type: p.type,
			category: p.category ?? 14,
			merchant: p.merchant ?? '',
			paymentMethod: p.paymentMethod ?? 'other',
			creditCard: p.creditCard,
			bankAccount: p.bankAccount,
			tags: [],
			note: '',
			isRecurring: false,
			recurringId: null,
			rawSMS: p.source === 'clipboard' ? p.rawText : null,
			source: p.source,
			date: p.date ?? today()
		};

		await addExpense(expense);

		if (p.merchant && p.category !== null) {
			await updateMerchantMapping(p.merchant, p.category);
		}

		// Notify parent if expense was added to a different month
		const expenseDate = expense.date;
		onexpenseadded?.(expenseDate);

		clearInput();
		isDuplicate = false;
		inputEl?.focus();
	}

	async function handleConfirm() {
		const p = getPreview();
		if (!p || p.amount === null) return;

		// Check for manual duplicate
		if (p.source !== 'clipboard' && p.merchant) {
			const dup = await checkManualDuplicate(p.amount, p.date ?? today(), p.merchant);
			if (dup && !isDuplicate) {
				isDuplicate = true;
				return;
			}
		}

		await confirmExpense();
	}

	function handleCategorySelect(id: number) {
		const p = getPreview();
		if (p) {
			handleUpdatePreview({ category: id });
		}
	}

	function handleDismiss() {
		clearInput();
		isDuplicate = false;
	}
</script>

<div class="fixed inset-x-0 bottom-0 z-30 bg-(--app-bg) pb-safe px-safe">
	<!-- Duplicate Warning -->
	<DuplicateWarning
		visible={isDuplicate}
		onproceed={confirmExpense}
		ondismiss={handleDismiss}
	/>

	<!-- Preview Card -->
	{#if preview}
		<div class="px-4 pb-2">
			<PreviewCard
				parsed={preview}
				onconfirm={handleConfirm}
				ondismiss={handleDismiss}
				onupdate={handleUpdatePreview}
			/>
		</div>
	{/if}

	<!-- Input Bar -->
	<div class="flex items-center gap-2 border-t border-(--app-border) px-4 py-2">
		<button
			class="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-(--app-input-bg) tap-transparent active:bg-(--app-border)"
			onclick={handlePaste}
			aria-label="Paste from clipboard"
		>
			📋
		</button>
		<input
			bind:this={inputEl}
			type="text"
			value={text}
			oninput={handleInput}
			placeholder="500 swiggy, or paste SMS..."
			class="h-11 flex-1 rounded-xl bg-(--app-input-bg) px-4 text-base text-(--app-text) placeholder:text-(--app-text-secondary)/50 outline-none"
		/>
		{#if isProcessing}
			<div class="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
		{/if}
	</div>
</div>
