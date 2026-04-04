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

    return {
      contacts: contactsResponse.success ? contactsResponse.data : [],
      groups: groupsResponse.success ? groupsResponse.data : []
    };
  } catch (error) {
    console.error('Failed to load contacts data:', error);
    return {
      contacts: [],
      groups: []
    };
  }
};
