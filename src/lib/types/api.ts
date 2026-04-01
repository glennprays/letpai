export interface User {
  user_id: string;
  whatsapp_number: string;
  full_name: string;
  avatar_url?: string;
}

export interface RegisterRequest {
  whatsapp_number: string;
  password: string;
}

export interface VerifyOTPRequest {
  whatsapp_number: string;
  otp_code: string;
}

export interface LoginRequest {
  whatsapp_number: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user_id: string;
  expires_at: string;
}

export interface Contact {
  contact_id: string;
  name: string;
  whatsapp_number: string;
  group_id?: string;
  group_name?: string;
  group_color?: string;
  is_favorite: boolean;
  avatar_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContactRequest {
  name: string;
  whatsapp_number: string;
  group_id?: string;
  avatar_url?: string;
  notes?: string;
}

export interface Session {
  session_id: string;
  host_id: string;
  session_name: string;
  session_description?: string;
  total_amount: number;
  currency: string;
  status: 'active' | 'completed' | 'cancelled';
  participant_count: number;
  paid_count: number;
  created_at: string;
}

export interface CreateSessionRequest {
  session_name: string;
  session_description?: string;
  currency?: string;
}

export interface BillItem {
  bill_item_id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  created_at: string;
}

export interface Participant {
  participant_id: string;
  name: string;
  whatsapp_number: string;
  share_amount: number;
  payment_status: 'pending' | 'submitted' | 'paid' | 'rejected';
  contact_avatar_url?: string;
  notification_count: number;
  last_notification_at?: string;
}

export interface DashboardStats {
  success: boolean;
  active_sessions: number;
  completed_sessions: number;
  pending_payments: number;
  total_pending: number;
}

export interface SessionsResponse {
  data: Session[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
