import { db } from '$lib/db/index.js';

export async function exportToJSON(): Promise<string> {
	const [expenses, categories, recurring, budgets, merchants, smsTemplates, settings] =
		await Promise.all([
			db.expenses.toArray(),
			db.categories.toArray(),
			db.recurring.toArray(),
			db.budgets.toArray(),
			db.merchants.toArray(),
			db.smsTemplates.toArray(),
			db.settings.toArray()
		]);

	return JSON.stringify(
		{
			version: 1,
			exportedAt: new Date().toISOString(),
			data: { expenses, categories, recurring, budgets, merchants, smsTemplates, settings }
		},
		null,
		2
	);
}

export async function exportToCSV(): Promise<string> {
	const expenses = await db.expenses.toArray();
	const categories = await db.categories.toArray();
	const catMap = new Map(categories.map((c) => [c.id, c.name]));

	const headers = ['Date', 'Amount', 'Type', 'Category', 'Merchant', 'Payment Method', 'Tags', 'Note'];
	const rows = expenses.map((e) => [
		e.date,
		String(e.amount),
		e.type,
		catMap.get(e.category) ?? '',
		e.merchant,
		e.paymentMethod,
		e.tags.join(';'),
		e.note
	]);

	return [headers, ...rows].map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
