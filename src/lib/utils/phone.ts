export interface CountryCode {
	code: string;
	short: string;
	label: string;
}

export const COUNTRY_CODES: CountryCode[] = [
	{ code: '62', short: 'ID', label: 'ID (Indonesia)' },
	{ code: '1', short: 'US', label: 'US (USA)' },
	{ code: '44', short: 'GB', label: 'GB (UK)' },
	{ code: '61', short: 'AU', label: 'AU (Australia)' },
	{ code: '65', short: 'SG', label: 'SG (Singapore)' },
	{ code: '60', short: 'MY', label: 'MY (Malaysia)' }
];

export const DEFAULT_COUNTRY_CODE = '62';

const CODE_SET = new Set(COUNTRY_CODES.map((c) => c.code));

/**
 * Strip any non-digit input the user might paste / type
 * (leading +, spaces, dashes, etc.) and return digits only.
 */
export function digitsOnly(value: string): string {
	return (value ?? '').replace(/\D/g, '');
}

/**
 * Split a stored E.164-style number (digits only, e.g. "6281234567890")
 * into a country code + local part. Falls back to the default country
 * code when nothing matches.
 */
export function splitWhatsappNumber(stored: string | null | undefined): {
	countryCode: string;
	local: string;
} {
	const digits = digitsOnly(stored ?? '');
	if (!digits) return { countryCode: DEFAULT_COUNTRY_CODE, local: '' };

	// Prefer the longest matching prefix so '1' doesn't shadow '12' etc.
	const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
	for (const c of sorted) {
		if (digits.startsWith(c.code)) {
			return { countryCode: c.code, local: digits.slice(c.code.length) };
		}
	}
	return { countryCode: DEFAULT_COUNTRY_CODE, local: digits };
}

/**
 * Compose a country code + locally entered digits into the canonical
 * stored shape (digits only, no leading +). Handles leading-zero
 * Indonesian-style input by dropping the 0.
 */
export function composeWhatsappNumber(countryCode: string, local: string): string {
	const cc = digitsOnly(countryCode) || DEFAULT_COUNTRY_CODE;
	let l = digitsOnly(local);
	if (l.startsWith('0')) l = l.slice(1);
	return cc + l;
}

/** True when the country code is one we render in the picker. */
export function isKnownCountryCode(code: string): boolean {
	return CODE_SET.has(code);
}

/**
 * Validate a normalised number (digits-only, may include country
 * code). Total length must fall within 10–15 — the practical floor
 * and ceiling for E.164 mobile numbers in the markets we care
 * about. Indonesian numbers are additionally checked for the `62`
 * country code and `8` mobile prefix.
 *
 * Returns null on success or a short human-friendly error message.
 */
export function validateWhatsappNumber(stored: string | null | undefined): string | null {
	const digits = digitsOnly(stored ?? '');
	if (!digits) return 'Enter a WhatsApp number.';
	if (digits.length < 10) return 'That number looks too short.';
	if (digits.length > 15) return 'That number looks too long.';
	// Light Indonesia-specific guard: if the prefix is `62`, expect
	// the next digit to be `8` (mobile). Other country codes pass
	// through with just the length check.
	if (digits.startsWith('62') && !digits.startsWith('628')) {
		return 'Use an Indonesian mobile (8xx…).';
	}
	return null;
}
