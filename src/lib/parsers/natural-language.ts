import type { ParsedExpense, TransactionType } from '$lib/types/index.js';
import { today, yesterday, parseDateString } from '$lib/utils/date.js';

const CREDIT_KEYWORDS = new Set(['received', 'cashback', 'refund', 'income', 'credit']);
const FILLER_WORDS = new Set(['spent', 'on', 'for', 'at', 'to']);

export function parseNaturalLanguage(text: string): ParsedExpense | null {
	const tokens = text.trim().split(/\s+/);
	if (tokens.length === 0) return null;

	let amount: number | null = null;
	let type: TransactionType = 'debit';
	let date: string | null = today();
	let merchant: string | null = null;
	const remainingTokens: string[] = [];

	for (const token of tokens) {
		const lower = token.toLowerCase();

		// Extract amount (first number-like token)
		if (amount === null) {
			const cleaned = token.replace(/[₹,]/g, '');
			const kMatch = cleaned.match(/^(\d+\.?\d*)[kK]$/);
			if (kMatch) {
				const num = parseFloat(kMatch[1]!);
				if (!isNaN(num) && num > 0) {
					amount = Math.round(num * 1000 * 100);
					continue;
				}
			}
			const num = parseFloat(cleaned);
			if (!isNaN(num) && num > 0) {
				amount = Math.round(num * 100);
				continue;
			}
		}

		// Detect credit type
		if (CREDIT_KEYWORDS.has(lower)) {
			type = 'credit';
			continue;
		}

		// Detect date keywords
		if (lower === 'today') {
			date = today();
			continue;
		}
		if (lower === 'yesterday') {
			date = yesterday();
			continue;
		}

		// Skip filler words from merchant
		if (FILLER_WORDS.has(lower)) {
			continue;
		}

		remainingTokens.push(token);
	}

	if (amount === null) return null;

	// Try to parse multi-word date from remaining tokens
	if (remainingTokens.length >= 2) {
		const last2 = remainingTokens.slice(-2).join(' ');
		const parsedDate = parseDateString(last2);
		if (parsedDate) {
			date = parsedDate;
			remainingTokens.splice(-2, 2);
		}
	}

	// Whatever is left is the merchant
	merchant = remainingTokens.length > 0 ? remainingTokens.join(' ') : null;

	return {
		amount,
		type,
		merchant,
		category: null,
		paymentMethod: null,
		creditCard: null,
		bankAccount: null,
		date,
		reference: null,
		rawText: text,
		source: 'natural_language',
		confidence: merchant ? 0.7 : 0.5,
		isCCBillPayment: false,
		recurring: null
	};
}
