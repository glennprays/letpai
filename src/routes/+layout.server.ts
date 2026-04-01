import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const token = cookies.get('token');

	// For SSR, just check if token exists
	// Actual user profile will be fetched client-side
	return {
		isAuthenticated: !!token,
		token
	};
};
