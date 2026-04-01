import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Check for token in cookie or localStorage (via client-side js)
  const token = event.cookies.get('token');

  // Add token to locals for use in load functions
  event.locals.token = token || null;
  event.locals.isAuthenticated = !!token;

  const protectedRoutes = ['/dashboard', '/sessions', '/contacts', '/profile'];
  const authRoutes = ['/login', '/register'];

  const isProtectedRoute = protectedRoutes.some(route =>
    event.url.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some(route =>
    event.url.pathname.startsWith(route)
  );

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !token) {
    const returnURL = encodeURIComponent(event.url.pathname + event.url.search);
    throw redirect(302, `/login?return=${returnURL}`);
  }

  // Redirect to dashboard if accessing auth route while logged in
  if (isAuthRoute && token) {
    throw redirect(302, '/dashboard');
  }

  const response = await resolve(event);
  return response;
};
