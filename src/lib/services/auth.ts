import { get, post } from './api';

export async function register(data: { whatsapp_number: string; password: string }) {
  return await post('/auth/register', data);
}

export async function verifyOTP(data: { whatsapp_number: string; otp_code: string }) {
  return await post('/auth/verify-otp', data);
}

export async function login(data: { whatsapp_number: string; password: string }) {
  return await post('/auth/login', data);
}

export async function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function getProfile() {
  return await get('/auth/profile');
}

export async function updateProfile(data: { full_name?: string; avatar_url?: string }) {
  return await post('/auth/profile', data);
}
