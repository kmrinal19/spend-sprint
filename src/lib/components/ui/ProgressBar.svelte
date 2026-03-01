<script lang="ts">
	let {
		value = 0,
		max = 100,
		warningAt = 80,
		dangerAt = 100
	}: {
		value: number;
		max: number;
		warningAt?: number;
		dangerAt?: number;
	} = $props();

	let percentage = $derived(max > 0 ? (value / max) * 100 : 0);

	let colorClass = $derived(
		percentage >= dangerAt ? 'bg-danger' : percentage >= warningAt ? 'bg-warning' : 'bg-income'
	);
</script>

<div class="h-2 overflow-hidden rounded-full bg-(--app-input-bg)">
	<div
		class="h-full rounded-full transition-all duration-500 {colorClass}"
		style="width: {Math.min(percentage, 100)}%"
	></div>
</div>
