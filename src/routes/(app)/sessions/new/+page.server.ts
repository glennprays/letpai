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
			return fail(400, { error: 'Not authenticated' });
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

			// Debug logging
			console.log('Create session result:', JSON.stringify(result, null, 2));

			// Handle different response structures
			let sessionId: string | undefined;

			// Try to get session_id from various possible structures
			if (result && typeof result === 'object') {
				if ('data' in result && result.data && typeof result.data === 'object' && 'session_id' in result.data) {
					sessionId = result.data.session_id as string;
				} else if ('session_id' in result) {
					sessionId = result.session_id as string;
				}
			}

			if (!sessionId) {
				console.error('No session ID in response. Full result:', result);
				return fail(500, { error: 'Failed to create session - no session ID returned' });
			}

			// Return success with session ID for client-side redirect
			return {
				success: true,
				sessionId
			};
		} catch (error) {
			console.error('Create session error:', error);
			const message = error instanceof Error ? error.message : 'Failed to create session';
			return fail(500, { error: message });
		}
	}
};
