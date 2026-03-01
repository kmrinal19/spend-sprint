import { describe, it, expect } from 'vitest';
import {
	today,
	yesterday,
	formatDate,
	formatDateRelative,
	getMonthRange,
	parseDateString,
	getNextDueDate
} from '../date.js';

describe('today', () => {
	it('returns YYYY-MM-DD format', () => {
		expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
});

describe('yesterday', () => {
	it('returns the day before today', () => {
		const y = yesterday();
		const d = new Date(y + 'T00:00:00');
		const t = new Date(today() + 'T00:00:00');
		expect(t.getTime() - d.getTime()).toBe(86400000);
	});
});

describe('formatDate', () => {
	it('formats Date to YYYY-MM-DD', () => {
		expect(formatDate(new Date(2025, 2, 5))).toBe('2025-03-05');
	});

	it('pads single digit months and days', () => {
		expect(formatDate(new Date(2025, 0, 1))).toBe('2025-01-01');
	});
});

describe('formatDateRelative', () => {
	it('returns "Today" for today', () => {
		expect(formatDateRelative(today())).toBe('Today');
	});

	it('returns "Yesterday" for yesterday', () => {
		expect(formatDateRelative(yesterday())).toBe('Yesterday');
	});

	it('returns formatted date for other days', () => {
		const result = formatDateRelative('2025-01-15');
		expect(result).toContain('15');
		expect(result).toContain('Jan');
	});
});

describe('getMonthRange', () => {
	it('returns correct start and end for March 2025', () => {
		const range = getMonthRange(2025, 3);
		expect(range.start).toBe('2025-03-01');
		expect(range.end).toBe('2025-03-31');
	});

	it('handles February correctly', () => {
		const range = getMonthRange(2024, 2);
		expect(range.end).toBe('2024-02-29'); // leap year
	});
});

describe('parseDateString', () => {
	it('parses "today"', () => {
		expect(parseDateString('today')).toBe(today());
	});

	it('parses "yesterday"', () => {
		expect(parseDateString('yesterday')).toBe(yesterday());
	});

	it('parses DD/MM/YYYY', () => {
		expect(parseDateString('15/03/2025')).toBe('2025-03-15');
	});

	it('parses DD-MM-YYYY', () => {
		expect(parseDateString('01-01-2025')).toBe('2025-01-01');
	});

	it('parses "5th march"', () => {
		const result = parseDateString('5th march');
		expect(result).toMatch(/^\d{4}-03-05$/);
	});

	it('parses "march 5"', () => {
		const result = parseDateString('march 5');
		expect(result).toMatch(/^\d{4}-03-05$/);
	});

	it('returns null for unparseable strings', () => {
		expect(parseDateString('foobar')).toBeNull();
	});
});

describe('getNextDueDate', () => {
	it('adds 1 day for daily', () => {
		expect(getNextDueDate('2025-03-01', 'daily')).toBe('2025-03-02');
	});

	it('adds 7 days for weekly', () => {
		expect(getNextDueDate('2025-03-01', 'weekly')).toBe('2025-03-08');
	});

	it('adds 1 month for monthly', () => {
		expect(getNextDueDate('2025-03-01', 'monthly')).toBe('2025-04-01');
	});

	it('adds 1 year for yearly', () => {
		expect(getNextDueDate('2025-03-01', 'yearly')).toBe('2026-03-01');
	});
});
