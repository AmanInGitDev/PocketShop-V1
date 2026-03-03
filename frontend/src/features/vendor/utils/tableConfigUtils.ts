/**
 * Table configuration utilities
 * Generates table codes and slugs from config
 */

import type { TableConfig, ZoneKey } from '../types/tables';
import { ZONE_PREFIX } from '../types/tables';

const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

/** Generate a short unique slug for a table (used in URL, never changes) */
export function generateTableSlug(): string {
  let result = '';
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 10; i++) {
    result += SLUG_CHARS[bytes[i]! % SLUG_CHARS.length];
  }
  return result;
}

/**
 * Compute table definitions from config (no DB - used when creating vendor_tables)
 */
export function computeTablesFromConfig(config: TableConfig): Array<{ table_code: string; zone: ZoneKey | null }> {
  const { mode, total_tables, zone_counts } = config;

  if (mode === 'simple' || total_tables <= 10) {
    return Array.from({ length: total_tables }, (_, i) => ({
      table_code: String(i + 1),
      zone: null,
    }));
  }

  // Zone mode
  const counts = zone_counts || { north: 0, south: 0, east: 0, west: 0 };
  const zones: ZoneKey[] = ['north', 'south', 'east', 'west'];
  const result: Array<{ table_code: string; zone: ZoneKey | null }> = [];

  for (const z of zones) {
    const n = Math.max(0, counts[z] ?? 0);
    const prefix = ZONE_PREFIX[z];
    for (let i = 1; i <= n; i++) {
      result.push({ table_code: `${prefix}-T${i}`, zone: z });
    }
  }

  return result;
}

/**
 * Validate zone counts sum to total_tables
 */
export function validateZoneConfig(config: TableConfig): { valid: boolean; error?: string } {
  const { mode, total_tables, zone_counts } = config;

  if (total_tables < 1 || total_tables > 50) {
    return { valid: false, error: 'Total tables must be between 1 and 50' };
  }

  if (mode === 'simple' || total_tables <= 10) {
    return { valid: true };
  }

  const counts = zone_counts || { north: 0, south: 0, east: 0, west: 0 };
  const sum = (counts.north || 0) + (counts.south || 0) + (counts.east || 0) + (counts.west || 0);
  if (sum !== total_tables) {
    return { valid: false, error: `Zone totals (${sum}) must equal total tables (${total_tables})` };
  }

  return { valid: true };
}
