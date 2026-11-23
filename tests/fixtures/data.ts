// Shared, realistic fixture dataset used by the mock API (Playwright) and by
// Vitest component tests. Every screen in the redesign is checked against this
// same data so options and regressions are compared on equal footing.
//
// Plain erasable TypeScript only: the mock API runs on Node's built-in type
// stripping (`node tests/mock-api.ts`), so no enums, namespaces or decorators.

export type PaymentStatus = 'pending' | 'submitted' | 'paid' | 'rejected';

export interface FxParticipant {
	participant_id: string;
	contact_id?: string;
	name: string;
	whatsapp_number: string;
	payment_status: PaymentStatus;
	rejection_reason?: string;
	paid_manually?: boolean;
	notification: 'sent' | 'failed' | 'dead' | 'none';
	notified_hours_ago?: number;
}

export interface FxBill {
	bill_item_id: string;
	description: string;
	amount: number;
	category?: string;
	participant_ids: string[]; // empty = everyone
	includes_service_charge: boolean;
	includes_tax: boolean;
}

export interface FxSession {
	session_id: string;
	host: 'host' | 'empty';
	title: string;
	description?: string;
	status: 'draft' | 'pending' | 'in_progress' | 'active' | 'completed' | 'cancelled';
	created_hours_ago: number;
	currency: string;
	fee_config: { service_charge_percentage: number; tax_percentage: number } | null;
	bank_accounts: Array<{ bank_name: string; account_number: string; account_holder: string }>;
	participants: FxParticipant[];
	bills: FxBill[];
	bill_images: number; // how many placeholder receipt photos
	expired_participant_ids?: string[];
}

// Timestamps are relative to process start so "2 hours ago"-style copy stays
// the same across runs (the app formats relative times from Date.now()).
export const FIXTURE_NOW = Date.now();
export const hoursAgo = (h: number) => new Date(FIXTURE_NOW - h * 3600_000).toISOString();

export const USERS = {
	host: {
		user_id: 'u-host',
		whatsapp_number: '+6281234567890',
		full_name: 'Raka Pratama',
		token: 'tok-host'
	},
	empty: {
		user_id: 'u-empty',
		whatsapp_number: '+6281111111111',
		full_name: 'Nadia Putri',
		token: 'tok-empty'
	}
} as const;

export const ADMIN = {
	admin_id: 'a-1',
	whatsapp_number: '+6289999999999',
	full_name: 'Ops Admin',
	role: 'super_admin',
	is_active: true,
	is_verified: true,
	password_setup_required: false,
	token: 'tok-admin'
};

const people: ReadonlyArray<readonly [string, string]> = [
	['Alya Kusuma', '+6281300000001'],
	['Bima Santoso', '+6281300000002'],
	['Citra Wulandari Ningsih Kartika', '+6281300000003'],
	['Dimas Arya', '+6281300000004'],
	['Eka Putra', '+6281300000005'],
	['Fajar Nugroho', '+6281300000006'],
	['Gita Ramadhani', '+6281300000007'],
	['Hana Lestari', '+6281300000008'],
	['Indra Wijaya', '+6281300000009'],
	['Joko Susilo', '+6281300000010'],
	['Kirana Dewi', '+6281300000011'],
	['Lukas Hartono', '+6281300000012']
];

export const CONTACT_GROUPS = [
	{ group_id: 'g-office', name: 'Office', color: '#375390', contact_count: 6, created_at: hoursAgo(900) },
	{ group_id: 'g-futsal', name: 'Futsal Thursday', color: '#c2453d', contact_count: 4, created_at: hoursAgo(800) },
	{ group_id: 'g-family', name: 'Family', color: '#2f7a5b', contact_count: 2, created_at: hoursAgo(700) }
];

export interface FxContact {
	contact_id: string;
	name: string;
	whatsapp_number: string;
	group_id?: string;
	group_name?: string;
	group_color?: string;
	is_favorite: boolean;
	notes?: string;
	created_at: string;
	updated_at: string;
}

export const CONTACTS: FxContact[] = people.map(([name, wa], i) => {
	const group = i < 6 ? CONTACT_GROUPS[0] : i < 10 ? CONTACT_GROUPS[1] : CONTACT_GROUPS[2];
	return {
		contact_id: `c-${i + 1}`,
		name,
		whatsapp_number: wa,
		group_id: group.group_id,
		group_name: group.name,
		group_color: group.color,
		is_favorite: i % 4 === 0,
		notes: i === 2 ? 'Prefers BCA transfers' : undefined,
		created_at: hoursAgo(1000 - i),
		updated_at: hoursAgo(500 - i)
	};
});

const statusCycle: PaymentStatus[] = ['paid', 'submitted', 'pending', 'rejected', 'paid', 'pending', 'submitted', 'paid', 'pending', 'paid', 'pending', 'paid'];

function makeParticipants(n: number, prefix: string, statuses?: PaymentStatus[]): FxParticipant[] {
	return people.slice(0, n).map(([name, wa], i) => {
		const status = statuses?.[i] ?? statusCycle[i];
		return {
			participant_id: `${prefix}-p${i + 1}`,
			contact_id: `c-${i + 1}`,
			name,
			whatsapp_number: wa,
			payment_status: status,
			rejection_reason: status === 'rejected' ? 'The screenshot is cropped, so I cannot see the amount. Could you send the full one?' : undefined,
			paid_manually: status === 'paid' && i === 4,
			notification: i === 5 ? 'failed' : i === 8 ? 'dead' : 'sent',
			notified_hours_ago: 26 + i
		};
	});
}

export const SESSIONS: FxSession[] = [
	{
		session_id: 's-dinner',
		host: 'host',
		title: 'Friday dinner at Sate Khas Senayan with the design team and their plus-ones',
		description: 'Thanks for coming, everyone. Transfer to either account below.',
		status: 'in_progress',
		created_hours_ago: 28,
		currency: 'IDR',
		fee_config: { service_charge_percentage: 5, tax_percentage: 10 },
		bank_accounts: [
			{ bank_name: 'BCA', account_number: '5270 1234 88', account_holder: 'Raka Pratama' },
			{ bank_name: 'GoPay', account_number: '0812 3456 7890', account_holder: 'Raka Pratama' }
		],
		participants: makeParticipants(12, 's-dinner'),
		bills: [
			{ bill_item_id: 'b-1', description: 'Sate kambing (6 portions)', amount: 540000, category: 'food', participant_ids: [], includes_service_charge: true, includes_tax: true },
			{ bill_item_id: 'b-2', description: 'Es teh manis jumbo', amount: 168000, category: 'drinks', participant_ids: [], includes_service_charge: true, includes_tax: true },
			{ bill_item_id: 'b-3', description: 'Sop buntut', amount: 285000, category: 'food', participant_ids: ['s-dinner-p1', 's-dinner-p2', 's-dinner-p3'], includes_service_charge: true, includes_tax: true },
			{ bill_item_id: 'b-4', description: 'Parking', amount: 30000, category: 'transport', participant_ids: ['s-dinner-p4'], includes_service_charge: false, includes_tax: false }
		],
		bill_images: 2,
		expired_participant_ids: []
	},
	{
		session_id: 's-bali',
		host: 'host',
		title: 'Bali villa weekend',
		description: 'Villa, scooters and the boat to Nusa Penida.',
		status: 'pending',
		created_hours_ago: 72,
		currency: 'IDR',
		fee_config: null,
		bank_accounts: [{ bank_name: 'Mandiri', account_number: '1370 0099 1234', account_holder: 'Raka Pratama' }],
		participants: makeParticipants(4, 's-bali', ['pending', 'submitted', 'pending', 'paid']),
		bills: [
			{ bill_item_id: 'b-5', description: 'Villa, 2 nights', amount: 4200000, participant_ids: [], includes_service_charge: false, includes_tax: false },
			{ bill_item_id: 'b-6', description: 'Scooter rental', amount: 600000, participant_ids: [], includes_service_charge: false, includes_tax: false }
		],
		bill_images: 0,
		expired_participant_ids: ['s-bali-p3']
	},
	{
		session_id: 's-groceries',
		host: 'host',
		title: 'Groceries',
		status: 'completed',
		created_hours_ago: 240,
		currency: 'IDR',
		fee_config: null,
		bank_accounts: [{ bank_name: 'BCA', account_number: '5270 1234 88', account_holder: 'Raka Pratama' }],
		participants: makeParticipants(2, 's-groceries', ['paid', 'paid']),
		bills: [{ bill_item_id: 'b-7', description: 'Weekly groceries', amount: 412500, participant_ids: [], includes_service_charge: false, includes_tax: false }],
		bill_images: 1
	},
	{
		session_id: 's-futsal',
		host: 'host',
		title: 'Futsal court, November',
		status: 'cancelled',
		created_hours_ago: 400,
		currency: 'IDR',
		fee_config: null,
		bank_accounts: [],
		participants: makeParticipants(3, 's-futsal', ['pending', 'pending', 'pending']),
		bills: [{ bill_item_id: 'b-8', description: 'Court rental', amount: 450000, participant_ids: [], includes_service_charge: false, includes_tax: false }],
		bill_images: 0
	},
	{
		session_id: 's-draft',
		host: 'host',
		title: 'Karaoke night',
		status: 'draft',
		created_hours_ago: 2,
		currency: 'IDR',
		fee_config: null,
		bank_accounts: [],
		participants: [],
		bills: [],
		bill_images: 0
	}
];

// ── Derived shapes ─────────────────────────────────────────────────────────

export function shareOf(session: FxSession, participantId: string) {
	const everyone = session.participants.map((p) => p.participant_id);
	const sc = session.fee_config?.service_charge_percentage ?? 0;
	const tax = session.fee_config?.tax_percentage ?? 0;
	let items_total = 0;
	let service_charge_share = 0;
	let tax_share = 0;
	const lines = [] as Array<{ bill: FxBill; your_share: number; shared_with: number }>;
	for (const bill of session.bills) {
		const assigned = bill.participant_ids.length ? bill.participant_ids : everyone;
		if (!assigned.includes(participantId)) continue;
		const your_share = Math.round(bill.amount / assigned.length);
		const itemSc = bill.includes_service_charge ? Math.round((your_share * sc) / 100) : 0;
		const itemTax = bill.includes_tax ? Math.round(((your_share + itemSc) * tax) / 100) : 0;
		items_total += your_share;
		service_charge_share += itemSc;
		tax_share += itemTax;
		lines.push({ bill, your_share, shared_with: assigned.length });
	}
	return { items_total, service_charge_share, tax_share, total: items_total + service_charge_share + tax_share, lines };
}

// Small, deterministic placeholder images (receipt / transfer screenshot) so
// tests never hit the network. CSP allows data: for img-src.
export function placeholderImage(label: string, w = 360, h = 480): string {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#f4f1ea"/><g fill="#1d2442" opacity=".55">${Array.from({ length: 10 }, (_, i) => `<rect x="32" y="${70 + i * 34}" width="${120 + ((i * 53) % 160)}" height="10" rx="5"/>`).join('')}</g><text x="32" y="44" font-family="sans-serif" font-size="20" fill="#1d2442">${label}</text></svg>`;
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function sessionTotal(s: FxSession) {
	return s.participants.reduce((sum, p) => sum + shareOf(s, p.participant_id).total, 0) || s.bills.reduce((a, b) => a + b.amount, 0);
}
