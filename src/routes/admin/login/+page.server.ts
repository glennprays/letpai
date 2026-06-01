import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import {
	getAdminNeedsSetup,
	initiateAdminLogin,
	loginAdminWithPassword,
	verifyAdminOTP
} from '$lib/services/admin';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const token = cookies.get('admin_token');
	if (token) {
		throw redirect(303, '/admin');
	}

	// First-boot wizard gate: when no usable super admin exists yet,
	// route the user to /admin/setup instead of showing the login form
	// (which would fail anyway since no real credentials are configured).
	// Treat network errors as "skip the check" so a momentary backend
	// hiccup doesn't lock the user out of the login page.
	try {
		const { needs_setup } = await getAdminNeedsSetup(fetch);
		if (needs_setup) {
			throw redirect(303, '/admin/setup');
		}
	} catch (err) {
		// Re-throw redirects; swallow everything else.
		if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
			throw err;
		}
		console.warn('[admin/login] needs-setup check failed:', err);
	}

	return {};
};

export const actions: Actions = {
	initiate: async ({ request, fetch }) => {
		const form = await request.formData();
		const whatsapp_number = (form.get('whatsapp_number') as string | null)?.trim();

		if (!whatsapp_number || whatsapp_number.length < 10) {
			return fail(400, { step: 'initiate', error: 'Enter a valid WhatsApp number' });
		}

		try {
			const res = await initiateAdminLogin(whatsapp_number, fetch);
			return {
				step: 'verify' as const,
				session_id: res.session_id,
				expires_at: res.expires_at,
				whatsapp_number
			};
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to send code';
			return fail(400, { step: 'initiate', error: message, whatsapp_number });
		}
	},

	verify: async ({ request, fetch, cookies }) => {
		const form = await request.formData();
		const session_id = form.get('session_id') as string | null;
		const otp_code = (form.get('otp_code') as string | null)?.trim();
		const whatsapp_number = form.get('whatsapp_number') as string | null;

		if (!session_id || !otp_code || otp_code.length !== 6) {
			return fail(400, {
				step: 'verify',
				error: 'Enter the 6-digit code',
				session_id,
				whatsapp_number
			});
		}

		try {
			const res = await verifyAdminOTP(session_id, otp_code, fetch);
			cookies.set('admin_token', res.token, {
				path: '/',
				httpOnly: false,
				secure: !dev,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Invalid code';
			return fail(400, { step: 'verify', error: message, session_id, whatsapp_number });
		}

		throw redirect(303, '/admin');
	},

	password: async ({ request, fetch, cookies }) => {
		const form = await request.formData();
		const whatsapp_number = (form.get('whatsapp_number') as string | null)?.trim();
		const password = (form.get('password') as string | null) ?? '';

		if (!whatsapp_number || whatsapp_number.length < 10) {
			return fail(400, { step: 'password', error: 'Enter a valid WhatsApp number' });
		}
		if (!password || password.length < 8) {
			return fail(400, {
				step: 'password',
				error: 'Password must be at least 8 characters',
				whatsapp_number
			});
		}

		try {
			const res = await loginAdminWithPassword(whatsapp_number, password, fetch);
			cookies.set('admin_token', res.token, {
				path: '/',
				httpOnly: false,
				secure: !dev,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Invalid credentials';
			return fail(401, { step: 'password', error: message, whatsapp_number });
		}

		throw redirect(303, '/admin');
	}
};
