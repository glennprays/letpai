import { describe, expect, it } from 'vitest';
import { narrowSessions, needsAction, unpaidCount } from './sessions-list';
import type { Session } from '$lib/types/api';

const s = (id: string, status: Session['status'], count: number, paid: number, hoursAgo = 0): Session => ({
	session_id: id,
	host_id: 'h',
	title: id,
	total_amount: 100,
	currency: 'IDR',
	status,
	participant_count: count,
	paid_count: paid,
	created_at: new Date(Date.now() - hoursAgo * 3600_000).toISOString()
});

describe('narrowSessions', () => {
	it.each([
		['array', [s('a', 'active', 1, 0)]],
		['data array', { data: [s('a', 'active', 1, 0)] }],
		['data.sessions', { data: { sessions: [s('a', 'active', 1, 0)], total: 1 } }],
		['sessions', { sessions: [s('a', 'active', 1, 0)] }]
	])('reads the %s shape', (_n, shape) => {
		expect(narrowSessions(shape).sessions.map((x) => x.session_id)).toEqual(['a']);
	});

	it('returns an empty list for junk', () => {
		expect(narrowSessions(null).sessions).toEqual([]);
		expect(narrowSessions('nope').sessions).toEqual([]);
	});
});

describe('needsAction', () => {
	it('keeps open sessions with unpaid people, most unpaid first, empty ones last', () => {
		const list = [
			s('settled', 'completed', 2, 2),
			s('cancelled', 'cancelled', 3, 0),
			s('few', 'active', 4, 3),
			s('many', 'active', 12, 5),
			s('done-but-open', 'active', 2, 2),
			s('empty', 'draft', 0, 0)
		];
		expect(needsAction(list).map((x) => x.session_id)).toEqual(['many', 'few', 'empty']);
	});

	it('counts unpaid people without going negative', () => {
		expect(unpaidCount({ participant_count: 3, paid_count: 5 })).toBe(0);
	});
});
