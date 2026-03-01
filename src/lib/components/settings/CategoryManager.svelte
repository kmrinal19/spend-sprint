<script lang="ts">
	import { getCategories } from '$lib/stores/categories.svelte.js';
	import { addCategory, updateCategory, deleteCategory } from '$lib/db/categories.js';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

	let categories = $derived(getCategories());

	let editingId = $state<number | null>(null);
	let editName = $state('');
	let editIcon = $state('');
	let editColor = $state('#78716c');
	let showAdd = $state(false);
	let deleteId = $state<number | null>(null);
	let nameError = $state<string | null>(null);

	function startEdit(id: number) {
		const cat = categories.find((c) => c.id === id);
		if (!cat) return;
		editingId = id;
		editName = cat.name;
		editIcon = cat.icon;
		editColor = cat.color;
		nameError = null;
	}

	function isDuplicateName(name: string, excludeId: number | null = null): boolean {
		return categories.some(
			(c) => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== excludeId
		);
	}

	async function saveEdit() {
		if (editingId === null || !editName.trim()) return;
		if (isDuplicateName(editName, editingId)) {
			nameError = 'A category with this name already exists';
			return;
		}
		nameError = null;
		await updateCategory(editingId, { name: editName.trim(), icon: editIcon, color: editColor });
		editingId = null;
	}

	function startAdd() {
		showAdd = true;
		editName = '';
		editIcon = '📌';
		editColor = '#78716c';
		nameError = null;
	}

	async function confirmAdd() {
		if (!editName.trim()) return;
		if (isDuplicateName(editName)) {
			nameError = 'A category with this name already exists';
			return;
		}
		nameError = null;
		const maxSort = categories.reduce((max, c) => Math.max(max, c.sortOrder), -1);
		await addCategory({
			name: editName.trim(),
			icon: editIcon,
			color: editColor,
			sortOrder: maxSort + 1,
			isDefault: false
		});
		showAdd = false;
	}

	async function confirmDelete() {
		if (deleteId !== null) {
			await deleteCategory(deleteId);
			deleteId = null;
		}
	}
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold text-(--app-text)">Categories</h3>
		<button
			class="rounded-lg px-3 py-1.5 text-sm font-medium text-primary tap-transparent active:bg-primary/10"
			onclick={startAdd}
		>
			+ Add
		</button>
	</div>

	{#if showAdd}
		<div class="flex items-center gap-2 rounded-xl bg-(--app-input-bg) p-3">
			<input
				type="text"
				bind:value={editIcon}
				class="h-9 w-12 rounded-lg bg-(--app-card) text-center text-lg outline-none"
				maxlength="2"
			/>
			<input
				type="text"
				bind:value={editName}
				class="h-9 flex-1 rounded-lg bg-(--app-card) px-3 text-sm outline-none text-(--app-text)"
				placeholder="Category name"
			/>
			<input
				type="color"
				bind:value={editColor}
				class="h-9 w-9 cursor-pointer rounded-lg"
			/>
			<button
				class="rounded-lg px-3 py-1.5 text-sm font-medium text-primary tap-transparent"
				onclick={confirmAdd}
			>
				Save
			</button>
			<button
				class="rounded-lg px-2 py-1.5 text-sm text-(--app-text-secondary) tap-transparent"
				onclick={() => (showAdd = false)}
			>
				✕
			</button>
		</div>
		{#if nameError && showAdd}
			<p class="text-xs text-danger px-3">{nameError}</p>
		{/if}
	{/if}

	<div class="space-y-1">
		{#each categories as cat (cat.id)}
			{#if editingId === cat.id}
				<div class="flex items-center gap-2 rounded-xl bg-(--app-input-bg) p-3">
					<input
						type="text"
						bind:value={editIcon}
						class="h-9 w-12 rounded-lg bg-(--app-card) text-center text-lg outline-none"
						maxlength="2"
					/>
					<input
						type="text"
						bind:value={editName}
						class="h-9 flex-1 rounded-lg bg-(--app-card) px-3 text-sm outline-none text-(--app-text)"
					/>
					<input
						type="color"
						bind:value={editColor}
						class="h-9 w-9 cursor-pointer rounded-lg"
					/>
					<button
						class="text-sm font-medium text-primary tap-transparent"
						onclick={saveEdit}
					>
						Save
					</button>
					<button
						class="text-sm text-(--app-text-secondary) tap-transparent"
						onclick={() => (editingId = null)}
					>
						✕
					</button>
				</div>
				{#if nameError && editingId === cat.id}
					<p class="text-xs text-danger px-3">{nameError}</p>
				{/if}
			{:else}
				<div class="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2">
					<span class="text-lg">{cat.icon}</span>
					<span class="flex-1 text-sm text-(--app-text)">{cat.name}</span>
					<div
						class="h-4 w-4 rounded-full"
						style="background-color: {cat.color}"
					></div>
					<button
						class="p-1 text-xs text-(--app-text-secondary) tap-transparent"
						onclick={() => cat.id !== undefined && startEdit(cat.id)}
					>
						✏️
					</button>
					{#if !cat.isDefault}
						<button
							class="p-1 text-xs text-danger tap-transparent"
							onclick={() => (deleteId = cat.id ?? null)}
						>
							🗑️
						</button>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
</div>

<ConfirmDialog
	open={deleteId !== null}
	title="Delete Category"
	message="Are you sure? Expenses using this category won't be deleted."
	onconfirm={confirmDelete}
	oncancel={() => (deleteId = null)}
/>
