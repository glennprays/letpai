import { get, post, put, del } from './api';
import type {
	ContactsResponse,
	CreateContactRequest,
	UpdateContactRequest,
	ContactResponse,
	Contact,
	ContactGroup,
	CreateGroupRequest,
	UpdateGroupRequest,
	GroupResponse,
	GroupsResponse,
	BulkImportRequest,
	BulkDeleteRequest,
	BulkUpdateRequest,
	BulkOperationResponse
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

// Contact Groups CRUD
export async function getContactGroups(
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<GroupsResponse> {
	return get('/contacts/groups', customFetch, serverToken);
}

export async function createContactGroup(
	data: CreateGroupRequest,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<GroupResponse> {
	return post('/contacts/groups', data, customFetch, serverToken);
}

export async function updateContactGroup(
	groupId: string,
	data: UpdateGroupRequest,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<GroupResponse> {
	return put(`/contacts/groups/${groupId}`, data, customFetch, serverToken);
}

export async function deleteContactGroup(
	groupId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ success: boolean; message: string }> {
	return del(`/contacts/groups/${groupId}`, customFetch, serverToken);
}

// Bulk Operations
export async function bulkImportContacts(
	data: BulkImportRequest,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<BulkOperationResponse> {
	return post('/contacts/bulk/import', data, customFetch, serverToken);
}

export async function bulkDeleteContacts(
	data: BulkDeleteRequest,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<BulkOperationResponse> {
	return post('/contacts/bulk/delete', data, customFetch, serverToken);
}

export async function bulkUpdateContacts(
	data: BulkUpdateRequest,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<BulkOperationResponse> {
	return post('/contacts/bulk/update', data, customFetch, serverToken);
}
