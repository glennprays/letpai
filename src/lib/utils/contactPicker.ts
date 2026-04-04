/**
 * Contact Picker API utility for importing device contacts
 * Only works on Chrome/Edge on Android with Contact Picker API support
 */

export interface DeviceContact {
  id: string;
  name: string;
  phone_numbers: string[];
}

export interface ContactPickerResult {
  success: boolean;
  contacts?: DeviceContact[];
  error?: string;
}

/**
 * Check if Contact Picker API is supported
 */
export function isContactPickerSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'contacts' in navigator &&
    typeof (navigator as any).contacts?.select === 'function'
  );
}

/**
 * Open device contact picker and return selected contacts
 * @param properties - Contact properties to request (default: ['name', 'tel'])
 * @param multiple - Allow multiple selection (default: true)
 * @returns Promise with selected contacts or error
 */
export async function selectDeviceContacts(
  properties: (keyof ContactProperties)['name'][][] = [['name'], ['tel']],
  multiple = true
): Promise<ContactPickerResult> {
  try {
    // Check if API is supported
    if (!isContactPickerSupported()) {
      return {
        success: false,
        error: 'Contact Picker API is not supported on this browser. Please use Chrome or Edge on Android.'
      };
    }

    // Request contact picker
    const contacts = await (navigator as any).contacts.select(properties, { multiple });

    if (!contacts || contacts.length === 0) {
      return {
        success: false,
        error: 'No contacts selected.'
      };
    }

    // Transform to DeviceContact format
    const deviceContacts: DeviceContact[] = contacts.map((contact: any) => ({
      id: crypto.randomUUID(),
      name: contact.name?.[0] || 'Unknown',
      phone_numbers: contact.tel?.map((tel: any) => tel.value) || []
    })).filter((c: DeviceContact) => c.phone_numbers.length > 0);

    return {
      success: true,
      contacts: deviceContacts
    };
  } catch (error) {
    console.error('Contact picker error:', error);

    // Handle user cancellation
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Contact selection was cancelled.'
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to access contacts.'
    };
  }
}

/**
 * Format phone number from device contact to WhatsApp format
 * @param phone - Phone number string
 * @returns Formatted Indonesian phone number (+62 XXX-XXXX-XXXX)
 */
export function formatDevicePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Remove leading country code if present
  if (cleaned.startsWith('62')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  // Validate length (Indonesian numbers are 9-12 digits)
  if (cleaned.length < 9 || cleaned.length > 12) {
    return phone; // Return original if invalid
  }

  return cleaned;
}

/**
 * Check if a phone number already exists in contacts
 * @param phone - Phone number to check
 * @param existingPhones - Set of existing phone numbers
 * @returns True if phone number is duplicate
 */
export function isDuplicatePhoneNumber(
  phone: string,
  existingPhones: Set<string>
): boolean {
  const normalized = formatDevicePhoneNumber(phone);
  return existingPhones.has(normalized);
}

interface ContactProperties {
  name: string[];
  tel: Array<{ value: string }>;
}

/**
 * Get all unique phone numbers from a device contact
 * @param contact - Device contact
 * @returns Array of formatted phone numbers
 */
export function getUniquePhoneNumbers(contact: DeviceContact): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const phone of contact.phone_numbers) {
    const formatted = formatDevicePhoneNumber(phone);
    if (formatted && !seen.has(formatted)) {
      seen.add(formatted);
      unique.push(formatted);
    }
  }

  return unique;
}
