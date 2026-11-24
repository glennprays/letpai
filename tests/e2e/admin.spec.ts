import { test, expect, type Page } from '@playwright/test';
import { loginAs, resetApi, shoot } from './helpers';

test.beforeEach(resetApi);

const typeCode = (page: Page, code: string) => page.getByLabel('Digit 1 of 6').fill(code);

test('sign in with a WhatsApp code; a wrong code clears the boxes', async ({ page }, testInfo) => {
	await page.goto('/admin/login');
	await expect(page.getByRole('heading', { name: 'Admin sign in' })).toBeVisible();
	await shoot(page, testInfo, 'admin-login');
	await page.getByLabel('WhatsApp number').fill('89999999999');
	await page.getByRole('button', { name: 'Send code' }).click();

	await expect(page.getByRole('heading', { name: 'Check WhatsApp' })).toBeVisible();
	await expect(page.getByText('+62 899-9999-9999')).toBeVisible();
	await typeCode(page, '000000');
	await expect(page.getByRole('alert')).toContainText('Invalid code');
	await expect(page.getByLabel('Digit 1 of 6')).toHaveValue('');

	await typeCode(page, '123456');
	await expect(page).toHaveURL(/\/admin$/);
	await expect(page.getByRole('heading', { name: 'Hi Ops' })).toBeVisible();
});

test('password sign-in is one tap away', async ({ page }) => {
	await page.goto('/admin/login');
	await page.getByRole('button', { name: 'Use a password instead' }).click();
	await page.getByLabel('WhatsApp number').fill('89999999999');
	await page.getByLabel('Password', { exact: true }).fill('correct horse');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page).toHaveURL(/\/admin$/);
});

test('overview says when nothing needs attention', async ({ page, context }, testInfo) => {
	await loginAs(context, 'admin');
	await page.goto('/admin');
	await expect(page.getByText('Nothing needs you right now.')).toBeVisible();
	await expect(page.getByRole('link', { name: 'WhatsApp gateway' })).toContainText('Sending');
	await expect(page.getByRole('link', { name: 'Admin team' })).toContainText('2 active · 1 super admin');
	await shoot(page, testInfo, 'admin-overview');
});

test('invite, pause and remove an admin', async ({ page, context }, testInfo) => {
	await loginAs(context, 'admin');
	await page.goto('/admin/admins');
	const rows = page.getByTestId('admin-row');
	await expect(rows).toHaveCount(3);
	await expect(rows.filter({ hasText: 'Ops Admin' })).toContainText('You');
	await expect(rows.filter({ hasText: 'Ops Admin' }).getByRole('button', { name: /Actions for/ })).toHaveCount(0);
	await shoot(page, testInfo, 'admin-admins');

	await page.getByRole('button', { name: 'Invite admin' }).click();
	const dialog = page.getByRole('dialog', { name: 'Invite an admin' });
	await dialog.getByRole('button', { name: 'Send invite' }).click();
	await expect(dialog.getByRole('alert')).toContainText('Enter a valid WhatsApp number');
	await dialog.getByLabel('Name').fill('Dewi Finance');
	await dialog.getByLabel('WhatsApp number').fill('81122223333');
	await dialog.getByText('Super admin').click();
	await dialog.getByRole('button', { name: 'Send invite' }).click();
	await expect(dialog).toBeHidden();
	await expect(page.getByText('Admin invited')).toBeVisible();
	await expect(rows.filter({ hasText: 'Dewi Finance' })).toContainText('Super admin');

	await rows.filter({ hasText: 'Support Desk' }).getByRole('button', { name: 'Actions for Support Desk' }).click();
	await page.getByRole('menuitem', { name: 'Pause access' }).click();
	await expect(rows.filter({ hasText: 'Support Desk' })).toContainText('Paused');

	await rows.filter({ hasText: 'Dewi Finance' }).getByRole('button', { name: 'Actions for Dewi Finance' }).click();
	await page.getByRole('menuitem', { name: 'Remove' }).click();
	await page.getByRole('dialog', { name: 'Remove Dewi Finance?' }).getByRole('button', { name: 'Remove' }).click();
	await expect(page.getByText('Admin removed')).toBeVisible();
	await expect(rows).toHaveCount(3);
});

test('edit a template with a live preview, then save', async ({ page, context }, testInfo) => {
	await loginAs(context, 'admin');
	await page.goto('/admin/templates');
	const preview = page.getByRole('figure', { name: /Preview of/ });
	await expect(preview).toContainText('Hello, Alya');
	await expect(preview).toContainText('Rp125.000');

	const body = page.getByLabel('Message');
	await body.fill('Hi {{.ParticipantName}}, {{.Nickname}} pay ');
	await page.getByRole('group', { name: 'Insert a placeholder' }).getByRole('button', { name: 'Share' }).click();
	await expect(body).toHaveValue('Hi {{.ParticipantName}}, {{.Nickname}} pay {{.Share}}');
	await expect(preview).toHaveText('Hi Alya, {{.Nickname}} pay 125.000');
	await expect(page.getByRole('status')).toContainText("{{.Nickname}} isn't filled");
	await expect(page.getByLabel('Unsaved changes')).toBeVisible();
	await shoot(page, testInfo, 'admin-templates');

	// Switching templates keeps the draft.
	await page.getByRole('navigation', { name: 'Templates' }).getByRole('button', { name: /Reminder/ }).click();
	await expect(body).toHaveValue(/just a reminder/);
	await page.getByRole('navigation', { name: 'Templates' }).getByRole('button', { name: /New bill/ }).click();
	await expect(body).toHaveValue('Hi {{.ParticipantName}}, {{.Nickname}} pay {{.Share}}');

	await body.fill('Broken {{.ParticipantName');
	await page.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(page.getByRole('alert')).toContainText('unclosed action');

	await body.fill('Hi {{.ParticipantName}}, your share is Rp{{.Share}}.');
	await page.getByRole('button', { name: 'Save', exact: true }).click();
	await expect(page.getByText('New bill saved')).toBeVisible();
	await expect(page.getByLabel('Unsaved changes')).toHaveCount(0);
	await page.reload();
	await expect(body).toHaveValue('Hi {{.ParticipantName}}, your share is Rp{{.Share}}.');
});

test('send a test message to your own number', async ({ page, context }) => {
	await loginAs(context, 'admin');
	await page.goto('/admin/templates');
	await page.getByRole('button', { name: 'Send a test' }).click();
	const dialog = page.getByRole('dialog', { name: /Test “New bill”/ });
	await expect(dialog.getByLabel('Send to')).toHaveValue('89999999999');
	await dialog.getByLabel('ParticipantName').fill('Budi');
	await expect(dialog.getByRole('figure', { name: 'Message to be sent' })).toContainText('Hello, Budi');
	await dialog.getByRole('button', { name: 'Send test' }).click();
	await expect(page.getByText('Test sent to +62 899-9999-9999')).toBeVisible();
	await expect(dialog).toBeHidden();
});

test('whatsapp page shows status and a pairing code with a countdown', async ({ page, context }, testInfo) => {
	await loginAs(context, 'admin');
	await page.goto('/admin/whatsapp');
	await expect(page.getByText('Messages, reminders and codes are going out.')).toBeVisible();
	await expect(page.getByText('+62 899-8877-6655')).toBeVisible();
	await page.getByRole('button', { name: 'Show pairing code' }).click();
	await expect(page.getByRole('img', { name: 'WhatsApp pairing code' })).toBeVisible();
	await expect(page.getByText(/Expires in \d:\d\d/)).toBeVisible();
	await shoot(page, testInfo, 'admin-whatsapp');
});

test('rename yourself, guard the password form, and sign out', async ({ page, context }) => {
	await loginAs(context, 'admin');
	await page.goto('/admin/profile');
	await expect(page.getByRole('button', { name: 'Save name' })).toBeDisabled();
	await page.getByLabel('Shown to other admins').fill('Ops Lead');
	await page.getByRole('button', { name: 'Save name' }).click();
	await expect(page.getByText('Profile updated')).toBeVisible();
	await expect(page.getByRole('region', { name: 'Signed in as' })).toContainText('Ops Lead');

	await page.getByLabel('New password').fill('longenough');
	await page.getByLabel('Type it again').fill('different!');
	await expect(page.getByText("These don't match yet.")).toBeVisible();
	await expect(page.getByRole('button', { name: 'Change password' })).toBeDisabled();
	await page.getByLabel('Type it again').fill('longenough');
	await page.getByRole('button', { name: 'Change password' }).click();
	await expect(page.getByText('Password saved')).toBeVisible();

	await page.getByRole('main').getByRole('button', { name: 'Sign out' }).click();
	await expect(page).toHaveURL(/\/admin\/login$/);
	await page.goto('/admin');
	await expect(page).toHaveURL(/\/admin\/login$/);
});
