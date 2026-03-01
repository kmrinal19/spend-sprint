<script lang="ts">
	import { getTheme, setTheme } from '$lib/stores/settings.svelte.js';

	let currentTheme = $derived(getTheme());

	const options: { value: 'light' | 'dark' | 'system'; label: string; icon: string }[] = [
		{ value: 'light', label: 'Light', icon: '☀️' },
		{ value: 'dark', label: 'Dark', icon: '🌙' },
		{ value: 'system', label: 'System', icon: '📱' }
	];
</script>

<div>
	<span class="text-sm font-medium text-(--app-text)">Theme</span>
	<div class="mt-2 flex gap-2">
		{#each options as opt (opt.value)}
			<button
				class="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium tap-transparent transition-colors
					{currentTheme === opt.value
					? 'bg-primary text-white'
					: 'bg-(--app-input-bg) text-(--app-text-secondary) active:bg-(--app-border)'}"
				onclick={() => setTheme(opt.value)}
			>
				<span>{opt.icon}</span>
				<span>{opt.label}</span>
			</button>
		{/each}
	</div>
</div>
