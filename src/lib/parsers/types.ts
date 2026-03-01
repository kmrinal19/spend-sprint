export type InputType = 'sms' | 'natural_language' | 'bare_number';

export interface SMSRegexTemplate {
	bank: string;
	pattern: RegExp;
}
