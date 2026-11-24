import { test, expect, type Page } from '@playwright/test';
import { loginAs, resetApi, shoot } from './helpers';

test.beforeEach(resetApi);

const open = async (page: Page, id = 's-dinner') => {
	await page.goto(`/sessions/${id}`);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
};

test('the queue comes first: proofs, then who still owes, then the bill', async ({ page, context }, testInfo) => {
	await loginAs(context, 'host');
	await open(page);
	await expect(page.getByText('Rp 726.465')).toBeVisible();
	const order = await page.locator('h2').allTextContents();
	const idx = (t: string) => order.findIndex((x) => x.includes(t));
	expect(idx('Check these proofs')).toBeGreaterThanOrEqual(0);
	expect(idx('Check these proofs')).toBeLessThan(idx('Still owes'));
	expect(idx('Still owes')).toBeLessThan(idx('The bill'));

	// The failed WhatsApp message leads the list.
	const firstOwer = page.getByRole('region', { name: /Still owes/ }).getByRole('article').first();
	await expect(firstOwer).toHaveAccessibleName('Indra Wijaya');
	// The receipt adds up to the same total as everyone's shares.
	await expect(page.getByRole('region', { name: 'The bill' })).toContainText('Rp 1.176.915');

	if (testInfo.project.name === 'mobile') {
		// Approve, Send again and Remind are reachable before the bill on a phone.
		const approveY = (await page.getByRole('button', { name: 'Approve' }).first().boundingBox())!.y;
		const billY = (await page.getByRole('heading', { name: 'The bill' }).boundingBox())!.y;
		expect(approveY).toBeLessThan(billY);
	}
	await shoot(page, testInfo, 'session-detail-queue');
});

test('host approves two proofs, retries a message and reminds one person', async ({ page, context }) => {
	await loginAs(context, 'host');
	await open(page);

	const proofs = page.getByRole('region', { name: /Check these proofs/ });
	await proofs.getByRole('article', { name: 'Proof from Bima Santoso' }).getByRole('button', { name: 'Approve' }).click();
	await expect(page.getByText('Payment approved.')).toBeVisible();
	await expect(proofs.getByRole('article', { name: 'Proof from Bima Santoso' })).toHaveCount(0);
	await proofs.getByRole('article', { name: 'Proof from Gita Ramadhani' }).getByRole('button', { name: 'Approve' }).click();
	await expect(page.getByRole('region', { name: /Check these proofs/ })).toHaveCount(0);
	await expect(page.getByRole('button', { name: /7 paid/ })).toBeVisible();

	await page.getByRole('article', { name: 'Indra Wijaya' }).getByRole('button', { name: 'Send again' }).click();
	await expect(page.getByText('Sending the message again.')).toBeVisible();

	await page.getByRole('button', { name: 'Remind Citra Wulandari Ningsih Kartika' }).click();
	await expect(page.getByText('Reminder sent.').or(page.getByRole('status').filter({ hasText: /remind|sent/i })).first()).toBeVisible();
});

test('send back asks for a reason and moves the person to Still owes', async ({ page, context }) => {
	await loginAs(context, 'host');
	await open(page);
	await page.getByRole('article', { name: 'Proof from Bima Santoso' }).getByRole('button', { name: 'Send back' }).click();
	const dialog = page.getByRole('dialog', { name: 'Send the proof back' });
	await dialog.getByRole('button', { name: 'Send back' }).click();
	await expect(dialog.getByText('Write a short note so they know what to fix.')).toBeVisible();
	await dialog.getByRole('button', { name: 'The amount does not match your share.' }).click();
	await dialog.getByRole('button', { name: 'Send back' }).click();
	await expect(dialog).toBeHidden();
	await expect(page.getByRole('article', { name: 'Bima Santoso' })).toContainText('Sent back');
});

test('adding an item updates the receipt; deleting asks first', async ({ page, context }) => {
	await loginAs(context, 'host');
	await open(page, 's-bali');
	await page.getByRole('region', { name: 'The bill' }).getByRole('button', { name: 'Add item' }).click();
	const dialog = page.getByRole('dialog', { name: 'Add an item' });
	await dialog.getByLabel('What was it?').fill('Boat to Nusa Penida');
	await dialog.getByLabel('How much?').fill('800000');
	await expect(dialog.getByLabel('How much?')).toHaveValue('800.000');
	await expect(dialog.getByText(/each for 4 people/)).toBeVisible();
	await dialog.getByRole('button', { name: 'Add item' }).click();
	await expect(page.getByRole('region', { name: 'The bill' })).toContainText('Boat to Nusa Penida');

	await page.getByRole('button', { name: 'Edit Boat to Nusa Penida' }).click();
	await page.getByRole('menuitem', { name: 'Delete item' }).click();
	await expect(page.getByRole('dialog', { name: 'Delete "Boat to Nusa Penida"?' })).toBeVisible();
	await page.getByRole('button', { name: 'Delete item' }).click();
	await expect(page.getByRole('region', { name: 'The bill' })).not.toContainText('Boat to Nusa Penida');
});

test('a new session shows the setup checklist until it is sent', async ({ page, context }) => {
	await loginAs(context, 'host');
	await open(page, 's-draft');
	const setup = page.getByRole('region', { name: 'Ready to send?' });
	await expect(setup).toBeVisible();
	await expect(setup.getByRole('button', { name: /Send to/ })).toBeDisabled();
	await expect(setup.getByText('Add the people')).toBeVisible();
});

test('participant detail puts the decision first', async ({ page, context }, testInfo) => {
	await loginAs(context, 'host');
	await page.goto('/sessions/s-dinner/participants/s-dinner-p2');
	await expect(page.getByRole('heading', { name: 'Check the screenshot' })).toBeVisible();
	await page.getByRole('button', { name: 'Approve' }).click();
	await expect(page.getByText('Payment approved.')).toBeVisible();
	await expect(page.getByText('Paid', { exact: true }).first()).toBeVisible();
	await shoot(page, testInfo, 'participant-approved');

	await page.goto('/sessions/s-dinner/participants/s-dinner-p3');
	// Citra is inside the 24h reminder cooldown in the fixture.
	await expect(page.getByRole('button', { name: /Remind again in/ })).toBeDisabled();
});
