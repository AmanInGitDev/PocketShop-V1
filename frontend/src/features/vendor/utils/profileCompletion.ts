/**
 * Profile completion calculation for vendor onboarding.
 * Required fields must be filled to enable "Go Online".
 * Optional fields are excluded from the completion percentage.
 */

export type OperationalHoursType = Record<string, { open?: string; close?: string }> | null | undefined;

export type VendorProfileForCompletion = {
  business_name?: string | null;
  owner_name?: string | null;
  business_type?: string | null;
  address?: string | null;
  city?: string | null;
  email?: string | null;
  mobile_number?: string | null;
  working_days?: string[] | null;
  operational_hours?: OperationalHoursType;
};

/** Required fields to enable Go Online. Optional (logo, banner, description, etc.) are not counted. */
const REQUIRED_FIELDS: (keyof VendorProfileForCompletion)[] = [
  'business_name',
  'owner_name',
  'business_type',
  'address',
  'city',
  'email',
  'mobile_number',
  'working_days',
  'operational_hours',
];

function isFilled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.length === 0) return false;
    const first = (value as Record<string, { open?: string; close?: string }>)[keys[0]];
    return !!(first?.open && first?.close);
  }
  return true;
}

export function getProfileCompletion(profile: VendorProfileForCompletion | null | undefined): {
  percentage: number;
  canGoOnline: boolean;
  missingRequired: string[];
} {
  if (!profile) {
    return { percentage: 0, canGoOnline: false, missingRequired: REQUIRED_FIELDS as string[] };
  }

  const missing: string[] = [];
  let filled = 0;

  for (const key of REQUIRED_FIELDS) {
    const value = profile[key as keyof VendorProfileForCompletion];
    if (isFilled(value)) {
      filled++;
    } else {
      const label = key === 'operational_hours' ? 'Working days & hours' : key.replace(/_/g, ' ');
      missing.push(label.charAt(0).toUpperCase() + label.slice(1));
    }
  }

  const total = REQUIRED_FIELDS.length;
  const percentage = Math.round((filled / total) * 100);
  const canGoOnline = missing.length === 0;

  return { percentage, canGoOnline, missingRequired: missing };
}
