<script lang="ts">
	import { exportToJSON, exportToCSV, downloadFile } from '$lib/utils/export.js';
	import { importFromJSON, clearAllData } from '$lib/utils/import.js';
	import { seedIfEmpty } from '$lib/db/seed.js';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

	let showClearConfirm = $state(false);
	let importStatus = $state<string | null>(null);
	let fileInput: HTMLInputElement | undefined = $state();

	async function handleExportJSON() {
		const json = await exportToJSON();
		const date = new Date().toISOString().slice(0, 10);
		downloadFile(json, `spendsprint-backup-${date}.json`, 'application/json');
	}

	async function handleExportCSV() {
		const csv = await exportToCSV();
		const date = new Date().toISOString().slice(0, 10);
		downloadFile(csv, `spendsprint-expenses-${date}.csv`, 'text/csv');
	}

	function handleImportClick() {
		fileInput?.click();
	}

	async function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			const result = await importFromJSON(text);
			importStatus = `Imported ${result.count} records`;
			setTimeout(() => (importStatus = null), 3000);
		} catch (err) {
			importStatus = `Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
			setTimeout(() => (importStatus = null), 5000);
		}

		input.value = '';
	}

	async function handleClear() {
		await clearAllData();
		await seedIfEmpty();
		showClearConfirm = false;
	}
</script>

<div class="space-y-3">
	<h3 class="text-sm font-semibold text-(--app-text)">Data</h3>

	<div class="space-y-2">
		<button
			class="flex min-h-11 w-full items-center gap-3 rounded-xl bg-(--app-input-bg) px-4 py-2.5 text-sm text-(--app-text) tap-transparent active:bg-(--app-border)"
			onclick={handleExportJSON}
		>
			<span>💾</span>
			<span>Export as JSON (full backup)</span>
		</button>

		<button
			class="flex min-h-11 w-full items-center gap-3 rounded-xl bg-(--app-input-bg) px-4 py-2.5 text-sm text-(--app-text) tap-transparent active:bg-(--app-border)"
			onclick={handleExportCSV}
		>
			<span>📊</span>
			<span>Export as CSV (expenses only)</span>
		</button>

		<button
			class="flex min-h-11 w-full items-center gap-3 rounded-xl bg-(--app-input-bg) px-4 py-2.5 text-sm text-(--app-text) tap-transparent active:bg-(--app-border)"
			onclick={handleImportClick}
		>
			<span>📥</span>
			<span>Import from JSON backup</span>
		</button>

		<input
			bind:this={fileInput}
			type="file"
			accept=".json"
			class="hidden"
			onchange={handleFileSelect}
		/>

		{#if importStatus}
			<div class="rounded-xl bg-primary/10 px-4 py-2 text-sm text-primary">
				{importStatus}
			</div>
		{/if}

		<button
			class="flex min-h-11 w-full items-center gap-3 rounded-xl bg-danger/10 px-4 py-2.5 text-sm text-danger tap-transparent active:bg-danger/20"
			onclick={() => (showClearConfirm = true)}
		>
			<span>⚠️</span>
			<span>Clear all data</span>
		</button>
	</div>
</div>

<ConfirmDialog
	open={showClearConfirm}
	title="Clear All Data"
	message="This will permanently delete all expenses, categories, and settings. This cannot be undone."
	confirmLabel="Clear Everything"
	onconfirm={handleClear}
	oncancel={() => (showClearConfirm = false)}
/>
