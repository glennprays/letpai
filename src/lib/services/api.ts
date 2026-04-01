import { browser } from '$app/environment';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

function getToken(): string | null {
  if (!browser) return null;
  return localStorage.getItem('token');
}

export async function get(endpoint: string, customFetch?: typeof fetch, serverToken?: string) {
  const token = serverToken || getToken();

  const fetchFn = customFetch || fetch;
  const response = await fetchFn(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || response.statusText);
  }

  return response.json();
}

export async function post(endpoint: string, data: unknown, customFetch?: typeof fetch, serverToken?: string) {
  const token = serverToken || getToken();

  const fetchFn = customFetch || fetch;
  const response = await fetchFn(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || response.statusText);
  }

  return response.json();
}

export async function put(endpoint: string, data: unknown, customFetch?: typeof fetch, serverToken?: string) {
  const token = serverToken || getToken();

  const fetchFn = customFetch || fetch;
  const response = await fetchFn(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || response.statusText);
  }

  return response.json();
}

export async function del(endpoint: string, customFetch?: typeof fetch, serverToken?: string) {
  const token = serverToken || getToken();

  const fetchFn = customFetch || fetch;
  const response = await fetchFn(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || response.statusText);
  }

  return response.json();
}
