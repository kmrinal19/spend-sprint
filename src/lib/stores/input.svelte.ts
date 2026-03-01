import type { ParsedExpense } from '$lib/types/index.js';

let text = $state('');
let preview = $state<ParsedExpense | null>(null);
let isProcessing = $state(false);

export function getInputText(): string {
	return text;
}

export function setInputText(value: string) {
	text = value;
}

export function getPreview(): ParsedExpense | null {
	return preview;
}

export function setPreview(value: ParsedExpense | null) {
	preview = value;
}

export function getIsProcessing(): boolean {
	return isProcessing;
}

export function setIsProcessing(value: boolean) {
	isProcessing = value;
}

export function clearInput() {
	text = '';
	preview = null;
	isProcessing = false;
}
