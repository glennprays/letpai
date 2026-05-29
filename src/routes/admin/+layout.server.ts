import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getAdminProfile } from '$lib/services/admin';

// All routes under /admin require an admin token except /admin/login
// itself. The shared shell (+layout.svelte) consumes the profile so
// every protected page can render the header without an extra round
// trip.
export const load: LayoutServerLoad = async ({ cookies, fetch, url }) => {
	if (url.pathname === '/admin/login' || url.pathname === '/admin/setup') {
		return { profile: null };
	}

	const token = cookies.get('admin_token');
	if (!token) {
		throw redirect(303, '/admin/login');
	}

	try {
		const profile = await getAdminProfile(fetch, token);
		return { profile };
	} catch (err) {
		console.warn('[admin layout] profile load failed:', err);
		cookies.delete('admin_token', { path: '/' });
		throw redirect(303, '/admin/login');
	}
};
