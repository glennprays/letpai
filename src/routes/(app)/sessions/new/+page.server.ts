import type { Actions, PageServerLoad } from './$types';
import { createSession } from '$lib/services/sessions';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	// No pre-loading needed for create page
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const token = cookies.get('token');

		if (!token) {
			return fail(401, { error: 'Not authenticated' });
		}

		const formData = await request.formData();
		const sessionName = formData.get('session_name')?.toString();
		const sessionDescription = formData.get('session_description')?.toString() || undefined;
		const currency = formData.get('currency')?.toString() || 'IDR';

		if (!sessionName || sessionName.trim().length === 0) {
			return fail(400, { error: 'Session name is required' });
		}

		try {
			const result = await createSession(
				{
					session_name: sessionName.trim(),
					session_description: sessionDescription?.trim(),
					currency
				},
				fetch,
				token
			);

			// Redirect to the session detail page
			return {
				success: true,
				sessionId: result.data.session_id
			};
		} catch (error) {
			console.error('Create session error:', error);
			const message = error instanceof Error ? error.message : 'Failed to create session';
			return fail(500, { error: message });
		}
	}
};
