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

    // Extract actual data from paginated response
    const contacts = contactsResponse?.data?.contacts || contactsResponse?.contacts || [];
    const groups = groupsResponse?.data?.groups || groupsResponse?.groups || [];

    const data = {
      contacts,
      groups
    };

    console.log('[Contacts Server Load] Returning data:', data);
    console.log('[Contacts Server Load] Contacts count:', contacts.length);
    console.log('[Contacts Server Load] Groups count:', groups.length);

    return data;
  } catch (error) {
    console.error('[Contacts Server Load] Failed to load contacts data:', error);
    return {
      contacts: [],
      groups: []
    };
  }
};
