import { describe, it, expect } from 'vitest';
import { parseNaturalLanguage } from '../natural-language.js';
import { today, yesterday } from '$lib/utils/date.js';

describe('parseNaturalLanguage', () => {
	it('parses "500 swiggy"', () => {
		const result = parseNaturalLanguage('500 swiggy');
		expect(result).not.toBeNull();
		expect(result!.amount).toBe(50000);
		expect(result!.merchant).toBe('swiggy');
		expect(result!.type).toBe('debit');
		expect(result!.date).toBe(today());
	});

	it('parses "swiggy 500"', () => {
		const result = parseNaturalLanguage('swiggy 500');
		expect(result).not.toBeNull();
		expect(result!.amount).toBe(50000);
		expect(result!.merchant).toBe('swiggy');
	});

	it('parses "₹1,200 amazon"', () => {
		const result = parseNaturalLanguage('₹1,200 amazon');
		expect(result).not.toBeNull();
		expect(result!.amount).toBe(120000);
		expect(result!.merchant).toBe('amazon');
	});

	it('parses "300 chai yesterday"', () => {
		const result = parseNaturalLanguage('300 chai yesterday');
		expect(result).not.toBeNull();
		expect(result!.amount).toBe(30000);
		expect(result!.merchant).toBe('chai');
		expect(result!.date).toBe(yesterday());
	});

	it('parses "1500 rent today"', () => {
		const result = parseNaturalLanguage('1500 rent today');
		expect(result).not.toBeNull();
		expect(result!.amount).toBe(150000);
		expect(result!.merchant).toBe('rent');
		expect(result!.date).toBe(today());
	});

	it('parses credit: "5000 salary received"', () => {
		const result = parseNaturalLanguage('5000 salary received');
		expect(result).not.toBeNull();
		expect(result!.amount).toBe(500000);
		expect(result!.type).toBe('credit');
		expect(result!.merchant).toBe('salary');
	});

	it('parses "200 cashback"', () => {
		const result = parseNaturalLanguage('200 cashback');
		expect(result).not.toBeNull();
		expect(result!.type).toBe('credit');
	});

	it('parses amount with decimals: "99.50 tea"', () => {
		const result = parseNaturalLanguage('99.50 tea');
		expect(result).not.toBeNull();
		expect(result!.amount).toBe(9950);
	});

	it('parses multi-word merchant: "1200 dominos pizza"', () => {
		const result = parseNaturalLanguage('1200 dominos pizza');
		expect(result).not.toBeNull();
		expect(result!.merchant).toBe('dominos pizza');
	});

	it('returns null for text without numbers', () => {
		expect(parseNaturalLanguage('swiggy food')).toBeNull();
	});

	it('returns null for empty string', () => {
		expect(parseNaturalLanguage('')).toBeNull();
	});

	it('handles bare number as amount only', () => {
		const result = parseNaturalLanguage('500');
		expect(result).not.toBeNull();
		expect(result!.amount).toBe(50000);
		expect(result!.merchant).toBeNull();
	});

	it('sets source to natural_language', () => {
		const result = parseNaturalLanguage('500 swiggy');
		expect(result!.source).toBe('natural_language');
	});

	it('has medium confidence with merchant', () => {
		const result = parseNaturalLanguage('500 swiggy');
		expect(result!.confidence).toBe(0.7);
	});

	it('has lower confidence without merchant', () => {
		const result = parseNaturalLanguage('500');
		expect(result!.confidence).toBe(0.5);
	});

	it('parses "k" shorthand: "1.5k swiggy"', () => {
		const result = parseNaturalLanguage('1.5k swiggy');
		expect(result).not.toBeNull();
		expect(result!.amount).toBe(150000);
		expect(result!.merchant).toBe('swiggy');
	});

	it('parses "2K coffee"', () => {
		const result = parseNaturalLanguage('2K coffee');
		expect(result).not.toBeNull();
		expect(result!.amount).toBe(200000);
		expect(result!.merchant).toBe('coffee');
	});

	it('filters filler words from merchant', () => {
		const result = parseNaturalLanguage('500 spent on swiggy');
		expect(result).not.toBeNull();
		expect(result!.amount).toBe(50000);
		expect(result!.merchant).toBe('swiggy');
	});
});
