import { redirect } from '@sveltejs/kit';
import { getContacts, getContactGroups } from '$lib/services/contacts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, depends }) => {
  depends('app:contacts');

  const token = cookies.get('token');

  console.log('[Contacts Server Load] Token from cookies:', token ? `${token.substring(0, 20)}...` : 'none');

  if (!token) {
    redirect(302, '/login');
  }

  try {
    console.log('[Contacts Server Load] Fetching contacts and groups...');
    const [contactsResponse, groupsResponse] = await Promise.all([
      getContacts(fetch, token),
      getContactGroups(fetch, token)
    ]);

    console.log('[Contacts Server Load] Contacts response:', contactsResponse);
    console.log('[Contacts Server Load] Groups response:', groupsResponse);

    const data = {
      contacts: contactsResponse.success ? contactsResponse.data : [],
      groups: groupsResponse.success ? groupsResponse.data : []
    };

    console.log('[Contacts Server Load] Returning data:', data);

    return data;
  } catch (error) {
    console.error('[Contacts Server Load] Failed to load contacts data:', error);
    return {
      contacts: [],
      groups: []
    };
  }
};
