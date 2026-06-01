import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/**
 * SSR gate for authenticated app routes:
 *  - Unauthenticated users get bounced to /login.
 *  - Authenticated users with no full_name on file get bounced to /profile
 *    (except when they're already there) so they complete their profile
 *    before doing anything else. Doing this server-side avoids the brief
 *    client-side flash a $effect-based redirect would produce.
 */
export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const token = cookies.get('token');
	if (!token) {
		throw redirect(303, `/login?return=${encodeURIComponent(url.pathname)}`);
	}

	const userCookie = cookies.get('user');
	if (!userCookie) return {};

	let user: { full_name?: string } | null = null;
	try {
		user = JSON.parse(userCookie);
	} catch {
		return {};
	}

	if (user && !user.full_name && url.pathname !== '/profile') {
		throw redirect(303, '/profile');
	}

	return {};
};
