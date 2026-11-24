import { test, expect } from '@playwright/test';
import { loginAs, resetApi, shoot } from './helpers';

test.beforeEach(resetApi);

for (const [path, title, first] of [
	['/tos', 'Terms of service', 'Agreeing to these terms'],
	['/privacy', 'Privacy policy', 'What we collect'],
	['/cookies', 'Cookies', 'Which cookies']
] as const) {
	test(`${title}: contents list jumps to sections`, async ({ page }, testInfo) => {
		await page.goto(path);
		await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
		await expect(page.getByText('Draft.')).toBeVisible();
		const toc = page.getByRole('navigation', { name: 'On this page' });
		await toc.getByRole('link', { name: new RegExp(first) }).click();
		await expect(page).toHaveURL(new RegExp(`${path}#`));
		await expect(page.getByRole('heading', { level: 2, name: first })).toBeInViewport();
		await expect(page.getByRole('navigation', { name: 'Other policies' }).getByRole('link', { name: title })).toHaveAttribute('aria-current', 'page');
		if (path === '/tos') await shoot(page, testInfo, 'legal-tos');
	});
}

test('404 offers a way home that fits who you are', async ({ page, context }, testInfo) => {
	await page.goto('/no-such-page');
	await expect(page.getByRole('heading', { name: "This page isn't here" })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Go to Letpai' })).toHaveAttribute('href', '/');
	await shoot(page, testInfo, 'error-404');

	await loginAs(context, 'host');
	await page.goto('/no-such-page');
	await expect(page.getByRole('link', { name: 'Go to dashboard' })).toHaveAttribute('href', '/dashboard');
});

test('a dead payment link tells the guest what to do', async ({ page }) => {
	await page.goto('/payment/not-a-real-link');
	await expect(page.getByRole('heading', { name: "This page isn't here" })).toBeVisible();
	await expect(page.getByText('Ask them to send it again.')).toBeVisible();
});
