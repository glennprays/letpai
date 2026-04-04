import { writable, derived } from 'svelte/store';

interface User {
  user_id: string;
  whatsapp_number: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { token: null, user: null, isAuthenticated: false };
  }
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  return {
    token,
    user,
    isAuthenticated: !!token
  };
};

const initialState = getInitialState();

export const auth = writable<AuthState>(initialState);

export const isAuthenticated = derived(auth, ($auth) => $auth.isAuthenticated);
export const user = derived(auth, ($auth) => $auth.user);

export function setToken(token: string, cookieSetter?: (name: string, value: string, options?: Record<string, unknown>) => void) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);

    // Only set cookie client-side if not already set by server
    if (!document.cookie.includes('token=')) {
      const isSecure = import.meta.env.PROD;
      const expires = new Date();
      expires.setDate(expires.getDate() + 30); // 30 days

      document.cookie = `token=${encodeURIComponent(token)}; path=/; expires=${expires.toUTCString()}; SameSite=lax${isSecure ? '; Secure' : ''}`;
    }
  }
  if (cookieSetter) {
    cookieSetter('token', token, {
      path: '/',
      httpOnly: false, // Allow client-side access
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
  }
  auth.update(state => ({ ...state, token, isAuthenticated: true }));
}

export function setUser(user: User, cookieSetter?: (name: string, value: string, options?: Record<string, unknown>) => void) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));

    // Also set user cookie for SSR access
    if (cookieSetter) {
      cookieSetter('user', JSON.stringify(user), {
        path: '/',
        httpOnly: false,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    } else {
      // Fallback: set cookie directly client-side
      const isSecure = import.meta.env.PROD;
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; expires=${expires.toUTCString()}; SameSite=lax${isSecure ? '; Secure' : ''}`;
    }
  }
  auth.update(state => ({ ...state, user }));
}

export function logout(cookieDeleter?: (name: string, options?: Record<string, unknown>) => void) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
  if (cookieDeleter) {
    cookieDeleter('token', { path: '/' });
    cookieDeleter('user', { path: '/' });
  }
  auth.set({ token: null, user: null, isAuthenticated: false });
}

export function initAuth(cookieToken?: string | null, cookieUser?: string | null) {
  if (typeof window === 'undefined') return;

  // Prefer cookie token over localStorage for SSR sync
  const token = cookieToken || localStorage.getItem('token');
  const userStr = cookieUser || localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // IMPORTANT: Always sync cookie token to localStorage if available
  // This ensures client-side API calls have access to the token
  if (cookieToken && cookieToken !== localStorage.getItem('token')) {
    localStorage.setItem('token', cookieToken);
  }

  // Sync cookie user to localStorage if available
  if (cookieUser && cookieUser !== localStorage.getItem('user')) {
    localStorage.setItem('user', cookieUser);
  }

  auth.set({
    token,
    user,
    isAuthenticated: !!token
  });
}
