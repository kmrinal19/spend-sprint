import type { ParsedExpense, TransactionType, PaymentMethod, CreditCard, BankAccount } from '$lib/types/index.js';
import { today } from '$lib/utils/date.js';
import { SMS_TEMPLATES } from './templates.js';

const CC_BANKS = new Set(['HDFC_CC', 'AXIS_CC', 'ICICI_CC']);

const CREDIT_KEYWORDS = /\b(credited|received|cashback|refund|reversed)\b/i;

const CC_BILL_KEYWORDS =
	/\b(bill\s*pay(?:ment)?|payment\s*received|payment\s*towards|thank\s*you\s*for\s*payment|amt\s*paid)\b/i;

function parseAmountString(raw: string): number | null {
	const cleaned = raw.replace(/,/g, '');
	const num = parseFloat(cleaned);
	if (isNaN(num) || !isFinite(num) || num <= 0) return null;
	return Math.round(num * 100);
}

function detectTransactionType(text: string, groups: Record<string, string>): TransactionType {
	if (groups['type']) {
		return CREDIT_KEYWORDS.test(groups['type']) ? 'credit' : 'debit';
	}
	return CREDIT_KEYWORDS.test(text) ? 'credit' : 'debit';
}

function detectCreditCard(bank: string, _account: string | undefined): CreditCard | null {
	switch (bank) {
		case 'AXIS_CC':
			return 'axis';
		case 'HDFC_CC':
			return 'hdfc';
		case 'ICICI_CC':
			return 'icici';
		default:
			return null;
	}
}

function detectBankAccount(bank: string): BankAccount | null {
	switch (bank) {
		case 'HDFC':
			return 'hdfc';
		case 'SBI':
			return 'sbi';
		case 'UBI':
			return 'ubi';
		default:
			return null;
	}
}

function detectPaymentMethod(bank: string, text: string): PaymentMethod {
	if (CC_BANKS.has(bank)) return 'credit_card';
	if (/\bUPI\b/i.test(text)) return 'upi';
	if (/\bNEFT|IMPS|RTGS\b/i.test(text)) return 'bank_transfer';
	if (/\bATM\b/i.test(text)) return 'debit_card';
	return 'upi'; // default for bank SMS
}

function cleanMerchant(raw: string): string {
	return raw
		.replace(/@\w+/g, '') // remove UPI handles
		.replace(/\s+/g, ' ')
		.trim();
}

export function parseSMS(text: string): ParsedExpense | null {
	for (const template of SMS_TEMPLATES) {
		const match = text.match(template.pattern);
		if (!match?.groups) continue;

		const groups = match.groups as Record<string, string>;
		const amount = parseAmountString(groups['amount'] ?? '');
		if (amount === null) continue;

		const type = detectTransactionType(text, groups);
		const merchant = groups['merchant'] ? cleanMerchant(groups['merchant']) : null;
		const creditCard = detectCreditCard(template.bank, groups['account']);
		const bankAccount = detectBankAccount(template.bank);
		const paymentMethod = detectPaymentMethod(template.bank, text);
		const isCCBillPayment = CC_BILL_KEYWORDS.test(text);

		return {
			amount,
			type: isCCBillPayment ? 'debit' : type,
			merchant,
			category: null,
			paymentMethod: isCCBillPayment ? 'cc_bill_payment' : paymentMethod,
			creditCard,
			bankAccount,
			date: today(),
			reference: groups['ref'] ?? null,
			rawText: text,
			source: 'clipboard',
			confidence: 0.9,
			isCCBillPayment,
			recurring: null
		};
	}

	return null;
}
