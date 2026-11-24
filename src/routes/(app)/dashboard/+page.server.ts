import type { PageServerLoad } from './$types';
import { getDashboardStats } from '$lib/services/dashboard';
import { getSessions } from '$lib/services/sessions';
import { narrowSessions, type Pagination } from '$lib/services/sessions-list';
import { toUserMessage } from '$lib/services/api';
import type { Session } from '$lib/types/api';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const token = cookies.get('token');
	if (!token) {
		return { stats: null, sessions: [] as Session[], pagination: null as Pagination, error: 'Not signed in' };
	}

	try {
		const [stats, sessionsResult] = await Promise.all([getDashboardStats(fetch, token), getSessions(1, 50, fetch, token)]);
		const { sessions, pagination } = narrowSessions(sessionsResult);
		return { stats, sessions, pagination, error: null as string | null };
	} catch (error) {
		console.error('Dashboard load error:', error);
		return {
			stats: null,
			sessions: [] as Session[],
			pagination: null as Pagination,
			error: toUserMessage(error, "We couldn't load your sessions.")
		};
	}
};
