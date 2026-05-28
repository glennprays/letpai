import { get, post, put } from './api';

export interface InitiateLoginResponse {
	success: boolean;
	message?: string;
	session_id: string;
	expires_at: string;
}

export interface VerifyAdminOTPResponse {
	token: string;
	expires_at: string;
}

export interface AdminProfile {
	admin_id: string;
	whatsapp_number: string;
	full_name: string;
	role: string;
	is_active: boolean;
	password_setup_required?: boolean;
	last_login_at?: string;
}

export interface WhatsAppStatus {
	is_connected: boolean;
	gateway_token_valid: boolean;
	phone_number: string;
	last_connected_at?: string;
	message?: string;
}

export interface QRCodeResponse {
	qr_code: string;
	qr_code_expires_at: string;
}

export async function initiateAdminLogin(
	whatsapp_number: string,
	customFetch?: typeof fetch
): Promise<InitiateLoginResponse> {
	return post('/admin/auth/initiate', { whatsapp_number }, customFetch);
}

export async function verifyAdminOTP(
	session_id: string,
	otp_code: string,
	customFetch?: typeof fetch
): Promise<VerifyAdminOTPResponse> {
	return post('/admin/auth/verify-otp', { session_id, otp_code }, customFetch);
}

export async function getAdminProfile(
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<AdminProfile> {
	return get('/admin/profile', customFetch, serverToken);
}

export async function getWhatsAppStatus(
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<WhatsAppStatus> {
	return get('/admin/status', customFetch, serverToken);
}

export async function generateQRCode(
	phone_number: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<QRCodeResponse> {
	return post('/admin/qr-code', { phone_number }, customFetch, serverToken);
}

export async function updateWhatsAppConfig(
	body: { phone_number?: string; token?: string },
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ success?: boolean }> {
	return put('/admin/config', body, customFetch, serverToken);
}

export async function adminLogout(
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ success?: boolean }> {
	return post('/admin/logout', {}, customFetch, serverToken);
}
