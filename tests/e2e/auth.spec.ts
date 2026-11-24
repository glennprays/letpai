import { test, expect } from '@playwright/test';
import { resetApi } from './helpers';

test.beforeEach(resetApi);

test('sign in with WhatsApp number and password lands on the dashboard', async ({ page }) => {
	await page.goto('/login');
	await page.getByLabel('WhatsApp number').fill('81234567890');
	await page.getByLabel('Password', { exact: true }).fill('correct-horse');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page).toHaveURL(/\/dashboard$/);
});

test('sign in errors show beside the fields, then from the server', async ({ page }) => {
	await page.goto('/login');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page.getByText('Enter your WhatsApp number.')).toBeVisible();
	await expect(page.getByText('Enter your password.')).toBeVisible();
	await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('aria-invalid', 'true');

	await page.getByLabel('WhatsApp number').fill('81234567890');
	await page.getByLabel('Password', { exact: true }).fill('wrong');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page.getByText('Use at least 8 characters.')).toBeVisible();
});

test('wrong password comes back as a readable message', async ({ page, request }) => {
	// Submit the action directly so the client-side 8-character rule doesn't stop it.
	const res = await request.post('/login', {
		form: { whatsapp_number: '6281234567890', password: 'wrong', return: '/dashboard' },
		headers: { origin: 'http://localhost:4173', 'x-sveltekit-action': 'true' }
	});
	const body = await res.text();
	expect(body).toContain('That number and password do not match.');
	expect(body).not.toContain('An error occurred');
});

test('keyboard only: tab through the form and submit with Enter', async ({ page }, testInfo) => {
	test.skip(testInfo.project.name === 'mobile', 'Keyboard flow checked on desktop');
	await page.goto('/login');
	await expect(page.getByLabel('WhatsApp number')).toBeFocused();
	await page.keyboard.type('81234567890');
	await page.keyboard.press('Tab'); // forgot link
	await page.keyboard.press('Tab'); // password
	await expect(page.getByLabel('Password', { exact: true })).toBeFocused();
	await page.keyboard.type('correct-horse');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/dashboard$/);
});

test('register: number and password, then the WhatsApp code', async ({ page }) => {
	await page.goto('/register');
	await page.getByLabel('WhatsApp number').fill('81111111111');
	await page.getByLabel('Password', { exact: true }).fill('a-long-Passw0rd');
	await expect(page.getByText('Strong')).toBeVisible();
	await page.getByRole('button', { name: 'Send me a code' }).click();

	await expect(page.getByRole('heading', { name: 'Check WhatsApp' })).toBeVisible();
	await expect(page.getByText('+62 811 1111 1111')).toBeVisible();
	await expect(page.getByText(/new one in 0:\d\d/)).toBeVisible();

	// A wrong code shows an inline error; the right one signs you in.
	await page.getByLabel('Digit 1 of 6').fill('000000');
	await expect(page.getByRole('alert')).toContainText('not right');
	await page.getByLabel('Digit 1 of 6').click();
	await page.keyboard.press('Control+A');
	await page.getByLabel('Digit 1 of 6').fill('123456');
	await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });
});

test('forgot password uses the WhatsApp code to set a new password', async ({ page }) => {
	await page.goto('/forgot-password');
	await page.getByLabel('WhatsApp number').fill('81234567890');
	await page.getByRole('button', { name: 'Send me a code' }).click();

	await expect(page.getByRole('heading', { name: 'Check WhatsApp' })).toBeVisible();
	await expect(page.getByText('+62 812 3456 7890')).toBeVisible();
	await expect(page.getByLabel('Digit 1 of 6')).toBeVisible();
	await expect(page.getByLabel('New password')).toBeVisible();
	await expect(page.getByText(/reset link/i)).not.toBeVisible();

	await page.getByLabel('Digit 1 of 6').fill('123456');
	await page.getByLabel('New password').fill('new-correct-horse');
	await page.getByRole('button', { name: 'Reset password' }).click();
	await expect(page.getByRole('heading', { name: 'Password updated' })).toBeVisible();
})
