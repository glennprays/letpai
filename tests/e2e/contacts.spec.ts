import { test, expect, type Page } from '@playwright/test';
import { loginAs, resetApi, shoot } from './helpers';

test.beforeEach(resetApi);

const rows = (page: Page) => page.getByTestId('contact-row');
const row = (page: Page, name: string) => rows(page).filter({ hasText: name });

test('list shows people with formatted numbers, groups and a working WhatsApp link', async ({ page, context }, testInfo) => {
	await loginAs(context, 'host');
	await page.goto('/contacts');
	await expect(page.getByText('12 people in 3 groups')).toBeVisible();
	await expect(rows(page)).toHaveCount(12);

	const alya = row(page, 'Alya Kusuma');
	await expect(alya).toContainText('+62 813-0000-0001');
	await expect(alya).toContainText('Office');
	await expect(alya.getByRole('link', { name: 'Message Alya Kusuma on WhatsApp' })).toHaveAttribute('href', 'https://wa.me/6281300000001');
	await shoot(page, testInfo, 'contacts-list');
});

test('search by name or local number, and filter by group pill', async ({ page, context }) => {
	await loginAs(context, 'host');
	await page.goto('/contacts');

	await page.getByRole('searchbox', { name: 'Search contacts' }).fill('0813-0000-0004');
	await expect(rows(page)).toHaveCount(1);
	await expect(rows(page)).toContainText('Dimas Arya');

	await page.getByRole('searchbox', { name: 'Search contacts' }).fill('nobody');
	await expect(page.getByRole('heading', { name: 'No one matches' })).toBeVisible();
	await page.getByRole('button', { name: 'Clear search' }).click();

	await page.getByRole('group', { name: 'Filter contacts' }).getByRole('button', { name: /Family/ }).click();
	await expect(rows(page)).toHaveCount(2);
	await page.getByRole('group', { name: 'Filter contacts' }).getByRole('button', { name: /Favourites/ }).click();
	await expect(rows(page)).toHaveCount(3);
});

test('add, edit and delete a contact', async ({ page, context }) => {
	await loginAs(context, 'host');
	await page.goto('/contacts');

	await page.getByRole('button', { name: /^Add/ }).click();
	const dialog = page.getByRole('dialog', { name: 'New contact' });
	await dialog.getByLabel('Name').fill('Maya Sari');
	await dialog.getByRole('button', { name: 'Add contact' }).click();
	await expect(dialog.getByText('Enter a WhatsApp number.')).toBeVisible();
	await dialog.getByLabel('WhatsApp number').fill('081299998888');
	await dialog.getByRole('button', { name: 'Family' }).click();
	await dialog.getByRole('button', { name: 'Add contact' }).click();
	await expect(dialog).toBeHidden();
	await expect(page.getByText('Maya Sari added')).toBeVisible();
	await expect(row(page, 'Maya Sari')).toContainText('+62 812-9999-8888');
	await expect(row(page, 'Maya Sari')).toContainText('Family');

	await row(page, 'Maya Sari').getByRole('button', { name: 'More actions for Maya Sari' }).click();
	await page.getByRole('menuitem', { name: 'Edit' }).click();
	const edit = page.getByRole('dialog', { name: 'Edit contact' });
	await edit.getByRole('button', { name: 'No group' }).click();
	await edit.getByLabel(/Note/).fill('Always pays first');
	await edit.getByRole('button', { name: 'Save changes' }).click();
	await expect(edit).toBeHidden();
	await expect(row(page, 'Maya Sari')).toContainText('Always pays first');
	await expect(row(page, 'Maya Sari')).not.toContainText('Family');

	await row(page, 'Maya Sari').getByRole('button', { name: 'More actions for Maya Sari' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.getByRole('dialog', { name: 'Delete Maya Sari?' }).getByRole('button', { name: 'Delete' }).click();
	await expect(row(page, 'Maya Sari')).toHaveCount(0);
	await expect(rows(page)).toHaveCount(12);
});

test('favourite from the row menu', async ({ page, context }) => {
	await loginAs(context, 'host');
	await page.goto('/contacts');
	await row(page, 'Bima Santoso').getByRole('button', { name: 'More actions for Bima Santoso' }).click();
	await page.getByRole('menuitem', { name: 'Add to favourites' }).click();
	await expect(row(page, 'Bima Santoso').getByLabel('Favourite')).toBeVisible();
	await page.reload();
	await expect(row(page, 'Bima Santoso').getByLabel('Favourite')).toBeVisible();
});

test('select several, move them to a group, then delete them', async ({ page, context }, testInfo) => {
	await loginAs(context, 'host');
	await page.goto('/contacts');

	await page.getByRole('button', { name: 'More contact actions' }).click();
	await page.getByRole('menuitem', { name: 'Select contacts' }).click();
	const bar = page.getByRole('toolbar', { name: 'Selected contacts' });
	await expect(bar).toContainText('0 selected');
	await page.getByRole('checkbox', { name: 'Select Alya Kusuma' }).check();
	await page.getByRole('checkbox', { name: 'Select Bima Santoso' }).check();
	await expect(bar).toContainText('2 selected');
	await shoot(page, testInfo, 'contacts-select');

	await bar.getByRole('button', { name: 'Group', exact: true }).click();
	await page.getByRole('menuitem', { name: 'Move to Family' }).click();
	await expect(page.getByText('2 contacts moved to Family')).toBeVisible();
	await expect(bar).toBeHidden();
	await page.getByRole('group', { name: 'Filter contacts' }).getByRole('button', { name: /Family/ }).click();
	await expect(rows(page)).toHaveCount(4);

	await page.getByRole('button', { name: 'More contact actions' }).click();
	await page.getByRole('menuitem', { name: 'Select contacts' }).click();
	await bar.getByRole('button', { name: 'Select all 4' }).click();
	await bar.getByRole('button', { name: 'Delete' }).click();
	await page.getByRole('dialog', { name: 'Delete 4 contacts?' }).getByRole('button', { name: 'Delete 4' }).click();
	await expect(page.getByText('4 contacts deleted')).toBeVisible();
	// The Family group is now empty, so the filter shows its empty state.
	await expect(page.getByRole('heading', { name: 'No one matches' })).toBeVisible();
});

test('create, rename and delete a group without stacked dialogs', async ({ page, context }) => {
	await loginAs(context, 'host');
	await page.goto('/contacts');
	await page.getByRole('button', { name: 'More contact actions' }).click();
	await page.getByRole('menuitem', { name: 'Manage groups' }).click();
	const sheet = page.getByRole('dialog', { name: 'Groups' });

	await sheet.getByRole('button', { name: 'New group' }).click();
	await sheet.getByLabel('Group name').fill('Badminton');
	await sheet.getByRole('button', { name: 'Coral' }).click();
	await sheet.getByRole('button', { name: 'Create group' }).click();
	await expect(sheet.getByTestId('group-row').filter({ hasText: 'Badminton' })).toContainText('0 people');

	await sheet.getByRole('button', { name: 'Edit Badminton' }).click();
	await sheet.getByLabel('Group name').fill('Badminton Sunday');
	await sheet.getByRole('button', { name: 'Save group' }).click();
	await expect(sheet.getByTestId('group-row').filter({ hasText: 'Badminton Sunday' })).toBeVisible();

	await sheet.getByRole('button', { name: 'Delete Office' }).click();
	await sheet.getByRole('button', { name: 'Delete', exact: true }).click();
	await expect(sheet.getByTestId('group-row')).toHaveCount(3);
	await expect(page.getByRole('dialog')).toHaveCount(1);
	await sheet.getByRole('button', { name: 'Close' }).click();
	await expect(row(page, 'Alya Kusuma')).not.toContainText('Office');
});

test('import from the phone skips numbers already saved', async ({ page, context }) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator, 'contacts', {
			value: {
				select: async () => [
					{ name: ['Nina Halim'], tel: ['0812 7777 6666'] },
					{ name: ['Alya K'], tel: ['+62 813-0000-0001'] }
				]
			}
		});
	});
	await loginAs(context, 'host');
	await page.goto('/contacts');
	await page.getByRole('button', { name: 'More contact actions' }).click();
	await page.getByRole('menuitem', { name: 'Import from phone' }).click();
	const sheet = page.getByRole('dialog', { name: 'Import from phone' });
	await sheet.getByRole('button', { name: 'Choose from phone' }).click();
	await expect(sheet).toContainText('1 new, 1 already saved');
	await expect(sheet.getByRole('checkbox', { name: 'Import Nina Halim' })).toBeChecked();
	await sheet.getByLabel(/Put them in a group/).selectOption({ label: 'Office' });
	await sheet.getByRole('button', { name: 'Import 1 contact' }).click();
	await expect(sheet.getByText('1 contact added')).toBeVisible();
	await sheet.getByRole('button', { name: 'Done' }).click();
	await expect(row(page, 'Nina Halim')).toContainText('+62 812-7777-6666');
	await expect(row(page, 'Nina Halim')).toContainText('Office');
});

test('import explains itself where the browser has no contact picker', async ({ page, context }) => {
	await loginAs(context, 'host');
	await page.goto('/contacts');
	await page.getByRole('button', { name: 'More contact actions' }).click();
	await page.getByRole('menuitem', { name: 'Import from phone' }).click();
	const sheet = page.getByRole('dialog', { name: 'Import from phone' });
	await expect(sheet.getByText("This browser can't share your phone's contacts")).toBeVisible();
	await sheet.getByRole('button', { name: 'Add a contact' }).click();
	await expect(page.getByRole('dialog', { name: 'New contact' })).toBeVisible();
});

test('empty account gets a first-contact prompt', async ({ page, context }, testInfo) => {
	await loginAs(context, 'empty');
	await page.goto('/contacts');
	await expect(page.getByRole('heading', { name: 'Your people go here' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Import from phone' })).toBeVisible();
	await shoot(page, testInfo, 'contacts-empty');
});

test('a failing API shows a retry', async ({ page, context }) => {
	await loginAs(context, 'broken');
	await page.goto('/contacts');
	await expect(page.getByRole('heading', { name: "We couldn't load your contacts" })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});
