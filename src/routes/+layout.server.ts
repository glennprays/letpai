import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
	// Get token from cookie (set by hooks.ts) or locals
	const token = cookies.get('token') || locals.token;
	const isAuthenticated = locals.isAuthenticated;

	// Parse user from localStorage equivalent (we'll store minimal user data in cookie/jwt)
	// For now, just return the auth state
	let user = null;
	if (isAuthenticated && token) {
		// TODO: Decode JWT to get user data, or fetch from API
		// For now, we'll return minimal user info
		user = {
			user_id: '',
			whatsapp_number: '',
			full_name: 'User'
		};
	}

	return {
		isAuthenticated,
		token,
		user
	};
};
