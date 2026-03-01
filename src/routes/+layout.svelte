<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { seedIfEmpty } from '$lib/db/seed.js';
	import { initKeyboardHandler } from '$lib/utils/keyboard.js';
	import { requestPersistentStorage, checkStorageEviction } from '$lib/utils/storage.js';

	let { children } = $props();

	onMount(async () => {
		await seedIfEmpty();
		initKeyboardHandler();
		requestPersistentStorage();

		const evicted = await checkStorageEviction();
		if (evicted) {
			await seedIfEmpty();
		}
	});
</script>

<div class="flex min-h-dvh flex-col bg-(--app-bg) pt-safe px-safe">
	{@render children()}
</div>
