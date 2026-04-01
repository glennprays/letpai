import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    const formData = await request.formData();
    const whatsapp_number = formData.get('whatsapp_number') as string;
    const password = formData.get('password') as string;
    console.log("password", password, "whatsapp_number", whatsapp_number);

    if (!whatsapp_number || !password) {
      return fail(400, { message: 'Please fill in all fields' });
    }

    try {
      // Call backend API from server-side
      const API_BASE = 'http://localhost:3000/api/v1';
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp_number, password })
      });

      const data = await response.json();

      if (data.success) {
        // Set cookie for SSR
        cookies.set('token', data.token, {
          path: '/',
          httpOnly: false,
          secure: false, // Set to true in production with HTTPS
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        });

        // Get return URL from form data
        const returnURL = formData.get('return') as string || '/dashboard';
        throw redirect(303, returnURL);
      } else {
        return fail(401, {
          message: data.error?.message || 'Invalid credentials'
        });
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'location' in error) {
        // This is a redirect, re-throw it
        throw error;
      }
      console.error('Login error:', error);
      return fail(500, {
        message: 'An error occurred during login'
      });
    }
  }
};
