export function now(): string {
	return new Date().toISOString();
}

export function today(): string {
	return formatDate(new Date());
}

export function yesterday(): string {
	const d = new Date();
	d.setDate(d.getDate() - 1);
	return formatDate(d);
}

export function formatDate(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function formatDateRelative(dateStr: string): string {
	const t = today();
	const y = yesterday();
	if (dateStr === t) return 'Today';
	if (dateStr === y) return 'Yesterday';
	const d = new Date(dateStr + 'T00:00:00');
	return d.toLocaleDateString('en-IN', {
		weekday: 'short',
		day: 'numeric',
		month: 'short'
	});
}

export function formatTime(isoString: string): string {
	return new Date(isoString).toLocaleTimeString('en-IN', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	});
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
	const start = `${year}-${String(month).padStart(2, '0')}-01`;
	const lastDay = new Date(year, month, 0).getDate();
	const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
	return { start, end };
}

export function parseDateString(input: string): string | null {
	const lower = input.toLowerCase().trim();

	if (lower === 'today') return today();
	if (lower === 'yesterday') return yesterday();

	// Try DD/MM/YYYY or DD-MM-YYYY
	const dmyMatch = lower.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);
	if (dmyMatch) {
		const [, d, m, y] = dmyMatch;
		return `${y}-${m!.padStart(2, '0')}-${d!.padStart(2, '0')}`;
	}

	// Try "5th March", "5 mar", etc.
	const months: Record<string, number> = {
		jan: 1, january: 1,
		feb: 2, february: 2,
		mar: 3, march: 3,
		apr: 4, april: 4,
		may: 5,
		jun: 6, june: 6,
		jul: 7, july: 7,
		aug: 8, august: 8,
		sep: 9, september: 9,
		oct: 10, october: 10,
		nov: 11, november: 11,
		dec: 12, december: 12
	};

	const monthMatch = lower.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+(\w+)$/);
	if (monthMatch) {
		const day = monthMatch[1]!;
		const monthName = monthMatch[2]!;
		const monthNum = months[monthName];
		if (monthNum !== undefined) {
			const year = new Date().getFullYear();
			return `${year}-${String(monthNum).padStart(2, '0')}-${day.padStart(2, '0')}`;
		}
	}

	// Try "march 5" or "mar 5th"
	const monthFirstMatch = lower.match(/^(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?$/);
	if (monthFirstMatch) {
		const monthName = monthFirstMatch[1]!;
		const day = monthFirstMatch[2]!;
		const monthNum = months[monthName];
		if (monthNum !== undefined) {
			const year = new Date().getFullYear();
			return `${year}-${String(monthNum).padStart(2, '0')}-${day.padStart(2, '0')}`;
		}
	}

	return null;
}

export function getNextDueDate(currentDate: string, frequency: string): string {
	const d = new Date(currentDate + 'T00:00:00');
	switch (frequency) {
		case 'daily':
			d.setDate(d.getDate() + 1);
			break;
		case 'weekly':
			d.setDate(d.getDate() + 7);
			break;
		case 'monthly':
			d.setMonth(d.getMonth() + 1);
			break;
		case 'yearly':
			d.setFullYear(d.getFullYear() + 1);
			break;
	}
	return formatDate(d);
}
