import { liveQuery } from 'dexie';
import { db } from '$lib/db/index.js';
import { today } from '$lib/utils/date.js';
import type { Expense } from '$lib/types/index.js';

let expenses = $state<Expense[]>([]);
let currentMonth = $state({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });

export function initExpenseStore() {
	$effect(() => {
		const y = currentMonth.year;
		const m = currentMonth.month;
		const start = `${y}-${String(m).padStart(2, '0')}-01`;
		const lastDay = new Date(y, m, 0).getDate();
		const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

		const sub = liveQuery(() =>
			db.expenses.where('date').between(start, end, true, true).reverse().toArray()
		).subscribe((result) => {
			expenses = result;
		});
		return () => sub.unsubscribe();
	});
}

export function getExpenses(): Expense[] {
	return expenses;
}

export function getMonthlyTotal(): number {
	return expenses
		.filter((e) => e.type === 'debit' && e.paymentMethod !== 'cc_bill_payment')
		.reduce((sum, e) => sum + e.amount, 0);
}

export function getTodayTotal(): number {
	const t = today();
	return expenses
		.filter((e) => e.date === t && e.type === 'debit' && e.paymentMethod !== 'cc_bill_payment')
		.reduce((sum, e) => sum + e.amount, 0);
}

export function getGroupedByDate(): { date: string; expenses: Expense[] }[] {
	const groups = new Map<string, Expense[]>();
	for (const e of expenses) {
		const existing = groups.get(e.date);
		if (existing) {
			existing.push(e);
		} else {
			groups.set(e.date, [e]);
		}
	}
	return Array.from(groups.entries())
		.sort(([a], [b]) => b.localeCompare(a))
		.map(([date, items]) => ({ date, expenses: items }));
}

export function setCurrentMonth(year: number, month: number) {
	currentMonth = { year, month };
}

export function getCurrentMonth() {
	return currentMonth;
}
