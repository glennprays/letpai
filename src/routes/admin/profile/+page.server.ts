import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { setupAdminPassword, updateAdminOwnProfile } from '$lib/services/admin';

// The layout already gates on admin_token and loads the profile; the
// page just re-exposes it (via parent()) so the template can read
// profile fields without a re-fetch.
export const load: PageServerLoad = async ({ cookies, parent }) => {
	const token = cookies.get('admin_token');
	if (!token) throw redirect(303, '/admin/login');
	const { profile } = await parent();
	return { profile };
};

export const actions: Actions = {
	rename: async ({ request, cookies, fetch }) => {
		const token = cookies.get('admin_token');
		if (!token) throw redirect(303, '/admin/login');

		const form = await request.formData();
		const full_name = (form.get('full_name') as string | null)?.trim() || '';

		if (full_name.length < 2 || full_name.length > 100) {
			return fail(400, {
				kind: 'rename' as const,
				error: 'Name must be between 2 and 100 characters',
				full_name
			});
		}

		try {
			await updateAdminOwnProfile({ full_name }, fetch, token);
			return { kind: 'rename' as const, success: true, message: 'Profile updated', full_name };
		} catch (err) {
			return fail(400, {
				kind: 'rename' as const,
				error: err instanceof Error ? err.message : 'Failed to update profile',
				full_name
			});
		}
	},

	setPassword: async ({ request, cookies, fetch }) => {
		const token = cookies.get('admin_token');
		if (!token) throw redirect(303, '/admin/login');

		const form = await request.formData();
		const new_password = (form.get('new_password') as string | null) ?? '';
		const confirm = (form.get('confirm') as string | null) ?? '';

		if (new_password.length < 8 || new_password.length > 100) {
			return fail(400, {
				kind: 'setPassword' as const,
				error: 'Password must be 8–100 characters'
			});
		}
		if (new_password !== confirm) {
			return fail(400, {
				kind: 'setPassword' as const,
				error: 'Passwords do not match'
			});
		}

		try {
			await setupAdminPassword(new_password, fetch, token);
			return { kind: 'setPassword' as const, success: true, message: 'Password saved' };
		} catch (err) {
			return fail(400, {
				kind: 'setPassword' as const,
				error: err instanceof Error ? err.message : 'Failed to save password'
			});
		}
	}
};
