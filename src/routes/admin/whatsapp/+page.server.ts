import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getWhatsAppStatus, type WhatsAppStatus } from '$lib/services/admin';

// The /admin layout already gates on admin_token and pre-loads the
// admin profile. Here we just fetch the WhatsApp status sidecar.
//
// updateToken / disconnect actions were removed — there's no longer
// a UI surface for either. Rotate the gateway token via .env +
// backend restart; WAGA doesn't expose a gateway-side logout.
export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const token = cookies.get('admin_token');
	if (!token) throw redirect(303, '/admin/login');

	const status = await getWhatsAppStatus(fetch, token).catch((err): WhatsAppStatus | null => {
		console.warn('[admin/whatsapp] status load failed:', err);
		return null;
	});

	return { initialStatus: status };
};
