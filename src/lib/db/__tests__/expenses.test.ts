import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../index.js';
import { today } from '$lib/utils/date.js';
import {
	addExpense,
	updateExpense,
	deleteExpense,
	getExpenseById,
	getExpensesByDateRange,
	checkDuplicate,
	checkManualDuplicate,
	getCCOutstanding,
	getMonthlyTotal
} from '../expenses.js';
import type { NewExpense } from '$lib/types/index.js';

function makeExpense(overrides: Partial<NewExpense> = {}): NewExpense {
	return {
		amount: 50000, // ₹500 in paise
		type: 'debit',
		category: 1,
		merchant: 'Swiggy',
		paymentMethod: 'upi',
		creditCard: null,
		bankAccount: 'hdfc',
		tags: [],
		note: '',
		isRecurring: false,
		recurringId: null,
		rawSMS: null,
		source: 'manual',
		date: '2025-03-01',
		...overrides
	};
}

beforeEach(async () => {
	await db.expenses.clear();
});

describe('addExpense', () => {
	it('adds an expense and returns an id', async () => {
		const id = await addExpense(makeExpense());
		expect(id).toBeGreaterThan(0);

		const saved = await db.expenses.get(id);
		expect(saved?.amount).toBe(50000);
		expect(saved?.merchant).toBe('Swiggy');
		expect(saved?.createdAt).toBeTruthy();
		expect(saved?.updatedAt).toBeTruthy();
	});
});

describe('updateExpense', () => {
	it('updates fields and sets updatedAt', async () => {
		const id = await addExpense(makeExpense());
		const before = await db.expenses.get(id);

		// Ensure timestamps differ
		await new Promise((r) => setTimeout(r, 5));
		await updateExpense(id, { amount: 60000, merchant: 'Zomato' });

		const after = await db.expenses.get(id);
		expect(after?.amount).toBe(60000);
		expect(after?.merchant).toBe('Zomato');
		expect(after?.updatedAt).not.toBe(before?.updatedAt);
	});
});

describe('deleteExpense', () => {
	it('removes the expense', async () => {
		const id = await addExpense(makeExpense());
		await deleteExpense(id);
		const result = await getExpenseById(id);
		expect(result).toBeUndefined();
	});
});

describe('getExpensesByDateRange', () => {
	it('returns expenses within the date range', async () => {
		await addExpense(makeExpense({ date: '2025-03-01' }));
		await addExpense(makeExpense({ date: '2025-03-15' }));
		await addExpense(makeExpense({ date: '2025-04-01' }));

		const results = await getExpensesByDateRange('2025-03-01', '2025-03-31');
		expect(results).toHaveLength(2);
	});
});

describe('checkDuplicate', () => {
	it('detects duplicate SMS within 5 minutes', async () => {
		const sms = 'Rs.500 debited from a/c **1234';
		await addExpense(makeExpense({ rawSMS: sms, date: today() }));

		const isDup = await checkDuplicate(sms);
		expect(isDup).toBe(true);
	});

	it('does not flag different SMS as duplicate', async () => {
		await addExpense(
			makeExpense({ rawSMS: 'Rs.500 debited', date: today() })
		);
		const isDup = await checkDuplicate('Rs.600 debited');
		expect(isDup).toBe(false);
	});
});

describe('checkManualDuplicate', () => {
	it('detects duplicate manual entry', async () => {
		await addExpense(makeExpense({ amount: 50000, date: '2025-03-01', merchant: 'Swiggy' }));
		const isDup = await checkManualDuplicate(50000, '2025-03-01', 'swiggy');
		expect(isDup).toBe(true);
	});
});

describe('getCCOutstanding', () => {
	it('calculates outstanding as cc debits minus cc payments', async () => {
		await addExpense(
			makeExpense({
				amount: 100000,
				paymentMethod: 'credit_card',
				creditCard: 'hdfc',
				type: 'debit'
			})
		);
		await addExpense(
			makeExpense({
				amount: 30000,
				paymentMethod: 'cc_bill_payment',
				creditCard: 'hdfc',
				type: 'debit'
			})
		);

		const outstanding = await getCCOutstanding('hdfc');
		expect(outstanding).toBe(70000);
	});
});

describe('getMonthlyTotal', () => {
	it('sums debit expenses excluding cc bill payments', async () => {
		await addExpense(makeExpense({ amount: 50000, date: '2025-03-01' }));
		await addExpense(makeExpense({ amount: 30000, date: '2025-03-15' }));
		await addExpense(
			makeExpense({
				amount: 100000,
				date: '2025-03-10',
				paymentMethod: 'cc_bill_payment'
			})
		);
		await addExpense(
			makeExpense({
				amount: 20000,
				date: '2025-03-10',
				type: 'credit'
			})
		);

		const total = await getMonthlyTotal(2025, 3);
		expect(total).toBe(80000);
	});
});
