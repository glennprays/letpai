import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		// SvelteKit owns the CSP so it can add nonces/hashes for its own inline
		// bootstrap script. The previous <meta> CSP in app.html had no hash, so
		// browsers blocked hydration and every page stayed non-interactive.
		// connect-src must include the deployed API origin (runtime-env.js
		// sets the URL at container startup; `https:` covers deployed APIs).
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'blob:', 'https:'],
				'font-src': ['self'],
				'connect-src': ['self', 'http://localhost:3000', 'http://127.0.0.1:3000', 'https:'],
				'upgrade-insecure-requests': true
			}
		}
	},
	vitePlugin: {
		dynamicCompileOptions: ({ filename }) =>
			filename.includes('node_modules') ? undefined : { runes: true }
	}
};

export default config;
