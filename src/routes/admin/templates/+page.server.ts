import { listAdminTemplates } from '$lib/services/admin';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const token = cookies.get('admin_token');
	if (!token) throw redirect(302, '/admin/login');

	try {
		const { templates } = await listAdminTemplates(fetch, token);
		return { templates };
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Failed to load templates';
		return { templates: [], error: msg };
	}
};
