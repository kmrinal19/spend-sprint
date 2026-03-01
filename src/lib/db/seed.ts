import { db } from './index.js';
import { now } from '$lib/utils/date.js';
import type { Category, SMSTemplate, AppSettings } from '$lib/types/index.js';

function getDefaultCategories(): Omit<Category, 'id'>[] {
	const ts = now();
	return [
		{ name: 'Food & Dining', icon: '🍔', color: '#ef4444', sortOrder: 0, isDefault: true, createdAt: ts },
		{ name: 'Shopping', icon: '🛒', color: '#f97316', sortOrder: 1, isDefault: true, createdAt: ts },
		{ name: 'Housing', icon: '🏠', color: '#8b5cf6', sortOrder: 2, isDefault: true, createdAt: ts },
		{ name: 'Transport', icon: '🚗', color: '#3b82f6', sortOrder: 3, isDefault: true, createdAt: ts },
		{ name: 'Chai / Snacks', icon: '☕', color: '#a16207', sortOrder: 4, isDefault: true, createdAt: ts },
		{ name: 'Health', icon: '💊', color: '#10b981', sortOrder: 5, isDefault: true, createdAt: ts },
		{ name: 'Entertainment', icon: '🎬', color: '#ec4899', sortOrder: 6, isDefault: true, createdAt: ts },
		{ name: 'Subscriptions', icon: '📱', color: '#6366f1', sortOrder: 7, isDefault: true, createdAt: ts },
		{ name: 'Education', icon: '📚', color: '#14b8a6', sortOrder: 8, isDefault: true, createdAt: ts },
		{ name: 'Utilities', icon: '🔌', color: '#64748b', sortOrder: 9, isDefault: true, createdAt: ts },
		{ name: 'EMI', icon: '💳', color: '#dc2626', sortOrder: 10, isDefault: true, createdAt: ts },
		{ name: 'Gifts', icon: '🎁', color: '#d946ef', sortOrder: 11, isDefault: true, createdAt: ts },
		{ name: 'Travel', icon: '✈️', color: '#0ea5e9', sortOrder: 12, isDefault: true, createdAt: ts },
		{ name: 'Miscellaneous', icon: '📦', color: '#78716c', sortOrder: 13, isDefault: true, createdAt: ts }
	];
}

function getDefaultSMSTemplates(): Omit<SMSTemplate, 'id'>[] {
	return [
		{
			bank: 'HDFC',
			senderPattern: 'HDFCBK',
			messagePattern:
				'Rs\\.?\\s?(?<amount>[\\d,]+\\.?\\d*)\\s+(?<type>debited|credited)\\s+from\\s+a\\/c\\s+\\*{0,2}(?<account>\\d{4}).*?(?:to|at)\\s+(?:VPA\\s+)?(?<merchant>[\\w\\s.@]+?)(?:\\s*\\(|\\s+UPI|\\s+on)',
			priority: 10,
			isActive: true
		},
		{
			bank: 'SBI',
			senderPattern: 'SBIBNK',
			messagePattern:
				'a\\/c\\s+X?(?<account>\\d{4})\\s+(?:is\\s+)?(?<type>debited|credited)\\s+by\\s+Rs\\.?\\s?(?<amount>[\\d,]+\\.?\\d*).*?transfer\\s+to\\s+(?<merchant>[\\w\\s]+?)(?:\\s+Ref|\\s*$)',
			priority: 10,
			isActive: true
		},
		{
			bank: 'UBI',
			senderPattern: 'ABORIG',
			messagePattern:
				'INR\\s+(?<amount>[\\d,]+\\.?\\d*)\\s+(?<type>debited|credited)\\s+from\\s+A\\/c\\s+(?<account>\\d+).*?Info:\\s*(?:UPI\\/\\d+\\/)?(?<merchant>[\\w\\s]+)',
			priority: 10,
			isActive: true
		},
		{
			bank: 'AXIS_CC',
			senderPattern: 'AXISBK',
			messagePattern:
				'Transaction\\s+of\\s+Rs\\.?\\s?(?<amount>[\\d,]+\\.?\\d*)\\s+done\\s+on\\s+Axis\\s+Bank\\s+Credit\\s+Card\\s+no\\.\\s*XX?(?<account>\\d{4})\\s+at\\s+(?<merchant>[\\w\\s]+?)(?:\\s+on)',
			priority: 10,
			isActive: true
		},
		{
			bank: 'HDFC_CC',
			senderPattern: 'HDFCBK',
			messagePattern:
				'HDFC\\s+Bank\\s+Credit\\s+Card\\s+xx?(?<account>\\d{4})\\s+has\\s+been\\s+used\\s+for\\s+Rs\\.?\\s?(?<amount>[\\d,]+\\.?\\d*)\\s+at\\s+(?<merchant>[\\w\\s]+?)(?:\\s+on)',
			priority: 15,
			isActive: true
		},
		{
			bank: 'ICICI_CC',
			senderPattern: 'ICICIB',
			messagePattern:
				'ICICI\\s+Bank\\s+Credit\\s+Card\\s+XX?(?<account>\\d{4})\\s+has\\s+been\\s+used\\s+for\\s+(?:a\\s+transaction\\s+of\\s+)?(?:INR|Rs\\.?)\\s?(?<amount>[\\d,]+\\.?\\d*).*?at\\s+(?<merchant>[\\w\\s]+)',
			priority: 10,
			isActive: true
		}
	];
}

function getDefaultSettings(): AppSettings[] {
	return [
		{ key: 'currency', value: 'INR' },
		{ key: 'currencySymbol', value: '₹' },
		{ key: 'budgetResetDay', value: 1 },
		{ key: 'theme', value: 'system' },
		{ key: 'clipboardDetection', value: true }
	];
}

export async function seedIfEmpty(): Promise<void> {
	const count = await db.categories.count();
	if (count > 0) return;

	await db.categories.bulkAdd(getDefaultCategories());
	await db.smsTemplates.bulkAdd(getDefaultSMSTemplates());
	await db.settings.bulkPut(getDefaultSettings());
}
