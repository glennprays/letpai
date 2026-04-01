import type { PageServerLoad } from './$types';
import { getDashboardStats, getSessions } from '$lib/services/dashboard';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return {
			stats: null,
			sessions: [],
			pagination: null,
			error: 'Not authenticated'
		};
	}

	try {
		const [statsResult, sessionsResult] = await Promise.all([
			getDashboardStats(fetch, token),
			getSessions(1, 12, fetch, token)
		]);

		// Debug logging to see the actual structure
		console.log('Stats result:', JSON.stringify(statsResult, null, 2));
		console.log('Sessions result:', JSON.stringify(sessionsResult, null, 2));

		// Handle sessions response - it might be wrapped in different ways
		let sessionsArray: unknown[] = [];
		let pagination = null;

		if (Array.isArray(sessionsResult)) {
			// Direct array response
			sessionsArray = sessionsResult;
		} else if (sessionsResult && typeof sessionsResult === 'object') {
			if ('data' in sessionsResult && typeof sessionsResult.data === 'object' && 'sessions' in sessionsResult.data && Array.isArray(sessionsResult.data.sessions)) {
				// Wrapped in { data: { sessions: [], total, page, limit } }
				sessionsArray = sessionsResult.data.sessions;
				pagination = { page: sessionsResult.data.page, limit: sessionsResult.data.limit, total: sessionsResult.data.total };
			} else if ('data' in sessionsResult && Array.isArray(sessionsResult.data)) {
				// Wrapped in { data: [], pagination: {} }
				sessionsArray = sessionsResult.data;
				pagination = sessionsResult.pagination || null;
			} else if ('success' in sessionsResult && 'data' in sessionsResult && Array.isArray(sessionsResult.data)) {
				// Wrapped in { success: true, data: [] }
				sessionsArray = sessionsResult.data;
			} else if ('sessions' in sessionsResult && Array.isArray(sessionsResult.sessions)) {
				// Wrapped in { sessions: [] }
				sessionsArray = sessionsResult.sessions;
			}
		}

		console.log('Parsed sessions array:', sessionsArray);
		console.log('Parsed pagination:', pagination);

		return {
			stats: statsResult,
			sessions: sessionsArray,
			pagination
		};
	} catch (error) {
		console.error('Dashboard load error:', error);
		return {
			stats: null,
			sessions: [],
			pagination: null,
			error: error instanceof Error ? error.message : 'Failed to load dashboard data'
		};
	}
};
