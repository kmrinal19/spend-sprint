import Dexie, { type Table } from 'dexie';
import type {
	Expense,
	Category,
	RecurringExpense,
	Budget,
	MerchantMapping,
	SMSTemplate,
	AppSettings
} from '$lib/types/index.js';

export class SpendSprintDB extends Dexie {
	expenses!: Table<Expense, number>;
	categories!: Table<Category, number>;
	recurring!: Table<RecurringExpense, number>;
	budgets!: Table<Budget, number>;
	merchants!: Table<MerchantMapping, number>;
	smsTemplates!: Table<SMSTemplate, number>;
	settings!: Table<AppSettings, string>;

	constructor() {
		super('spendsprint');

		this.version(1).stores({
			expenses: '++id, date, category, type, paymentMethod, creditCard, *tags',
			categories: '++id, sortOrder',
			recurring: '++id, nextDueDate, isActive',
			budgets: '++id, category',
			merchants: '++id, &merchantKeyword',
			smsTemplates: '++id, bank, priority',
			settings: 'key'
		});
	}
}

export const db = new SpendSprintDB();
