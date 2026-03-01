<script lang="ts">
	import { fade } from 'svelte/transition';

	let {
		visible,
		onproceed,
		ondismiss
	}: {
		visible: boolean;
		onproceed: () => void;
		ondismiss: () => void;
	} = $props();
</script>

{#if visible}
	<div
		class="mx-4 mb-2 flex items-center justify-between rounded-xl bg-warning/10 px-4 py-3 ring-1 ring-warning/30"
		transition:fade={{ duration: 150 }}
	>
		<div class="flex items-center gap-2 text-sm">
			<span>⚠️</span>
			<span class="text-warning font-medium">Looks like a duplicate</span>
		</div>
		<div class="flex gap-2">
			<button
				class="rounded-lg px-3 py-1 text-xs font-medium text-warning tap-transparent active:bg-warning/20"
				onclick={onproceed}
			>
				Add anyway
			</button>
			<button
				class="rounded-lg px-3 py-1 text-xs text-(--app-text-secondary) tap-transparent active:bg-(--app-input-bg)"
				onclick={ondismiss}
			>
				Skip
			</button>
		</div>
	</div>
{/if}
