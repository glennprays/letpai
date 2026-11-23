// Letpai design tokens ("Ink & Receipt"). Source of truth for colour, radius
// and shadow values. `src/app.css` mirrors these in its @theme block so
// Tailwind utilities (bg-fog, text-ink, rounded-card, shadow-float…) resolve;
// tests/unit/tokens.test.ts fails if the two drift apart.
//
// Names describe roles, not hues, so a dark theme can remap them later.

export const color = {
	// Surfaces (max three levels: fog canvas → card → mist inset)
	fog: '#eff0f4',
	card: '#ffffff',
	mist: '#e3e5ed',
	hairline: '#d3d7e3',

	// Ink
	ink: '#1d2442',
	'ink-hover': '#2b3560',
	'ink-soft': '#5d627e',
	steel: '#3a5088',

	// The one accent: primary actions and money still owed
	coral: '#cf3a31',
	'coral-hover': '#b8322b',
	'coral-ink': '#b8322b',
	'coral-tint': '#fbe4e1',

	// Rare highlight: the Paid stamp, once per screen
	lime: '#d4f25c',

	// Payment status (text on tint)
	pending: '#8a5a00',
	'pending-tint': '#fbefd3',
	review: '#24508f',
	'review-tint': '#e1eaf8',
	paid: '#1f6b47',
	'paid-tint': '#dcefe4',
	rejected: '#a3241c',
	'rejected-tint': '#f8e0dd',

	// WhatsApp chat illustration + WhatsApp-branded action
	'chat-bg': '#e7e1d6',
	'chat-out': '#d7f5c9',
	whatsapp: '#1a7a49',
	'whatsapp-hover': '#156a3f'
} as const;

export const radius = {
	field: '12px',
	card: '16px',
	sheet: '24px',
	pill: '9999px'
} as const;

export const shadow = {
	card: '0 1px 3px rgba(29, 36, 66, 0.06), 0 4px 11px rgba(29, 36, 66, 0.05)',
	float: '0 9px 25px rgba(29, 36, 66, 0.12)',
	pop: '0 24px 48px -8px rgba(29, 36, 66, 0.18)'
} as const;

export const font = {
	sans: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
	display: '"Bricolage Grotesque Variable", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif'
} as const;

// Palette offered when a user colours a contact group. Stored on the backend
// as a hex string, so these are data values, not styling shortcuts.
export const groupColors = ['#3a5088', '#cf3a31', '#1f6b47', '#8a5a00', '#6b3fa0', '#0f7c86', '#5d627e', '#b3416f'] as const;

export type PaymentStatus = 'pending' | 'submitted' | 'paid' | 'rejected';
