import { db } from './index.js';
import { now } from '$lib/utils/date.js';
import type { Category, NewCategory } from '$lib/types/index.js';

export async function getAllCategories(): Promise<Category[]> {
	return await db.categories.orderBy('sortOrder').toArray();
}

export async function getCategoryById(id: number): Promise<Category | undefined> {
	return await db.categories.get(id);
}

export async function addCategory(data: NewCategory): Promise<number> {
	return await db.categories.add({
		...data,
		createdAt: now()
	});
}

export async function updateCategory(
	id: number,
	patch: Partial<Omit<Category, 'id' | 'createdAt'>>
): Promise<void> {
	await db.categories.update(id, patch);
}

export async function deleteCategory(id: number): Promise<void> {
	await db.categories.delete(id);
}

export async function reorderCategories(orderedIds: number[]): Promise<void> {
	await db.transaction('rw', db.categories, async () => {
		for (let i = 0; i < orderedIds.length; i++) {
			await db.categories.update(orderedIds[i]!, { sortOrder: i });
		}
	});
}
