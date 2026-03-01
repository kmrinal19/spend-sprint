<script lang="ts">
	let {
		checked = false,
		onchange,
		label
	}: {
		checked: boolean;
		onchange: (value: boolean) => void;
		label?: string;
	} = $props();
</script>

<label class="flex min-h-11 items-center justify-between gap-3 tap-transparent">
	{#if label}
		<span class="text-sm text-(--app-text)">{label}</span>
	{/if}
	<button
		role="switch"
		aria-checked={checked}
		aria-label={label ?? 'Toggle'}
		class="relative h-7 w-12 rounded-full transition-colors {checked
			? 'bg-primary'
			: 'bg-(--app-border)'}"
		onclick={() => onchange(!checked)}
	>
		<span
			class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform {checked
				? 'translate-x-5'
				: ''}"
		></span>
	</button>
</label>
