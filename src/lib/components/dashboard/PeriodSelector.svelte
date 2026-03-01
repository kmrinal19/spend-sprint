<script lang="ts">
	type Period = 'today' | 'week' | 'month';

	let {
		selected = 'month' as Period,
		onselect
	}: {
		selected?: Period;
		onselect: (period: Period) => void;
	} = $props();

	const periods: { value: Period; label: string }[] = [
		{ value: 'today', label: 'Today' },
		{ value: 'week', label: 'Week' },
		{ value: 'month', label: 'Month' }
	];
</script>

<div class="flex gap-1 rounded-xl bg-(--app-input-bg) p-1">
	{#each periods as p (p.value)}
		<button
			class="flex-1 rounded-lg py-2 text-sm font-medium tap-transparent transition-colors
				{selected === p.value
				? 'bg-(--app-card) text-(--app-text) shadow-sm'
				: 'text-(--app-text-secondary)'}"
			onclick={() => onselect(p.value)}
		>
			{p.label}
		</button>
	{/each}
</div>
