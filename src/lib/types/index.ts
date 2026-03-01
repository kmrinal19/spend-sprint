// === Union Types ===

export type TransactionType = 'debit' | 'credit';

export type PaymentMethod =
	| 'upi'
	| 'debit_card'
	| 'credit_card'
	| 'cash'
	| 'bank_transfer'
	| 'cc_bill_payment'
	| 'other';

export type CreditCard = 'axis' | 'hdfc' | 'scapia' | 'icici';
export type BankAccount = 'hdfc' | 'sbi' | 'ubi';
export type ExpenseSource = 'clipboard' | 'natural_language' | 'manual' | 'recurring';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

// === Entity Interfaces ===

export interface Expense {
	id?: number;
	amount: number; // Amount in paise (integer). ₹49.50 = 4950
	type: TransactionType;
	category: number;
	merchant: string;
	paymentMethod: PaymentMethod;
	creditCard: CreditCard | null;
	bankAccount: BankAccount | null;
	tags: string[];
	note: string;
	isRecurring: boolean;
	recurringId: number | null;
	rawSMS: string | null;
	source: ExpenseSource;
	date: string; // YYYY-MM-DD
	createdAt: string; // ISO timestamp
	updatedAt: string; // ISO timestamp
}

export interface Category {
	id?: number;
	name: string;
	icon: string; // Emoji
	color: string; // Hex color
	sortOrder: number;
	isDefault: boolean;
	createdAt: string;
}

export interface RecurringExpense {
	id?: number;
	amount: number; // Amount in paise (integer). ₹49.50 = 4950
	type: TransactionType;
	category: number;
	merchant: string;
	paymentMethod: PaymentMethod;
	creditCard: CreditCard | null;
	bankAccount: BankAccount | null;
	tags: string[];
	note: string;
	frequency: Frequency;
	startDate: string; // YYYY-MM-DD
	nextDueDate: string; // YYYY-MM-DD
	isActive: boolean;
	createdAt: string;
}

export interface Budget {
	id?: number;
	category: number | null; // null = overall budget
	limit: number; // Amount in paise (integer). ₹49.50 = 4950
	period: 'monthly';
	resetDay: number; // 1-28
	createdAt: string;
}

export interface MerchantMapping {
	id?: number;
	merchantKeyword: string; // Lowercase
	categoryId: number;
	displayName: string;
	usageCount: number;
}

export interface SMSTemplate {
	id?: number;
	bank: string;
	senderPattern: string; // Regex string
	messagePattern: string; // Regex string with named groups
	priority: number; // Higher = tried first
	isActive: boolean;
}

export interface AppSettings {
	key: string;
	value: unknown;
}

// === Parser Types ===

export interface ParsedExpense {
	amount: number | null; // Amount in paise (integer). ₹49.50 = 4950
	type: TransactionType;
	merchant: string | null;
	category: number | null;
	paymentMethod: PaymentMethod | null;
	creditCard: CreditCard | null;
	bankAccount: BankAccount | null;
	date: string | null; // YYYY-MM-DD
	reference: string | null;
	rawText: string;
	source: ExpenseSource;
	confidence: number; // 0-1
	isCCBillPayment: boolean;
	recurring: {
		frequency: Frequency;
	} | null;
}

// === Utility Types ===

export type NewExpense = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
export type ExpensePatch = Partial<Omit<Expense, 'id' | 'createdAt'>>;
export type NewCategory = Omit<Category, 'id' | 'createdAt'>;
export type NewRecurringExpense = Omit<RecurringExpense, 'id' | 'createdAt'>;
export type NewBudget = Omit<Budget, 'id' | 'createdAt'>;

// === Label Maps ===

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
	upi: 'UPI',
	debit_card: 'Debit Card',
	credit_card: 'Credit Card',
	cash: 'Cash',
	bank_transfer: 'Bank Transfer',
	cc_bill_payment: 'CC Bill Payment',
	other: 'Other'
};

export const CREDIT_CARD_LABELS: Record<CreditCard, string> = {
	axis: 'Axis Bank',
	hdfc: 'HDFC',
	scapia: 'Scapia',
	icici: 'ICICI'
};

export const BANK_ACCOUNT_LABELS: Record<BankAccount, string> = {
	hdfc: 'HDFC',
	sbi: 'SBI',
	ubi: 'UBI'
};

export const FREQUENCY_LABELS: Record<Frequency, string> = {
	daily: 'Daily',
	weekly: 'Weekly',
	monthly: 'Monthly',
	yearly: 'Yearly'
};
