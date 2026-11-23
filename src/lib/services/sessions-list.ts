import type { Session } from '$lib/types/api';

export type Pagination = { page?: number; limit?: number; total?: number } | null;

// The sessions endpoint has answered in several shapes over time; narrow
// them all into a flat { sessions, pagination }.
export function narrowSessions(result: unknown): { sessions: Session[]; pagination: Pagination } {
	if (Array.isArray(result)) return { sessions: result as Session[], pagination: null };
	if (!result || typeof result !== 'object') return { sessions: [], pagination: null };
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
	// { data: [...], pagination } or { success, data: [...] }
	if (Array.isArray(r.data)) return { sessions: r.data as Session[], pagination: (r.pagination as Pagination) ?? null };
	// { sessions: [...] }
	if (Array.isArray(r.sessions)) return { sessions: r.sessions as Session[], pagination: null };
	return { sessions: [], pagination: null };
}

/** How many people in the session have not paid yet. */
export function unpaidCount(s: Pick<Session, 'participant_count' | 'paid_count'>): number {
	return Math.max(0, (s.participant_count ?? 0) - (s.paid_count ?? 0));
}

/**
 * Open sessions that need the host, most unpaid people first. Sessions with
 * nobody added yet come last (they need setup, not chasing).
 */
export function needsAction(sessions: Session[]): Session[] {
	return sessions
		.filter((s) => s.status !== 'completed' && s.status !== 'cancelled')
		.filter((s) => (s.participant_count ?? 0) === 0 || unpaidCount(s) > 0)
		.sort((a, b) => {
			const ea = (a.participant_count ?? 0) === 0;
			const eb = (b.participant_count ?? 0) === 0;
			if (ea !== eb) return ea ? 1 : -1;
			return unpaidCount(b) - unpaidCount(a) || Date.parse(b.created_at) - Date.parse(a.created_at);
		});
}
