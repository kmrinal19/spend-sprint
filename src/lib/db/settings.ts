import { db } from './index.js';
import type { AppSettings } from '$lib/types/index.js';

export async function getSetting<T = unknown>(key: string): Promise<T | undefined> {
	const row = await db.settings.get(key);
	return row?.value as T | undefined;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
	await db.settings.put({ key, value });
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
	const rows = await db.settings.toArray();
	const result: Record<string, unknown> = {};
	for (const row of rows) {
		result[row.key] = row.value;
	}
	return result;
}

export async function deleteSetting(key: string): Promise<void> {
	await db.settings.delete(key);
}
