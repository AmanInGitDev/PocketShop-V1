/**
 * Utilities for vendor working hours and reopening messages
 */

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Format time like "09:00" to "9:00 AM"
 */
function formatTimeForDisplay(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const hour = h % 12 || 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Get human-readable "reopens on..." message based on working_days and operational_hours.
 * Returns null if no schedule is configured.
 */
export function getNextReopeningText(
  workingDays: string[] | null | undefined,
  operationalHours: Record<string, { open: string; close: string }> | null | undefined
): string | null {
  if (!workingDays?.length || !operationalHours) return null;

  const now = new Date();
  const todayIdx = now.getDay();
  const todayName = DAY_NAMES[todayIdx];
  const todayLower = todayName.toLowerCase();
  const pad = (n: number) => String(n).padStart(2, '0');
  const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const sortedDayIndices = [0, 1, 2, 3, 4, 5, 6]; // Sun-Sat
  const workingDaySet = new Set(workingDays.map((d) => d.toLowerCase()));

  // Build list of (dayIndex, dayName, openTime) for next 7 days
  for (let offset = 0; offset < 7; offset++) {
    const dayIdx = (todayIdx + offset) % 7;
    const dayName = DAY_NAMES[dayIdx];
    const dayLower = dayName.toLowerCase();
    const hours = operationalHours[dayLower];

    if (!workingDaySet.has(dayLower) || !hours?.open) continue;

    const openTime = hours.open;

    if (offset === 0) {
      // Today - check if we're before open
      if (currentTime < openTime) {
        return `Opens today at ${formatTimeForDisplay(openTime)}`;
      }
      // We're past open today - try tomorrow
      continue;
    }

    // Future day
    const dayLabel = offset === 1 ? 'Tomorrow' : dayName;
    return `Reopens ${dayLabel} at ${formatTimeForDisplay(openTime)}`;
  }

  return 'Reopens soon';
}
