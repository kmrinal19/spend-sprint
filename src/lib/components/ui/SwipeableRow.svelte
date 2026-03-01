<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		onswipeleft,
		children
	}: {
		onswipeleft?: () => void;
		children: Snippet;
	} = $props();

	let startX = $state(0);
	let deltaX = $state(0);
	let swiping = $state(false);

	function handleTouchStart(e: TouchEvent) {
		const touch = e.touches[0];
		if (!touch) return;
		startX = touch.clientX;
		deltaX = 0;
		swiping = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!swiping) return;
		const touch = e.touches[0];
		if (!touch) return;
		const dx = touch.clientX - startX;
		// Only allow left swipe
		deltaX = Math.min(0, dx);
	}

	function handleTouchEnd() {
		if (deltaX < -80) {
			onswipeleft?.();
		}
		deltaX = 0;
		swiping = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="relative overflow-hidden"
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
>
	<!-- Delete background -->
	{#if deltaX < -20}
		<div class="absolute inset-y-0 right-0 flex items-center bg-danger px-4 text-sm font-medium text-white">
			Delete
		</div>
	{/if}

	<!-- Content -->
	<div
		class="relative bg-(--app-bg) transition-transform {swiping ? '' : 'duration-200'}"
		style="transform: translateX({deltaX}px)"
	>
		{@render children()}
	</div>
</div>
