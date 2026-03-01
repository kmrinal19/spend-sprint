export async function readClipboard(): Promise<string | null> {
	try {
		// Must be called from a user gesture (click/tap handler)
		const text = await navigator.clipboard.readText();
		return text.trim() || null;
	} catch {
		// NotAllowedError (no permission) or DataError (no text)
		return null;
	}
}
