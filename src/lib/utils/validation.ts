export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const cleaned = phone.replace(/\D/g, '');
  
  if (!cleaned) {
    return { valid: false, error: 'Nomor WhatsApp wajib diisi' };
  }
  
  if (cleaned.length < 10 || cleaned.length > 13) {
    return { valid: false, error: 'Nomor WhatsApp tidak valid' };
  }
  
  return { valid: true };
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
