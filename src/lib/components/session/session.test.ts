import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import SessionHeader from './SessionHeader.svelte';
import ProofQueue from './ProofQueue.svelte';
import OwesList from './OwesList.svelte';
import BillReceipt from './BillReceipt.svelte';
import SegmentBar from './SegmentBar.svelte';
import CopyButton from '../ui/CopyButton.svelte';
import AmountInput from '../ui/AmountInput.svelte';
import type { BillItem, Participant } from '$lib/types/api';

const person = (id: string, name: string, status: Participant['payment_status'], share = 68145, extra: Partial<Participant> = {}): Participant => ({
	participant_id: id,
	name,
	whatsapp_number: '6281300000001',
	share_amount: share,
	payment_status: status,
	...extra
});

describe('SessionHeader', () => {
	const base = { title: 'Friday dinner', status: 'active', createdAt: new Date().toISOString(), total: 1176915, outstanding: 726465 };

	it('leads with the outstanding amount and the per-status counts', () => {
		render(SessionHeader, { ...base, counts: { paid: 5, review: 2, rejected: 1, unpaid: 4, total: 12 } });
		expect(screen.getByRole('heading', { level: 1, name: 'Friday dinner' })).toBeInTheDocument();
		expect(screen.getByText(/726\.465/)).toBeInTheDocument();
		expect(screen.getByText(/still out of/)).toHaveTextContent('1.176.915');
		expect(screen.getByRole('img', { name: '5 of 12 paid, 2 to check, 1 sent back' })).toBeInTheDocument();
	});

	it('swaps to a Paid stamp when everyone has paid', () => {
		render(SessionHeader, { ...base, outstanding: 0, counts: { paid: 3, review: 0, rejected: 0, unpaid: 0, total: 3 } });
		expect(screen.getByText('All settled')).toBeInTheDocument();
		expect(screen.getByText('Everyone has paid.')).toBeInTheDocument();
	});
});

describe('ProofQueue', () => {
	it('approves and sends back with the right person', async () => {
		const onapprove = vi.fn();
		const onsendback = vi.fn();
		render(ProofQueue, {
			proofs: [person('p2', 'Bima Santoso', 'submitted', 177870, { payment_proof_url: 'data:image/png;base64,AA' }), person('p7', 'Gita', 'submitted')],
			onapprove,
			onsendback,
			onapproveall: vi.fn()
		});
		const bima = screen.getByRole('article', { name: 'Proof from Bima Santoso' });
		await fireEvent.click(within(bima).getByRole('button', { name: 'Approve' }));
		expect(onapprove).toHaveBeenCalledWith('p2');
		await fireEvent.click(within(bima).getByRole('button', { name: 'Send back' }));
		expect(onsendback).toHaveBeenCalledWith('p2', 'Bima Santoso');
		expect(screen.getByRole('button', { name: 'Approve all 2' })).toBeInTheDocument();
	});
});

describe('OwesList', () => {
	const handlers = { onremind: vi.fn(), onremindall: vi.fn(), onretry: vi.fn(), onmarkpaid: vi.fn(), onremove: vi.fn(), onadd: vi.fn() };

	it('offers Send again for a failed message and Remind for a delivered one', async () => {
		const failed = person('p9', 'Indra', 'pending', 68145, { last_notification: { log_id: 'l', type: 't', status: 'dead', sent_at: '', friendly_status: 'Failed — tap to retry' } });
		const ok = person('p3', 'Citra', 'pending', 177870, { last_notification: { log_id: 'l', type: 't', status: 'sent', sent_at: '', friendly_status: 'Sent' } });
		render(OwesList, { sessionId: 's', people: [failed, ok], sent: true, cooldownMs: () => 0, ...handlers });

		const indra = screen.getByRole('article', { name: 'Indra' });
		expect(within(indra).getByText('WhatsApp message not delivered')).toBeInTheDocument();
		await fireEvent.click(within(indra).getByRole('button', { name: 'Send again' }));
		expect(handlers.onretry).toHaveBeenCalledWith('p9');

		await fireEvent.click(screen.getByRole('button', { name: 'Remind Citra' }));
		expect(handlers.onremind).toHaveBeenCalledWith('p3');
	});

	it('disables Remind during the 24h cooldown and says when it reopens', () => {
		render(OwesList, { sessionId: 's', people: [person('p11', 'Kirana', 'pending')], sent: true, cooldownMs: () => 6 * 3600_000, ...handlers });
		expect(screen.getByRole('button', { name: 'Remind Kirana' })).toBeDisabled();
		expect(screen.getByText('Can remind again in 6 h')).toBeInTheDocument();
	});

	it('hides reminders before the first send', () => {
		render(OwesList, { sessionId: 's', people: [person('p1', 'Alya', 'pending')], sent: false, cooldownMs: () => 0, ...handlers });
		expect(screen.queryByRole('button', { name: /Remind/ })).toBeNull();
		expect(screen.getByText('Not messaged yet')).toBeInTheDocument();
	});
});

describe('BillReceipt', () => {
	const bills: BillItem[] = [
		{ bill_item_id: 'b1', description: 'Sate', amount: 100000, participant_ids: [], includes_service_charge: true, includes_tax: true },
		{ bill_item_id: 'b2', description: 'Parking', amount: 20000, participant_ids: ['p1'], includes_service_charge: false, includes_tax: false }
	];

	it('applies service on the item and tax on item + service, per item flags', () => {
		render(BillReceipt, { bills, participants: [person('p1', 'Dimas Arya', 'pending')], fees: { service_charge_percentage: 5, tax_percentage: 10 }, onadd: vi.fn(), onedit: vi.fn(), ondelete: vi.fn() });
		// service 5% of 100.000 = 5.000; tax 10% of 105.000 = 10.500; total 120.000 + 15.500
		expect(screen.getByText('Service 5%').nextElementSibling).toHaveTextContent('5.000');
		expect(screen.getByText('Tax 10%').nextElementSibling).toHaveTextContent('10.500');
		expect(screen.getByText('Total').nextElementSibling).toHaveTextContent('135.500');
		expect(screen.getByText(/· Dimas/)).toBeInTheDocument();
		expect(screen.getByText('No service or tax')).toBeInTheDocument();
	});
});

describe('SegmentBar', () => {
	it('draws one segment per person up to 16, one bar beyond', () => {
		const { container, unmount } = render(SegmentBar, { paid: 2, total: 12 });
		expect(container.querySelectorAll('[role="img"] > span')).toHaveLength(12);
		unmount();
		const big = render(SegmentBar, { paid: 10, total: 30 });
		expect(big.container.querySelectorAll('[role="img"] > span')).toHaveLength(1);
	});
});

describe('CopyButton', () => {
	it('copies digits only and confirms', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		render(CopyButton, { value: '5270 1234 88', label: 'Copy BCA account number' });
		await fireEvent.click(screen.getByRole('button', { name: 'Copy BCA account number' }));
		expect(writeText).toHaveBeenCalledWith('5270123488');
		expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
	});
});

describe('AmountInput', () => {
	it('formats Indonesian thousands and parses pasted rupiah', async () => {
		render(AmountInput, { label: 'How much?' });
		const field = screen.getByLabelText('How much?') as HTMLInputElement;
		await fireEvent.input(field, { target: { value: 'Rp 540.000' } });
		expect(field.value).toBe('540.000');
		await fireEvent.input(field, { target: { value: '1250000' } });
		expect(field.value).toBe('1.250.000');
	});
});
