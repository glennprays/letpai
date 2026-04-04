import { get, post, put, del } from './api';
import type {
	ContactsResponse,
	CreateContactRequest,
	UpdateContactRequest,
	ContactResponse,
	Contact
} from '$lib/types/api';

export async function getContacts(
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<ContactsResponse> {
	return get('/contacts', customFetch, serverToken);
}

export async function createContact(
	data: CreateContactRequest,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<ContactResponse> {
	return post('/contacts', data, customFetch, serverToken);
}

export async function updateContact(
	contactId: string,
	data: UpdateContactRequest,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<ContactResponse> {
	return put(`/contacts/${contactId}`, data, customFetch, serverToken);
}

export async function deleteContact(
	contactId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ success: boolean; message: string }> {
	return del(`/contacts/${contactId}`, customFetch, serverToken);
}
