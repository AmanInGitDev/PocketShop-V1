/**
 * Table system types for PocketShop
 *
 * - 1-10 tables: Simple numbering (1, 2, 3...)
 * - 11-50 tables: Zone-wise (N-T1, S-T1, E-T1, W-T1) with optional 0 for zones
 * - Pickup QR: Regeneratable (storefront?pickup=1)
 * - Table QRs: Permanent slugs, printed once
 */

export type TableMode = 'simple' | 'zone';

export type ZoneKey = 'north' | 'south' | 'east' | 'west';

export const ZONE_LABELS: Record<ZoneKey, string> = {
  north: 'North',
  south: 'South',
  east: 'East',
  west: 'West',
};

export const ZONE_PREFIX: Record<ZoneKey, string> = {
  north: 'N',
  south: 'S',
  east: 'E',
  west: 'W',
};

export interface ZoneCounts {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface TableConfig {
  mode: TableMode;
  total_tables: number;
  zone_counts?: ZoneCounts;
}

export interface VendorTable {
  id: string;
  vendor_id: string;
  table_slug: string;
  table_code: string;
  zone: ZoneKey | null;
  display_order: number;
  created_at?: string;
}
