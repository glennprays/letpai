export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_VERIFY_OTP: '/auth/verify-otp',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_PROFILE: '/auth/profile',
  
  // Contacts
  CONTACTS: '/contacts',
  CONTACTS_BULK: '/contacts/bulk',
  CONTACTS_IMPORT: '/contacts/import',
  
  // Contact Groups
  CONTACT_GROUPS: '/contact-groups',
  
  // Sessions
  SESSIONS: '/sessions',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Notifications
  SEND_NOTIFICATIONS: (sessionId: string) => `/sessions/${sessionId}/send-notifications`,
  BULK_REMINDER: (sessionId: string) => `/sessions/${sessionId}/bulk-reminder`,
  REMIND_PARTICIPANT: (participantId: string) => `/participants/${participantId}/reminder`,
  
  // Payments (public)
  PAYMENT_PUBLIC: (participantId: string) => `/payments/${participantId}/public`,
  PAYMENT_SUBMIT: (participantId: string) => `/payments/${participantId}/submit`,
  
  // Payments (protected)
  PAYMENT_APPROVE: (proofId: string) => `/payments/${proofId}/approve`,
  PAYMENT_REJECT: (proofId: string) => `/payments/${proofId}/reject`,
  PAYMENT_BULK_APPROVE: '/payments/bulk-approve',
  PAYMENT_BULK_REJECT: '/payments/bulk-reject',
} as const;
