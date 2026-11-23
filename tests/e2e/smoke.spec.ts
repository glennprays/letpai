import { test, expect } from '@playwright/test';
import { expectNoErrors, loginAs, resetApi, shoot, watchErrors } from './helpers';

type Who = 'anon' | 'host' | 'empty' | 'admin';

// Every screen in the app, with the identity it is viewed as. `name` doubles
// as the screenshot file name.
export const ROUTES: Array<{ name: string; path: string; who: Who }> = [
	{ name: 'landing', path: '/', who: 'anon' },
	{ name: 'about', path: '/about', who: 'anon' },
	{ name: 'tos', path: '/tos', who: 'anon' },
	{ name: 'privacy', path: '/privacy', who: 'anon' },
	{ name: 'cookies', path: '/cookies', who: 'anon' },
	{ name: 'error-404', path: '/this-page-does-not-exist', who: 'anon' },
	{ name: 'login', path: '/login', who: 'anon' },
	{ name: 'register', path: '/register', who: 'anon' },
	{ name: 'forgot-password', path: '/forgot-password', who: 'anon' },
	{ name: 'dashboard', path: '/dashboard', who: 'host' },
	{ name: 'dashboard-empty', path: '/dashboard', who: 'empty' },
	{ name: 'sessions', path: '/sessions', who: 'host' },
	{ name: 'session-detail', path: '/sessions/s-dinner', who: 'host' },
	{ name: 'session-detail-small', path: '/sessions/s-bali', who: 'host' },
	{ name: 'participant-detail', path: '/sessions/s-dinner/participants/s-dinner-p2', who: 'host' },
	{ name: 'session-new', path: '/sessions/new', who: 'host' },
	{ name: 'contacts', path: '/contacts', who: 'host' },
	{ name: 'contacts-empty', path: '/contacts', who: 'empty' },
	{ name: 'profile', path: '/profile', who: 'host' },
	{ name: 'settings', path: '/settings', who: 'host' },
	{ name: 'pay-pending', path: '/payment/s-dinner-p3', who: 'anon' },
	{ name: 'pay-submitted', path: '/payment/s-dinner-p2', who: 'anon' },
	{ name: 'pay-paid', path: '/payment/s-dinner-p1', who: 'anon' },
	{ name: 'pay-rejected', path: '/payment/s-dinner-p4', who: 'anon' },
	{ name: 'pay-expired', path: '/payment/s-bali-p3', who: 'anon' },
	{ name: 'admin-login', path: '/admin/login', who: 'anon' },
	{ name: 'admin-overview', path: '/admin', who: 'admin' },
	{ name: 'admin-admins', path: '/admin/admins', who: 'admin' },
	{ name: 'admin-profile', path: '/admin/profile', who: 'admin' },
	{ name: 'admin-templates', path: '/admin/templates', who: 'admin' },
	{ name: 'admin-whatsapp', path: '/admin/whatsapp', who: 'admin' }
];

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
