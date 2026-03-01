<script lang="ts">
	import { fade } from 'svelte/transition';

	let {
		open = false,
		title,
		message,
		confirmLabel = 'Delete',
		onconfirm,
		oncancel
	}: {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		onconfirm: () => void;
		oncancel: () => void;
	} = $props();
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
		transition:fade={{ duration: 150 }}
		onclick={oncancel}
		onkeydown={(e) => e.key === 'Escape' && oncancel()}
		role="button"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<div
			class="w-full max-w-sm rounded-2xl bg-(--app-card) p-6 shadow-xl"
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
			role="dialog"
		>
			<h3 class="text-lg font-semibold text-(--app-text)">{title}</h3>
			<p class="mt-2 text-sm text-(--app-text-secondary)">{message}</p>
			<div class="mt-4 flex gap-2">
				<button
					class="flex-1 rounded-xl bg-(--app-input-bg) py-2.5 font-medium text-(--app-text) tap-transparent active:bg-(--app-border)"
					onclick={oncancel}
				>
					Cancel
				</button>
				<button
					class="flex-1 rounded-xl bg-danger py-2.5 font-medium text-white tap-transparent active:bg-danger/80"
					onclick={onconfirm}
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
