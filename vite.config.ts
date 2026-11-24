import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	build: {
		// Never inline fonts as data: URIs; the CSP only allows font-src 'self'.
		assetsInlineLimit: (file) => (/\.(woff2?|ttf|otf)$/.test(file) ? false : undefined)
	},
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts'],
		setupFiles: ['tests/unit/setup.ts']
	}
});
