import type { Actions, PageServerLoad } from './$types';
import { createSession, replaceBankAccounts, type BankAccountInput } from '$lib/services/sessions';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	// No pre-loading needed for create page
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, fetch }) => {
		const token = cookies.get('token');

		if (!token) {
			return fail(400, { error: 'Not authenticated' });
		}

		const formData = await request.formData();
		const title = formData.get('title')?.toString();
		const description = formData.get('description')?.toString() || undefined;
		const currency = formData.get('currency')?.toString() || 'IDR';

		// Bank accounts come in as repeatable rows:
		//   bank_name[]            → multi-value
		//   account_number[]
		//   account_holder[]
		// formData.getAll preserves order. Empty rows are dropped on
		// the server too (the backend's BulkReplace normalises and
		// drops blanks) so a sparse form still saves cleanly.
		const bankNames = formData.getAll('bank_name[]').map((v) => v.toString());
		const accountNumbers = formData.getAll('account_number[]').map((v) => v.toString());
		const accountHolders = formData.getAll('account_holder[]').map((v) => v.toString());
		const rowCount = Math.max(bankNames.length, accountNumbers.length, accountHolders.length);
		const accounts: BankAccountInput[] = [];
		for (let i = 0; i < rowCount; i++) {
			const row: BankAccountInput = {
				bank_name: bankNames[i]?.trim() || undefined,
				account_number: accountNumbers[i]?.trim() || undefined,
				account_holder: accountHolders[i]?.trim() || undefined
			};
			if (row.bank_name || row.account_number || row.account_holder) accounts.push(row);
		}

		// Legacy single-field form fallback — keeps the page server-action
		// compatible with the previous markup while the FE migrates.
		if (accounts.length === 0) {
			const legacyName = formData.get('bank_name')?.toString().trim();
			const legacyNumber = formData.get('bank_account_number')?.toString().trim();
			const legacyHolder = formData.get('bank_account_holder')?.toString().trim();
			if (legacyName || legacyNumber || legacyHolder) {
				accounts.push({
					bank_name: legacyName || undefined,
					account_number: legacyNumber || undefined,
					account_holder: legacyHolder || undefined
				});
			}
		}

		if (!title || title.trim().length === 0) {
			return fail(400, { error: 'Title is required' });
		}

		try {
			const result = await createSession(
				{
					title: title.trim(),
					description: description?.trim(),
					currency
				},
				fetch,
				token
			);

			// Handle different response structures
			let sessionId: string | undefined;

			// Try to get session_id from various possible structures
			if (result && typeof result === 'object') {
				if ('data' in result && result.data && typeof result.data === 'object' && 'session_id' in result.data) {
					sessionId = result.data.session_id as string;
				} else if ('session_id' in result) {
					sessionId = result.session_id as string;
				}
			}

			if (!sessionId) {
				console.error('No session ID in response. Full result:', result);
				return fail(500, { error: 'Failed to create session - no session ID returned' });
			}

			// Persist bank accounts as a separate call so the new-session
			// happy path doesn't depend on bank fields being filled in
			// (host can also add them later from /sessions/:id). Best-
			// effort — if this fails we still land on the detail page
			// with the session created.
			if (accounts.length > 0) {
				try {
					await replaceBankAccounts(sessionId, accounts, fetch, token);
				} catch (bankErr) {
					console.error('Bank accounts save failed (continuing):', bankErr);
				}
			}

			// Redirect to the session detail page using SvelteKit redirect
			throw redirect(302, `/sessions/${sessionId}`);
		} catch (error) {
			// Check if it's a redirect - rethrow it
			if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
				throw error;
			}

			console.error('Create session error:', error);
			const message = error instanceof Error ? error.message : 'Failed to create session';
			return fail(500, { error: message });
		}
	}
};
