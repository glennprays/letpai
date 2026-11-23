import { digitsOnly, validateWhatsappNumber } from './phone';

// Single source of truth for the phone rule is phone.ts:validateWhatsappNumber
// (country-aware: 10–15 digits + the Indonesia 628 mobile guard). This wrapper
// keeps the auth screens' { valid, error } contract while delegating the rule.
export function validatePhone(phone: string): { valid: boolean; error?: string } {
	const error = validateWhatsappNumber(phone);
	if (error === null) return { valid: true };
	if (!digitsOnly(phone)) return { valid: false, error: 'Enter your WhatsApp number.' };
	return { valid: false, error };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
	if (!password) return { valid: false, error: 'Enter your password.' };
	if (password.length < 8) return { valid: false, error: 'Use at least 8 characters.' };
	return { valid: true };
}

export function validateOTP(otp: string): { valid: boolean; error?: string } {
	if (!otp) return { valid: false, error: 'Enter the 6-digit code from WhatsApp.' };
	if (!/^\d{6}$/.test(otp)) return { valid: false, error: 'The code has 6 digits.' };
	return { valid: true };
}

export function validateRequired(value: string, fieldName: string): { valid: boolean; error?: string } {
	if (!value || !value.trim()) return { valid: false, error: `Enter ${fieldName.toLowerCase()}.` };
	return { valid: true };
}
