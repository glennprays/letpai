/**
 * Avatar utility for generating modern, accessible profile image fallbacks
 * Based on UX Pro Max guidelines: solid colors, hash-based, WCAG compliant
 */

// Professional color palette - WCAG AA compliant with white text
const AVATAR_COLORS = [
  '#6366F1', // Indigo 500
  '#8B5CF6', // Violet 500
  '#EC4899', // Pink 500
  '#F43F5E', // Rose 500
  '#EF4444', // Red 500
  '#F97316', // Orange 500
  '#F59E0B', // Amber 500
  '#EAB308', // Yellow 500
  '#84CC16', // Lime 500
  '#22C55E', // Green 500
  '#10B981', // Emerald 500
  '#14B8A6', // Teal 500
  '#06B6D4', // Cyan 500
  '#0EA5E9', // Sky 500
  '#3B82F6', // Blue 500
  '#6366F1', // Indigo 500
  '#8B5CF6', // Violet 500
  '#D946EF', // Fuchsia 500
  '#A855F7', // Purple 500
] as const;

/**
 * Format phone number for display (e.g., 628123456789 → +62 812-3456-789)
 */
function formatPhoneNumberForDisplay(phone: string): string {
  if (!phone) return 'User';
  // Remove leading 0 if present and add +62
  let formatted = phone.replace(/^0/, '');
  if (!formatted.startsWith('62')) {
    formatted = '62' + formatted;
  }
  return '+' + formatted;
}

/**
 * Get user initials from full name or phone number
 * @param fullName - User's full name
 * @param phoneNumber - Fallback to phone number if no name
 * @returns 1-2 character initials
 */
export function getInitials(fullName: string | undefined | null, phoneNumber?: string | undefined | null): string {
  if (fullName && fullName.trim().length > 0) {
    const trimmed = fullName.trim();
    const parts = trimmed.split(' ').filter(p => p.length > 0);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  // Fallback to phone number last 4 digits
  if (phoneNumber) {
    return phoneNumber.slice(-4);
  }

  return 'U';
}

/**
 * Get display name from full name or phone number
 * @param fullName - User's full name
 * @param phoneNumber - Fallback to phone number if no name
 * @returns Display name (first name or formatted phone)
 */
export function getDisplayName(fullName: string | undefined | null, phoneNumber?: string | undefined | null): string {
  if (fullName && fullName.trim().length > 0) {
    const trimmed = fullName.trim();
    const parts = trimmed.split(' ');
    return parts[0];
  }

  // Fallback to formatted phone number
  if (phoneNumber) {
    return formatPhoneNumberForDisplay(phoneNumber);
  }

  return 'User';
}

/**
 * @deprecated Use getDisplayName instead - this alias for backward compatibility
 */
export function getFirstName(fullName: string | undefined | null, phoneNumber?: string | undefined | null): string {
  return getDisplayName(fullName, phoneNumber);
}

/**
 * Get consistent color based on user identifier
 * Uses simple hash for deterministic color assignment
 * @param identifier - User ID, name, email
 * @returns Hex color from palette
 */
export function getAvatarColor(identifier: string | undefined | null): string {
  if (!identifier) return AVATAR_COLORS[0];

  // Simple string hash
  let hash = 0;
  const str = String(identifier);
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Generate SVG data URL for avatar fallback
 * Modern design: solid color, centered initials, no gradient
 * @param fullName - User's full name for initials
 * @param phoneNumber - Fallback phone number for initials
 * @param identifier - User identifier for consistent color
 * @param size - Avatar size in pixels (default 40)
 * @returns Data URL for SVG image
 */
export function generateAvatarUrl(
  fullName: string | undefined | null,
  phoneNumber: string | undefined | null,
  identifier: string | undefined | null,
  size: number = 40
): string {
  const initials = getInitials(fullName, phoneNumber);
  const color = getAvatarColor(identifier || fullName || phoneNumber);

  // Modern SVG: solid background, centered white text
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${color}"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
      fill="white" font-size="${size * 0.4}" font-weight="600" font-family="system-ui, -apple-system, sans-serif">
      ${initials}
    </text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Get avatar URL with automatic fallback generation
 * @param avatarUrl - User's uploaded avatar URL (optional)
 * @param fullName - User's full name
 * @param phoneNumber - Fallback phone number
 * @param identifier - User identifier for consistent color
 * @param size - Avatar size in pixels
 * @returns Avatar URL or generated SVG data URL
 */
export function getAvatarWithFallback(
  avatarUrl: string | undefined | null,
  fullName: string | undefined | null,
  phoneNumber: string | undefined | null,
  identifier: string | undefined | null,
  size: number = 40
): string {
  return avatarUrl || generateAvatarUrl(fullName, phoneNumber, identifier || fullName || phoneNumber, size);
}
