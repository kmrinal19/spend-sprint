<script lang="ts">
	import type { DailySpend } from '$lib/stores/dashboard.svelte.js';
	import { formatCurrency } from '$lib/utils/currency.js';

	let { data }: { data: DailySpend[] } = $props();

	let width = 300;
	let height = 120;
	let padding = { top: 10, right: 10, bottom: 20, left: 10 };

	let isSinglePoint = $derived(data.length === 1);

	let singlePointCoords = $derived(() => {
		if (!isSinglePoint || data.length === 0) return { x: 0, y: 0 };
		const chartW = width - padding.left - padding.right;
		const chartH = height - padding.top - padding.bottom;
		return {
			x: padding.left + chartW / 2,
			y: padding.top + chartH / 2
		};
	});

	let points = $derived(() => {
		if (data.length <= 1) return '';
		const maxAmount = Math.max(...data.map((d) => d.amount), 1);
		const chartW = width - padding.left - padding.right;
		const chartH = height - padding.top - padding.bottom;

		return data
			.map((d, i) => {
				const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
				const y = padding.top + chartH - (d.amount / maxAmount) * chartH;
				return `${x},${y}`;
			})
			.join(' ');
	});

	let areaPath = $derived(() => {
		if (data.length <= 1) return '';
		const maxAmount = Math.max(...data.map((d) => d.amount), 1);
		const chartW = width - padding.left - padding.right;
		const chartH = height - padding.top - padding.bottom;
		const baseline = padding.top + chartH;

		const pts = data.map((d, i) => {
			const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
			const y = padding.top + chartH - (d.amount / maxAmount) * chartH;
			return { x, y };
		});

		let path = `M ${pts[0]!.x},${baseline}`;
		for (const p of pts) path += ` L ${p.x},${p.y}`;
		path += ` L ${pts[pts.length - 1]!.x},${baseline} Z`;
		return path;
	});
</script>

<div class="space-y-2">
	<h3 class="text-sm font-semibold text-(--app-text)">Spending Trend</h3>
	{#if data.length === 0}
		<p class="text-sm text-(--app-text-secondary)">No data to show.</p>
	{:else if isSinglePoint}
		<svg viewBox="0 0 {width} {height}" class="w-full">
			<circle
				cx={singlePointCoords().x}
				cy={singlePointCoords().y}
				r="5"
				fill="oklch(0.62 0.2 260)"
			/>
			<text
				x={singlePointCoords().x}
				y={singlePointCoords().y - 12}
				text-anchor="middle"
				fill="oklch(0.62 0.2 260)"
				font-size="12"
			>
				{formatCurrency(data[0]!.amount)}
			</text>
		</svg>
	{:else}
		<svg viewBox="0 0 {width} {height}" class="w-full">
			<defs>
				<linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="oklch(0.62 0.2 260)" stop-opacity="0.3" />
					<stop offset="100%" stop-color="oklch(0.62 0.2 260)" stop-opacity="0.02" />
				</linearGradient>
			</defs>
			<path d={areaPath()} fill="url(#trendGradient)" />
			<polyline
				points={points()}
				fill="none"
				stroke="oklch(0.62 0.2 260)"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	{/if}
</div>
