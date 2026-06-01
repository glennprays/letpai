import { fail, redirect } from '@sveltejs/kit';
import { post } from '$lib/services/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    const formData = await request.formData();
    const whatsapp_number = formData.get('whatsapp_number') as string;
    const password = formData.get('password') as string;

    if (!whatsapp_number || !password) {
      return fail(400, { message: 'Please fill in all fields' });
    }

    let data: { success?: boolean; token?: string; user?: unknown; error?: { message?: string } };
    try {
      data = await post('/auth/login', { whatsapp_number, password }, fetch);
    } catch (err) {
      console.error('Login error:', err);
      return fail(500, { message: 'An error occurred during login' });
    }

    if (!data.success || !data.token) {
      return fail(401, { message: data.error?.message || 'Invalid credentials' });
    }

    // 30-day session cookies. Token is non-httpOnly so the SPA can attach it
    // as a bearer header on client-side fetches; user blob is non-httpOnly so
    // the client can hydrate without an extra /me roundtrip.
    const cookieOpts = {
      path: '/',
      httpOnly: false,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 30
    };
    cookies.set('token', data.token, cookieOpts);
    if (data.user) {
      cookies.set('user', JSON.stringify(data.user), cookieOpts);
    }

    const returnURL = (formData.get('return') as string) || '/dashboard';
    throw redirect(303, returnURL);
  }
};
