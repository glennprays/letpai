import { writable, derived } from 'svelte/store';

interface User {
  user_id: string;
  whatsapp_number: string;
  full_name: string;
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

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
  auth.update(state => ({ ...state, token, isAuthenticated: true }));
}

export function setUser(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
  auth.update(state => ({ ...state, user }));
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  auth.set({ token: null, user: null, isAuthenticated: false });
}

export function initAuth() {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  auth.set({
    token,
    user,
    isAuthenticated: !!token
  });
}
