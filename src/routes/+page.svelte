<script lang="ts">
	import { onMount } from 'svelte';
	import { formatCurrency } from '$lib/utils/currency.js';
	import { getMonthlyTotal, getTodayTotal, getCurrentMonth } from '$lib/stores/expenses.svelte.js';
	import { initExpenseStore } from '$lib/stores/expenses.svelte.js';
	import { initCategoryStore } from '$lib/stores/categories.svelte.js';
	import { initSettings } from '$lib/stores/settings.svelte.js';
	import { processRecurringExpenses } from '$lib/db/recurring.js';
	import { getBudgetStatus } from '$lib/db/budgets.js';
	import ExpenseFeed from '$lib/components/expense/ExpenseFeed.svelte';
	import UnifiedInput from '$lib/components/input/UnifiedInput.svelte';
	import SettingsPanel from '$lib/components/settings/SettingsPanel.svelte';
	import Dashboard from '$lib/components/dashboard/Dashboard.svelte';
	import Banner from '$lib/components/ui/Banner.svelte';

	initCategoryStore();
	initExpenseStore();
	initSettings();

	let settingsOpen = $state(false);
	let dashboardOpen = $state(false);
	let bannerMessage = $state<string | null>(null);
	let bannerType = $state<'info' | 'warning' | 'success'>('info');

	let monthlyTotal = $derived(getMonthlyTotal());
	let todayTotal = $derived(getTodayTotal());
	let currentMonth = $derived(getCurrentMonth());

	const MONTH_NAMES = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];
	const MONTH_NAMES_SHORT = [
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	];

	function handleExpenseAdded(date: string) {
		const expMonth = parseInt(date.slice(5, 7), 10);
		const cm = getCurrentMonth();
		if (expMonth !== cm.month) {
			bannerMessage = `Added to ${MONTH_NAMES[expMonth - 1]}`;
			bannerType = 'info';
		}
	}

	onMount(async () => {
		// Process recurring expenses on app open
		const created = await processRecurringExpenses();
		if (created > 0) {
			bannerMessage = `Added ${created} recurring expense${created > 1 ? 's' : ''}`;
			bannerType = 'info';
		}

		// Check budget alerts
		const now = new Date();
		const statuses = await getBudgetStatus(now.getFullYear(), now.getMonth() + 1);
		const overBudget = statuses.filter((s) => s.isOver);
		const warning = statuses.filter((s) => s.isWarning);

		if (overBudget.length > 0) {
			bannerMessage = `Budget exceeded for ${overBudget.length} categor${overBudget.length > 1 ? 'ies' : 'y'}!`;
			bannerType = 'warning';
		} else if (warning.length > 0 && !bannerMessage) {
			bannerMessage = `Approaching budget limit for ${warning.length} categor${warning.length > 1 ? 'ies' : 'y'}`;
			bannerType = 'warning';
		}
	});
</script>

<div class="flex flex-1 flex-col">
	<!-- Header -->
	<header class="flex items-center justify-between px-4 py-3">
		<h1 class="text-lg font-bold text-(--app-text)">SpendSprint</h1>
		<button
			class="flex min-h-11 min-w-11 items-center justify-center rounded-xl tap-transparent active:bg-(--app-input-bg)"
			aria-label="Settings"
			onclick={() => (settingsOpen = true)}
		>
			⚙️
		</button>
	</header>

	<!-- Banner -->
	{#if bannerMessage}
		<Banner message={bannerMessage} type={bannerType} visible={true} />
	{/if}

	<!-- Summary Bar (tap to open dashboard) -->
	<button
		class="mx-4 mt-2 w-auto rounded-2xl bg-(--app-card) p-4 shadow-sm ring-1 ring-(--app-border) text-left tap-transparent active:bg-(--app-input-bg) transition-colors"
		onclick={() => (dashboardOpen = true)}
	>
		<div class="flex items-baseline justify-between">
			<div>
				<div class="text-xs text-(--app-text-secondary) uppercase">
					Spent in {MONTH_NAMES_SHORT[currentMonth.month - 1]} {currentMonth.year}
				</div>
				<div class="text-2xl font-bold text-(--app-text)">
					{formatCurrency(monthlyTotal)}
				</div>
			</div>
			<div class="text-right">
				<div class="text-xs text-(--app-text-secondary)">Today</div>
				<div class="text-lg font-semibold text-(--app-text)">
					{formatCurrency(todayTotal)}
				</div>
			</div>
		</div>
	</button>

	<!-- Expense Feed -->
	<ExpenseFeed />

	<!-- Unified Input -->
	<UnifiedInput onexpenseadded={handleExpenseAdded} />
</div>

<!-- Dashboard -->
<Dashboard open={dashboardOpen} onclose={() => (dashboardOpen = false)} />

<!-- Settings Panel -->
<SettingsPanel open={settingsOpen} onclose={() => (settingsOpen = false)} />
