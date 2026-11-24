import { test, expect } from '@playwright/test';
import { resetApi, shoot } from './helpers';

test.beforeEach(resetApi);

// 1×1 PNG.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

test('pending: amount, where to transfer with copy, then upload to done', async ({ page, context }, testInfo) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('/payment/s-dinner-p3');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rp 177.870');
	await expect(page.getByText('Hi Citra, your share of')).toBeVisible();
	// No marketing nav on a guest link.
	await expect(page.getByRole('navigation', { name: 'Site' })).toHaveCount(0);

	await page.getByRole('button', { name: 'Copy BCA account number' }).click();
	await expect(page.getByRole('button', { name: 'Copied' }).first()).toBeVisible();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('5270123488');

	await expect(page.getByRole('button', { name: 'Send screenshot' })).toBeDisabled();
	await page.locator('#proof').setInputFiles({ name: 'transfer.png', mimeType: 'image/png', buffer: PNG });
	await expect(page.getByAltText('Your selected screenshot')).toBeVisible();
	await shoot(page, testInfo, 'pay-ready-to-send');
	await page.getByRole('button', { name: 'Send screenshot' }).click();

	await expect(page.getByRole('heading', { name: 'Screenshot sent' })).toBeVisible();
	await expect(page.getByText('Proof sent', { exact: true })).toBeVisible();
});

test('rejects non-images and files over 5 MB with a clear message', async ({ page }) => {
	await page.goto('/payment/s-dinner-p3');
	await page.locator('#proof').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') });
	await expect(page.getByRole('alert')).toContainText('not an image');
	await page.locator('#proof').setInputFiles({ name: 'big.png', mimeType: 'image/png', buffer: Buffer.alloc(6 * 1024 * 1024) });
	await expect(page.getByRole('alert')).toContainText('The limit is 5 MB');
});

test('submitted: waiting state, and the option to replace the screenshot', async ({ page }) => {
	await page.goto('/payment/s-dinner-p2');
	await expect(page.getByRole('heading', { name: 'Screenshot sent' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Then upload the screenshot' })).toHaveCount(0);
	await page.getByRole('button', { name: 'Sent the wrong one? Upload again' }).click();
	await expect(page.getByRole('button', { name: 'Send screenshot' })).toBeVisible();
	await page.getByRole('button', { name: 'Keep the one I sent' }).click();
	await expect(page.getByRole('heading', { name: 'Screenshot sent' })).toBeVisible();
});

test('paid: the stamp and nothing left to do', async ({ page }) => {
	await page.goto('/payment/s-dinner-p1');
	await expect(page.getByRole('heading', { name: "You're all settled" })).toBeVisible();
	await expect(page.locator('.bg-lime')).toHaveCount(1);
	await expect(page.getByRole('button', { name: 'Send screenshot' })).toHaveCount(0);
});

test('rejected: the host note sits above the new upload', async ({ page }) => {
	await page.goto('/payment/s-dinner-p4');
	const note = page.getByText('The host needs a new screenshot');
	const upload = page.getByRole('heading', { name: 'Upload a new screenshot' });
	await expect(note).toBeVisible();
	await expect(page.getByText(/screenshot is cropped/)).toBeVisible();
	expect((await note.boundingBox())!.y).toBeLessThan((await upload.boundingBox())!.y);
	await expect(page.getByText('Needs a new proof')).toBeVisible();
});

test('expired: explains what to do, no upload', async ({ page }) => {
	await page.goto('/payment/s-bali-p3');
	await expect(page.getByRole('heading', { name: 'This link has expired' })).toBeVisible();
	await expect(page.getByText(/Ask the person who sent it/)).toBeVisible();
	await expect(page.locator('#proof')).toHaveCount(0);
});

test('one breakdown only (it used to appear twice)', async ({ page }) => {
	await page.goto('/payment/s-dinner-p4');
	await expect(page.getByRole('heading', { name: 'What it covers' })).toHaveCount(1);
	await expect(page.getByText('Fee breakdown')).toHaveCount(0);
	await expect(page.getByText('Service 5%')).toHaveCount(1);
});
