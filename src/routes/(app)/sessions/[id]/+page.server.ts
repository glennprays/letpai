import type { PageServerLoad } from './$types';
import { getSession } from '$lib/services/sessions';
import { getContacts, getContactGroups } from '$lib/services/contacts';
import type { Contact, ContactGroup } from '$lib/types/api';

function narrowContacts(result: unknown): Contact[] {
	if (Array.isArray(result)) return result as Contact[];
	if (!result || typeof result !== 'object') return [];
	const r = result as Record<string, unknown>;
	if (Array.isArray(r.contacts)) return r.contacts as Contact[];
	if (Array.isArray(r.data)) return r.data as Contact[];
	if (
		r.data &&
		typeof r.data === 'object' &&
		Array.isArray((r.data as Record<string, unknown>).contacts)
	) {
		return (r.data as { contacts: Contact[] }).contacts;
	}
	return [];
}

function narrowGroups(result: unknown): ContactGroup[] {
	if (Array.isArray(result)) return result as ContactGroup[];
	if (!result || typeof result !== 'object') return [];
	const r = result as Record<string, unknown>;
	if (Array.isArray(r.groups)) return r.groups as ContactGroup[];
	if (Array.isArray(r.data)) return r.data as ContactGroup[];
	if (
		r.data &&
		typeof r.data === 'object' &&
		Array.isArray((r.data as Record<string, unknown>).groups)
	) {
		return (r.data as { groups: ContactGroup[] }).groups;
	}
	return [];
}

export const load: PageServerLoad = async ({ params, cookies, fetch }) => {
	const token = cookies.get('token');

	if (!token) {
		throw new Error('Not authenticated');
	}

	try {
		const [sessionData, contactsResponse, groupsResponse] = await Promise.all([
			getSession(params.id, fetch, token),
			getContacts(fetch, token).catch(() => null),
			getContactGroups(fetch, token).catch(() => null)
		]);

		return {
			session: sessionData.data,
			contacts: contactsResponse ? narrowContacts(contactsResponse) : [],
			groups: groupsResponse ? narrowGroups(groupsResponse) : []
		};
	} catch (error) {
		console.error('Session load error:', error);
		throw new Error('Failed to load session');
	}
};
