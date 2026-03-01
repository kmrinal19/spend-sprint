import { getSetting, setSetting } from '$lib/db/settings.js';

let theme = $state<'light' | 'dark' | 'system'>('system');

export async function initSettings() {
	const saved = await getSetting<string>('theme');
	if (saved === 'light' || saved === 'dark' || saved === 'system') {
		theme = saved;
	}
	applyTheme(theme);
}

export function getTheme() {
	return theme;
}

export async function setTheme(value: 'light' | 'dark' | 'system') {
	theme = value;
	await setSetting('theme', value);
	applyTheme(value);
}

function applyTheme(value: 'light' | 'dark' | 'system') {
	const isDark =
		value === 'dark' || (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
	document.documentElement.classList.toggle('dark', isDark);
	localStorage.setItem('spendsprint-theme', isDark ? 'dark' : 'light');
}
