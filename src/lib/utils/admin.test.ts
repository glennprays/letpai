import { describe, expect, it } from 'vitest';
import { gatewayState, renderTemplate, templateVariables, timeAgo } from './admin';

describe('gatewayState', () => {
	it('reads connected as sending', () => {
		expect(gatewayState({ is_connected: true, gateway_token_valid: true, has_token: false, phone_number: '62' })).toMatchObject({ label: 'Sending', healthy: true });
	});
	it('a valid token without a device needs pairing', () => {
		expect(gatewayState({ is_connected: false, gateway_token_valid: true, has_token: false, phone_number: '' })).toMatchObject({ label: 'Needs pairing', tone: 'pending' });
	});
	it('no token is not set up, and no status is unknown', () => {
		expect(gatewayState({ is_connected: false, gateway_token_valid: false, has_token: false, phone_number: '' }).label).toBe('Not set up');
		expect(gatewayState(null).label).toBe('Unknown');
	});
});

describe('templates', () => {
	const body = 'Hi {{.ParticipantName}}, pay {{ .Share }} for {{.SessionName}}. Thanks {{.ParticipantName}}';
	it('lists variables once, in order', () => {
		expect(templateVariables(body)).toEqual(['ParticipantName', 'Share', 'SessionName']);
	});
	it('fills known values and leaves unknown ones visible', () => {
		expect(renderTemplate(body, { ParticipantName: 'Alya', Share: 'Rp 87.500' })).toBe(
			'Hi Alya, pay Rp 87.500 for {{.SessionName}}. Thanks Alya'
		);
	});
});

describe('timeAgo', () => {
	const now = Date.parse('2026-01-10T12:00:00Z');
	it.each([
		['2026-01-10T11:59:30Z', 'just now'],
		['2026-01-10T11:15:00Z', '45 min ago'],
		['2026-01-10T07:00:00Z', '5 h ago'],
		['2026-01-09T10:00:00Z', 'yesterday'],
		['2025-12-31T12:00:00Z', '10 days ago']
	])('%s → %s', (iso, out) => expect(timeAgo(iso, now)).toBe(out));
	it('handles missing values', () => expect(timeAgo(undefined)).toBe('never'));
});
