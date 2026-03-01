<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	let {
		open = false,
		onclose,
		children
	}: {
		open: boolean;
		onclose: () => void;
		children: Snippet;
	} = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) onclose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-40 bg-black/40"
		transition:fade={{ duration: 200 }}
		onclick={onclose}
		role="button"
		tabindex="-1"
	></div>

	<!-- Sheet -->
	<div
		class="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-(--app-card) pb-safe shadow-xl"
		transition:fly={{ y: 300, duration: 300, easing: (t) => 1 - Math.pow(1 - t, 3) }}
		role="dialog"
	>
		<div class="sticky top-0 z-10 flex items-center justify-center bg-(--app-card) py-2">
			<div class="h-1 w-10 rounded-full bg-(--app-border)"></div>
			<button
				class="absolute right-3 top-1.5 flex h-8 w-8 items-center justify-center rounded-full text-(--app-text-secondary) tap-transparent active:bg-(--app-input-bg)"
				onclick={onclose}
				aria-label="Close"
			>
				✕
			</button>
		</div>
		<div class="px-4 pb-4">
			{@render children()}
		</div>
	</div>
{/if}
