import { test, expect } from '@playwright/test';
import { resetApi } from './helpers';

test.beforeEach(resetApi);

test('landing page has full link-preview metadata', async ({ page, request }) => {
	await page.goto('/');
	await expect(page).toHaveTitle('Letpai · You paid. They pay you back.');
	const og = await page.locator('meta[property="og:image"]').getAttribute('content');
	expect(og).toMatch(/\/og\/landing\.png$/);
	expect((await request.get(new URL(og!).pathname)).status()).toBe(200);
	await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
	for (const href of ['/site.webmanifest', '/apple-touch-icon.png', '/og/default.png', '/og/payment.png']) {
		expect((await request.get(href)).status(), href).toBe(200);
	}
});

// WhatsApp renders a preview card from these tags in the chat itself, so a
// payment link must not leak who owes what to anyone glancing at the chat.
test('payment link metadata never reveals the amount, person or session', async ({ page }) => {
	await page.goto('/payment/s-dinner-p3');
	const head = await page.evaluate(() =>
		[document.title, ...[...document.querySelectorAll('meta')].map((m) => m.getAttribute('content') ?? '')].join(' | ')
	);
	expect(head).toContain('A bill is waiting for you');
	for (const secret of ['Citra', 'Rp', '177', 'Friday dinner', 'Sate Khas']) {
		expect(head, secret).not.toContain(secret);
	}
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});
