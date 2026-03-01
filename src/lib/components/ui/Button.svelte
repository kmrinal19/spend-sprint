<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		onclick,
		children
	}: {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	} = $props();

	const baseClasses =
		'inline-flex items-center justify-center font-medium rounded-xl tap-transparent transition-colors active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

	const variantClasses = {
		primary: 'bg-primary text-white active:bg-primary/80',
		secondary: 'bg-(--app-input-bg) text-(--app-text) active:bg-(--app-border)',
		ghost: 'text-(--app-text-secondary) active:bg-(--app-input-bg)',
		danger: 'bg-danger text-white active:bg-danger/80'
	};

	const sizeClasses = {
		sm: 'min-h-9 min-w-9 px-3 text-sm',
		md: 'min-h-11 min-w-11 px-4 text-base',
		lg: 'min-h-12 min-w-12 px-6 text-lg'
	};
</script>

<button
	class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]}"
	{disabled}
	{onclick}
>
	{@render children()}
</button>
