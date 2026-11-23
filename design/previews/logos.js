// Three logo-mark candidates. All are single-colour-safe: each reads in ink
// alone, and the coral/lime is a second layer, not structure.
window.ART = Object.assign(window.ART || {}, {
	// A · Split coin: a disc cut along a shallow S, the right half nudged down.
	'logo-a': `<svg viewBox="0 0 64 64"><path d="M30 4.1A28 28 0 0 0 30 59.9C24 52 34 40 28 32S36 12 30 4.1z" fill="#1d2442"/><path d="M35 7.1A28 28 0 0 1 35 62.9C29 55 39 43 33 35S41 15 35 7.1z" fill="#cf3a31"/></svg>`,
	// B · Torn ticket: a bill whose bottom edge is perforated, with one tear
	// running through it. Reads as "receipt" and "split" at 16px.
	'logo-b': `<svg viewBox="0 0 64 64"><path d="M8 10a6 6 0 0 1 6-6h36a6 6 0 0 1 6 6v46l-4.8-3.6-4.8 3.6-4.8-3.6-4.8 3.6-4.8-3.6-4.8 3.6-4.8-3.6-4.8 3.6-4.8-3.6L8 56z" fill="#1d2442"/><path d="M40 4 26 30l12 4-14 26" stroke="#eff0f4" stroke-width="4.5" fill="none" stroke-linejoin="round"/><circle cx="47" cy="16" r="4.5" fill="#cf3a31"/></svg>`,
	// C · Bubble split: a WhatsApp-like bubble pulled into two halves.
	'logo-c': `<svg viewBox="0 0 64 64"><path d="M29 6H22C12 6 5 13 5 23v8c0 9 6 15 14 16v11l12-11z" fill="#cf3a31"/><path d="M35 6h7c10 0 17 7 17 17v8c0 10-7 16-17 16H35z" fill="#1d2442"/></svg>`
});
