import { test, expect } from '@playwright/test';
import { loginAs, resetApi, shoot } from './helpers';
import { USERS } from '../fixtures/data';

test.beforeEach(resetApi);

test('profile shows who is signed in and saves a new name', async ({ page, context }, testInfo) => {
	await loginAs(context, 'host');
	await page.goto('/profile');
	const card = page.getByRole('region', { name: 'Signed in as' });
	await expect(card).toContainText('Raka Pratama');
	await expect(card).toContainText('+62 812-3456-7890');
	await shoot(page, testInfo, 'profile');

	// Save controls only appear once something changed.
	await expect(page.getByRole('button', { name: 'Save name' })).toHaveCount(0);
	await page.getByLabel('Name', { exact: true }).fill('Raka P.');
	await page.getByRole('button', { name: 'Undo' }).click();
	await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Raka Pratama');

	await page.getByLabel('Name', { exact: true }).fill('Raka P');
	await page.getByRole('button', { name: 'Save name' }).click();
	await expect(page.getByText('Name updated.')).toBeVisible();
	await expect(card).toContainText('Raka P');
	await expect(page.getByRole('button', { name: 'Save name' })).toHaveCount(0);
});

test('a new account without a name gets a one-field welcome step', async ({ page, context }, testInfo) => {
	const { token, ...user } = USERS.empty;
	const base = { domain: 'localhost', path: '/', sameSite: 'Lax' as const };
	await context.addCookies([
		{ ...base, name: 'token', value: token },
		{ ...base, name: 'user', value: encodeURIComponent(JSON.stringify({ ...user, full_name: '' })) }
	]);
	await page.goto('/dashboard');
	await expect(page).toHaveURL(/\/profile$/);
	await expect(page.getByRole('heading', { name: 'What do friends call you?' })).toBeVisible();
	await shoot(page, testInfo, 'profile-welcome');

	await page.getByRole('button', { name: 'Continue' }).click();
	await expect(page.getByText('Enter the name friends know you by.')).toBeVisible();
	await page.getByLabel('Your name').fill('Nadia Putri');
	await page.getByRole('button', { name: 'Continue' }).click();
	await expect(page).toHaveURL(/\/dashboard$/);
});

test('settings lists account, facts and legal links', async ({ page, context }, testInfo) => {
	await loginAs(context, 'host');
	await page.goto('/settings');
	const main = page.getByRole('main');
	await expect(main.getByRole('link', { name: /^Profile/ })).toContainText('Raka Pratama');
	await expect(page.getByRole('region', { name: 'How Letpai works for you' })).toContainText('IDR');
	for (const [name, href] of [
		['Change password', '/forgot-password'],
		['Terms of service', '/tos'],
		['Privacy policy', '/privacy'],
		['Cookies', '/cookies']
	]) {
		await expect(main.getByRole('link', { name: new RegExp(`^${name}`) })).toHaveAttribute('href', href);
	}
	await shoot(page, testInfo, 'settings');
});

test('sign out clears the session', async ({ page, context }) => {
	await loginAs(context, 'host');
	await page.goto('/settings');
	await page.getByRole('main').getByRole('button', { name: /Sign out/ }).click();
	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByText('Signed out.')).toBeVisible();
	const cookies = await context.cookies();
	expect(cookies.find((c) => c.name === 'token')?.value ?? '').toBe('');

	await page.goto('/dashboard');
	await expect(page).toHaveURL(/\/login/);
});
