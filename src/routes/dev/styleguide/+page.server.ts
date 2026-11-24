import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Living styleguide. Available in `vite dev`, and in a production build only
// when LETPAI_STYLEGUIDE=1 (set by the Playwright web server for screenshots).
export const load: PageServerLoad = () => {
	if (!dev && env.LETPAI_STYLEGUIDE !== '1') throw error(404, 'Not found');
	return {};
};
