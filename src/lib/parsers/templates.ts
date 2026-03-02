import type { SMSRegexTemplate } from './types.js';

export const SMS_TEMPLATES: SMSRegexTemplate[] = [
	{
		bank: 'HDFC_CC',
		pattern:
			/HDFC\s+Bank\s+Credit\s+Card\s+xx?(?<account>\d{4})\s+has\s+been\s+used\s+for\s+Rs\.?\s?(?<amount>[\d,]+\.?\d*)\s+at\s+(?<merchant>[\w\s]+?)(?:\s+on)/i
	},
	{
		bank: 'HDFC',
		pattern:
			/Rs\.?\s?(?<amount>[\d,]+\.?\d*)\s+(?<type>debited|credited)\s+(?:from|to)\s+(?:your\s+)?a\/c\s+\*{0,2}(?<account>\d{4})(?:.*?(?:to|at|by)\s+(?:VPA\s+)?(?<merchant>[\w\s.@]+?)(?:\s*\(|\s+UPI|\s+on|\s+Ref|\s+bill|\s*$))?/i
	},
	{
		bank: 'SBI',
		pattern:
			/a\/c\s+X?(?<account>\d{4})\s+(?:is\s+)?(?<type>debited|credited)\s+by\s+Rs\.?\s?(?<amount>[\d,]+\.?\d*).*?transfer\s+to\s+(?<merchant>[\w\s]+?)(?:\s+Ref|\s*$)/i
	},
	{
		bank: 'UBI',
		pattern:
			/INR\s+(?<amount>[\d,]+\.?\d*)\s+(?<type>debited|credited)\s+from\s+A\/c\s+(?<account>\d+).*?Info:\s*(?:UPI\/\d+\/)?(?<merchant>[\w\s]+)/i
	},
	{
		bank: 'AXIS_CC',
		pattern:
			/Transaction\s+of\s+Rs\.?\s?(?<amount>[\d,]+\.?\d*)\s+done\s+on\s+Axis\s+Bank\s+Credit\s+Card\s+no\.\s*XX?(?<account>\d{4})\s+at\s+(?<merchant>[\w\s]+?)(?:\s+on)/i
	},
	{
		bank: 'ICICI_CC',
		pattern:
			/ICICI\s+Bank\s+Credit\s+Card\s+XX?(?<account>\d{4})\s+has\s+been\s+used\s+for\s+(?:a\s+transaction\s+of\s+)?(?:INR|Rs\.?)\s?(?<amount>[\d,]+\.?\d*).*?at\s+(?<merchant>[\w\s]+?)(?:\s+on\s+\d|\.\s|$)/i
	}
];
