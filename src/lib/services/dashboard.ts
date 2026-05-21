import { get } from './api';
import type { DashboardStats } from '$lib/types/api';

export async function getDashboardStats(
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<DashboardStats> {
	return get('/dashboard', customFetch, serverToken);
}
