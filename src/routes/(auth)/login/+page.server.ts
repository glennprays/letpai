import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { login as apiLogin } from '$lib/services/auth';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		isAuthenticated: locals.isAuthenticated
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const whatsapp_number = formData.get('whatsapp_number') as string;
		const password = formData.get('password') as string;

		if (!whatsapp_number || !password) {
			return fail(400, { message: 'Missing required fields' });
		}

		try {
			const response = await apiLogin({ whatsapp_number, password });

			if (response.success) {
				// Set cookie for SSR
				cookies.set('token', response.token, {
					path: '/',
					httpOnly: false, // Allow client-side access
					secure: import.meta.env.PROD,
					sameSite: 'lax',
					maxAge: 60 * 60 * 24 * 30 // 30 days
				});

				// Get return URL from form data or default to dashboard
				const returnURL = formData.get('return') as string || '/dashboard';

				throw redirect(303, returnURL);
			} else {
				return fail(401, { message: response.error?.message || 'Login failed' });
			}
		} catch (error) {
			if (error && typeof error === 'object' && 'location' in error) {
				// This is a redirect, re-throw it
				throw error;
			}
			return fail(500, { message: 'An error occurred during login' });
		}
	}
};
