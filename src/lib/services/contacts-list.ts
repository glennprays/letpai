import type { Contact, ContactGroup } from '$lib/types/api';
import { digitsOnly } from '$lib/utils/phone';

// The contacts endpoints have returned `[]`, `{ data: [] }`,
// `{ data: { contacts: [] } }` and `{ contacts: [] }` over time. Narrow all
// of them in one place so the server load and client refresh agree.
function pickList<T>(result: unknown, key: string): T[] | null {
	if (Array.isArray(result)) return result as T[];
	if (!result || typeof result !== 'object') return null;
	const r = result as Record<string, unknown>;
	if (Array.isArray(r[key])) return r[key] as T[];
	if (Array.isArray(r.data)) return r.data as T[];
	const inner = r.data as Record<string, unknown> | undefined;
	if (inner && typeof inner === 'object' && Array.isArray(inner[key])) return inner[key] as T[];
	return null;
}

export const narrowContacts = (result: unknown): Contact[] | null => pickList<Contact>(result, 'contacts');
export const narrowGroups = (result: unknown): ContactGroup[] | null => pickList<ContactGroup>(result, 'groups');

/** 'all', 'favorites', or a group_id. */
export type ContactFilter = string;

export function filterContacts(contacts: Contact[], query: string, filter: ContactFilter): Contact[] {
	const q = query.trim().toLowerCase();
	const qDigits = digitsOnly(q);
	return contacts.filter((c) => {
		if (filter === 'favorites' && !c.is_favorite) return false;
		if (filter !== 'all' && filter !== 'favorites' && c.group_id !== filter) return false;
		if (!q) return true;
		if (c.name.toLowerCase().includes(q)) return true;
		// "0812…" should find "62812…": compare without the local 0.
		const needle = qDigits.startsWith('0') ? qDigits.slice(1) : qDigits;
		return needle.length >= 3 && digitsOnly(c.whatsapp_number).includes(needle);
	});
}

export interface ContactSection {
	key: string;
	contacts: Contact[];
}

/** A–Z sections like a phone's address book; anything else goes under "#". */
export function sectionByLetter(contacts: Contact[]): ContactSection[] {
	const sorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
	const sections: ContactSection[] = [];
	for (const c of sorted) {
		const first = c.name.trim().charAt(0).toUpperCase();
		const key = /[A-Z]/.test(first) ? first : '#';
		const last = sections.at(-1);
		if (last?.key === key) last.contacts.push(c);
		else sections.push({ key, contacts: [c] });
	}
	// Keep "#" last even though digits and symbols sort first.
	const hash = sections.findIndex((s) => s.key === '#');
	if (hash > -1) sections.push(...sections.splice(hash, 1));
	return sections;
}
