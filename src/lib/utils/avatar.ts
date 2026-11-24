/**
 * Avatar utility for generating modern, accessible profile image fallbacks
 * Hash-based tint so the same person always gets the same colour.
 */

import { avatarTones, font } from '$lib/constants/design';

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
function avatarTone(identifier: string | undefined | null): readonly [string, string] {
  if (!identifier) return avatarTones[0];

  // Simple string hash
  let hash = 0;
  const str = String(identifier);
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return avatarTones[Math.abs(hash) % avatarTones.length];
}

/** Background colour of the generated avatar for this identifier. */
export function getAvatarColor(identifier: string | undefined | null): string {
  return avatarTone(identifier)[0];
}

/**
 * Generate SVG data URL for avatar fallback
 * Flat tint with ink-coloured initials (palette in design.ts avatarTones)
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
  const [bg, fg] = avatarTone(identifier || fullName || phoneNumber);

  // Modern SVG: solid background, centered white text
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${bg}"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
      fill="${fg}" font-size="${size * 0.38}" font-weight="700" font-family='${font.sans}'>
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
