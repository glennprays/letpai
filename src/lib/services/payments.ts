import { get, post } from './api';

export interface PaymentPageData {
	session_name: string;
	participant_name: string;
	share_amount: number;
	currency: string;
	bill_items: Array<{
		bill_item_id: string;
		description: string;
		amount: number;
		category?: string | null;
	}>;
	payment_status: 'pending' | 'submitted' | 'paid' | 'rejected';
	link_expires_at?: string;
	is_expired?: boolean;
}

export interface SubmitPaymentResult {
	success?: boolean;
	proof_id?: string;
	status?: string;
	uploaded_at?: string;
	proof_url?: string;
}

/** Public payment page metadata (no auth required). */
export async function getPaymentPage(
	participantId: string,
	customFetch?: typeof fetch
): Promise<PaymentPageData> {
	const res = await get(`/payments/${participantId}/public`, customFetch);
	// Backend may wrap response as { success, data } or return the page object directly.
	return (res && typeof res === 'object' && 'data' in res ? (res as { data: PaymentPageData }).data : res) as PaymentPageData;
}

/**
 * Submit payment proof. Backend expects a JSON body with a base64-encoded image
 * plus the original filename and (optional) format hint. No auth required.
 */
export async function submitPayment(
	participantId: string,
	payload: { proof_image: string; file_name: string; file_format?: string },
	customFetch?: typeof fetch
): Promise<SubmitPaymentResult> {
	return post(`/payments/${participantId}/submit`, payload, customFetch);
}

export interface ApproveResponse {
	success: boolean;
	message?: string;
	payment_status?: string;
}

export interface RejectResponse {
	success: boolean;
	message?: string;
	payment_status?: string;
	rejection_reason?: string;
}

export interface BulkResponse {
	success: boolean;
	message?: string;
	approved?: number;
	rejected?: number;
	failed?: Array<{ proof_id: string; error: string }>;
}

/**
 * Approve a single payment proof. The path parameter `proof_id` is actually
 * the participant_id on the current backend — the swagger and route naming
 * are historical.
 */
export async function approvePayment(
	participantId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<ApproveResponse> {
	return post(`/payments/${participantId}/approve`, {}, customFetch, serverToken);
}

/** Reject a single payment proof, optionally with a reason shown to the participant. */
export async function rejectPayment(
	participantId: string,
	reason: string | undefined,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<RejectResponse> {
	return post(
		`/payments/${participantId}/reject`,
		{ rejection_reason: reason || undefined },
		customFetch,
		serverToken
	);
}

export async function bulkApprove(
	participantIds: string[],
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<BulkResponse> {
	return post('/payments/bulk-approve', { proof_ids: participantIds }, customFetch, serverToken);
}

export async function bulkReject(
	participantIds: string[],
	reason: string | undefined,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<BulkResponse> {
	return post(
		'/payments/bulk-reject',
		{ proof_ids: participantIds, rejection_reason: reason || undefined },
		customFetch,
		serverToken
	);
}
