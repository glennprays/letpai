import { redirect } from '@sveltejs/kit';
import { getContacts, getContactGroups } from '$lib/services/contacts';
import type { Contact, ContactGroup } from '$lib/types/api';
import type { PageServerLoad } from './$types';

// Backend may return `{ data: [] }`, `{ data: { contacts: [] } }`, or `{ contacts: [] }`.
function narrowContacts(result: unknown): Contact[] {
  if (Array.isArray(result)) return result as Contact[];
  if (!result || typeof result !== 'object') return [];
  const r = result as Record<string, unknown>;
  if (Array.isArray(r.contacts)) return r.contacts as Contact[];
  if (Array.isArray(r.data)) return r.data as Contact[];
  if (r.data && typeof r.data === 'object' && Array.isArray((r.data as Record<string, unknown>).contacts)) {
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
  if (r.data && typeof r.data === 'object' && Array.isArray((r.data as Record<string, unknown>).groups)) {
    return (r.data as { groups: ContactGroup[] }).groups;
  }
  return [];
}

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
      contacts: narrowContacts(contactsResponse),
      groups: narrowGroups(groupsResponse)
    };
  } catch (error) {
    console.error('[Contacts Server Load] Failed to load contacts data:', error);
    return {
      contacts: [] as Contact[],
      groups: [] as ContactGroup[]
    };
  }
};
