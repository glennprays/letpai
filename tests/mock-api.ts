// Fixture API for Playwright. SvelteKit server loads call the backend from
// the Node server, so browser-side request mocking can't intercept them; this
// tiny HTTP server stands in for the real backend at /api/v1.
//
// Run: node tests/mock-api.ts   (Node >= 22.18 strips types natively)
// Env: MOCK_API_PORT (default 3000). POST /__reset restores pristine state.

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import {
	ADMIN,
	CONTACTS,
	CONTACT_GROUPS,
	SESSIONS,
	USERS,
	hoursAgo,
	placeholderImage,
	sessionTotal,
	shareOf,
	type FxSession
} from './fixtures/data.ts';

const PORT = Number(process.env.MOCK_API_PORT ?? 3000);
const PREFIX = '/api/v1';

let sessions: FxSession[] = structuredClone(SESSIONS);
let contacts = structuredClone(CONTACTS);
let nextId = 1;

function reset() {
	sessions = structuredClone(SESSIONS);
	contacts = structuredClone(CONTACTS);
	nextId = 1;
}

type Json = Record<string, unknown> | unknown[] | null;

function send(res: ServerResponse, status: number, body: Json) {
	res.writeHead(status, {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
	});
	res.end(body === null ? '' : JSON.stringify(body));
}

const ok = (data?: unknown, extra: Record<string, unknown> = {}) => ({ success: true, data: data ?? null, ...extra });
const fail = (code: string, message: string) => ({ success: false, error: { code, message } });

async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
	const chunks: Buffer[] = [];
	for await (const c of req) chunks.push(c as Buffer);
	if (!chunks.length) return {};
	try {
		return JSON.parse(Buffer.concat(chunks).toString('utf8'));
	} catch {
		return {};
	}
}

function userFor(req: IncomingMessage) {
	const auth = req.headers.authorization ?? '';
	const token = auth.replace(/^Bearer\s+/i, '');
	if (token === USERS.host.token) return 'host' as const;
	if (token === USERS.empty.token) return 'empty' as const;
	return null;
}

const isAdmin = (req: IncomingMessage) => (req.headers.authorization ?? '').endsWith(ADMIN.token);

function publicUser(key: 'host' | 'empty') {
	const { token: _t, ...u } = USERS[key];
	return u;
}

function listSession(s: FxSession) {
	return {
		session_id: s.session_id,
		host_id: USERS[s.host].user_id,
		title: s.title,
		description: s.description,
		total_amount: sessionTotal(s),
		currency: s.currency,
		status: s.status,
		participant_count: s.participants.length,
		paid_count: s.participants.filter((p) => p.payment_status === 'paid').length,
		created_at: hoursAgo(s.created_hours_ago)
	};
}

function detailParticipant(s: FxSession, p: FxSession['participants'][number]) {
	const share = shareOf(s, p.participant_id);
	const notif =
		p.notification === 'none'
			? null
			: {
					log_id: `log-${p.participant_id}`,
					type: 'payment_request',
					status: p.notification,
					sent_at: hoursAgo(p.notified_hours_ago ?? 26),
					error_message: p.notification === 'sent' ? null : 'Recipient number is not on WhatsApp',
					friendly_status: p.notification === 'sent' ? 'Sent' : p.notification === 'failed' ? 'Retrying…' : 'Failed — tap to retry'
				};
	return {
		participant_id: p.participant_id,
		contact_id: p.contact_id,
		name: p.name,
		whatsapp_number: p.whatsapp_number,
		share_amount: share.total,
		payment_status: p.payment_status,
		payment_proof_url: ['submitted', 'paid', 'rejected'].includes(p.payment_status) && !p.paid_manually ? placeholderImage(`Transfer ${p.name.split(' ')[0]}`) : undefined,
		rejection_reason: p.rejection_reason,
		paid_manually: p.paid_manually,
		notification_count: notif ? 1 : 0,
		last_notification_at: notif?.sent_at,
		last_notification: notif,
		fee_breakdown: { participant_id: p.participant_id, ...share, lines: undefined }
	};
}

function detailSession(s: FxSession) {
	return {
		...listSession(s),
		bank_name: s.bank_accounts[0]?.bank_name ?? null,
		bank_account_number: s.bank_accounts[0]?.account_number ?? null,
		bank_account_holder: s.bank_accounts[0]?.account_holder ?? null,
		bank_accounts: s.bank_accounts.map((a, i) => ({ account_id: `${s.session_id}-acct-${i}`, ordinal: i, ...a })),
		// "Sent" once any participant has had a WhatsApp message.
		last_notified_at: s.participants.some((p) => p.notification !== 'none') ? hoursAgo(26) : null,
		is_dirty: false,
		participants: s.participants.map((p) => detailParticipant(s, p)),
		bills: s.bills.map((b) => ({ ...b, session_id: s.session_id, created_at: hoursAgo(s.created_hours_ago) })),
		bill_images: Array.from({ length: s.bill_images }, (_, i) => ({
			bill_image_id: `${s.session_id}-img-${i}`,
			session_id: s.session_id,
			image_url: placeholderImage(`Receipt ${i + 1}`),
			thumbnail_url: placeholderImage(`Receipt ${i + 1}`, 180, 240),
			file_name: `receipt-${i + 1}.jpg`,
			file_format: 'jpg',
			file_size: 182_000,
			uploaded_at: hoursAgo(s.created_hours_ago),
			ordinal: i
		})),
		fee_config: s.fee_config
	};
}

function findParticipant(pid: string) {
	for (const s of sessions) {
		const p = s.participants.find((x) => x.participant_id === pid);
		if (p) return { s, p };
	}
	return null;
}

function paymentPage(pid: string) {
	const hit = findParticipant(pid);
	if (!hit) return null;
	const { s, p } = hit;
	const share = shareOf(s, pid);
	const expired = s.expired_participant_ids?.includes(pid) ?? false;
	return {
		session_id: s.session_id,
		participant_id: pid,
		session_name: s.title,
		participant_name: p.name,
		total_amount: sessionTotal(s),
		share_amount: share.total,
		currency: s.currency,
		bill_items: share.lines.map((l) => ({
			bill_item_id: l.bill.bill_item_id,
			description: l.bill.description,
			amount: l.bill.amount,
			your_share: l.your_share,
			shared_with: l.shared_with,
			category: l.bill.category ?? null,
			includes_service_charge: l.bill.includes_service_charge,
			includes_tax: l.bill.includes_tax
		})),
		payment_status: p.payment_status,
		payment_proof_url: detailParticipant(s, p).payment_proof_url ?? null,
		rejection_reason: p.rejection_reason ?? null,
		bank_name: s.bank_accounts[0]?.bank_name ?? null,
		bank_account_number: s.bank_accounts[0]?.account_number ?? null,
		bank_account_holder: s.bank_accounts[0]?.account_holder ?? null,
		bank_accounts: s.bank_accounts,
		link_expires_at: hoursAgo(expired ? 1 : -120),
		is_expired: expired,
		bill_images: detailSession(s).bill_images,
		fee_breakdown: s.fee_config
			? { items_total: share.items_total, service_charge_share: share.service_charge_share, tax_share: share.tax_share, total: share.total }
			: undefined,
		fee_config: s.fee_config ?? undefined
	};
}

const TEMPLATES = [
	{
		template_id: 't-1',
		key: 'payment_request',
		name: 'Payment request',
		description: 'Sent when the host shares a session.',
		body: 'Hi {{name}}, your share for "{{session}}" is {{amount}}. Pay and upload proof here: {{link}}',
		variables: ['name', 'session', 'amount', 'link'],
		updated_at: hoursAgo(300)
	},
	{
		template_id: 't-2',
		key: 'payment_rejected',
		name: 'Proof rejected',
		description: 'Sent when the host asks for a new proof.',
		body: 'Hi {{name}}, {{host}} needs a new proof for "{{session}}": {{reason}}. Upload again: {{link}}',
		variables: ['name', 'host', 'session', 'reason', 'link'],
		updated_at: hoursAgo(200)
	}
];

type Handler = (ctx: { req: IncomingMessage; m: RegExpMatchArray; body: Record<string, unknown> }) => [number, Json] | Promise<[number, Json]>;
const routes: Array<[string, RegExp, Handler]> = [];
const route = (method: string, pattern: string, h: Handler) => routes.push([method, new RegExp(`^${pattern}$`), h]);

// ── Auth ───────────────────────────────────────────────────────────────────
route('POST', '/auth/login', ({ body }) => {
	if (body.password === 'wrong') return [200, fail('AUTH_005', 'That number and password do not match.')];
	const key = body.whatsapp_number === USERS.empty.whatsapp_number ? 'empty' : 'host';
	return [200, { success: true, token: USERS[key].token, user: publicUser(key) }];
});
route('POST', '/auth/register', () => [200, { success: true, message: 'OTP sent to WhatsApp', user_id: 'u-new', expires_at: hoursAgo(-0.1) }]);
route('POST', '/auth/verify-otp', ({ body }) => {
	if (body.otp_code === '000000') return [400, fail('OTP_INVALID', 'That code is not right. Check WhatsApp and try again.')];
	return [200, { success: true, token: USERS.empty.token, user: publicUser('empty') }];
});
route('POST', '/auth/resend-otp', () => [200, ok({ expires_at: hoursAgo(-0.1) })]);
route('POST', '/auth/forgot-password', () => [200, { success: true, message: 'Reset link sent to WhatsApp' }]);
route('POST', '/auth/logout', () => [200, ok()]);
route('PUT', '/auth/profile', ({ req, body }) => {
	const key = userFor(req) ?? 'host';
	return [200, { success: true, data: { ...publicUser(key), ...body }, user: { ...publicUser(key), ...body } }];
});
route('GET', '/auth/profile', ({ req }) => [200, ok(publicUser(userFor(req) ?? 'host'))]);

// ── Dashboard + sessions ───────────────────────────────────────────────────
route('GET', '/dashboard', ({ req }) => {
	const mine = sessions.filter((s) => s.host === userFor(req));
	let pending = 0;
	let totalPending = 0;
	for (const s of mine) {
		if (s.status === 'cancelled') continue;
		for (const p of s.participants) {
			if (p.payment_status !== 'paid') {
				pending++;
				totalPending += shareOf(s, p.participant_id).total;
			}
		}
	}
	return [
		200,
		{
			success: true,
			active_sessions: mine.filter((s) => !['completed', 'cancelled'].includes(s.status)).length,
			completed_sessions: mine.filter((s) => s.status === 'completed').length,
			pending_payments: pending,
			total_pending: totalPending
		}
	];
});
route('GET', '/sessions', ({ req }) => {
	const mine = sessions.filter((s) => s.host === userFor(req)).map(listSession);
	return [200, ok(mine, { pagination: { page: 1, limit: 12, total: mine.length } })];
});
route('POST', '/sessions', ({ body }) => {
	const id = `s-new-${nextId++}`;
	sessions.unshift({
		session_id: id,
		host: 'host',
		title: String(body.title ?? 'Untitled'),
		description: body.description ? String(body.description) : undefined,
		status: 'draft',
		created_hours_ago: 0,
		currency: String(body.currency ?? 'IDR'),
		fee_config: null,
		bank_accounts: [],
		participants: [],
		bills: [],
		bill_images: 0
	});
	return [201, ok({ session_id: id })];
});
route('GET', '/sessions/([^/]+)', ({ m }) => {
	const s = sessions.find((x) => x.session_id === m[1]);
	return s ? [200, ok(detailSession(s))] : [404, fail('NOT_FOUND', 'Session not found')];
});
route('PUT', '/sessions/([^/]+)', ({ m, body }) => {
	const s = sessions.find((x) => x.session_id === m[1]);
	if (!s) return [404, fail('NOT_FOUND', 'Session not found')];
	if (typeof body.title === 'string') s.title = body.title;
	if (typeof body.description === 'string') s.description = body.description;
	return [200, ok(listSession(s))];
});
route('DELETE', '/sessions/([^/]+)', ({ m }) => {
	const s = sessions.find((x) => x.session_id === m[1]);
	if (s) s.status = 'cancelled';
	return [200, ok()];
});
route('POST', '/sessions/([^/]+)/participants', ({ m, body }) => {
	const s = sessions.find((x) => x.session_id === m[1]);
	if (!s) return [404, fail('NOT_FOUND', 'Session not found')];
	const list = (body.participants as Array<Record<string, string>>) ?? [];
	for (const item of list) {
		const c = item.contact_id ? contacts.find((x) => x.contact_id === item.contact_id) : null;
		s.participants.push({
			participant_id: `${s.session_id}-px${nextId++}`,
			contact_id: c?.contact_id,
			name: c?.name ?? item.custom_name ?? 'Guest',
			whatsapp_number: c?.whatsapp_number ?? item.custom_whatsapp ?? '',
			payment_status: 'pending',
			notification: 'none'
		});
	}
	return [200, ok({ participants: s.participants.map((p) => detailParticipant(s, p)) })];
});
route('PUT', '/sessions/([^/]+)/participants/([^/]+)', () => [200, ok()]);
route('DELETE', '/sessions/([^/]+)/participants/([^/]+)', ({ m }) => {
	const s = sessions.find((x) => x.session_id === m[1]);
	if (s) s.participants = s.participants.filter((p) => p.participant_id !== m[2]);
	return [200, ok()];
});
route('POST', '/sessions/([^/]+)/bills', ({ m, body }) => {
	const s = sessions.find((x) => x.session_id === m[1]);
	if (!s) return [404, fail('NOT_FOUND', 'Session not found')];
	const bill = {
		bill_item_id: `b-new-${nextId++}`,
		description: String(body.description ?? 'Item'),
		amount: Number(body.amount ?? 0),
		participant_ids: (body.participant_ids as string[]) ?? [],
		includes_service_charge: body.includes_service_charge !== false,
		includes_tax: body.includes_tax !== false
	};
	s.bills.push(bill);
	return [201, ok(bill)];
});
route('PUT', '/sessions/([^/]+)/bills/([^/]+)', () => [200, ok({}, { message: 'Updated' })]);
route('DELETE', '/sessions/([^/]+)/bills/([^/]+)', ({ m }) => {
	const s = sessions.find((x) => x.session_id === m[1]);
	if (s) s.bills = s.bills.filter((b) => b.bill_item_id !== m[2]);
	return [200, ok()];
});
route('PUT', '/sessions/([^/]+)/calculate-splits', () => [200, ok()]);
route('POST', '/sessions/([^/]+)/send-notifications', ({ m }) => {
	const s = sessions.find((x) => x.session_id === m[1]);
	if (s) for (const p of s.participants) p.notification = 'sent';
	return [200, ok({ sent: s?.participants.length ?? 0, failed: 0 })];
});
route('POST', '/sessions/([^/]+)/send-notifications/resend', () => [200, ok({ sent: 1, failed: 0 })]);
route('POST', '/sessions/([^/]+)/bulk-reminder', () => [200, ok({ sent: 3, skipped: 0 })]);
route('PUT', '/sessions/([^/]+)/bank-accounts', ({ m, body }) => {
	const s = sessions.find((x) => x.session_id === m[1]);
	if (s) s.bank_accounts = ((body.accounts as FxSession['bank_accounts']) ?? []).map((a) => ({ ...a }));
	return [200, ok()];
});
route('PUT', '/sessions/([^/]+)/fee-config', ({ body }) => [200, ok(body)]);
route('GET', '/sessions/([^/]+)/bill-images', ({ m }) => {
	const s = sessions.find((x) => x.session_id === m[1]);
	return [200, ok(s ? detailSession(s).bill_images : [])];
});
route('POST', '/sessions/([^/]+)/bill-images', () => [201, ok({ bill_image_id: `img-${nextId++}` })]);
route('GET', '/sessions/([^/]+)/bill-images/([^/]+)', () => [200, ok({ url: placeholderImage('Receipt'), expires_at: hoursAgo(-1) })]);
route('DELETE', '/sessions/([^/]+)/bill-images/([^/]+)', () => [200, ok()]);

// ── Payments + reminders ───────────────────────────────────────────────────
route('GET', '/payments/([^/]+)/public', ({ m }) => {
	const page = paymentPage(m[1]);
	return page ? [200, ok(page)] : [404, fail('NOT_FOUND', 'Payment link not found')];
});
route('POST', '/payments/([^/]+)/submit', ({ m }) => {
	const hit = findParticipant(m[1]);
	if (!hit) return [404, fail('NOT_FOUND', 'Payment link not found')];
	hit.p.payment_status = 'submitted';
	hit.p.rejection_reason = undefined;
	return [200, ok({ proof_id: `proof-${m[1]}`, status: 'submitted', uploaded_at: hoursAgo(0) })];
});
route('POST', '/payments/([^/]+)/approve', ({ m }) => {
	const hit = findParticipant(m[1]);
	if (hit) hit.p.payment_status = 'paid';
	return [200, ok()];
});
route('POST', '/payments/([^/]+)/reject', ({ m, body }) => {
	const hit = findParticipant(m[1]);
	if (hit) {
		hit.p.payment_status = 'rejected';
		hit.p.rejection_reason = String(body.reason ?? body.rejection_reason ?? '');
	}
	return [200, ok()];
});
route('POST', '/payments/bulk-approve', ({ body }) => {
	const ids = (body.proof_ids as string[]) ?? [];
	for (const id of ids) {
		const hit = findParticipant(id);
		if (hit) hit.p.payment_status = 'paid';
	}
	return [200, ok({ succeeded: ids.length, failed: 0, errors: [] })];
});
route('POST', '/payments/bulk-reject', ({ body }) => [200, ok({ succeeded: ((body.proof_ids as string[]) ?? []).length, failed: 0, errors: [] })]);
route('POST', '/participants/([^/]+)/mark-paid', ({ m }) => {
	const hit = findParticipant(m[1]);
	if (hit) {
		hit.p.payment_status = 'paid';
		hit.p.paid_manually = true;
	}
	return [200, ok()];
});
route('POST', '/participants/([^/]+)/reminder', () => [200, ok({ sent: true, next_available_at: hoursAgo(-24) })]);
route('GET', '/participants/([^/]+)/reminder-status', ({ m }) => {
	const cooling = m[1].endsWith('-p3');
	return [200, ok({ can_send: !cooling, retry_after_seconds: cooling ? 6 * 3600 : 0, next_available_at: cooling ? hoursAgo(-6) : undefined })];
});
route('POST', '/participants/([^/]+)/notifications/retry', () => [200, ok()]);

// ── Contacts ───────────────────────────────────────────────────────────────
route('GET', '/contacts', ({ req }) => [200, ok(userFor(req) === 'empty' ? [] : contacts, { pagination: { page: 1, limit: 100, total: contacts.length } })]);
route('POST', '/contacts', ({ body }) => {
	const c = {
		contact_id: `c-new-${nextId++}`,
		name: String(body.name ?? ''),
		whatsapp_number: String(body.whatsapp_number ?? ''),
		group_id: undefined as string | undefined,
		group_name: undefined as string | undefined,
		group_color: undefined as string | undefined,
		is_favorite: false,
		notes: body.notes ? String(body.notes) : undefined,
		created_at: hoursAgo(0),
		updated_at: hoursAgo(0)
	};
	contacts.unshift(c);
	return [201, ok(c)];
});
route('PUT', '/contacts/([^/]+)', ({ m, body }) => {
	const c = contacts.find((x) => x.contact_id === m[1]);
	if (!c) return [404, fail('NOT_FOUND', 'Contact not found')];
	Object.assign(c, body);
	return [200, ok(c)];
});
route('DELETE', '/contacts/([^/]+)', ({ m }) => {
	contacts = contacts.filter((x) => x.contact_id !== m[1]);
	return [200, ok()];
});
route('POST', '/contacts/bulk', ({ body }) => {
	const ids = (body.contact_ids as string[]) ?? [];
	if (body.operation === 'delete') contacts = contacts.filter((c) => !ids.includes(c.contact_id));
	return [200, ok({ succeeded: ids.length, failed: 0, errors: [] }, { message: 'Done' })];
});
route('POST', '/contacts/import', ({ body }) => {
	const list = (body.contacts as Array<{ name: string; whatsapp_number: string }>) ?? [];
	return [200, ok({ succeeded: list.length, failed: 0, errors: [] }, { message: 'Imported' })];
});
route('GET', '/contact-groups', ({ req }) => [200, ok(userFor(req) === 'empty' ? [] : CONTACT_GROUPS)]);
route('POST', '/contact-groups', ({ body }) => [201, ok({ group_id: `g-new-${nextId++}`, contact_count: 0, created_at: hoursAgo(0), ...body })]);
route('PUT', '/contact-groups/([^/]+)', ({ m, body }) => [200, ok({ group_id: m[1], ...body })]);
route('DELETE', '/contact-groups/([^/]+)', () => [200, ok()]);

// ── Admin (returns flat objects, like the real admin API) ──────────────────
const adminProfile = () => {
	const { token: _t, ...p } = ADMIN;
	return { ...p, last_login_at: hoursAgo(3), created_at: hoursAgo(2000), updated_at: hoursAgo(10) };
};
route('GET', '/admin/auth/needs-setup', () => [200, { needs_setup: false }]);
route('POST', '/admin/auth/initiate', () => [200, { success: true, session_id: 'adm-sess-1', expires_at: hoursAgo(-0.1) }]);
route('POST', '/admin/auth/verify-otp', ({ body }) =>
	body.otp_code === '000000' ? [400, fail('OTP_INVALID', 'Invalid code')] : [200, { token: ADMIN.token, expires_at: hoursAgo(-24) }]
);
route('POST', '/admin/auth/login', () => [200, { token: ADMIN.token, expires_at: hoursAgo(-24) }]);
route('POST', '/admin/auth/bootstrap', () => [200, { token: ADMIN.token, expires_at: hoursAgo(-24), admin_id: ADMIN.admin_id }]);
route('GET', '/admin/profile', ({ req }) => (isAdmin(req) ? [200, adminProfile()] : [401, fail('AUTH_003', 'Admin access required')]));
route('PUT', '/admin/profile', ({ body }) => [200, { admin_id: ADMIN.admin_id, full_name: body.full_name, message: 'Profile updated' }]);
route('PUT', '/admin/profile/setup-password', () => [200, { success: true }]);
route('GET', '/admin/status', () => [200, { is_connected: true, gateway_token_valid: true, phone_number: '+6289988776655', last_connected_at: hoursAgo(5), message: 'Connected' }]);
route('POST', '/admin/qr-code', () => [200, { qr_code: placeholderImage('QR', 240, 240), qr_code_expires_at: hoursAgo(-0.05) }]);
route('PUT', '/admin/config', () => [200, { success: true }]);
route('POST', '/admin/disconnect-device', () => [200, { connection_status: 'disconnected', message: 'Device disconnected' }]);
route('POST', '/admin/logout', () => [200, { success: true }]);
route('GET', '/admin/admins', () => [
	200,
	{
		admins: [
			{ ...adminProfile() },
			{ admin_id: 'a-2', whatsapp_number: '+6289911112222', full_name: 'Support Desk', role: 'admin', is_active: true, created_at: hoursAgo(900) },
			{ admin_id: 'a-3', whatsapp_number: '+6289933334444', full_name: 'Former Contractor With A Long Name', role: 'admin', is_active: false, created_at: hoursAgo(1500) }
		]
	}
]);
route('POST', '/admin/admins', ({ body }) => [201, { admin_id: `a-new-${nextId++}`, ...body }]);
route('PUT', '/admin/admins/([^/]+)', ({ m, body }) => [200, { admin_id: m[1], ...body }]);
route('DELETE', '/admin/admins/([^/]+)', () => [200, { success: true }]);
route('GET', '/admin/templates', () => [200, { data: { templates: TEMPLATES } }]);
route('PUT', '/admin/templates/([^/]+)', ({ m, body }) => [200, { data: { ...TEMPLATES.find((t) => t.key === m[1]), ...body } }]);
route('POST', '/admin/templates/([^/]+)/test-send', () => [200, { data: { rendered: 'Hi Alya, your share for "Dinner" is Rp 125.000.', status: 'sent', message_id: 'm-1' } }]);

// ── Server ─────────────────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
	const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
	if (req.method === 'OPTIONS') return send(res, 204, null);
	if (url.pathname === '/__reset') {
		reset();
		return send(res, 200, { ok: true });
	}
	if (url.pathname === '/__health') return send(res, 200, { ok: true });
	// A signed-in user whose data endpoints fail, for error-state screens.
	if ((req.headers.authorization ?? '').endsWith('tok-broken') && /\/(dashboard|sessions|contacts)/.test(url.pathname)) {
		return send(res, 503, fail('UNAVAILABLE', 'The server is having a moment.'));
	}
	if (!url.pathname.startsWith(PREFIX)) return send(res, 404, fail('NOT_FOUND', 'Unknown path'));
	const path = url.pathname.slice(PREFIX.length);
	const body = await readBody(req);
	for (const [method, re, handler] of routes) {
		if (method !== req.method) continue;
		const m = path.match(re);
		if (!m) continue;
		const [status, payload] = await handler({ req, m, body });
		return send(res, status, payload);
	}
	console.error(`[mock-api] unhandled ${req.method} ${path}`);
	send(res, 404, fail('NOT_FOUND', `Mock has no route for ${req.method} ${path}`));
});

server.listen(PORT, () => console.log(`[mock-api] listening on http://localhost:${PORT}${PREFIX}`));
