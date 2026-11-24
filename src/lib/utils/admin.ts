import type { WhatsAppStatus } from '$lib/services/admin';
import type { Tone } from './status';

export interface GatewayState {
	label: string;
	tone: Tone;
	/** One sentence on what this means for hosts and what to do. */
	detail: string;
	/** Notifications reach people in this state. */
	healthy: boolean;
}

/**
 * The gateway in the admin's terms: can Letpai send WhatsApp messages right
 * now, and if not, what's the next step.
 */
export function gatewayState(status: WhatsAppStatus | null | undefined): GatewayState {
	if (!status) {
		return {
			label: 'Unknown',
			tone: 'neutral',
			detail: "We couldn't reach the gateway to check. Refresh in a moment.",
			healthy: false
		};
	}
	if (status.is_connected) {
		return { label: 'Sending', tone: 'paid', detail: 'Messages, reminders and codes are going out.', healthy: true };
	}
	if (status.gateway_token_valid) {
		return {
			label: 'Needs pairing',
			tone: 'pending',
			detail: 'The token works but no phone is linked. Pair one to start sending.',
			healthy: false
		};
	}
	return {
		label: 'Not set up',
		tone: 'rejected',
		detail: 'No valid gateway token, so nothing is being sent. Set WHATSAPP_API_KEY on the backend.',
		healthy: false
	};
}

export function adminRoleLabel(role: string | undefined): string {
	if (role === 'super_admin') return 'Super admin';
	if (role === 'admin') return 'Admin';
	return role ?? 'Admin';
}

/** "3 h ago", "12 days ago": coarse on purpose, admins scan these. */
export function timeAgo(iso: string | undefined, now = Date.now()): string {
	if (!iso) return 'never';
	const t = new Date(iso).getTime();
	if (Number.isNaN(t)) return 'never';
	const s = Math.max(0, Math.round((now - t) / 1000));
	if (s < 60) return 'just now';
	if (s < 3600) return `${Math.floor(s / 60)} min ago`;
	if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
	const d = Math.floor(s / 86400);
	return d === 1 ? 'yesterday' : `${d} days ago`;
}

export function formatDay(iso: string | undefined): string {
	if (!iso) return '—';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '—';
	return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Fill `{{.Name}}` placeholders; unknown names stay visible so gaps show. */
export function renderTemplate(body: string, values: Record<string, string>): string {
	return body.replace(/\{\{\s*\.(\w+)\s*\}\}/g, (match, key: string) => values[key] ?? match);
}

/** Placeholders used in a body, in order of first use. */
export function templateVariables(body: string): string[] {
	return [...new Set([...body.matchAll(/\{\{\s*\.(\w+)\s*\}\}/g)].map((m) => m[1]))];
}
