import type { InputType } from './types.js';

const SMS_INDICATORS = [
	/(?:debited|credited|spent|withdrawn|paid|received|cashback|refund)/i,
	/(?:Rs\.?|INR|₹)\s*[\d,]+/i,
	/(?:a\/c|account|card)\s*(?:no\.?|xx?|X|\*)/i,
	/(?:UPI|NEFT|IMPS|RTGS)\s*(?:ref|Ref)/i
];

const FAILED_INDICATORS = [/\b(?:failed|declined|unsuccessful|rejected|not\s+processed)\b/i];

export function detectInputType(text: string): InputType | null {
	const trimmed = text.trim();
	if (!trimmed) return null;

	// Check for failed transactions first
	for (const pattern of FAILED_INDICATORS) {
		if (pattern.test(trimmed)) return null;
	}

	// Check if it looks like an SMS (matches 2+ indicators)
	let smsScore = 0;
	for (const pattern of SMS_INDICATORS) {
		if (pattern.test(trimmed)) smsScore++;
	}
	if (smsScore >= 2) return 'sms';

	// Check if it's just a number
	if (/^\d+(\.\d{1,2})?$/.test(trimmed)) return 'bare_number';

	// Default to natural language if it contains a number
	if (/\d/.test(trimmed)) return 'natural_language';

	return null;
}
