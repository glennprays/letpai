export const colors = {
  // Primary - Coral Red (gradient pair: deep → bright)
  primary: {
    DEFAULT: '#FF6B6B',
    hover: '#EE5A5A',
    contrast: '#CC4444',
    deep: '#ae2f34',
  },

  // Secondary - Teal Blue
  secondary: {
    DEFAULT: '#14B8A6',
    hover: '#10A392',
    deep: '#006b5f',
    light: '#6df5e1',
  },

  // Tertiary - Purple (premium/settled)
  tertiary: {
    DEFAULT: '#842bd2',
  },

  // Accents
  accent: {
    purple: '#8B5CF6',
    yellow: '#F59E0B',
  },

  // Status Colors (functional only — never decorative)
  status: {
    pending: '#F59E0B',
    submitted: '#3B82F6',
    paid: '#10B981',
    rejected: '#EF4444',
  },

  // Social Ledger Surface Colors (tonal layering)
  surfaces: {
    surface: '#fff8f7',
    containerLow: '#fff0ef',
    containerLowest: '#ffffff',
    container: '#ffe9e7',
    containerHigh: '#fbe3e1',
    containerHighest: '#f5dddb',
    dim: '#ecd5d3',
  },

  // Social Ledger On-Surface Colors
  onSurface: {
    DEFAULT: '#251818',
    variant: '#584140',
  },

  outline: {
    variant: '#e0bfbd',
  },

  // Pure neutrals (use sparingly — prefer surface/onSurface tokens above)
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
  },
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

// Mirror of --radius-* in src/app.css. Keep these in sync.
export const borderRadius = {
  sm: '4px',
  md: '10px',
  icon: '14px',
  DEFAULT: '18px',
  card: '20px',
  lg: '24px',
  xl: '28px',
  full: '100px',
};

// Social Ledger ambient shadows — tinted with on-surface, low opacity.
// Never pure black, never above 12% opacity.
export const shadows = {
  none: 'none',
  card: '0 1px 3px rgba(37, 24, 24, 0.04)',
  cardHover: '0 10px 30px rgba(37, 24, 24, 0.06)',
  modal: '0 24px 48px -4px rgba(37, 24, 24, 0.12)',
};
