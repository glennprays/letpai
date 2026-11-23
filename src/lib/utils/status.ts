// One vocabulary for statuses across the app (see docs/VOICE.md).
// `tone` maps to the StatusPill / Badge variant.

export type PaymentStatus = 'pending' | 'submitted' | 'paid' | 'rejected';
export type SessionStatus = 'draft' | 'pending' | 'in_progress' | 'active' | 'completed' | 'cancelled';
export type Tone = 'pending' | 'review' | 'paid' | 'rejected' | 'neutral' | 'accent';

/** Labels from the host's point of view. */
export const paymentStatusHost: Record<PaymentStatus, { label: string; tone: Tone }> = {
	pending: { label: 'Not paid', tone: 'pending' },
	submitted: { label: 'Check proof', tone: 'review' },
	paid: { label: 'Paid', tone: 'paid' },
	rejected: { label: 'Sent back', tone: 'rejected' }
};

/** Labels from the participant's point of view (payment page). */
export const paymentStatusGuest: Record<PaymentStatus, { label: string; tone: Tone }> = {
	pending: { label: 'Not paid yet', tone: 'pending' },
	submitted: { label: 'Proof sent', tone: 'review' },
	paid: { label: 'Paid', tone: 'paid' },
	rejected: { label: 'Needs a new proof', tone: 'rejected' }
};

export const sessionStatus: Record<SessionStatus, { label: string; tone: Tone }> = {
	draft: { label: 'Draft', tone: 'neutral' },
	// The backend only emits active/completed/cancelled today; the other
	// values are legacy and read as an open session.
	pending: { label: 'Collecting', tone: 'accent' },
	in_progress: { label: 'Collecting', tone: 'accent' },
	active: { label: 'Collecting', tone: 'accent' },
	completed: { label: 'Settled', tone: 'paid' },
	cancelled: { label: 'Cancelled', tone: 'neutral' }
};

export function sessionStatusOf(status: string) {
	return sessionStatus[status as SessionStatus] ?? { label: status, tone: 'neutral' as Tone };
}

export function paymentStatusOf(status: string, view: 'host' | 'guest' = 'host') {
	const map = view === 'host' ? paymentStatusHost : paymentStatusGuest;
	return map[status as PaymentStatus] ?? { label: status, tone: 'neutral' as Tone };
}

export type SessionGroup = 'open' | 'settled' | 'cancelled';

export function sessionGroup(status: string): SessionGroup {
	if (status === 'completed') return 'settled';
	if (status === 'cancelled') return 'cancelled';
	return 'open';
}
