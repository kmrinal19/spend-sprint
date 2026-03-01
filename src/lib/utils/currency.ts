export function formatCurrency(paise: number): string {
	const rupees = paise / 100;
	return '₹' + rupees.toLocaleString('en-IN', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}

export function parseAmount(input: string): number | null {
	// Remove currency symbols and whitespace
	const cleaned = input.replace(/[₹$,\s]/g, '').replace(/^(rs\.?|inr)\s*/i, '');
	const num = parseFloat(cleaned);
	if (isNaN(num) || !isFinite(num) || num < 0) return null;
	return Math.round(num * 100);
}
