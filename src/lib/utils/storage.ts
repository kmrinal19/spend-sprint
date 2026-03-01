import { db } from '$lib/db/index.js';

export async function requestPersistentStorage(): Promise<boolean> {
	if (navigator.storage?.persist) {
		return await navigator.storage.persist();
	}
	return false;
}

export async function checkStorageEviction(): Promise<boolean> {
	// If we had categories before but now they're gone, data was likely evicted
	try {
		const count = await db.categories.count();
		const hasInitialized = localStorage.getItem('spendsprint-initialized');
		if (hasInitialized && count === 0) {
			return true; // Eviction detected
		}
		if (count > 0) {
			localStorage.setItem('spendsprint-initialized', 'true');
		}
	} catch {
		// DB access failed
	}
	return false;
}

export async function getStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
	if (navigator.storage?.estimate) {
		const est = await navigator.storage.estimate();
		return {
			usage: est.usage ?? 0,
			quota: est.quota ?? 0
		};
	}
	return null;
}
