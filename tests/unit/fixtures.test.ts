import { describe, expect, it } from 'vitest';
import { SESSIONS, shareOf } from '../fixtures/data';

// Guards the shared dataset itself: the redesign's screenshots are only
// meaningful if the fixture covers every state the UI has to handle.
describe('fixture dataset', () => {
	const dinner = SESSIONS.find((s) => s.session_id === 's-dinner')!;

	it('covers every payment status in the dense session', () => {
		const statuses = new Set(dinner.participants.map((p) => p.payment_status));
		expect([...statuses].sort()).toEqual(['paid', 'pending', 'rejected', 'submitted']);
		expect(dinner.participants).toHaveLength(12);
	});

	it('computes fee shares the same way the payment page does', () => {
		const share = shareOf(dinner, 's-dinner-p4');
		// 540000/12 + 168000/12 = 45000 + 14000 (+ parking 30000, no fees)
		expect(share.items_total).toBe(45000 + 14000 + 30000);
		const sc = Math.round(45000 * 0.05) + Math.round(14000 * 0.05);
		expect(share.service_charge_share).toBe(sc);
		expect(share.total).toBe(share.items_total + share.service_charge_share + share.tax_share);
	});
});
