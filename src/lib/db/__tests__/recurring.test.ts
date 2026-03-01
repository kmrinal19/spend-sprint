import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../index.js';
import {
	addRecurring,
	processRecurringExpenses,
	createExpenseWithRecurring,
	pauseRecurring,
	resumeRecurring,
	deleteRecurring
} from '../recurring.js';
import type { NewExpense, NewRecurringExpense } from '$lib/types/index.js';
import { today, formatDate } from '$lib/utils/date.js';

function makeRecurring(overrides: Partial<NewRecurringExpense> = {}): NewRecurringExpense {
	return {
		amount: 199,
		type: 'debit',
		category: 8,
		merchant: 'Netflix',
		paymentMethod: 'credit_card',
		creditCard: 'hdfc',
		bankAccount: null,
		tags: [],
		note: '',
		frequency: 'monthly',
		startDate: '2025-01-01',
		nextDueDate: '2025-01-01',
		isActive: true,
		...overrides
	};
}

function makeExpense(overrides: Partial<NewExpense> = {}): NewExpense {
	return {
		amount: 199,
		type: 'debit',
		category: 8,
		merchant: 'Netflix',
		paymentMethod: 'credit_card',
		creditCard: 'hdfc',
		bankAccount: null,
		tags: [],
		note: '',
		isRecurring: false,
		recurringId: null,
		rawSMS: null,
		source: 'manual',
		date: today(),
		...overrides
	};
}

beforeEach(async () => {
	await db.expenses.clear();
	await db.recurring.clear();
});

describe('addRecurring', () => {
	it('adds a recurring rule', async () => {
		const id = await addRecurring(makeRecurring());
		expect(id).toBeGreaterThan(0);
		const saved = await db.recurring.get(id);
		expect(saved?.merchant).toBe('Netflix');
		expect(saved?.frequency).toBe('monthly');
	});
});

describe('pauseRecurring / resumeRecurring', () => {
	it('toggles isActive', async () => {
		const id = await addRecurring(makeRecurring());

		await pauseRecurring(id);
		let saved = await db.recurring.get(id);
		expect(saved?.isActive).toBe(false);

		await resumeRecurring(id);
		saved = await db.recurring.get(id);
		expect(saved?.isActive).toBe(true);
	});
});

describe('deleteRecurring', () => {
	it('removes the recurring rule', async () => {
		const id = await addRecurring(makeRecurring());
		await deleteRecurring(id);
		const saved = await db.recurring.get(id);
		expect(saved).toBeUndefined();
	});
});

describe('createExpenseWithRecurring', () => {
	it('creates both expense and recurring rule in a transaction', async () => {
		const { expenseId, recurringId } = await createExpenseWithRecurring(
			makeExpense(),
			makeRecurring()
		);

		expect(expenseId).toBeGreaterThan(0);
		expect(recurringId).toBeGreaterThan(0);

		const expense = await db.expenses.get(expenseId);
		expect(expense?.isRecurring).toBe(true);
		expect(expense?.recurringId).toBe(recurringId);
	});
});

describe('processRecurringExpenses', () => {
	it('creates expenses for overdue recurring rules', async () => {
		// Set nextDueDate to yesterday so it's overdue
		const yesterdayDate = formatDate(new Date(Date.now() - 86400000));
		await addRecurring(makeRecurring({ nextDueDate: yesterdayDate }));

		const created = await processRecurringExpenses();
		expect(created).toBeGreaterThanOrEqual(1);

		const expenses = await db.expenses.toArray();
		expect(expenses.length).toBeGreaterThanOrEqual(1);
		expect(expenses[0]?.source).toBe('recurring');
	});

	it('skips paused recurring rules', async () => {
		const yesterdayDate = formatDate(new Date(Date.now() - 86400000));
		const id = await addRecurring(makeRecurring({ nextDueDate: yesterdayDate }));
		await pauseRecurring(id);

		const created = await processRecurringExpenses();
		expect(created).toBe(0);
	});

	it('backfills multiple missed dates', async () => {
		// Set a daily recurring that was due 3 days ago
		const threeDaysAgo = formatDate(new Date(Date.now() - 3 * 86400000));
		await addRecurring(
			makeRecurring({ nextDueDate: threeDaysAgo, frequency: 'daily' })
		);

		const created = await processRecurringExpenses();
		// Should create expenses for 3 days ago, 2 days ago, yesterday, and today
		expect(created).toBeGreaterThanOrEqual(3);
	});
});
