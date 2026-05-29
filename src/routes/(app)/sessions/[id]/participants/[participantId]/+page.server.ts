import { error } from '@sveltejs/kit';
import { getPaymentPage } from '$lib/services/payments';
import type { PageServerLoad } from './$types';

// Host-side per-participant detail. The data shape we need (per-bill
// breakdown, bank info, proof status) is the same one the public
// payment page consumes, so we fetch the same backend endpoint here.
// The host's "actions" (approve, request update, mark paid, remove,
// remind) are wired straight to existing services on the client.
export const load: PageServerLoad = async ({ params, fetch }) => {
	const { id: sessionId, participantId } = params;
	try {
		const page = await getPaymentPage(participantId, fetch);
		return { sessionId, participantId, page };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		throw error(404, `Participant not found: ${msg}`);
	}
};
