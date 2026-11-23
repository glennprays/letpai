import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import Button from './Button.svelte';
import StatusPill from './StatusPill.svelte';
import Badge from './Badge.svelte';
import Input from './Input.svelte';
import Checkbox from './Checkbox.svelte';
import Tabs from './Tabs.svelte';
import Modal from './Modal.svelte';
import ProgressStepper from './ProgressStepper.svelte';
import EmptyState from './EmptyState.svelte';
import { text } from '../../../../tests/unit/snippet';

describe('Button', () => {
	it('fires onclick when enabled', async () => {
		const onclick = vi.fn();
		render(Button, { onclick, children: text('Approve') });
		await fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
		expect(onclick).toHaveBeenCalledOnce();
	});

	it('blocks clicks while loading and marks itself busy', async () => {
		const onclick = vi.fn();
		render(Button, { onclick, loading: true, children: text('Save') });
		const btn = screen.getByRole('button');
		expect(btn).toBeDisabled();
		expect(btn).toHaveAttribute('aria-busy', 'true');
		await fireEvent.click(btn);
		expect(onclick).not.toHaveBeenCalled();
	});

	it('renders a link for href and disables it without an href', async () => {
		const { rerender } = render(Button, { href: '/sessions/new', children: text('New session') });
		expect(screen.getByRole('link', { name: 'New session' })).toHaveAttribute('href', '/sessions/new');
		await rerender({ href: '/sessions/new', disabled: true, children: text('New session') });
		const link = screen.getByText('New session').closest('a')!;
		expect(link).not.toHaveAttribute('href');
		expect(link).toHaveAttribute('aria-disabled', 'true');
	});

	it.each([
		['primary', 'bg-coral'],
		['ink', 'bg-ink'],
		['secondary', 'bg-card'],
		['destructive', 'bg-rejected']
	])('%s variant uses the %s token', (variant, cls) => {
		render(Button, { variant: variant as never, children: text('x') });
		expect(screen.getByRole('button').className).toContain(cls);
	});
});

describe('StatusPill and Badge', () => {
	it('maps tones to token pairs', () => {
		render(StatusPill, { tone: 'review', children: text('Check proof') });
		expect(screen.getByText('Check proof').parentElement!.className).toMatch(/bg-review-tint.*text-review|text-review.*bg-review-tint/);
	});

	it('keeps the legacy Badge variants working', () => {
		render(Badge, { variant: 'submitted', children: text('Submitted') });
		expect(screen.getByText('Submitted').parentElement!.className).toContain('bg-review-tint');
	});
});

describe('Input', () => {
	it('links the label and reports typed values', async () => {
		const oninput = vi.fn();
		render(Input, { label: 'Session name', oninput });
		const field = screen.getByLabelText('Session name');
		await fireEvent.input(field, { target: { value: 'Dinner' } });
		expect(oninput).toHaveBeenCalledWith('Dinner');
	});

	it('marks errors for assistive tech', () => {
		render(Input, { label: 'Amount', error: true, errorText: 'Enter an amount.' });
		const field = screen.getByLabelText('Amount');
		expect(field).toHaveAttribute('aria-invalid', 'true');
		expect(field).toHaveAccessibleDescription('Enter an amount.');
	});

	it('toggles password visibility', async () => {
		render(Input, { label: 'Password', type: 'password', value: 'secret' });
		const field = screen.getByLabelText('Password');
		expect(field).toHaveAttribute('type', 'password');
		await fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
		expect(field).toHaveAttribute('type', 'text');
	});
});

describe('Checkbox', () => {
	it('is a real checkbox with a label and toggles', async () => {
		const onchange = vi.fn();
		render(Checkbox, { label: 'Include tax', onchange });
		const box = screen.getByRole('checkbox', { name: 'Include tax' });
		expect(box).not.toBeChecked();
		await fireEvent.click(box);
		expect(box).toBeChecked();
		expect(onchange).toHaveBeenCalledWith(true);
	});
});

describe('Tabs (pill filter)', () => {
	it('exposes the selected filter with aria-pressed', async () => {
		const onchange = vi.fn();
		render(Tabs, {
			label: 'Filter sessions',
			onchange,
			tabs: [
				{ value: 'all', label: 'All', count: 3 },
				{ value: 'settled', label: 'Settled', count: 1 }
			]
		});
		expect(screen.getByRole('group', { name: 'Filter sessions' })).toBeInTheDocument();
		const settled = screen.getByRole('button', { name: /Settled/ });
		expect(settled).toHaveAttribute('aria-pressed', 'false');
		await fireEvent.click(settled);
		expect(settled).toHaveAttribute('aria-pressed', 'true');
		expect(onchange).toHaveBeenCalledWith('settled');
	});
});

describe('Modal', () => {
	it('is labelled by its title and closes on Escape', async () => {
		const onclose = vi.fn();
		render(Modal, { open: true, title: 'Edit session', onclose, children: text('Body') });
		const dialog = screen.getByRole('dialog', { name: 'Edit session' });
		await tick();
		await fireEvent.keyDown(dialog, { key: 'Escape' });
		expect(onclose).toHaveBeenCalledOnce();
	});

	it('cannot be dismissed while busy', async () => {
		const onclose = vi.fn();
		render(Modal, { open: true, title: 'Saving', busy: true, onclose, children: text('Body') });
		await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
		expect(onclose).not.toHaveBeenCalled();
	});
});

describe('ProgressStepper', () => {
	it('marks the current step', () => {
		render(ProgressStepper, { currentStep: 2, steps: [{ id: 1, label: 'Details' }, { id: 2, label: 'People' }, { id: 3, label: 'Items' }] });
		const current = screen.getByText('People').closest('li')!;
		expect(current).toHaveAttribute('aria-current', 'step');
		expect(screen.getByText('(done)')).toBeInTheDocument();
	});
});

describe('EmptyState', () => {
	it('renders the title, description and action link', () => {
		render(EmptyState, { title: 'No sessions yet', description: 'Start one.', action: { label: 'New session', href: '/sessions/new' } });
		expect(screen.getByRole('heading', { name: 'No sessions yet' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'New session' })).toHaveAttribute('href', '/sessions/new');
	});
});
