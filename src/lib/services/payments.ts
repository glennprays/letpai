import { get, post } from './api';

// The backend now returns per-participant filtered bills (each line is
// either a bill assigned to this participant or an "everyone" bill)
// with `your_share` showing how much of the bill this participant owes
// after the split. Bank info lives on the session and is surfaced here
// so the participant has the transfer destination on the same page.
export interface PaymentPageData {
	session_id: string;
	participant_id: string;
	session_name: string;
	participant_name: string;
	total_amount: number;
	share_amount: number;
	currency: string;
	bill_items: Array<{
		bill_item_id: string;
		description: string;
		amount: number;
		your_share: number;
		shared_with: number;
		category?: string | null;
	}>;
	payment_status: 'pending' | 'submitted' | 'paid' | 'rejected';
	payment_proof_url?: string | null;
	rejection_reason?: string | null;
	bank_name?: string | null;
	bank_account_number?: string | null;
	bank_account_holder?: string | null;
	bank_accounts?: Array<{
		bank_name?: string | null;
		account_number?: string | null;
		account_holder?: string | null;
	}>;
	link_expires_at?: string;
	is_expired?: boolean;
	// Bill images attached to the session (read-only view for participants)
	bill_images?: Array<{
		bill_image_id: string;
		image_url: string;
		thumbnail_url?: string;
		file_name: string;
	}>;
	// Fee breakdown for this participant
	fee_breakdown?: {
		items_total: number;
		service_charge_share: number;
		tax_share: number;
		total: number;
	};
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

export interface MarkPaidResponse {
	success: boolean;
	data?: {
		message: string;
		participant_id: string;
		payment_status: string;
		paid_manually: boolean;
	};
	message?: string;
}

/**
 * Mark a participant as paid without requiring a proof upload. Useful for
 * cash payments and offline transfers the host has already confirmed.
 * Backend returns 409 if the participant is already paid.
 */
export async function markPaidWithoutProof(
	participantId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<MarkPaidResponse> {
	return post(`/participants/${participantId}/mark-paid`, {}, customFetch, serverToken);
}
