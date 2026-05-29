import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getWhatsAppStatus, updateWhatsAppConfig, type WhatsAppStatus } from '$lib/services/admin';

// The /admin layout already gates on admin_token and pre-loads the
// admin profile. Here we just fetch the WhatsApp status sidecar.
export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const token = cookies.get('admin_token');
	if (!token) throw redirect(303, '/admin/login');

	const status = await getWhatsAppStatus(fetch, token).catch((err): WhatsAppStatus | null => {
		console.warn('[admin/whatsapp] status load failed:', err);
		return null;
	});

	return { initialStatus: status };
};

export const actions: Actions = {
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
