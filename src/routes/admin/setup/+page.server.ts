import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { bootstrapSuperAdmin, getAdminNeedsSetup } from '$lib/services/admin';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	// Already signed in -> dashboard, regardless of bootstrap state.
	if (cookies.get('admin_token')) {
		throw redirect(303, '/admin');
	}

	// The gate may have been closed by another tab between when the
	// /admin/login redirect bounced us here and now. Re-check; on
	// `needs_setup === false` push the user to login. Network errors
	// fall through so a flaky backend doesn't break the page.
	try {
		const { needs_setup } = await getAdminNeedsSetup(fetch);
		if (!needs_setup) {
			throw redirect(303, '/admin/login');
		}
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
			throw err;
		}
		console.warn('[admin/setup] needs-setup check failed:', err);
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, fetch, cookies }) => {
		const form = await request.formData();
		const whatsapp_number = (form.get('whatsapp_number') as string | null)?.trim() ?? '';
		const full_name = (form.get('full_name') as string | null)?.trim() ?? '';
		const password = (form.get('password') as string | null) ?? '';
		const confirm = (form.get('confirm') as string | null) ?? '';

		if (whatsapp_number.length < 10) {
			return fail(400, {
				error: 'Enter a valid WhatsApp number (E.164, no +).',
				whatsapp_number,
				full_name
			});
		}
		if (full_name.length < 2 || full_name.length > 100) {
			return fail(400, {
				error: 'Name must be 2–100 characters.',
				whatsapp_number,
				full_name
			});
		}
		if (password.length < 8 || password.length > 100) {
			return fail(400, {
				error: 'Password must be 8–100 characters.',
				whatsapp_number,
				full_name
			});
		}
		if (password !== confirm) {
			return fail(400, {
				error: 'Passwords do not match.',
				whatsapp_number,
				full_name
			});
		}

		try {
			const res = await bootstrapSuperAdmin(
				{ whatsapp_number, full_name, password },
				fetch
			);
			cookies.set('admin_token', res.token, {
				path: '/',
				httpOnly: false,
				secure: !dev,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Setup failed';
			return fail(409, { error: message, whatsapp_number, full_name });
		}

		throw redirect(303, '/admin');
	}
};
