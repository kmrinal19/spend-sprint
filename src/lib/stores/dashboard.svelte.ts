import { db } from '$lib/db/index.js';
import type { Expense, CreditCard } from '$lib/types/index.js';

export interface CategorySpend {
	categoryId: number;
	name: string;
	icon: string;
	color: string;
	amount: number;
	percentage: number;
}

export interface MerchantSpend {
	merchant: string;
	amount: number;
	count: number;
}

export interface DailySpend {
	date: string;
	amount: number;
}

export interface CCOutstandingItem {
	card: CreditCard;
	outstanding: number;
}

export async function getCategoryBreakdown(
	startDate: string,
	endDate: string,
	categories: { id?: number; name: string; icon: string; color: string }[]
): Promise<CategorySpend[]> {
	const expenses = await db.expenses
		.where('date')
		.between(startDate, endDate, true, true)
		.filter((e) => e.type === 'debit' && e.paymentMethod !== 'cc_bill_payment')
		.toArray();

	const catMap = new Map<number, number>();
	for (const e of expenses) {
		catMap.set(e.category, (catMap.get(e.category) ?? 0) + e.amount);
	}

	const total = expenses.reduce((s, e) => s + e.amount, 0);

	return categories
		.filter((c) => c.id !== undefined && catMap.has(c.id))
		.map((c) => ({
			categoryId: c.id!,
			name: c.name,
			icon: c.icon,
			color: c.color,
			amount: catMap.get(c.id!) ?? 0,
			percentage: total > 0 ? ((catMap.get(c.id!) ?? 0) / total) * 100 : 0
		}))
		.sort((a, b) => b.amount - a.amount);
}

export async function getTopMerchants(
	startDate: string,
	endDate: string,
	limit = 10
): Promise<MerchantSpend[]> {
	const expenses = await db.expenses
		.where('date')
		.between(startDate, endDate, true, true)
		.filter((e) => e.type === 'debit' && e.paymentMethod !== 'cc_bill_payment' && e.merchant.length > 0)
		.toArray();

	const map = new Map<string, { amount: number; count: number }>();
	for (const e of expenses) {
		const key = e.merchant.toLowerCase();
		const existing = map.get(key);
		if (existing) {
			existing.amount += e.amount;
			existing.count++;
		} else {
			map.set(key, { amount: e.amount, count: 1 });
		}
	}

	return Array.from(map.entries())
		.map(([merchant, data]) => ({ merchant, ...data }))
		.sort((a, b) => b.amount - a.amount)
		.slice(0, limit);
}

export async function getDailySpending(
	startDate: string,
	endDate: string
): Promise<DailySpend[]> {
	const expenses = await db.expenses
		.where('date')
		.between(startDate, endDate, true, true)
		.filter((e) => e.type === 'debit' && e.paymentMethod !== 'cc_bill_payment')
		.toArray();

	const map = new Map<string, number>();
	for (const e of expenses) {
		map.set(e.date, (map.get(e.date) ?? 0) + e.amount);
	}

	return Array.from(map.entries())
		.map(([date, amount]) => ({ date, amount }))
		.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getCCOutstanding(): Promise<CCOutstandingItem[]> {
	const cards: CreditCard[] = ['axis', 'hdfc', 'scapia', 'icici'];
	const results: CCOutstandingItem[] = [];

	for (const card of cards) {
		const expenses = await db.expenses
			.where('creditCard')
			.equals(card)
			.toArray();

		let outstanding = 0;
		for (const e of expenses) {
			if (e.paymentMethod === 'cc_bill_payment') {
				outstanding -= e.amount;
			} else if (e.type === 'debit') {
				outstanding += e.amount;
			} else {
				outstanding -= e.amount;
			}
		}

		if (outstanding > 0) {
			results.push({ card, outstanding });
		}
	}

	return results;
}
