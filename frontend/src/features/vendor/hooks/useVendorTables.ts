/**
 * Hook for vendor table management
 * - Fetch vendor_tables
 * - Save table config and create vendor_tables
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useVendor } from './useVendor';
import { useToast } from '@/hooks/use-toast';
import type { TableConfig, VendorTable } from '../types/tables';
import type { ZoneKey } from '../types/tables';
import { ZONE_PREFIX } from '../types/tables';
import {
  computeTablesFromConfig,
  generateTableSlug,
  validateZoneConfig,
} from '../utils/tableConfigUtils';

export function useVendorTables() {
  const { data: vendor } = useVendor();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const vendorId = vendor?.id ?? '';

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['vendor-tables', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_tables')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data ?? []) as VendorTable[];
    },
    enabled: !!vendorId,
  });

  const tableConfig = (vendor?.metadata as Record<string, unknown>)?.table_config as TableConfig | undefined;

  const saveTableConfigMutation = useMutation({
    mutationFn: async (config: TableConfig) => {
      const validation = validateZoneConfig(config);
      if (!validation.valid) throw new Error(validation.error);

      const meta = (vendor?.metadata as Record<string, unknown>) ?? {};
      const { error: updateError } = await supabase
        .from('vendor_profiles')
        .update({
          metadata: { ...meta, table_config: config },
          updated_at: new Date().toISOString(),
        })
        .eq('id', vendorId);

      if (updateError) throw updateError;

      const definitions = computeTablesFromConfig(config);

      // Check if we already have tables - if reconfiguring, we need to handle carefully
      const { data: existing } = await supabase
        .from('vendor_tables')
        .select('id')
        .eq('vendor_id', vendorId);

      if ((existing?.length ?? 0) > 0) {
        // Existing tables - don't delete (printed QRs!). Only allow adding new tables
        // For simplicity: if count matches, no op. If config asks for more, add new ones.
        const toAdd = definitions.length - (existing?.length ?? 0);
        if (toAdd <= 0) return { config, created: 0 };

        const startIdx = existing!.length;
        const newDefs = definitions.slice(startIdx);
        const inserts = newDefs.map((d, i) => ({
          vendor_id: vendorId,
          table_slug: generateTableSlug(),
          table_code: d.table_code,
          zone: d.zone,
          display_order: startIdx + i,
        }));

        const { error: insertError } = await supabase.from('vendor_tables').insert(inserts);
        if (insertError) throw insertError;
        return { config, created: inserts.length };
      }

      const inserts = definitions.map((d, i) => ({
        vendor_id: vendorId,
        table_slug: generateTableSlug(),
        table_code: d.table_code,
        zone: d.zone,
        display_order: i,
      }));

      const { error: insertError } = await supabase.from('vendor_tables').insert(inserts);
      if (insertError) throw insertError;
      return { config, created: inserts.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-tables', vendorId] });
      toast({
        title: 'Tables saved',
        description: result.created > 0 ? `${result.created} table(s) created.` : 'Table config updated.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to save table configuration',
        variant: 'destructive',
      });
    },
  });

  /** Update layout when tables are dragged between zones. Recalculates table_code. */
  const updateTableLayoutMutation = useMutation({
    mutationFn: async (updates: Array<{ id: string; zone: ZoneKey; display_order: number; table_code: string }>) => {
      for (const u of updates) {
        const { error } = await supabase
          .from('vendor_tables')
          .update({ zone: u.zone, display_order: u.display_order, table_code: u.table_code })
          .eq('id', u.id)
          .eq('vendor_id', vendorId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-tables', vendorId] });
      toast({ title: 'Layout saved', description: 'Table positions updated.' });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to update layout',
        variant: 'destructive',
      });
    },
  });

  /** Recompute table_code for each table from zone + index, then persist */
  const saveLayout = async (tablesByZone: Record<ZoneKey, VendorTable[]>) => {
    const updates: Array<{ id: string; zone: ZoneKey; display_order: number; table_code: string }> = [];
    const zones: ZoneKey[] = ['north', 'south', 'east', 'west'];
    let globalOrder = 0;
    for (const z of zones) {
      const zoneTables = tablesByZone[z] || [];
      zoneTables.forEach((t, i) => {
        const prefix = ZONE_PREFIX[z];
        const tableCode = `${prefix}-T${i + 1}`;
        updates.push({
          id: t.id,
          zone: z,
          display_order: globalOrder++,
          table_code: tableCode,
        });
      });
    }
    await updateTableLayoutMutation.mutateAsync(updates);
  };

  return {
    tables,
    tableConfig,
    vendorId,
    isLoading,
    saveTableConfig: saveTableConfigMutation.mutateAsync,
    isSaving: saveTableConfigMutation.isPending,
    saveLayout,
    isSavingLayout: updateTableLayoutMutation.isPending,
  };
}
