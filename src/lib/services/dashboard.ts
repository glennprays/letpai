import { get, post } from './api';
import type { DashboardStats, SessionsResponse, CreateSessionRequest, Session } from '$lib/types/api';

export async function getDashboardStats(customFetch?: typeof fetch, serverToken?: string): Promise<DashboardStats> {
	return get('/dashboard', customFetch, serverToken);
}

export async function getSessions(page = 1, limit = 10, customFetch?: typeof fetch, serverToken?: string): Promise<SessionsResponse> {
	return get(`/sessions?page=${page}&limit=${limit}`, customFetch, serverToken);
}

export async function createSession(data: CreateSessionRequest, customFetch?: typeof fetch, serverToken?: string): Promise<Session> {
	return post('/sessions', data, customFetch, serverToken);
}
