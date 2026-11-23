import { expect, type BrowserContext, type Page, type TestInfo } from '@playwright/test';
import { ADMIN, USERS } from '../fixtures/data';

export const MOCK_API = 'http://localhost:3000';

export async function resetApi() {
	await fetch(`${MOCK_API}/__reset`, { method: 'POST' });
}

export async function loginAs(context: BrowserContext, who: 'host' | 'empty' | 'admin') {
	const base = { domain: 'localhost', path: '/', sameSite: 'Lax' as const };
	if (who === 'admin') {
		await context.addCookies([{ ...base, name: 'admin_token', value: ADMIN.token }]);
		return;
	}
	const { token, ...user } = USERS[who];
	await context.addCookies([
		{ ...base, name: 'token', value: token },
		{ ...base, name: 'user', value: encodeURIComponent(JSON.stringify(user)) }
	]);
}

// Collects console errors and uncaught exceptions for the lifetime of a page.
export function watchErrors(page: Page) {
	const errors: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
	});
	page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
	return errors;
}

// Screenshots land in tests/screenshots/<SHOT_SET>/<project>/<name>.png.
// SHOT_SET=before was captured once against the pre-redesign UI.
export async function shoot(page: Page, testInfo: TestInfo, name: string) {
	const set = process.env.SHOT_SET ?? 'current';
	await page.evaluate(() => document.fonts.ready);
	await page.screenshot({
		path: `tests/screenshots/${set}/${testInfo.project.name}/${name}.png`,
		fullPage: true,
		animations: 'disabled'
	});
}

export async function expectNoErrors(errors: string[]) {
	expect(errors, errors.join('\n')).toEqual([]);
}
