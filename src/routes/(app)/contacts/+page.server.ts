import { redirect } from '@sveltejs/kit';
import { getContacts, getContactGroups } from '$lib/services/contacts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, depends }) => {
  depends('app:contacts');

  const token = cookies.get('token');

  if (!token) {
    redirect(302, '/login');
  }

  try {
    const [contactsResponse, groupsResponse] = await Promise.all([
      getContacts(fetch, token),
      getContactGroups(fetch, token)
    ]);

    // Extract actual data from paginated response
    const contacts = contactsResponse?.data?.contacts || contactsResponse?.contacts || [];
    const groups = groupsResponse?.data?.groups || groupsResponse?.groups || [];

    const data = {
      contacts,
      groups
    };

    return data;
  } catch (error) {
    console.error('[Contacts Server Load] Failed to load contacts data:', error);
    return {
      contacts: [],
      groups: []
    };
  }
};
