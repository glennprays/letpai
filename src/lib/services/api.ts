import { browser } from '$app/environment';

const API_BASE =
	(typeof window !== 'undefined' && (window as any).__env__?.VITE_API_URL) ||
	import.meta.env.VITE_API_URL ||
	'http://localhost:3000/api/v1';

// Two parallel cookie namespaces exist:
//   - `token` for end-user sessions (read by /(app) layout gates)
//   - `admin_token` for /admin sessions
// When a client-side fetch fires from an /admin/* page we must read the
// admin cookie, or every browser-side admin API call would land at the
// backend with no Authorization header → 401 → bounce to /login. When
// outside /admin we keep the existing user-token behaviour intact.
function isAdminPath(): boolean {
	return browser && window.location.pathname.startsWith('/admin');
}

function readCookie(name: string): string | null {
	const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
	return match ? decodeURIComponent(match[1]) : null;
}

// Read the token client-side. Prefer the localStorage cache (written by
// setToken / initAuth) but fall back to parsing document.cookie so that the
// brief window between page hydration and initAuth running still authenticates.
function getToken(): string | null {
	if (!browser) return null;
	// On admin pages, only the admin_token cookie is meaningful. The user
	// localStorage `token` is unrelated and would send a wrong bearer.
	if (isAdminPath()) {
		return readCookie('admin_token');
	}
	const cached = localStorage.getItem('token');
	if (cached) return cached;
	return readCookie('token');
}

// Centralised 401 handling: clear the local cache + bounce to the right
// login screen. On the server side we just bubble the error so SvelteKit
// can decide what to do (typically the +page.server.ts will redirect
// itself).
function handle401(endpoint: string): never {
	console.error('[API] 401 Unauthorized for', endpoint);
	if (browser) {
		if (isAdminPath()) {
			document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
			window.location.href = '/admin/login';
		} else {
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
			document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
			const next = encodeURIComponent(window.location.pathname + window.location.search);
			window.location.href = `/login?return=${next}`;
		}
	}
	throw new Error('Unauthorized. Please login again.');
}

// ApiError carries the structured pieces from a backend non-2xx response
// so call sites can branch on `status` (e.g. show a cooldown countdown
// on 429) instead of fishing strings out of `error.message`. The plain
// `Error` superclass keeps `instanceof Error` checks working downstream.
export class ApiError extends Error {
	status: number;
	code?: string;
	retryAfterSeconds?: number;
	nextAvailableAt?: string;
	body?: unknown;

	constructor(opts: {
		status: number;
		message: string;
		code?: string;
		retryAfterSeconds?: number;
		nextAvailableAt?: string;
		body?: unknown;
	}) {
		super(opts.message);
		this.name = 'ApiError';
		this.status = opts.status;
		this.code = opts.code;
		this.retryAfterSeconds = opts.retryAfterSeconds;
		this.nextAvailableAt = opts.nextAvailableAt;
		this.body = opts.body;
	}
}

async function buildApiError(response: Response, endpoint: string): Promise<ApiError> {
	let body: unknown;
	try {
		body = await response.json();
	} catch {
		body = undefined;
	}

	const bodyObj = (typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}) as Record<string, unknown>;
	const errObj = (typeof bodyObj.error === 'object' && bodyObj.error !== null ? (bodyObj.error as Record<string, unknown>) : null);

	const message =
		(errObj?.message as string | undefined) ||
		(bodyObj.message as string | undefined) ||
		response.statusText ||
		`Request to ${endpoint} failed`;

	// Retry-After can come in as either a numeric seconds JSON field or
	// the HTTP header (per RFC 7231). The header parses as either an
	// integer-seconds or an HTTP-date; we only handle the seconds form
	// because the backend always emits seconds.
	let retryAfterSeconds: number | undefined;
	const headerRetry = response.headers.get('Retry-After');
	if (headerRetry && /^\d+$/.test(headerRetry)) {
		retryAfterSeconds = parseInt(headerRetry, 10);
	} else if (typeof bodyObj.retry_after === 'number') {
		retryAfterSeconds = bodyObj.retry_after;
	}

	const nextAvailableAt =
		(bodyObj.next_available_at as string | undefined) ||
		(errObj?.next_available_at as string | undefined);

	return new ApiError({
		status: response.status,
		message,
		code: errObj?.code as string | undefined,
		retryAfterSeconds,
		nextAvailableAt,
		body
	});
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
		throw await buildApiError(response, endpoint);
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
