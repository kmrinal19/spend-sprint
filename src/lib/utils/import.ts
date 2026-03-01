import { db } from '$lib/db/index.js';

interface ExportedData {
	version: number;
	data: {
		expenses: unknown[];
		categories: unknown[];
		recurring: unknown[];
		budgets: unknown[];
		merchants: unknown[];
		smsTemplates: unknown[];
		settings: unknown[];
	};
}

export async function importFromJSON(jsonString: string): Promise<{ count: number }> {
	const parsed = JSON.parse(jsonString) as ExportedData;
	if (parsed.version !== 1) throw new Error('Unsupported export version');

	const { data } = parsed;
	let count = 0;

	await db.transaction(
		'rw',
		[db.expenses, db.categories, db.recurring, db.budgets, db.merchants, db.smsTemplates, db.settings],
		async () => {
			await db.expenses.clear();
			await db.categories.clear();
			await db.recurring.clear();
			await db.budgets.clear();
			await db.merchants.clear();
			await db.smsTemplates.clear();
			await db.settings.clear();

			if (data.categories?.length) {
				await db.categories.bulkAdd(data.categories as never[]);
				count += data.categories.length;
			}
			if (data.expenses?.length) {
				await db.expenses.bulkAdd(data.expenses as never[]);
				count += data.expenses.length;
			}
			if (data.recurring?.length) {
				await db.recurring.bulkAdd(data.recurring as never[]);
			}
			if (data.budgets?.length) {
				await db.budgets.bulkAdd(data.budgets as never[]);
			}
			if (data.merchants?.length) {
				await db.merchants.bulkAdd(data.merchants as never[]);
			}
			if (data.smsTemplates?.length) {
				await db.smsTemplates.bulkAdd(data.smsTemplates as never[]);
			}
			if (data.settings?.length) {
				await db.settings.bulkAdd(data.settings as never[]);
			}
		}
	);

	return { count };
}

export async function clearAllData(): Promise<void> {
	await db.transaction(
		'rw',
		[db.expenses, db.categories, db.recurring, db.budgets, db.merchants, db.smsTemplates, db.settings],
		async () => {
			await db.expenses.clear();
			await db.categories.clear();
			await db.recurring.clear();
			await db.budgets.clear();
			await db.merchants.clear();
			await db.smsTemplates.clear();
			await db.settings.clear();
		}
	);
}
