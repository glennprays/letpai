import { error } from '@sveltejs/kit';
import { getPaymentPage } from '$lib/services/payments';
import { getReminderStatus, type ReminderStatus } from '$lib/services/notifications';
import type { PageServerLoad } from './$types';

// Host-side per-participant detail. The data shape we need (per-bill
// breakdown, bank info, proof status) is the same one the public
// payment page consumes, so we fetch the same backend endpoint here.
// The host's "actions" (approve, request update, mark paid, remove,
// remind) are wired straight to existing services on the client.
//
// We additionally pre-fetch the reminder cooldown so the FE can render
// the Remind button as already-disabled with a countdown on first
// paint when the host is mid-cooldown. The fetch is best-effort —
// failure to load it shouldn't block the page.
export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
	const { id: sessionId, participantId } = params;
	const token = cookies.get('token');
	try {
		const [page, reminderStatusResult] = await Promise.all([
			getPaymentPage(participantId, fetch),
			getReminderStatus(participantId, fetch, token).catch<ReminderStatus>(() => ({
				can_send: true,
				retry_after_seconds: 0
			}))
		]);
		return { sessionId, participantId, page, reminderStatus: reminderStatusResult };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		throw error(404, `Participant not found: ${msg}`);
	}
};
