import { get, post, put, del } from './api';
import type {
	Session,
	SessionDetail,
	SessionResponse,
	SessionDetailResponse,
	UpdateSessionRequest,
	CreateSessionRequest,
	AddParticipantsRequest,
	ParticipantsResponse,
	CreateBillItemRequest,
	BillItemResponse,
	UpdateBillItemRequest,
	UpdateBillItemResponse
} from '$lib/types/api';

export async function getSessions(
	page = 1,
	limit = 10,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ success: boolean; data: Session[]; pagination?: { page: number; limit: number; total: number } }> {
	return get(`/sessions?page=${page}&limit=${limit}`, customFetch, serverToken);
}

export async function getSession(
	sessionId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<SessionDetailResponse> {
	return get(`/sessions/${sessionId}`, customFetch, serverToken);
}

export async function createSession(
	data: CreateSessionRequest,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<SessionResponse> {
	return post('/sessions', data, customFetch, serverToken);
}

export async function updateSession(
	sessionId: string,
	data: UpdateSessionRequest,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<SessionResponse> {
	return put(`/sessions/${sessionId}`, data, customFetch, serverToken);
}

export async function cancelSession(
	sessionId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ success: boolean; message: string }> {
	return del(`/sessions/${sessionId}`, customFetch, serverToken);
}

export async function addParticipants(
	sessionId: string,
	data: AddParticipantsRequest,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<ParticipantsResponse> {
	return post(`/sessions/${sessionId}/participants`, data, customFetch, serverToken);
}

/**
 * Update a participant's custom name / WhatsApp number. Only valid for
 * custom (unlinked) participants — for linked contacts, edit the contact
 * instead. Payment status transitions (submit / approve / reject) use the
 * dedicated /payments/* endpoints, not this one.
 */
export async function updateParticipant(
	sessionId: string,
	participantId: string,
	data: { custom_name?: string; custom_whatsapp?: string },
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ success: boolean; data: unknown }> {
	return put(`/sessions/${sessionId}/participants/${participantId}`, data, customFetch, serverToken);
}

export async function removeParticipant(
	sessionId: string,
	participantId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ success: boolean; message: string }> {
	return del(`/sessions/${sessionId}/participants/${participantId}`, customFetch, serverToken);
}

export async function addBillItem(
	sessionId: string,
	data: CreateBillItemRequest,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<BillItemResponse> {
	return post(`/sessions/${sessionId}/bills`, data, customFetch, serverToken);
}

export async function updateBillItem(
	sessionId: string,
	billItemId: string,
	data: UpdateBillItemRequest,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<UpdateBillItemResponse> {
	return put(`/sessions/${sessionId}/bills/${billItemId}`, data, customFetch, serverToken);
}

export async function deleteBillItem(
	sessionId: string,
	billItemId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ success: boolean; message: string }> {
	return del(`/sessions/${sessionId}/bills/${billItemId}`, customFetch, serverToken);
}

export async function calculateSplits(
	sessionId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ success: boolean; data: unknown; message: string }> {
	return put(`/sessions/${sessionId}/calculate-splits`, {}, customFetch, serverToken);
}

export async function sendNotifications(
	sessionId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ success: boolean; message: string }> {
	return post(`/sessions/${sessionId}/send-notifications`, {}, customFetch, serverToken);
}

/**
 * Force-send notifications, bypassing the server-side dirty gate.
 * Called from the FE's "Send again anyway?" confirm modal when the
 * default endpoint returns 409 SESSION_NOT_DIRTY.
 */
export async function resendNotifications(
	sessionId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ success: boolean; message: string }> {
	return post(`/sessions/${sessionId}/send-notifications/resend`, {}, customFetch, serverToken);
}

export interface BankAccountInput {
	bank_name?: string | null;
	account_number?: string | null;
	account_holder?: string | null;
}

/**
 * Swap the host's transfer destinations. Idempotent — the FE PUTs
 * the full list every save, the backend transactionally replaces.
 * Up to 5 accounts; empty array clears.
 */
export async function replaceBankAccounts(
	sessionId: string,
	accounts: BankAccountInput[],
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{
	success: boolean;
	data: {
		accounts: Array<{
			account_id: string;
			ordinal: number;
			bank_name?: string | null;
			account_number?: string | null;
			account_holder?: string | null;
		}>;
	};
}> {
	return put(`/sessions/${sessionId}/bank-accounts`, { accounts }, customFetch, serverToken);
}
