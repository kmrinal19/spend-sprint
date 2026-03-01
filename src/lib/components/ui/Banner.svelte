<script lang="ts">
	import { fade } from 'svelte/transition';

	let {
		message,
		type = 'info',
		visible = true,
		autodismiss = 3000
	}: {
		message: string;
		type?: 'info' | 'warning' | 'success';
		visible: boolean;
		autodismiss?: number;
	} = $props();

	const colors = {
		info: 'bg-primary/10 text-primary ring-primary/20',
		warning: 'bg-warning/10 text-warning ring-warning/20',
		success: 'bg-income/10 text-income ring-income/20'
	};

	$effect(() => {
		if (!visible || autodismiss <= 0) return;
		const timer = setTimeout(() => {
			visible = false;
		}, autodismiss);
		return () => clearTimeout(timer);
	});
</script>

{#if visible}
	<div
		class="mx-4 mt-2 rounded-xl px-4 py-2.5 text-sm font-medium ring-1 {colors[type]}"
		transition:fade={{ duration: 200 }}
	>
		{message}
	</div>
{/if}
