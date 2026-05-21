import { error } from '@sveltejs/kit';
import { getPaymentPage } from '$lib/services/payments';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	// The `[token]` path segment is the participant_id — historical naming.
	const participantId = params.token;
	if (!participantId) {
		throw error(404, 'Invalid payment link');
	}

	try {
		const page = await getPaymentPage(participantId, fetch);
		return { page, participantId };
	} catch (err) {
		console.error('Load payment page error:', err);
		throw error(404, 'This payment link is no longer valid.');
	}
};
