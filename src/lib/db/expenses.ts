import { db } from './index.js';
import { now, today } from '$lib/utils/date.js';
import type { Expense, NewExpense, ExpensePatch } from '$lib/types/index.js';

export async function addExpense(data: NewExpense): Promise<number> {
	const ts = now();
	return await db.expenses.add({
		...data,
		createdAt: ts,
		updatedAt: ts
	});
}

export async function updateExpense(id: number, patch: ExpensePatch): Promise<void> {
	await db.expenses.update(id, {
		...patch,
		updatedAt: now()
	});
}

export async function deleteExpense(id: number): Promise<void> {
	await db.expenses.delete(id);
}

export async function getExpenseById(id: number): Promise<Expense | undefined> {
	return await db.expenses.get(id);
}

export async function getExpensesByDateRange(
	startDate: string,
	endDate: string
): Promise<Expense[]> {
	return await db.expenses
		.where('date')
		.between(startDate, endDate, true, true)
		.reverse()
		.toArray();
}

export async function getExpensesForMonth(year: number, month: number): Promise<Expense[]> {
	const start = `${year}-${String(month).padStart(2, '0')}-01`;
	const lastDay = new Date(year, month, 0).getDate();
	const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
	return getExpensesByDateRange(start, end);
}

export async function checkDuplicate(rawSMS: string): Promise<boolean> {
	const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
	const recent = await db.expenses
		.where('date')
		.equals(today())
		.filter((e) => e.rawSMS === rawSMS && e.createdAt > fiveMinutesAgo)
		.first();
	return recent !== undefined;
}

export async function checkManualDuplicate(
	amount: number,
	date: string,
	merchant: string
): Promise<boolean> {
	const match = await db.expenses
		.where('date')
		.equals(date)
		.filter(
			(e) =>
				e.amount === amount && e.merchant.toLowerCase() === merchant.toLowerCase()
		)
		.first();
	return match !== undefined;
}

export async function getCCOutstanding(
	card: string
): Promise<number> {
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
	return Math.max(0, outstanding);
}

export async function checkDuplicateByRef(reference: string): Promise<boolean> {
	const match = await db.expenses
		.where('date')
		.equals(today())
		.filter((e) => e.rawSMS !== null && e.rawSMS.includes(reference))
		.first();
	return match !== undefined;
}

export async function getMonthlyTotal(year: number, month: number): Promise<number> {
	const expenses = await getExpensesForMonth(year, month);
	return expenses
		.filter((e) => e.type === 'debit' && e.paymentMethod !== 'cc_bill_payment')
		.reduce((sum, e) => sum + e.amount, 0);
}
