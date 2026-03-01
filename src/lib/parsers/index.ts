import type { ParsedExpense } from '$lib/types/index.js';
import { detectInputType } from './detect.js';
import { parseSMS } from './sms.js';
import { parseNaturalLanguage } from './natural-language.js';
import { enrichParsedExpense } from './enrich.js';
import { today } from '$lib/utils/date.js';

export async function parseInput(text: string): Promise<ParsedExpense | null> {
	const inputType = detectInputType(text);
	if (inputType === null) return null;

	let parsed: ParsedExpense | null = null;

	switch (inputType) {
		case 'sms':
			parsed = parseSMS(text);
			break;
		case 'natural_language':
			parsed = parseNaturalLanguage(text);
			break;
		case 'bare_number': {
			const amount = parseFloat(text.trim());
			if (isNaN(amount) || amount <= 0) return null;
			parsed = {
				amount: Math.round(amount * 100),
				type: 'debit',
				merchant: null,
				category: null,
				paymentMethod: 'other',
				creditCard: null,
				bankAccount: null,
				date: today(),
				reference: null,
				rawText: text,
				source: 'manual',
				confidence: 0.3,
				isCCBillPayment: false,
				recurring: null
			};
			break;
		}
	}

	if (parsed === null) return null;

	return enrichParsedExpense(parsed);
}

export { detectInputType } from './detect.js';
export { parseSMS } from './sms.js';
export { parseNaturalLanguage } from './natural-language.js';
