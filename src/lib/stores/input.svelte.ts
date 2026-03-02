import type { ParsedExpense } from '$lib/types/index.js';

let text = $state('');
let preview = $state<ParsedExpense | null>(null);
let isProcessing = $state(false);
let parseError = $state<string | null>(null);

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

export function getParseError(): string | null {
	return parseError;
}

export function setParseError(value: string | null) {
	parseError = value;
}

export function clearInput() {
	text = '';
	preview = null;
	isProcessing = false;
	parseError = null;
}
