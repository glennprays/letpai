import { error } from '@sveltejs/kit';
import { getPaymentPage } from '$lib/services/payments';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	// The `[token]` path segment is the participant's public_slug
	// (10 URL-safe chars) for new links; legacy 36-char UUIDs from
	// messages sent before the slug migration still resolve via the
	// backend's slug-or-UUID boundary.
	const token = params.token;
	if (!token) {
		throw error(404, 'Invalid payment link');
	}

	try {
		const page = await getPaymentPage(token, fetch);
		// participantId on the returned data is the canonical UUID
		// so existing call sites (submitPayment etc.) keep working.
		return { page, participantId: page.participant_id };
	} catch (err) {
		console.error('Load payment page error:', err);
		throw error(404, 'This payment link is no longer valid.');
	}
};
