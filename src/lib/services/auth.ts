import { get, post, put } from './api';
import { setToken, setUser, logout as logoutStore } from '$lib/stores/auth';

// API Response Types
interface LoginResponse {
  success: true;
  token: string;
  user: {
    user_id: string;
    whatsapp_number: string;
    full_name: string;
  };
}

interface RegisterResponse {
  success: true;
  message: string;
  user_id: string;
  expires_at: string;
}

interface VerifyOTPResponse {
  success: true;
  message: string;
  token: string;
  user: {
    user_id: string;
    whatsapp_number: string;
    full_name: string;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

interface ProfileResponse {
  success: true;
  data: {
    user_id: string;
    whatsapp_number: string;
    full_name: string;
    avatar_url?: string;
  };
}

export async function register(data: { whatsapp_number: string; password: string }): Promise<RegisterResponse | ErrorResponse> {
  return await post('/auth/register', data);
}

export async function verifyOTP(data: { whatsapp_number: string; otp: string }): Promise<VerifyOTPResponse | ErrorResponse> {
  return await post('/auth/verify-otp', { whatsapp_number: data.whatsapp_number, otp_code: data.otp });
}

export async function login(data: { whatsapp_number: string; password: string }): Promise<LoginResponse | ErrorResponse> {
  const response = await post('/auth/login', data);
  if (response.success) {
    setToken(response.token);
    setUser(response.user);
  }
  return response;
}

export async function logout() {
  logoutStore();
}

export async function getProfile(): Promise<ProfileResponse | ErrorResponse> {
  const response = await get('/auth/profile');
  // Sync profile data with auth store if successful
  if (response && 'success' in response && response.success) {
    setUser(response.data);
  }
  return response;
}

export async function refreshProfile(): Promise<void> {
  try {
    await getProfile();
  } catch (error) {
    console.error('Failed to refresh profile:', error);
  }
}

export async function updateProfile(data: { full_name?: string; avatar_url?: string }): Promise<ProfileResponse | ErrorResponse> {
  const response = await put('/auth/profile', data);
  // Sync updated profile data with auth store
  if (response && 'success' in response && response.success) {
    setUser(response.data);
  }
  return response;
}

export async function sendResetLink(data: { whatsapp_number: string }): Promise<{ success: boolean; message: string } | ErrorResponse> {
  return await post('/auth/forgot-password', data);
}
