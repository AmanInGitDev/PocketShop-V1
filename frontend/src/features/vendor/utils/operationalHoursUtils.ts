/**
 * Utilities for vendor operational hours: closing time, 30-min window, etc.
 */

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface OperationalInfo {
  /** Minutes until closing time (null if outside hours, non-working day, or no config) */
  minutesUntilClosing: number | null;
  /** Human-readable closing time, e.g. "10:00 PM" */
  closingTimeFormatted: string | null;
  /** True when within 30 minutes of closing */
  isWithin30MinsOfClosing: boolean;
  /** Minutes until opening time (null if not before open on working day) */
  minutesUntilOpening: number | null;
  /** Human-readable opening time, e.g. "9:00 AM" */
  openingTimeFormatted: string | null;
  /** True when within 30 minutes of opening (before open) */
  isWithin30MinsOfOpening: boolean;
  /** True when before opening time on a working day */
  isBeforeOpening: boolean;
  /** True when currently outside operational hours */
  isOutsideHours: boolean;
  /** True when vendor has working_days and operational_hours configured */
  hasOperationalHours: boolean;
}

function isWithinWorkingHours(
  workingDays: string[] | null | undefined,
  operationalHours: Record<string, { open: string; close: string }> | null | undefined
): boolean {
  if (!workingDays?.length || !operationalHours) return true;
  const now = new Date();
  const today = DAY_NAMES[now.getDay()];
  const todayLower = today.toLowerCase();
  const isWorkingDay = workingDays.some((d) => d.toLowerCase() === todayLower);
  if (!isWorkingDay) return false;
  const dayKey = todayLower;
  const hours = operationalHours[dayKey];
  if (!hours?.open || !hours?.close) return true;
  const pad = (n: number) => String(n).padStart(2, '0');
  const current = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return current >= hours.open && current <= hours.close;
}

function formatTimeForDisplay(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const hour = h % 12 || 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Parse "HH:mm" to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Get operational info for the current moment.
 */
export function getOperationalInfo(
  workingDays: string[] | null | undefined,
  operationalHours: Record<string, { open: string; close: string }> | null | undefined
): OperationalInfo {
  const hasOperationalHours = !!(workingDays?.length && operationalHours);
  const outsideHours = hasOperationalHours && !isWithinWorkingHours(workingDays, operationalHours);

  if (!hasOperationalHours) {
    return {
      minutesUntilClosing: null,
      closingTimeFormatted: null,
      isWithin30MinsOfClosing: false,
      minutesUntilOpening: null,
      openingTimeFormatted: null,
      isWithin30MinsOfOpening: false,
      isBeforeOpening: false,
      isOutsideHours: false,
      hasOperationalHours: false,
    };
  }

  const now = new Date();
  const today = DAY_NAMES[now.getDay()];
  const todayLower = today.toLowerCase();
  const isWorkingDay = (workingDays || []).some((d) => d.toLowerCase() === todayLower);
  if (!isWorkingDay) {
    return {
      minutesUntilClosing: null,
      closingTimeFormatted: null,
      isWithin30MinsOfClosing: false,
      minutesUntilOpening: null,
      openingTimeFormatted: null,
      isWithin30MinsOfOpening: false,
      isBeforeOpening: false,
      isOutsideHours: outsideHours,
      hasOperationalHours: true,
    };
  }

  const hours = operationalHours?.[todayLower];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = hours?.open ? timeToMinutes(hours.open) : 0;
  const closeMinutes = hours?.close ? timeToMinutes(hours.close) : 0;

  if (!hours?.close) {
    return {
      minutesUntilClosing: null,
      closingTimeFormatted: null,
      isWithin30MinsOfClosing: false,
      minutesUntilOpening: null,
      openingTimeFormatted: null,
      isWithin30MinsOfOpening: false,
      isBeforeOpening: false,
      isOutsideHours: outsideHours,
      hasOperationalHours: true,
    };
  }

  // Before opening time
  if (currentMinutes < openMinutes) {
    const minutesUntilOpening = openMinutes - currentMinutes;
    const isWithin30MinsOfOpening = minutesUntilOpening > 0 && minutesUntilOpening <= 30;
    return {
      minutesUntilClosing: null,
      closingTimeFormatted: formatTimeForDisplay(hours.close),
      isWithin30MinsOfClosing: false,
      minutesUntilOpening,
      openingTimeFormatted: formatTimeForDisplay(hours.open),
      isWithin30MinsOfOpening,
      isBeforeOpening: true,
      isOutsideHours: true,
      hasOperationalHours: true,
    };
  }

  // After closing time
  if (currentMinutes > closeMinutes) {
    return {
      minutesUntilClosing: null,
      closingTimeFormatted: formatTimeForDisplay(hours.close),
      isWithin30MinsOfClosing: false,
      minutesUntilOpening: null,
      openingTimeFormatted: null,
      isWithin30MinsOfOpening: false,
      isBeforeOpening: false,
      isOutsideHours: true,
      hasOperationalHours: true,
    };
  }

  // Within hours
  const minutesUntilClosing = closeMinutes - currentMinutes;
  const isWithin30MinsOfClosing = minutesUntilClosing > 0 && minutesUntilClosing <= 30;

  return {
    minutesUntilClosing,
    closingTimeFormatted: formatTimeForDisplay(hours.close),
    isWithin30MinsOfClosing,
    minutesUntilOpening: null,
    openingTimeFormatted: null,
    isWithin30MinsOfOpening: false,
    isBeforeOpening: false,
    isOutsideHours: false,
    hasOperationalHours: true,
  };
}
