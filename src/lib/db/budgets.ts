import { db } from './index.js';
import { now } from '$lib/utils/date.js';
import { getExpensesForMonth } from './expenses.js';
import type { Budget, NewBudget } from '$lib/types/index.js';

export async function getAllBudgets(): Promise<Budget[]> {
	return await db.budgets.toArray();
}

export async function getBudgetForCategory(categoryId: number | null): Promise<Budget | undefined> {
	return await db.budgets.where('category').equals(categoryId as number).first();
}

export async function setBudget(data: NewBudget): Promise<number> {
	// Upsert: remove existing for same category, then add
	const existing = await getBudgetForCategory(data.category);
	if (existing?.id !== undefined) {
		await db.budgets.delete(existing.id);
	}
	return await db.budgets.add({
		...data,
		createdAt: now()
	});
}

export async function deleteBudget(id: number): Promise<void> {
	await db.budgets.delete(id);
}

export interface BudgetStatus {
	budget: Budget;
	spent: number;
	percentage: number;
	isWarning: boolean;
	isOver: boolean;
}

export async function getBudgetStatus(
	year: number,
	month: number
): Promise<BudgetStatus[]> {
	const [budgets, expenses] = await Promise.all([
		getAllBudgets(),
		getExpensesForMonth(year, month)
	]);

	const debitExpenses = expenses.filter(
		(e) => e.type === 'debit' && e.paymentMethod !== 'cc_bill_payment'
	);

	return budgets.map((budget) => {
		const spent =
			budget.category === null
				? debitExpenses.reduce((sum, e) => sum + e.amount, 0)
				: debitExpenses
						.filter((e) => e.category === budget.category)
						.reduce((sum, e) => sum + e.amount, 0);

		const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
		return {
			budget,
			spent,
			percentage,
			isWarning: percentage >= 80 && percentage < 100,
			isOver: percentage >= 100
		};
	});
}
