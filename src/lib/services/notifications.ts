import { get, post } from './api';

export interface ReminderResponse {
	success: boolean;
	message: string;
	// Backend may include rate-limit context on 429 responses
	retry_after?: number;
}

export interface ReminderStatus {
	can_send: boolean;
	retry_after_seconds: number;
	next_available_at?: string;
}

/** Send a payment reminder to a single participant. Rate-limited backend-side. */
export async function sendParticipantReminder(
	participantId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<ReminderResponse> {
	return post(`/participants/${participantId}/reminder`, {}, customFetch, serverToken);
}

/** Read the current cooldown for a participant so the FE can pre-disable
 * the Remind button on first paint instead of waiting for a 429 click. */
export async function getReminderStatus(
	participantId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<ReminderStatus> {
	const res = (await get(
		`/participants/${participantId}/reminder-status`,
		customFetch,
		serverToken
	)) as { data: ReminderStatus } | ReminderStatus;
	return 'data' in res ? res.data : res;
}

/** Send a reminder to every unpaid participant in a session. */
export async function sendBulkReminder(
	sessionId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<ReminderResponse> {
	return post(`/sessions/${sessionId}/bulk-reminder`, {}, customFetch, serverToken);
}

/** Retry the most recent notification for a single participant.
 *  Not subject to the session-level dirty gate (per-participant
 *  retries of a failed delivery are always allowed); reminder
 *  rate-limit still applies when the previous send was a reminder. */
export async function retryParticipantNotification(
	participantId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{
	success: boolean;
	data?: { message: string; status: string; type: string; queued_at: string };
}> {
	return post(`/participants/${participantId}/notifications/retry`, {}, customFetch, serverToken);
}
