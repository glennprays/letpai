import type { Actions, PageServerLoad } from './$types';
import { createSession } from '$lib/services/sessions';
import { fail, redirect } from '@sveltejs/kit';

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
		const title = formData.get('title')?.toString();
		const description = formData.get('description')?.toString() || undefined;
		const currency = formData.get('currency')?.toString() || 'IDR';

		if (!title || title.trim().length === 0) {
			return fail(400, { error: 'Title is required' });
		}

		try {
			const result = await createSession(
				{
					title: title.trim(),
					description: description?.trim(),
					currency
				},
				fetch,
				token
			);

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

			// Redirect to the session detail page using SvelteKit redirect
			throw redirect(302, `/sessions/${sessionId}`);
		} catch (error) {
			// Check if it's a redirect - rethrow it
			if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
				throw error;
			}

			console.error('Create session error:', error);
			const message = error instanceof Error ? error.message : 'Failed to create session';
			return fail(500, { error: message });
		}
	}
};
