import { get, post, put, del } from './api';

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
	is_verified?: boolean;
	password_setup_required?: boolean;
	last_login_at?: string;
	created_at?: string;
	updated_at?: string;
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

// No phone parameter: WAGA's JWT (configured via WHATSAPP_API_KEY on
// the backend) is bound to the phone that originally registered with
// the gateway, and the SDK derives the phone from the bearer token on
// every call. Asking the admin to retype it was app-layer ceremony.
export async function generateQRCode(
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<QRCodeResponse> {
	return post('/admin/qr-code', {}, customFetch, serverToken);
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

// Super-admin: manage other admins.
//
// Backend returns AdminProfile with: admin_id, whatsapp_number, full_name,
// role, is_active, created_at. Listed via { admins: AdminProfile[] }.
export interface AdminListItem {
	admin_id: string;
	whatsapp_number: string;
	full_name: string;
	role: 'super_admin' | 'admin' | string;
	is_active: boolean;
	created_at: string;
}

export interface ListAdminsResponse {
	admins: AdminListItem[];
}

export async function listAdmins(
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<ListAdminsResponse> {
	return get('/admin/admins', customFetch, serverToken);
}

export interface CreateAdminPayload {
	whatsapp_number: string;
	full_name: string;
	role: 'super_admin' | 'admin';
	// Optional temporary password. When present, the new admin can
	// sign in via the password flow immediately — useful before WAGA
	// is paired. They're still nudged to change it on /admin/profile.
	password?: string;
}

export async function createAdmin(
	body: CreateAdminPayload,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ admin_id: string; message: string }> {
	return post('/admin/admins', body, customFetch, serverToken);
}

export interface UpdateAdminPayload {
	full_name?: string;
	role?: 'super_admin' | 'admin';
	is_active?: boolean;
}

export async function updateAdmin(
	adminId: string,
	body: UpdateAdminPayload,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ admin_id: string; message: string }> {
	return put(`/admin/admins/${adminId}`, body, customFetch, serverToken);
}

export async function deleteAdmin(
	adminId: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ success?: boolean }> {
	return del(`/admin/admins/${adminId}`, customFetch, serverToken);
}

// Backup sign-in: bcrypt-verified password instead of OTP. Useful when
// the WhatsApp gateway is down or hasn't been paired yet. The admin
// must have previously set a password via setupAdminPassword(); the
// backend returns a distinct 400 message when they haven't.
export interface AdminPasswordLoginResponse {
	token: string;
	expires_at: string;
}

export async function loginAdminWithPassword(
	whatsapp_number: string,
	password: string,
	customFetch?: typeof fetch
): Promise<AdminPasswordLoginResponse> {
	return post('/admin/auth/login', { whatsapp_number, password }, customFetch);
}

export async function updateAdminOwnProfile(
	body: { full_name: string },
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ admin_id: string; full_name: string; message: string }> {
	return put('/admin/profile', body, customFetch, serverToken);
}

export async function setupAdminPassword(
	password: string,
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<{ success?: boolean }> {
	return put('/admin/profile/setup-password', { password }, customFetch, serverToken);
}

export interface DisconnectDeviceResponse {
	connection_status: string;
	message: string;
}

export async function disconnectWhatsAppDevice(
	customFetch?: typeof fetch,
	serverToken?: string
): Promise<DisconnectDeviceResponse> {
	return post('/admin/disconnect-device', {}, customFetch, serverToken);
}

// First-boot wizard helpers (no auth)

export interface NeedsSetupResponse {
	needs_setup: boolean;
}

export async function getAdminNeedsSetup(
	customFetch?: typeof fetch
): Promise<NeedsSetupResponse> {
	return get('/admin/auth/needs-setup', customFetch);
}

export interface BootstrapResponse {
	token: string;
	expires_at: string;
	admin_id: string;
}

export async function bootstrapSuperAdmin(
	body: { whatsapp_number: string; full_name: string; password: string },
	customFetch?: typeof fetch
): Promise<BootstrapResponse> {
	return post('/admin/auth/bootstrap', body, customFetch);
}
