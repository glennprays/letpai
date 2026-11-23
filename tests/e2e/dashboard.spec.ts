import { test, expect } from '@playwright/test';
import { loginAs, resetApi, shoot } from './helpers';

test.beforeEach(resetApi);

test('dashboard leads with the amount still owed, then sessions that need the host', async ({ page, context }) => {
	await loginAs(context, 'host');
	await page.goto('/dashboard');
	await expect(page.getByText('Still owed to you')).toBeVisible();
	await expect(page.getByText('Rp 4.326.465')).toBeVisible();
	await expect(page.getByText('10 payments open across 3 sessions')).toBeVisible();

	const needs = page.getByRole('region', { name: 'Needs you' });
	const rows = needs.getByRole('link');
	// Most unpaid people first; the empty draft comes last.
	await expect(rows.nth(0)).toContainText('Friday dinner');
	await expect(rows.nth(0)).toContainText('7 of 12 still to pay');
	await expect(rows.last()).toContainText('Karaoke night');
	await expect(rows.last()).toContainText('Nobody added yet');
	await expect(page.getByRole('region', { name: 'Recently settled' })).toContainText('Groceries');

	await rows.nth(0).click();
	await expect(page).toHaveURL(/\/sessions\/s-dinner$/);
});

test('empty account gets a first-session prompt', async ({ page, context }, testInfo) => {
	await loginAs(context, 'empty');
	await page.goto('/dashboard');
	await expect(page.getByRole('heading', { name: 'No sessions yet' })).toBeVisible();
	await expect(page.getByRole('main').locator('section').getByRole('link', { name: 'New session' })).toHaveAttribute('href', '/sessions/new');
	await shoot(page, testInfo, 'dashboard-empty-state');
});

test('a failing API shows a retry, not a blank page', async ({ page, context }, testInfo) => {
	await loginAs(context, 'broken');
	await page.goto('/dashboard');
	await expect(page.getByRole('heading', { name: "We couldn't load your sessions" })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
	await shoot(page, testInfo, 'dashboard-error');
});

test('sessions list filters by group and searches by name', async ({ page, context }) => {
	await loginAs(context, 'host');
	await page.goto('/sessions');
	const list = page.getByRole('main').locator('a[href^="/sessions/s-"]');
	await expect(list).toHaveCount(5);

	const filters = page.getByRole('group', { name: 'Filter sessions' });
	await filters.getByRole('button', { name: /Settled/ }).click();
	await expect(filters.getByRole('button', { name: /Settled/ })).toHaveAttribute('aria-pressed', 'true');
	await expect(list).toHaveCount(1);
	await expect(list.first()).toContainText('Groceries');

	await filters.getByRole('button', { name: /All/ }).click();
	await page.getByRole('searchbox', { name: 'Search sessions' }).fill('bali');
	await expect(list).toHaveCount(1);
	await page.getByRole('searchbox', { name: 'Search sessions' }).fill('zzz');
	await expect(page.getByText('No sessions match')).toBeVisible();
});

test('no stray Indonesian or gray utility copy on the list', async ({ page, context }) => {
	await loginAs(context, 'host');
	await page.goto('/sessions');
	await expect(page.getByText(/\bbayar\b/i)).toHaveCount(0);
});
