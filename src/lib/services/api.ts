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

  const result = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      console.error('[API] 401 Unauthorized for', endpoint);
      // Clear invalid token and redirect to login
      if (browser) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new Error('Unauthorized. Please login again.');
    }
    throw new Error(result.error?.message || response.statusText);
  }

  return result;
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
    if (response.status === 401) {
      console.error(`[API POST] 401 Unauthorized for ${endpoint}`);
      throw new Error('Unauthorized. Please login again.');
    }
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
    if (response.status === 401) {
      if (browser) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new Error('Unauthorized. Please login again.');
    }
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
    if (response.status === 401) {
      if (browser) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new Error('Unauthorized. Please login again.');
    }
    const error = await response.json();
    throw new Error(error.error?.message || response.statusText);
  }

  return response.json();
}
