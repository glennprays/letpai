export const colors = {
  // Primary - Coral Red (action-oriented)
  primary: {
    DEFAULT: '#FF6B6B',
    hover: '#EE5A5A',
    contrast: '#CC4444',
  },
  
  // Secondary - Teal Blue (secondary actions)
  secondary: {
    DEFAULT: '#14B8A6',
    hover: '#10A392',
  },
  
  // Accents
  accent: {
    purple: '#8B5CF6',
    yellow: '#F59E0B',
  },
  
  // Status Colors (high contrast)
  status: {
    pending: '#F59E0B',      // Yellow - attention
    submitted: '#3B82F6',    // Blue - in progress
    paid: '#10B981',         // Green - success
    rejected: '#EF4444',     // Red - needs action
  },
  
  // Neutral (high contrast)
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    }
  }
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

export const borderRadius = {
  none: '0',
  sm: '4px',
  DEFAULT: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  bold: '4px 4px 0 0 rgba(0, 0, 0, 1)',
};
