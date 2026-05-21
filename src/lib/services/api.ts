import { browser } from '$app/environment';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Read the token client-side. Prefer the localStorage cache (written by
// setToken / initAuth) but fall back to parsing document.cookie so that the
// brief window between page hydration and initAuth running still authenticates.
function getToken(): string | null {
	if (!browser) return null;
	const cached = localStorage.getItem('token');
	if (cached) return cached;
	const match = document.cookie.match(/(?:^|; )token=([^;]+)/);
	return match ? decodeURIComponent(match[1]) : null;
}

// Centralised 401 handling: clear the local cache + bounce to /login.
// On the server side we just bubble the error so SvelteKit can decide what
// to do (typically the +page.server.ts will redirect itself).
function handle401(endpoint: string): never {
	console.error('[API] 401 Unauthorized for', endpoint);
	if (browser) {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
		document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
		const next = encodeURIComponent(window.location.pathname + window.location.search);
		window.location.href = `/login?return=${next}`;
	}
	throw new Error('Unauthorized. Please login again.');
}

async function readError(response: Response): Promise<string> {
	try {
		const body = await response.json();
		return body?.error?.message || body?.message || response.statusText;
	} catch {
		return response.statusText;
	}
}

async function request(
	method: 'GET' | 'POST' | 'PUT' | 'DELETE',
	endpoint: string,
	body: unknown,
	customFetch?: typeof fetch,
	serverToken?: string
) {
	const token = serverToken || getToken();
	const fetchFn = customFetch || fetch;
	const headers: Record<string, string> = {};
	if (body !== undefined && method !== 'GET' && method !== 'DELETE') {
		headers['Content-Type'] = 'application/json';
	}
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetchFn(`${API_BASE}${endpoint}`, {
		method,
		headers,
		body: body !== undefined && method !== 'GET' && method !== 'DELETE' ? JSON.stringify(body) : undefined
	});

	if (!response.ok) {
		if (response.status === 401) {
			handle401(endpoint);
		}
		throw new Error(await readError(response));
	}

	// DELETE responses may be empty
	if (response.status === 204) return null;
	return response.json();
}

export function get(endpoint: string, customFetch?: typeof fetch, serverToken?: string) {
	return request('GET', endpoint, undefined, customFetch, serverToken);
}

export function post(endpoint: string, data: unknown, customFetch?: typeof fetch, serverToken?: string) {
	return request('POST', endpoint, data, customFetch, serverToken);
}

export function put(endpoint: string, data: unknown, customFetch?: typeof fetch, serverToken?: string) {
	return request('PUT', endpoint, data, customFetch, serverToken);
}

export function del(endpoint: string, customFetch?: typeof fetch, serverToken?: string) {
	return request('DELETE', endpoint, undefined, customFetch, serverToken);
}
