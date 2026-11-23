import { test, expect } from '@playwright/test';
import { loginAs, resetApi } from './helpers';

test.beforeEach(resetApi);

test('app navigation marks the current page and reaches every section', async ({ page, context }, testInfo) => {
	await loginAs(context, 'host');
	await page.goto('/dashboard');
	const nav = page.getByRole('navigation', { name: 'Main' }).locator('visible=true');
	await expect(nav).toHaveCount(1);
	await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');

	for (const [label, path] of [
		['Contacts', '/contacts'],
		['Profile', '/profile']
	] as const) {
		await nav.getByRole('link', { name: label }).click();
		await expect(page).toHaveURL(new RegExp(`${path}$`));
		await expect(nav.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
	}

	// "New session" is a coral button in the sidebar on desktop, the centre tab on mobile.
	const newSession = testInfo.project.name === 'mobile' ? nav.getByRole('link', { name: 'New session' }) : page.getByRole('link', { name: 'New session' }).first();
	await newSession.click();
	await expect(page).toHaveURL(/\/sessions\/new$/);
});

test('session detail keeps Sessions active', async ({ page, context }) => {
	await loginAs(context, 'host');
	await page.goto('/sessions/s-dinner');
	const nav = page.getByRole('navigation', { name: 'Main' }).locator('visible=true');
	await expect(nav.getByRole('link', { name: 'Sessions' })).toHaveAttribute('aria-current', 'page');
});

test('keyboard: skip link first, then the logo, then the main navigation', async ({ page, context }, testInfo) => {
	test.skip(testInfo.project.name === 'mobile', 'Tab order is checked on the desktop layout');
	await loginAs(context, 'host');
	await page.goto('/dashboard');
	await page.keyboard.press('Tab');
	await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(page.getByRole('link', { name: 'Letpai home' })).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(page.getByRole('navigation', { name: 'Main' }).first().getByRole('link', { name: 'Home' })).toBeFocused();
});

test('public pill nav: menu on mobile, links on desktop', async ({ page }, testInfo) => {
	await page.goto('/');
	if (testInfo.project.name === 'mobile') {
		const toggle = page.getByRole('button', { name: 'Open menu' });
		await toggle.click();
		await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
		await page.locator('#site-menu').getByRole('link', { name: 'Sign in' }).click();
	} else {
		await page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'Sign in' }).click();
	}
	await expect(page).toHaveURL(/\/login$/);
	await expect(page.getByRole('banner').getByRole('link', { name: 'Create an account' })).toBeVisible();
});
