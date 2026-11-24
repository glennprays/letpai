import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Browser config, read from the container environment on every request.
// Served by the app (not a static file) so it can't go stale: static files
// get precompressed at build time and cached by the CDN, which is how an
// empty runtime-env.js once reached every browser.
export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/env.js') {
		const config = { VITE_API_URL: env.VITE_API_URL || 'http://localhost:3000/api/v1' };
		return new Response(`window.__env__ = ${JSON.stringify(config)};\n`, {
			headers: {
				'content-type': 'text/javascript; charset=utf-8',
				'cache-control': 'no-store'
			}
		});
	}
	return resolve(event);
};
