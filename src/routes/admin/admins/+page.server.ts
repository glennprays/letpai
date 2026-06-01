import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import {
	createAdmin,
	deleteAdmin,
	listAdmins,
	updateAdmin
} from '$lib/services/admin';

export const load: PageServerLoad = async ({ cookies, fetch, parent }) => {
	const token = cookies.get('admin_token');
	if (!token) throw redirect(303, '/admin/login');

	const { profile } = await parent();
	if (!profile || profile.role !== 'super_admin') {
		throw error(403, 'Only super admins can manage other admins');
	}

	try {
		const { admins } = await listAdmins(fetch, token);
		return { admins };
	} catch (err) {
		console.warn('[admin/admins] list load failed:', err);
		return { admins: [] };
	}
};

export const actions: Actions = {
	create: async ({ request, cookies, fetch }) => {
		const token = cookies.get('admin_token');
		if (!token) throw redirect(303, '/admin/login');

		const form = await request.formData();
		const whatsapp_number = (form.get('whatsapp_number') as string | null)?.trim() || '';
		const full_name = (form.get('full_name') as string | null)?.trim() || '';
		const role = (form.get('role') as string | null) || 'admin';
		// Temporary password is opt-in. Only forwarded to the backend
		// when both the toggle is on AND the field has 8+ chars.
		const setTemp = form.get('set_temp_password') === 'on';
		const password = setTemp ? ((form.get('password') as string | null) ?? '') : '';

		if (!whatsapp_number || whatsapp_number.length < 10) {
			return fail(400, {
				kind: 'create' as const,
				error: 'Enter a valid WhatsApp number',
				whatsapp_number,
				full_name,
				role
			});
		}
		if (!full_name || full_name.length < 2) {
			return fail(400, {
				kind: 'create' as const,
				error: 'Enter a name',
				whatsapp_number,
				full_name,
				role
			});
		}
		if (role !== 'super_admin' && role !== 'admin') {
			return fail(400, {
				kind: 'create' as const,
				error: 'Pick a valid role',
				whatsapp_number,
				full_name,
				role
			});
		}
		if (setTemp && (password.length < 8 || password.length > 100)) {
			return fail(400, {
				kind: 'create' as const,
				error: 'Temporary password must be 8–100 characters',
				whatsapp_number,
				full_name,
				role
			});
		}

		try {
			await createAdmin(
				{
					whatsapp_number,
					full_name,
					role,
					...(password ? { password } : {})
				},
				fetch,
				token
			);
			return {
				kind: 'create' as const,
				success: true,
				message: password ? 'Admin invited with a temporary password' : 'Admin invited'
			};
		} catch (err) {
			return fail(400, {
				kind: 'create' as const,
				error: err instanceof Error ? err.message : 'Failed to create admin',
				whatsapp_number,
				full_name,
				role
			});
		}
	},

	update: async ({ request, cookies, fetch }) => {
		const token = cookies.get('admin_token');
		if (!token) throw redirect(303, '/admin/login');

		const form = await request.formData();
		const admin_id = form.get('admin_id') as string | null;
		if (!admin_id) return fail(400, { kind: 'update' as const, error: 'Missing admin id' });

		const payload: { full_name?: string; role?: 'super_admin' | 'admin'; is_active?: boolean } = {};
		const full_name = (form.get('full_name') as string | null)?.trim();
		const role = form.get('role') as string | null;
		const isActiveRaw = form.get('is_active');

		if (full_name) payload.full_name = full_name;
		if (role === 'super_admin' || role === 'admin') payload.role = role;
		if (isActiveRaw !== null) payload.is_active = isActiveRaw === 'true';

		if (Object.keys(payload).length === 0) {
			return fail(400, { kind: 'update' as const, error: 'Nothing to change', admin_id });
		}

		try {
			await updateAdmin(admin_id, payload, fetch, token);
			return { kind: 'update' as const, success: true, admin_id, message: 'Admin updated' };
		} catch (err) {
			return fail(400, {
				kind: 'update' as const,
				admin_id,
				error: err instanceof Error ? err.message : 'Failed to update admin'
			});
		}
	},

	delete: async ({ request, cookies, fetch }) => {
		const token = cookies.get('admin_token');
		if (!token) throw redirect(303, '/admin/login');

		const form = await request.formData();
		const admin_id = form.get('admin_id') as string | null;
		if (!admin_id) return fail(400, { kind: 'delete' as const, error: 'Missing admin id' });

		try {
			await deleteAdmin(admin_id, fetch, token);
			return { kind: 'delete' as const, success: true, admin_id, message: 'Admin removed' };
		} catch (err) {
			return fail(400, {
				kind: 'delete' as const,
				admin_id,
				error: err instanceof Error ? err.message : 'Failed to remove admin'
			});
		}
	}
};
