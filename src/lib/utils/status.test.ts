import { describe, expect, it } from 'vitest';
import { deliveryOf, paymentStatusOf, sessionGroup, sessionStatusOf } from './status';

describe('status vocabulary', () => {
	it('uses host and guest words from docs/VOICE.md', () => {
		expect(paymentStatusOf('submitted').label).toBe('Check proof');
		expect(paymentStatusOf('rejected').label).toBe('Sent back');
		expect(paymentStatusOf('rejected', 'guest').label).toBe('Needs a new proof');
		expect(sessionStatusOf('completed').label).toBe('Settled');
		expect(sessionStatusOf('weird').label).toBe('weird');
	});

	it('groups sessions', () => {
		expect(sessionGroup('active')).toBe('open');
		expect(sessionGroup('in_progress')).toBe('open');
		expect(sessionGroup('completed')).toBe('settled');
		expect(sessionGroup('cancelled')).toBe('cancelled');
	});
});

describe('deliveryOf', () => {
	it('maps the outbox statuses', () => {
		expect(deliveryOf(null).state).toBe('none');
		expect(deliveryOf({ status: 'sent' }).state).toBe('sent');
		expect(deliveryOf({ status: 'pending', friendly_status: 'Sending…' }).state).toBe('sending');
		expect(deliveryOf({ status: 'sending', friendly_status: 'Stuck — tap to retry' }).state).toBe('failed');
		expect(deliveryOf({ status: 'failed', friendly_status: 'Retrying…' }).state).toBe('retrying');
		expect(deliveryOf({ status: 'dead', error_message: 'not on WhatsApp' })).toEqual({ state: 'failed', reason: 'not on WhatsApp' });
	});
});
