import type { PageServerLoad } from './$types';
import { getDashboardStats, getSessions } from '$lib/services/dashboard';
import type { Session } from '$lib/types/api';

type Pagination = { page?: number; limit?: number; total?: number } | null;

// Narrow the various server response shapes into a flat { sessions, pagination }.
function narrowSessions(result: unknown): { sessions: Session[]; pagination: Pagination } {
	if (Array.isArray(result)) {
		return { sessions: result as Session[], pagination: null };
	}
	if (!result || typeof result !== 'object') {
		return { sessions: [], pagination: null };
	}
	const r = result as Record<string, unknown>;

	// { data: { sessions: [], page, limit, total } }
	if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
		const d = r.data as Record<string, unknown>;
		if (Array.isArray(d.sessions)) {
			return {
				sessions: d.sessions as Session[],
				pagination: {
					page: typeof d.page === 'number' ? d.page : undefined,
					limit: typeof d.limit === 'number' ? d.limit : undefined,
					total: typeof d.total === 'number' ? d.total : undefined
				}
			};
		}
	}

	// { data: [...], pagination: {...} } or { success, data: [...] }
	if (Array.isArray(r.data)) {
		return {
			sessions: r.data as Session[],
			pagination: (r.pagination as Pagination) ?? null
		};
	}

	// { sessions: [...] }
	if (Array.isArray(r.sessions)) {
		return { sessions: r.sessions as Session[], pagination: null };
	}

	return { sessions: [], pagination: null };
}

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		return {
			stats: null,
			sessions: [] as Session[],
			pagination: null as Pagination,
			error: 'Not authenticated'
		};
	}

	try {
		const [statsResult, sessionsResult] = await Promise.all([
			getDashboardStats(fetch, token),
			getSessions(1, 12, fetch, token)
		]);

		const { sessions, pagination } = narrowSessions(sessionsResult);

		return {
			stats: statsResult,
			sessions,
			pagination
		};
	} catch (error) {
		console.error('Dashboard load error:', error);
		return {
			stats: null,
			sessions: [] as Session[],
			pagination: null as Pagination,
			error: error instanceof Error ? error.message : 'Failed to load dashboard data'
		};
	}
};
