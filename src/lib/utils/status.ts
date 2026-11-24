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

/** What the host should know about the WhatsApp message to one person. */
export type Delivery =
	| { state: 'none' }
	| { state: 'sending' }
	| { state: 'sent'; at?: string }
	| { state: 'retrying' }
	| { state: 'failed'; reason?: string | null };

// Mirrors friendlyNotificationStatus in the backend (get_session_detail.go):
// queued/pending/sending are in flight until they're 2 min old ("Stuck"),
// failed auto-retries, dead needs a manual retry.
export function deliveryOf(n: { status: string; friendly_status?: string; sent_at?: string; error_message?: string | null } | null | undefined): Delivery {
	if (!n) return { state: 'none' };
	switch (n.status) {
		case 'sent':
			return { state: 'sent', at: n.sent_at };
		case 'queued':
		case 'pending':
		case 'sending':
			return n.friendly_status?.startsWith('Stuck') ? { state: 'failed', reason: 'Stuck in the queue' } : { state: 'sending' };
		case 'failed':
			return { state: 'retrying' };
		case 'dead':
			return { state: 'failed', reason: n.error_message };
		default:
			return { state: 'none' };
	}
}
