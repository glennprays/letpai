import type { Actions, PageServerLoad } from './$types';
import { sendResetLink } from '$lib/services/auth';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		isAuthenticated: locals.isAuthenticated
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const whatsapp_number = formData.get('whatsapp_number') as string;

		if (!whatsapp_number) {
			return fail(400, { message: 'WhatsApp number is required' });
		}

		try {
			const response = await sendResetLink({ whatsapp_number });

			if ('success' in response && response.success) {
				return { success: true, message: response.message || 'Reset link sent' };
			} else {
				return fail(400, {
					message: ('error' in response && response.error?.message) || 'Failed to send reset link',
					whatsapp_number
				});
			}
		} catch (error) {
			console.error('Send reset link error:', error);
			return fail(500, {
				message: 'An error occurred',
				whatsapp_number
			});
		}
	}
};
