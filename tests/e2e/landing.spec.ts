import { test, expect } from '@playwright/test';
import { loginAs, resetApi } from './helpers';

test.beforeEach(resetApi);

test('signed out: the hero CTA starts a split (registration)', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('You paid. They pay you back.');
	const cta = page.getByRole('main').getByRole('link', { name: "Start a split, it's free" });
	await expect(cta).toHaveAttribute('href', '/register');
	await page.getByRole('main').getByRole('link', { name: 'See how it works' }).click();
	await expect(page.locator('#how')).toBeInViewport();
});

test('signed in: the same CTA opens the dashboard on first paint', async ({ page, context }) => {
	await loginAs(context, 'host');
	// JavaScript off proves the server-rendered HTML already has the right link.
	const res = await page.request.get('/');
	expect(await res.text()).toContain('href="/dashboard"');
	await page.goto('/');
	await page.getByRole('main').getByRole('link', { name: 'Open Letpai' }).first().click();
	await expect(page).toHaveURL(/\/dashboard$/);
});

test('one lime stamp at most, and no layout shift in the hero', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('.bg-lime')).toHaveCount(1);
	const cls = await page.evaluate(
		() =>
			new Promise<number>((resolve) => {
				let total = 0;
				new PerformanceObserver((list) => {
					for (const e of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
						if (!e.hadRecentInput) total += e.value;
					}
				}).observe({ type: 'layout-shift', buffered: true });
				setTimeout(() => resolve(total), 800);
			})
	);
	expect(cls).toBeLessThan(0.05);
});

test('about page renders its sections', async ({ page }) => {
	await page.goto('/about');
	for (const h of ['Why we built it', 'If you paid', 'If you got a link', 'What we promise']) {
		await expect(page.getByRole('heading', { name: h })).toBeVisible();
	}
});
