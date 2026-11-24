import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { loginAs, resetApi } from './helpers';
import { ROUTES } from './routes';

test.beforeEach(resetApi);

// axe on every screen: WCAG 2.1 A/AA rules. Serious and critical findings
// fail; minor ones are printed so they can be picked up later.
for (const r of ROUTES.filter((x) => x.name !== 'styleguide')) {
	test(`axe: ${r.name}`, async ({ page, context }) => {
		if (r.who !== 'anon') await loginAs(context, r.who);
		await page.goto(r.path, { waitUntil: 'networkidle' });
		const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
		const blocking = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
		for (const v of violations.filter((x) => !blocking.includes(x))) console.log(`[axe ${r.name}] ${v.impact}: ${v.id} (${v.nodes.length})`);
		expect(
			blocking.map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`),
			'serious/critical axe violations'
		).toEqual([]);
	});
}

test('keyboard: skip link, then the main nav, on the host app', async ({ page, context }, testInfo) => {
	test.skip(testInfo.project.name === 'mobile', 'Desktop sidebar');
	await loginAs(context, 'host');
	await page.goto('/dashboard');
	await page.keyboard.press('Tab');
	await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/#main$/);
});

test('keyboard: row menus open, move and close without a mouse', async ({ page, context }) => {
	await loginAs(context, 'host');
	await page.goto('/contacts');
	const trigger = page.getByRole('button', { name: 'More actions for Alya Kusuma' });
	await trigger.focus();
	await page.keyboard.press('Enter');
	const menu = page.getByRole('menu', { name: 'More actions for Alya Kusuma' });
	await expect(menu.getByRole('menuitem').first()).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(menu.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(menu).toBeHidden();
	await expect(trigger).toBeFocused();
});

test('keyboard: dialogs trap focus and give it back', async ({ page, context }) => {
	await loginAs(context, 'host');
	await page.goto('/contacts');
	const add = page.getByRole('button', { name: /^Add/ });
	await add.focus();
	await page.keyboard.press('Enter');
	const dialog = page.getByRole('dialog', { name: 'New contact' });
	await expect(dialog).toBeVisible();
	for (let i = 0; i < 12; i++) {
		await page.keyboard.press('Tab');
		expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
	}
	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
	await expect(add).toBeFocused();
});
