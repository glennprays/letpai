import { describe, expect, it } from 'vitest';
import { buildSeo, PAYMENT_SEO } from './seo';

describe('buildSeo', () => {
	it('uses the tagline as the default title and image', () => {
		const s = buildSeo({}, 'https://letpai.xyz', '/');
		expect(s.title).toBe('Letpai · You paid. They pay you back.');
		expect(s.image).toBe('https://letpai.xyz/og/default.png');
		expect(s.url).toBe('https://letpai.xyz/');
		expect(s.noindex).toBe(false);
	});

	it('suffixes page titles with the brand', () => {
		const s = buildSeo({ title: 'Sessions', noindex: true }, 'https://letpai.xyz', '/sessions');
		expect(s.title).toBe('Sessions · Letpai');
		expect(s.noindex).toBe(true);
	});
});

describe('payment link metadata', () => {
	it('never contains an amount, currency or name placeholder', () => {
		const s = buildSeo(PAYMENT_SEO, 'https://letpai.xyz', '/payment/abc');
		const text = [s.title, s.ogTitle, s.description, s.imageAlt].join(' ');
		expect(text).not.toMatch(/Rp|IDR|\d{2,}/);
		expect(s.image).toBe('https://letpai.xyz/og/payment.png');
		expect(s.noindex).toBe(true);
	});
});
