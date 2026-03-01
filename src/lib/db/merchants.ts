import { db } from './index.js';

export async function getMerchantCategory(merchant: string): Promise<number | null> {
	const keyword = merchant.toLowerCase().trim();
	const mapping = await db.merchants.where('merchantKeyword').equals(keyword).first();
	return mapping?.categoryId ?? null;
}

export async function updateMerchantMapping(
	merchant: string,
	categoryId: number,
	displayName?: string
): Promise<void> {
	const keyword = merchant.toLowerCase().trim();
	const existing = await db.merchants.where('merchantKeyword').equals(keyword).first();

	if (existing?.id !== undefined) {
		await db.merchants.update(existing.id, {
			categoryId,
			usageCount: existing.usageCount + 1,
			...(displayName !== undefined ? { displayName } : {})
		});
	} else {
		await db.merchants.add({
			merchantKeyword: keyword,
			categoryId,
			displayName: displayName ?? merchant,
			usageCount: 1
		});
	}
}
