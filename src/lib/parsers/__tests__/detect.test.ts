import { describe, it, expect } from 'vitest';
import { detectInputType } from '../detect.js';

describe('detectInputType', () => {
	it('detects HDFC SMS', () => {
		expect(
			detectInputType(
				'Rs.500.00 debited from a/c **1234 to VPA swiggy@paytm on 01-03-25. UPI Ref: 123'
			)
		).toBe('sms');
	});

	it('detects SBI SMS', () => {
		expect(
			detectInputType(
				'Your a/c X1234 is debited by Rs.500.00 on 01-03-25 transfer to SWIGGY Ref No 123'
			)
		).toBe('sms');
	});

	it('detects CC SMS', () => {
		expect(
			detectInputType(
				'HDFC Bank Credit Card xx5678 has been used for Rs.2500 at Flipkart on 01-03-25'
			)
		).toBe('sms');
	});

	it('detects bare number', () => {
		expect(detectInputType('500')).toBe('bare_number');
		expect(detectInputType('99.50')).toBe('bare_number');
	});

	it('detects natural language with number', () => {
		expect(detectInputType('500 swiggy')).toBe('natural_language');
		expect(detectInputType('swiggy 500')).toBe('natural_language');
	});

	it('returns null for failed transactions', () => {
		expect(
			detectInputType(
				'Rs.500 debited from a/c **1234 failed. Transaction declined.'
			)
		).toBeNull();
	});

	it('returns null for empty input', () => {
		expect(detectInputType('')).toBeNull();
	});

	it('returns null for text without numbers', () => {
		expect(detectInputType('hello world')).toBeNull();
	});

	it('returns null for whitespace only', () => {
		expect(detectInputType('   ')).toBeNull();
	});
});
