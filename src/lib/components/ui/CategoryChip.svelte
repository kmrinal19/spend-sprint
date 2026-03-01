<script lang="ts">
	let {
		icon,
		name,
		color,
		selected = false,
		onclick
	}: {
		icon: string;
		name: string;
		color: string;
		selected?: boolean;
		onclick?: () => void;
	} = $props();
</script>

<button
	class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm tap-transparent transition-all active:scale-95 whitespace-nowrap
		{selected
		? 'ring-2 shadow-sm font-medium'
		: 'bg-(--app-input-bg) text-(--app-text-secondary)'}"
	style={selected ? `background-color: ${color}20; ring-color: ${color}; color: ${color}` : ''}
	{onclick}
>
	<span>{icon}</span>
	<span>{name}</span>
</button>
