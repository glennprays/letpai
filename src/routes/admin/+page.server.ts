import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	adminLogout,
	getWhatsAppStatus,
	listAdmins,
	type AdminListItem,
	type WhatsAppStatus
} from '$lib/services/admin';

// Best-effort sidecar data for the dashboard cards. The layout already
// validated the token + loaded the profile, so we only fetch the extras
// here and tolerate failures (the cards degrade gracefully).
export const load: PageServerLoad = async ({ cookies, fetch, parent }) => {
	const token = cookies.get('admin_token');
	if (!token) throw redirect(303, '/admin/login');

	const { profile } = await parent();
	const isSuperAdmin = profile?.role === 'super_admin';

	const [status, admins] = await Promise.all([
		getWhatsAppStatus(fetch, token).catch((err): WhatsAppStatus | null => {
			console.warn('[admin dashboard] status load failed:', err);
			return null;
		}),
		isSuperAdmin
			? listAdmins(fetch, token)
					.then((r) => r.admins as AdminListItem[])
					.catch((err): AdminListItem[] | null => {
						console.warn('[admin dashboard] admin list failed:', err);
						return null;
					})
			: Promise.resolve(null)
	]);

	return {
		status,
		admins
	};
};

export const actions: Actions = {
	logout: async ({ cookies, fetch }) => {
		const token = cookies.get('admin_token');
		if (token) {
			try {
				await adminLogout(fetch, token);
			} catch (err) {
				console.warn('[admin dashboard] logout call failed:', err);
			}
		}
		cookies.delete('admin_token', { path: '/' });
		throw redirect(303, '/admin/login');
	}
};

// Quiet unused-import errors when fail is referenced indirectly.
void fail;
