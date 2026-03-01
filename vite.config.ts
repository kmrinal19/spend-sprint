import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vitest/config';
import { createLogger } from 'vite';

const logger = createLogger();
const originalWarn = logger.warn.bind(logger);
logger.warn = (msg, options) => {
	if (typeof msg === 'string' && msg.includes('liveQuery')) return;
	originalWarn(msg, options);
};

export default defineConfig({
	customLogger: logger,
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			strategies: 'generateSW',
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
				runtimeCaching: [],
				cleanupOutdatedCaches: true,
				skipWaiting: true,
				clientsClaim: true,
				navigateFallback: '404.html'
			},
			manifest: false,
			devOptions: {
				enabled: true,
				type: 'module'
			}
		})
	],
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'happy-dom',
		setupFiles: ['src/test-setup.ts']
	}
});
