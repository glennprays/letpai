import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import {
	adminLogout,
	getAdminProfile,
	getWhatsAppStatus,
	updateWhatsAppConfig,
	type AdminProfile,
	type WhatsAppStatus
} from '$lib/services/admin';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const token = cookies.get('admin_token');
	if (!token) {
		throw redirect(303, '/admin/login');
	}

	// Both calls are best-effort; the UI can recover from missing data.
	const [profile, status] = await Promise.all([
		getAdminProfile(fetch, token).catch((err): AdminProfile | null => {
			console.warn('[admin/whatsapp] profile load failed:', err);
			return null;
		}),
		getWhatsAppStatus(fetch, token).catch((err): WhatsAppStatus | null => {
			console.warn('[admin/whatsapp] status load failed:', err);
			return null;
		})
	]);

	if (profile === null) {
		// Most likely the token expired — bounce back to login.
		cookies.delete('admin_token', { path: '/' });
		throw redirect(303, '/admin/login');
	}

	return {
		profile,
		initialStatus: status
	};
};

export const actions: Actions = {
	logout: async ({ cookies, fetch }) => {
		const token = cookies.get('admin_token');
		if (token) {
			try {
				await adminLogout(fetch, token);
			} catch (err) {
				console.warn('[admin/whatsapp] logout call failed:', err);
			}
		}
		cookies.delete('admin_token', { path: '/' });
		throw redirect(303, '/admin/login');
	},

	updateToken: async ({ request, cookies, fetch }) => {
		const token = cookies.get('admin_token');
		if (!token) throw redirect(303, '/admin/login');

		const form = await request.formData();
		const newToken = (form.get('gateway_token') as string | null)?.trim();
		if (!newToken) return fail(400, { error: 'Paste the gateway token to save it' });

		try {
			await updateWhatsAppConfig({ token: newToken }, fetch, token);
			return { success: true, message: 'Gateway token updated' };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to update token';
			return fail(400, { error: message });
		}
	}
};
