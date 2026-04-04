import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const token = cookies.get('token');
	const userCookie = cookies.get('user');

	// Parse user data from cookie if available
	let user = null;
	if (userCookie) {
		try {
			user = JSON.parse(userCookie);
		} catch (e) {
			console.error('Failed to parse user cookie:', e);
		}
	}

	return {
		isAuthenticated: !!token,
		token,
		user
	};
};
