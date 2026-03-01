<script lang="ts">
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import PeriodSelector from './PeriodSelector.svelte';
	import CategoryBreakdown from './CategoryBreakdown.svelte';
	import SpendingTrend from './SpendingTrend.svelte';
	import BudgetProgress from './BudgetProgress.svelte';
	import TopMerchants from './TopMerchants.svelte';
	import CCOutstanding from './CCOutstanding.svelte';
	import {
		getCategoryBreakdown,
		getTopMerchants,
		getDailySpending,
		getCCOutstanding as fetchCCOutstanding
	} from '$lib/stores/dashboard.svelte.js';
	import type { CategorySpend, MerchantSpend, DailySpend, CCOutstandingItem } from '$lib/stores/dashboard.svelte.js';
	import { getBudgetStatus, type BudgetStatus } from '$lib/db/budgets.js';
	import { getCategories } from '$lib/stores/categories.svelte.js';
	import { today, formatDate } from '$lib/utils/date.js';
	import { formatCurrency } from '$lib/utils/currency.js';

	let {
		open,
		onclose
	}: {
		open: boolean;
		onclose: () => void;
	} = $props();

	type Period = 'today' | 'week' | 'month';
	let period = $state<Period>('month');

	let categoryData = $state<CategorySpend[]>([]);
	let merchantData = $state<MerchantSpend[]>([]);
	let trendData = $state<DailySpend[]>([]);
	let budgetData = $state<BudgetStatus[]>([]);
	let ccData = $state<CCOutstandingItem[]>([]);
	let totalSpend = $state(0);

	function getDateRange(p: Period): { start: string; end: string } {
		const now = new Date();
		const t = today();
		switch (p) {
			case 'today':
				return { start: t, end: t };
			case 'week': {
				const weekAgo = new Date(now);
				weekAgo.setDate(weekAgo.getDate() - 6);
				return { start: formatDate(weekAgo), end: t };
			}
			case 'month': {
				const y = now.getFullYear();
				const m = now.getMonth() + 1;
				const start = `${y}-${String(m).padStart(2, '0')}-01`;
				return { start, end: t };
			}
		}
	}

	async function loadData() {
		const { start, end } = getDateRange(period);
		const cats = getCategories();

		const [catBreakdown, merchants, daily, budgets, cc] = await Promise.all([
			getCategoryBreakdown(start, end, cats),
			getTopMerchants(start, end),
			getDailySpending(start, end),
			getBudgetStatus(new Date().getFullYear(), new Date().getMonth() + 1),
			fetchCCOutstanding()
		]);

		categoryData = catBreakdown;
		merchantData = merchants;
		trendData = daily;
		budgetData = budgets;
		ccData = cc;
		totalSpend = catBreakdown.reduce((s, c) => s + c.amount, 0);
	}

	$effect(() => {
		if (open) {
			loadData();
		}
	});

	// Reload when period changes while open
	$effect(() => {
		if (open) {
			// Access period to track it
			const _ = period;
			loadData();
		}
	});
</script>

<BottomSheet {open} {onclose}>
	<div class="space-y-5">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-bold text-(--app-text)">Dashboard — {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'}</h2>
			<span class="text-lg font-bold text-expense">{formatCurrency(totalSpend)}</span>
		</div>

		<PeriodSelector selected={period} onselect={(p) => (period = p)} />

		<CategoryBreakdown data={categoryData} />

		<SpendingTrend data={trendData} />

		<BudgetProgress budgets={budgetData} />

		<TopMerchants data={merchantData} />

		<CCOutstanding data={ccData} />
	</div>
</BottomSheet>
