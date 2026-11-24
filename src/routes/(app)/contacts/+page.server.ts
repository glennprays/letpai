import { redirect } from '@sveltejs/kit';
import { getContacts, getContactGroups } from '$lib/services/contacts';
import { narrowContacts, narrowGroups } from '$lib/services/contacts-list';
import { toUserMessage } from '$lib/services/api';
import type { Contact, ContactGroup } from '$lib/types/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, depends, fetch }) => {
	depends('app:contacts');

	const token = cookies.get('token');
	if (!token) redirect(302, '/login');

	try {
		const [contactsResponse, groupsResponse] = await Promise.all([getContacts(fetch, token), getContactGroups(fetch, token)]);
		return {
			contacts: narrowContacts(contactsResponse) ?? [],
			groups: narrowGroups(groupsResponse) ?? [],
			error: null as string | null
		};
	} catch (error) {
		console.error('[Contacts Server Load] Failed to load contacts data:', error);
		return {
			contacts: [] as Contact[],
			groups: [] as ContactGroup[],
			error: toUserMessage(error, "We couldn't load your contacts.")
		};
	}
};
