import { describe, expect, it } from 'vitest';
import { filterContacts, narrowContacts, narrowGroups, sectionByLetter } from './contacts-list';
import { formatWhatsappDisplay, whatsappChatLink } from '$lib/utils/phone';
import type { Contact } from '$lib/types/api';

const c = (id: string, name: string, wa: string, extra: Partial<Contact> = {}): Contact => ({
	contact_id: id,
	name,
	whatsapp_number: wa,
	is_favorite: false,
	created_at: '',
	updated_at: '',
	...extra
});

const people = [
	c('1', 'Citra', '6281300000003', { group_id: 'g1', is_favorite: true }),
	c('2', 'aditya', '6281300000001', { group_id: 'g2' }),
	c('3', 'Bima', '6281300000002'),
	c('4', '8 Ball Pool', '6281300000009')
];

describe('narrowContacts / narrowGroups', () => {
	it.each([
		['array', people],
		['data array', { data: people }],
		['data.contacts', { data: { contacts: people } }],
		['contacts', { contacts: people }]
	])('reads the %s shape', (_n, shape) => {
		expect(narrowContacts(shape)).toHaveLength(4);
	});

	it('returns null for junk so callers can keep what they had', () => {
		expect(narrowContacts(null)).toBeNull();
		expect(narrowGroups({ data: { nope: 1 } })).toBeNull();
	});

	it('reads groups under their own key', () => {
		expect(narrowGroups({ data: { groups: [{ group_id: 'g' }] } })).toHaveLength(1);
	});
});

describe('filterContacts', () => {
	it('filters by favourites and by group', () => {
		expect(filterContacts(people, '', 'favorites').map((x) => x.name)).toEqual(['Citra']);
		expect(filterContacts(people, '', 'g2').map((x) => x.name)).toEqual(['aditya']);
	});

	it('matches names case-insensitively', () => {
		expect(filterContacts(people, 'ADI', 'all').map((x) => x.name)).toEqual(['aditya']);
	});

	it('matches a local 0812-style number against the stored 62 number', () => {
		expect(filterContacts(people, '0813-0000-0002', 'all').map((x) => x.name)).toEqual(['Bima']);
	});

	it('ignores one- and two-digit number fragments', () => {
		expect(filterContacts(people, '81', 'all')).toEqual([]);
	});
});

describe('sectionByLetter', () => {
	it('sorts A–Z ignoring case and puts non-letters last', () => {
		expect(sectionByLetter(people).map((s) => s.key)).toEqual(['A', 'B', 'C', '#']);
	});
});

describe('WhatsApp number display', () => {
	it.each([
		['6281234567890', '+62 812-3456-7890'],
		['+6281234567890', '+62 812-3456-7890'],
		['081234567890', '+62 812-3456-7890'],
		['6591234567', '+65 9123-4567']
	])('%s → %s', (stored, shown) => {
		expect(formatWhatsappDisplay(stored)).toBe(shown);
	});

	it('links to wa.me with the full number exactly once', () => {
		expect(whatsappChatLink('081234567890')).toBe('https://wa.me/6281234567890');
		expect(whatsappChatLink('+6281234567890')).toBe('https://wa.me/6281234567890');
	});
});
