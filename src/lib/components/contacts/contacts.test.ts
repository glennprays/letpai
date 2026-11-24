import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import ContactList from './ContactList.svelte';
import ContactForm from './ContactForm.svelte';
import ContactGroups from './ContactGroups.svelte';
import BulkActionsBar from './BulkActionsBar.svelte';
import { groupColors } from '$lib/constants/design';
import type { Contact, ContactGroup } from '$lib/types/api';

const contact = (id: string, name: string, extra: Partial<Contact> = {}): Contact => ({
	contact_id: id,
	name,
	whatsapp_number: '6281300000001',
	is_favorite: false,
	created_at: '',
	updated_at: '',
	...extra
});

const groups: ContactGroup[] = [
	{ group_id: 'g1', name: 'Office', color: groupColors[0], contact_count: 1, created_at: '' },
	{ group_id: 'g2', name: 'Family', color: groupColors[2], contact_count: 0, created_at: '' }
];

describe('ContactList', () => {
	it('shows the formatted number, group and a WhatsApp link per row', () => {
		render(ContactList, { contacts: [contact('1', 'Citra', { group_id: 'g1', group_name: 'Office', group_color: groupColors[0] })] });
		const row = screen.getByTestId('contact-row');
		expect(within(row).getByText('+62 813-0000-0001')).toBeTruthy();
		expect(within(row).getByText('Office')).toBeTruthy();
		expect(within(row).getByRole('link', { name: 'Message Citra on WhatsApp' }).getAttribute('href')).toBe('https://wa.me/6281300000001');
	});

	it('in select mode the row is a checkbox and the actions disappear', async () => {
		const onSelect = vi.fn();
		render(ContactList, { contacts: [contact('1', 'Citra')], selecting: true, onSelect });
		expect(screen.queryByRole('link')).toBeNull();
		await fireEvent.click(screen.getByRole('checkbox', { name: 'Select Citra' }));
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ contact_id: '1' }));
	});

	it('adds letter headings only once the list is long', () => {
		const many = Array.from({ length: 20 }, (_, i) => contact(String(i), `${String.fromCharCode(65 + (i % 3))}name ${i}`));
		const { unmount } = render(ContactList, { contacts: many.slice(0, 5) });
		expect(screen.queryByRole('heading')).toBeNull();
		unmount();
		render(ContactList, { contacts: many });
		expect(screen.getAllByRole('heading').map((h) => h.textContent)).toEqual(['Contacts starting with A', 'Contacts starting with B', 'Contacts starting with C']);
	});
});

describe('ContactForm', () => {
	it('blocks a bad number with a plain-English message', async () => {
		const onsubmit = vi.fn();
		render(ContactForm, { groups, onsubmit });
		await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Citra' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Save contact' }));
		expect(onsubmit).not.toHaveBeenCalled();
		expect(screen.getByText('Enter a WhatsApp number.')).toBeTruthy();
	});

	it('only sends what changed, and an empty group_id to leave a group', async () => {
		const onsubmit = vi.fn();
		render(ContactForm, { contact: contact('1', 'Citra', { group_id: 'g1' }), groups, onsubmit });
		await fireEvent.click(screen.getByRole('button', { name: 'No group' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Save contact' }));
		expect(onsubmit).toHaveBeenCalledWith({ group_id: '' });
	});
});

describe('ContactGroups', () => {
	it('rejects a duplicate name without calling the API', async () => {
		const oncreate = vi.fn();
		render(ContactGroups, { groups, oncreate });
		await fireEvent.click(screen.getByRole('button', { name: 'New group' }));
		await fireEvent.input(screen.getByLabelText('Group name'), { target: { value: 'office' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Create group' }));
		expect(oncreate).not.toHaveBeenCalled();
		expect(screen.getByText('You already have a group with that name.')).toBeTruthy();
	});

	it('confirms a delete inline before calling ondelete', async () => {
		const ondelete = vi.fn();
		render(ContactGroups, { groups, ondelete });
		await fireEvent.click(screen.getByRole('button', { name: 'Delete Office' }));
		expect(screen.getByText(/contacts? stays?, just without a group/)).toBeTruthy();
		await fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
		expect(ondelete).toHaveBeenCalledWith('g1');
	});
});

describe('BulkActionsBar', () => {
	it('offers select-all only when more are visible, and disables delete at zero', async () => {
		const onselectall = vi.fn();
		const { rerender } = render(BulkActionsBar, { selectedCount: 0, visibleCount: 4, onselectall, ondelete: vi.fn() });
		expect((screen.getByRole('button', { name: 'Delete' }) as HTMLButtonElement).disabled).toBe(true);
		await fireEvent.click(screen.getByRole('button', { name: 'Select all 4' }));
		expect(onselectall).toHaveBeenCalled();
		await rerender({ selectedCount: 4, visibleCount: 4 });
		expect(screen.queryByRole('button', { name: /Select all/ })).toBeNull();
	});
});
