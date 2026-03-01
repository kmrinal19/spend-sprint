import { liveQuery } from 'dexie';
import { db } from '$lib/db/index.js';
import type { Category } from '$lib/types/index.js';

let categories = $state<Category[]>([]);

export function initCategoryStore() {
	$effect(() => {
		const sub = liveQuery(() => db.categories.orderBy('sortOrder').toArray()).subscribe(
			(result) => {
				categories = result;
			}
		);
		return () => sub.unsubscribe();
	});
}

export function getCategories(): Category[] {
	return categories;
}

export function getCategoryById(id: number): Category | undefined {
	return categories.find((c) => c.id === id);
}
