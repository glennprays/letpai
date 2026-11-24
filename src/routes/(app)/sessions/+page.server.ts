import type { PageServerLoad } from './$types';
import { getSessions } from '$lib/services/sessions';
import { narrowSessions } from '$lib/services/sessions-list';
import { toUserMessage } from '$lib/services/api';
import type { Session } from '$lib/types/api';

// Full list of the host's sessions. Filtering and search happen client-side;
// hosts rarely have more than a few dozen sessions.
export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const token = cookies.get('token');
	try {
		const { sessions } = narrowSessions(await getSessions(1, 100, fetch, token));
		return { sessions, error: null as string | null };
	} catch (error) {
		console.error('Sessions load error:', error);
		return { sessions: [] as Session[], error: toUserMessage(error, "We couldn't load your sessions.") };
	}
};
