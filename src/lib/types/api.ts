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

// Backend may wrap the list as `{ data: Session[] }` (top-level pagination),
// `{ data: { sessions, page, limit, total } }`, or `{ sessions: [] }`.
// Keep the type permissive so the server load can narrow at runtime.
export interface SessionsResponse {
  success?: boolean;
  data?: Session[] | {
    sessions: Session[];
    page?: number;
    limit?: number;
    total?: number;
  };
  sessions?: Session[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Response wrapper for AddParticipants
export interface ParticipantsResponse {
  success: boolean;
  data: {
    participants: Participant[];
  };
  message?: string;
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

// Session Detail Types
export interface SessionDetail {
  session_id: string;
  host_id: string;
  session_name: string;
  session_description?: string;
  total_amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
  participant_count: number;
  paid_count: number;
  created_at: string;
  participants: Participant[];
  bill_items: BillItem[];
}

export interface SessionResponse {
  success: boolean;
  data: Session;
  message?: string;
}

export interface SessionDetailResponse {
  success: boolean;
  data: SessionDetail;
}

export interface UpdateSessionRequest {
  session_name?: string;
  session_description?: string;
  currency?: string;
  status?: string;
}

// Participant Types
export interface AddParticipantsRequest {
  participants: Array<{
    contact_id?: string;
    name: string;
    whatsapp_number: string;
  }>;
}

export interface UpdateParticipantRequest {
  payment_status: 'paid' | 'rejected';
  rejection_reason?: string;
}

// Bill Item Types
export interface CreateBillItemRequest {
  name: string;
  description?: string;
  amount: number;
  category?: string;
}

export interface UpdateBillItemRequest {
  name?: string;
  description?: string;
  amount?: number;
  category?: string;
}

export interface BillItemResponse {
  success: boolean;
  data: BillItem;
  message?: string;
}

export interface UpdateBillItemResponse {
  success: boolean;
  data: BillItem;
  message: string;
}

// Contacts Types
// Backend may return `{ data: Contact[] }`, `{ data: { contacts: [] } }`,
// or `{ contacts: [] }`. Keep permissive so server loads can narrow.
export interface ContactsResponse {
  success?: boolean;
  data?: Contact[] | { contacts: Contact[] };
  contacts?: Contact[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreateContactRequest {
  name: string;
  whatsapp_number: string;
  group_id?: string;
  avatar_url?: string;
  notes?: string;
}

export interface UpdateContactRequest {
  name?: string;
  whatsapp_number?: string;
  group_id?: string;
  avatar_url?: string;
  notes?: string;
  is_favorite?: boolean;
}

export interface ContactResponse {
  success: boolean;
  data: Contact;
  message?: string;
}

// Contact Groups
export interface ContactGroup {
  group_id: string;
  name: string;
  color: string;
  contact_count: number;
  created_at: string;
}

export interface CreateGroupRequest {
  name: string;
  color: string;
}

export interface UpdateGroupRequest {
  name?: string;
  color?: string;
}

export interface GroupResponse {
  success: boolean;
  data: ContactGroup;
  message?: string;
}

// Permissive shape: matches `{ data: [] }`, `{ data: { groups: [] } }`, or `{ groups: [] }`.
export interface GroupsResponse {
  success?: boolean;
  data?: ContactGroup[] | { groups: ContactGroup[] };
  groups?: ContactGroup[];
}

// Bulk Operations
export type BulkOperationType = 'delete' | 'update';

export interface BulkImportRequest {
  contacts: Array<{
    name: string;
    whatsapp_number: string;
    group_id?: string;
  }>;
}

export interface BulkDeleteRequest {
  contact_ids: string[];
}

export interface BulkUpdateRequest {
  contact_ids: string[];
  updates: {
    group_id?: string;
    is_favorite?: boolean;
  };
}

export interface BulkOperationRequest {
  operation: BulkOperationType;
  contact_ids: string[];
  updates?: {
    group_id?: string;
    is_favorite?: boolean;
  };
}

export interface BulkOperationResponse {
  success: boolean;
  data: {
    succeeded: number;
    failed: number;
    errors: Array<{
      contact_id: string;
      error: string;
    }>;
  };
  message: string;
}

// Device Import Preview
export interface DeviceContact {
  id: string;
  name: string;
  phone_numbers: string[];
}

export interface ImportPreviewResponse {
  success: boolean;
  data: {
    total: number;
    new_contacts: number;
    existing_contacts: number;
    contacts: Array<{
      name: string;
      whatsapp_number: string;
      status: 'new' | 'existing';
      existing_id?: string;
    }>;
  };
}
