<script lang="ts">
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import CategoryManager from './CategoryManager.svelte';
	import RecurringManager from './RecurringManager.svelte';
	import DataManager from './DataManager.svelte';

	let {
		open,
		onclose
	}: {
		open: boolean;
		onclose: () => void;
	} = $props();
</script>

<BottomSheet {open} {onclose}>
	<div class="space-y-6">
		<h2 class="text-lg font-bold text-(--app-text)">Settings</h2>

		<ThemeToggle />

		<div class="h-px bg-(--app-border)"></div>

		<CategoryManager />

		<div class="h-px bg-(--app-border)"></div>

		<RecurringManager />

		<div class="h-px bg-(--app-border)"></div>

		<DataManager />
	</div>
</BottomSheet>
