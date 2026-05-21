import { post } from './api';

export interface ReminderResponse {
	success: boolean;
	message: string;
	// Backend may include rate-limit context on 429 responses
	retry_after?: number;
}

/** Send a payment reminder to a single participant. Rate-limited backend-side. */
export async function sendParticipantReminder(
	participantId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<ReminderResponse> {
	return post(`/participants/${participantId}/reminder`, {}, customFetch, serverToken);
}

/** Send a reminder to every unpaid participant in a session. */
export async function sendBulkReminder(
	sessionId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<ReminderResponse> {
	return post(`/sessions/${sessionId}/bulk-reminder`, {}, customFetch, serverToken);
}
