import { digitsOnly, validateWhatsappNumber } from './phone';

// Single source of truth for the phone rule is phone.ts:validateWhatsappNumber
// (country-aware: 10–15 digits + the Indonesia 628 mobile guard). This wrapper
// keeps the auth screens' { valid, error } contract and Indonesian copy while
// delegating the actual rule, so the two validators can no longer diverge.
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (validateWhatsappNumber(phone) === null) {
    return { valid: true };
  }
  if (!digitsOnly(phone)) {
    return { valid: false, error: 'Nomor WhatsApp wajib diisi' };
  }
  return { valid: false, error: 'Nomor WhatsApp tidak valid' };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password wajib diisi' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password minimal 8 karakter' };
  }
  
  return { valid: true };
}

export function validateOTP(otp: string): { valid: boolean; error?: string } {
  if (!otp) {
    return { valid: false, error: 'Kode OTP wajib diisi' };
  }
  
  if (!/^\d{6}$/.test(otp)) {
    return { valid: false, error: 'Kode OTP harus 6 digit' };
  }
  
  return { valid: true };
}

export function validateRequired(value: string, fieldName: string): { valid: boolean; error?: string } {
  if (!value || !value.trim()) {
    return { valid: false, error: `${fieldName} wajib diisi` };
  }
  
  return { valid: true };
}
