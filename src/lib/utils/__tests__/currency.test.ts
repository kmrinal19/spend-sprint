import { describe, it, expect } from 'vitest';
import { formatCurrency, parseAmount } from '../currency.js';

describe('formatCurrency', () => {
	it('formats with rupee symbol and Indian locale', () => {
		expect(formatCurrency(100000)).toBe('₹1,000.00');
	});

	it('formats decimals with trailing zero', () => {
		expect(formatCurrency(9950)).toBe('₹99.50');
	});

	it('formats large amounts with Indian grouping', () => {
		const result = formatCurrency(10000000);
		expect(result).toContain('₹');
		expect(result).toContain('1,00,000.00');
	});

	it('formats zero', () => {
		expect(formatCurrency(0)).toBe('₹0.00');
	});

	it('formats single paise correctly', () => {
		expect(formatCurrency(1)).toBe('₹0.01');
	});
});

describe('parseAmount', () => {
	it('parses plain number to paise', () => {
		expect(parseAmount('500')).toBe(50000);
	});

	it('parses with rupee symbol to paise', () => {
		expect(parseAmount('₹1,200.50')).toBe(120050);
	});

	it('parses with Rs prefix to paise', () => {
		expect(parseAmount('Rs. 500')).toBe(50000);
	});

	it('parses with INR prefix to paise', () => {
		expect(parseAmount('INR 1500')).toBe(150000);
	});

	it('returns null for invalid input', () => {
		expect(parseAmount('abc')).toBeNull();
	});

	it('returns null for negative numbers', () => {
		expect(parseAmount('-500')).toBeNull();
	});
});
