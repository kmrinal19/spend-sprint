import { db } from './index.js';
import { now, today, formatDate, getNextDueDate } from '$lib/utils/date.js';
import type { RecurringExpense, NewRecurringExpense, NewExpense } from '$lib/types/index.js';

export async function getAllRecurring(): Promise<RecurringExpense[]> {
	return await db.recurring.toArray();
}

export async function getActiveRecurring(): Promise<RecurringExpense[]> {
	return await db.recurring.filter((r) => r.isActive).toArray();
}

export async function addRecurring(data: NewRecurringExpense): Promise<number> {
	return await db.recurring.add({
		...data,
		createdAt: now()
	});
}

export async function pauseRecurring(id: number): Promise<void> {
	await db.recurring.update(id, { isActive: false });
}

export async function resumeRecurring(id: number): Promise<void> {
	await db.recurring.update(id, { isActive: true });
}

export async function deleteRecurring(id: number): Promise<void> {
	await db.recurring.delete(id);
}

export async function createExpenseWithRecurring(
	expense: NewExpense,
	recurring: NewRecurringExpense
): Promise<{ expenseId: number; recurringId: number }> {
	let expenseId = 0;
	let recurringId = 0;

	await db.transaction('rw', [db.expenses, db.recurring], async () => {
		const ts = now();
		recurringId = await db.recurring.add({
			...recurring,
			createdAt: ts
		});
		expenseId = await db.expenses.add({
			...expense,
			isRecurring: true,
			recurringId,
			createdAt: ts,
			updatedAt: ts
		});
	});

	return { expenseId, recurringId };
}

export async function processRecurringExpenses(): Promise<number> {
	const todayStr = today();
	const active = await db.recurring
		.filter((r) => r.isActive && r.nextDueDate <= todayStr)
		.toArray();

	let created = 0;

	for (const rule of active) {
		await db.transaction('rw', [db.expenses, db.recurring], async () => {
			// Backfill all missed dates
			let dueDate = rule.nextDueDate;
			while (dueDate <= todayStr) {
				const ts = now();
				await db.expenses.add({
					amount: rule.amount,
					type: rule.type,
					category: rule.category,
					merchant: rule.merchant,
					paymentMethod: rule.paymentMethod,
					creditCard: rule.creditCard,
					bankAccount: rule.bankAccount,
					tags: [...rule.tags],
					note: rule.note,
					isRecurring: true,
					recurringId: rule.id!,
					rawSMS: null,
					source: 'recurring',
					date: dueDate,
					createdAt: ts,
					updatedAt: ts
				});
				created++;
				dueDate = getNextDueDate(dueDate, rule.frequency);
			}

			// Update nextDueDate
			await db.recurring.update(rule.id!, { nextDueDate: dueDate });
		});
	}

	return created;
}
