import type { ParsedExpense } from '$lib/types/index.js';
import { getMerchantCategory } from '$lib/db/merchants.js';

export async function enrichParsedExpense(parsed: ParsedExpense): Promise<ParsedExpense> {
	if (parsed.merchant && parsed.category === null) {
		const categoryId = await getMerchantCategory(parsed.merchant);
		if (categoryId !== null) {
			return { ...parsed, category: categoryId, confidence: Math.min(parsed.confidence + 0.1, 1) };
		}
	}
	return parsed;
}
