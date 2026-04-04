import type { PageServerLoad } from './$types';
import { getSession } from '$lib/services/sessions';

export const load: PageServerLoad = async ({ params, cookies, fetch }) => {
	const token = cookies.get('token');

	if (!token) {
		throw new Error('Not authenticated');
	}

	try {
		const sessionData = await getSession(params.id, fetch, token);
		return {
			session: sessionData.data
		};
	} catch (error) {
		console.error('Session load error:', error);
		throw new Error('Failed to load session');
	}
};
