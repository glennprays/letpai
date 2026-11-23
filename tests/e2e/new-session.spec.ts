import { test, expect } from '@playwright/test';
import { loginAs, resetApi, shoot } from './helpers';

test.beforeEach(resetApi);

test('name is required before moving on', async ({ page, context }) => {
	await loginAs(context, 'host');
	await page.goto('/sessions/new');
	await page.getByRole('button', { name: 'Next' }).click();
	await expect(page.getByText('Give it a name your friends will recognise.')).toBeVisible();
	await expect(page.getByLabel("What's it for?")).toBeFocused();
});

test('create a session with a suggested name and a bank account, then add people and an item', async ({ page, context }, testInfo) => {
	await loginAs(context, 'host');
	await page.goto('/sessions/new');
	await page.getByRole('group', { name: 'Suggestions' }).getByRole('button', { name: 'Trip' }).click();
	await expect(page.getByLabel("What's it for?")).toHaveValue('Trip');
	await page.getByLabel("What's it for?").fill('Trip to Bandung');
	await page.getByRole('button', { name: 'Next' }).click();

	await expect(page.getByRole('heading', { name: 'Where should they transfer?' })).toBeVisible();
	await page.getByRole('button', { name: 'BCA', exact: true }).click();
	await page.getByLabel('Account or phone number').fill('5270123488');
	await page.getByLabel('Name on the account').fill('Raka Pratama');
	await shoot(page, testInfo, 'session-new-step-2');
	await page.getByRole('button', { name: 'Create and add people' }).click();

	await expect(page).toHaveURL(/\/sessions\/s-new-\d+$/);
	await expect(page.getByRole('heading', { level: 1, name: 'Trip to Bandung' })).toBeVisible();
	const setup = page.getByRole('region', { name: 'Ready to send?' });
	await expect(setup.getByText('Transfer account set')).toBeVisible();

	// People: from saved contacts.
	await setup.getByRole('button', { name: 'Add people' }).click();
	const add = page.getByRole('dialog', { name: 'Add people' });
	await add.getByRole('checkbox', { name: 'Alya Kusuma' }).check();
	await add.getByRole('checkbox', { name: 'Bima Santoso' }).check();
	await add.getByRole('checkbox', { name: 'Dimas Arya' }).check();
	await add.getByRole('button', { name: 'Add 3 people' }).click();
	await expect(setup.getByText('3 people added')).toBeVisible();

	// Item: large formatted amount, per-person preview.
	await setup.getByRole('button', { name: 'Add item' }).click();
	const item = page.getByRole('dialog', { name: 'Add an item' });
	await item.getByLabel('What was it?').fill('Kereta Argo Parahyangan');
	await item.getByLabel('How much?').fill('450000');
	await expect(item.getByText(/Rp\s?150\.000/)).toBeVisible();
	await item.getByRole('button', { name: 'Add item' }).click();
	await expect(page.getByRole('region', { name: 'The bill' })).toContainText('Kereta Argo Parahyangan');
	await expect(setup.getByRole('button', { name: 'Send to 3 people on WhatsApp' })).toBeEnabled();
});
