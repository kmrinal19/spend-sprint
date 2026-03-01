import { describe, it, expect } from 'vitest';
import { parseSMS } from '../sms.js';

describe('parseSMS', () => {
	describe('HDFC Bank', () => {
		it('parses HDFC debit UPI SMS', () => {
			const sms =
				'Rs.500.00 debited from a/c **1234 to VPA swiggy@paytm on 01-03-25. UPI Ref: 123456789';
			const result = parseSMS(sms);
			expect(result).not.toBeNull();
			expect(result!.amount).toBe(50000);
			expect(result!.type).toBe('debit');
			expect(result!.merchant).toBe('swiggy');
			expect(result!.bankAccount).toBe('hdfc');
			expect(result!.paymentMethod).toBe('upi');
		});

		it('parses HDFC credit SMS', () => {
			const sms =
				'Rs.10,000.00 credited to a/c **5678 by NEFT from John Doe on 01-03-25. Ref: 987654321';
			const result = parseSMS(sms);
			expect(result).not.toBeNull();
			expect(result!.amount).toBe(1000000);
			expect(result!.type).toBe('credit');
			expect(result!.bankAccount).toBe('hdfc');
		});

		it('parses HDFC with comma in amount', () => {
			const sms =
				'Rs 1,200.50 debited from a/c *1234 to VPA merchant@upi on 15-03-25. UPI Ref: 111';
			const result = parseSMS(sms);
			expect(result).not.toBeNull();
			expect(result!.amount).toBe(120050);
		});

		it('parses HDFC without dots after Rs', () => {
			const sms =
				'Rs 250 debited from a/c **9999 to BigBasket on 01-03-25. UPI Ref: 222';
			const result = parseSMS(sms);
			expect(result).not.toBeNull();
			expect(result!.amount).toBe(25000);
			expect(result!.merchant).toBe('BigBasket');
		});
	});

	describe('SBI', () => {
		it('parses SBI debit SMS', () => {
			const sms =
				'Your a/c X1234 is debited by Rs.500.00 on 01-03-25 transfer to SWIGGY Ref No 123';
			const result = parseSMS(sms);
			expect(result).not.toBeNull();
			expect(result!.amount).toBe(50000);
			expect(result!.type).toBe('debit');
			expect(result!.merchant).toBe('SWIGGY');
			expect(result!.bankAccount).toBe('sbi');
		});

		it('parses SBI credit SMS', () => {
			const sms =
				'Your a/c X5678 is credited by Rs.25,000 on 01-03-25 transfer to Salary Ref No 456';
			const result = parseSMS(sms);
			expect(result).not.toBeNull();
			expect(result!.amount).toBe(2500000);
			expect(result!.type).toBe('credit');
		});
	});

	describe('UBI', () => {
		it('parses UBI debit SMS', () => {
			const sms =
				'INR 350.00 debited from A/c 12345678 on 01-03-25. Info: UPI/123456/MerchantName';
			const result = parseSMS(sms);
			expect(result).not.toBeNull();
			expect(result!.amount).toBe(35000);
			expect(result!.type).toBe('debit');
			expect(result!.merchant).toBe('MerchantName');
			expect(result!.bankAccount).toBe('ubi');
		});
	});

	describe('Axis CC', () => {
		it('parses Axis credit card SMS', () => {
			const sms =
				'Transaction of Rs.1500.00 done on Axis Bank Credit Card no. XX1234 at Amazon India on 01-03-25';
			const result = parseSMS(sms);
			expect(result).not.toBeNull();
			expect(result!.amount).toBe(150000);
			expect(result!.creditCard).toBe('axis');
			expect(result!.paymentMethod).toBe('credit_card');
			expect(result!.merchant).toBe('Amazon India');
		});
	});

	describe('HDFC CC', () => {
		it('parses HDFC credit card SMS', () => {
			const sms =
				'HDFC Bank Credit Card xx5678 has been used for Rs.2,500 at Flipkart on 01-03-25';
			const result = parseSMS(sms);
			expect(result).not.toBeNull();
			expect(result!.amount).toBe(250000);
			expect(result!.creditCard).toBe('hdfc');
			expect(result!.paymentMethod).toBe('credit_card');
			expect(result!.merchant).toBe('Flipkart');
		});
	});

	describe('ICICI CC', () => {
		it('parses ICICI credit card SMS', () => {
			const sms =
				'ICICI Bank Credit Card XX9876 has been used for a transaction of INR 899.00 at Netflix on 01-03-25';
			const result = parseSMS(sms);
			expect(result).not.toBeNull();
			expect(result!.amount).toBe(89900);
			expect(result!.creditCard).toBe('icici');
			expect(result!.paymentMethod).toBe('credit_card');
			expect(result!.merchant).toBe('Netflix');
		});

		it('parses ICICI CC with Rs prefix', () => {
			const sms =
				'ICICI Bank Credit Card XX1111 has been used for Rs.450 at Zomato on 01-03-25';
			const result = parseSMS(sms);
			expect(result).not.toBeNull();
			expect(result!.amount).toBe(45000);
		});
	});

	describe('Edge cases', () => {
		it('returns null for non-matching text', () => {
			expect(parseSMS('Hello world')).toBeNull();
		});

		it('returns null for empty string', () => {
			expect(parseSMS('')).toBeNull();
		});

		it('detects CC bill payment', () => {
			const sms =
				'Rs.15000 debited from a/c **1234 to HDFC Credit Card bill payment on 01-03-25. Ref: 333';
			const result = parseSMS(sms);
			expect(result).not.toBeNull();
			expect(result!.isCCBillPayment).toBe(true);
			expect(result!.paymentMethod).toBe('cc_bill_payment');
		});

		it('handles large amounts', () => {
			const sms =
				'Rs.1,50,000.00 debited from a/c **1234 to VPA builder@upi on 01-03-25. UPI Ref: 444';
			const result = parseSMS(sms);
			expect(result).not.toBeNull();
			expect(result!.amount).toBe(15000000);
		});

		it('cleans UPI handle from merchant', () => {
			const sms =
				'Rs.100 debited from a/c **1234 to VPA merchant@ybl on 01-03-25. UPI Ref: 555';
			const result = parseSMS(sms);
			expect(result).not.toBeNull();
			expect(result!.merchant).not.toContain('@ybl');
		});

		it('sets source to clipboard', () => {
			const sms =
				'Rs.100 debited from a/c **1234 to VPA test@upi on 01-03-25. UPI Ref: 666';
			const result = parseSMS(sms);
			expect(result?.source).toBe('clipboard');
		});

		it('has high confidence', () => {
			const sms =
				'Rs.100 debited from a/c **1234 to VPA test@upi on 01-03-25. UPI Ref: 777';
			const result = parseSMS(sms);
			expect(result?.confidence).toBeGreaterThanOrEqual(0.8);
		});
	});
});
