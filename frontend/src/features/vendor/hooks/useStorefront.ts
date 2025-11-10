import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useVendor } from './useVendor';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

export interface StorefrontSettings {
  primary_color?: string;
  secondary_color?: string;
  banner_text?: string;
  show_description?: boolean;
  layout_style?: 'grid' | 'list';
}

export const useStorefront = () => {
  const { data: vendor } = useVendor();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateQRCode = async (vendorId: string): Promise<string> => {
    const storefrontUrl = `${window.location.origin}/storefront/${vendorId}`;
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(storefrontUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const updateQRCodeMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      const qrCodeDataUrl = await generateQRCode(vendorId);
      
      const { data, error } = await supabase
        .from('vendor_profiles')
        .update({ qr_code_url: qrCodeDataUrl })
        .eq('id', vendorId)
        .select()
        .single();

      if (error) throw error;
      return { ...data, qr_code_url: qrCodeDataUrl };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast({
        title: 'QR Code generated',
        description: 'Your QR code has been updated successfully',
      });
      return data?.qr_code_url;
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      });
      console.error('Error updating QR code:', error);
    },
  });

  const updateStorefrontMutation = useMutation({
    mutationFn: async (updates: Partial<typeof vendor>) => {
      if (!vendor?.id) throw new Error('No vendor ID');

      const { data, error } = await supabase
        .from('vendor_profiles')
        .update(updates)
        .eq('id', vendor.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      toast({
        title: 'Storefront updated',
        description: 'Your storefront settings have been saved',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to update storefront',
        variant: 'destructive',
      });
      console.error('Error updating storefront:', error);
    },
  });

  return {
    vendor,
    generateQRCode,
    updateQRCode: updateQRCodeMutation.mutateAsync,
    isUpdatingQRCode: updateQRCodeMutation.isPending,
    updateStorefront: updateStorefrontMutation.mutate,
    isUpdatingStorefront: updateStorefrontMutation.isPending,
  };
};

