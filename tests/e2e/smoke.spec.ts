import { test, expect } from '@playwright/test';
import { expectNoErrors, loginAs, resetApi, shoot, watchErrors } from './helpers';
import { ROUTES } from './routes';

test.beforeEach(async () => {
	await resetApi();
});

for (const r of ROUTES) {
	test(`renders ${r.name}`, async ({ page, context }, testInfo) => {
		if (r.who !== 'anon') await loginAs(context, r.who);
		const errors = watchErrors(page);
		const res = await page.goto(r.path, { waitUntil: 'networkidle' });
		expect(res, 'navigation response').not.toBeNull();
		const expected = r.name === 'error-404' ? 404 : 200;
		expect(res!.status()).toBe(expected);
		await expect(page.locator('body')).toBeVisible();
		await shoot(page, testInfo, r.name);
		// The 404 route logs the failed document request itself; ignore just that.
		await expectNoErrors(errors.filter((e) => !(r.name === 'error-404' && e.includes('404'))));
	});
}

test('browser config comes from the server env and is never cached', async ({ request }) => {
	const res = await request.get('/env.js');
	expect(res.status()).toBe(200);
	expect(res.headers()['cache-control']).toBe('no-store');
	expect(await res.text()).toMatch(/^window\.__env__ = \{"VITE_API_URL":"http:\/\/localhost:3000\/api\/v1"\};/);
});
