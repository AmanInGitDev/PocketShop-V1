import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useVendor } from './useVendor';
import { getVendorId } from '@/features/common/utils/storage';

export const useProductMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: vendor } = useVendor();

  const createProduct = useMutation({
    mutationFn: async (productData: {
      name: string;
      description?: string;
      price: number;
      stock_quantity: number;
      low_stock_threshold?: number;
      category?: string;
      image_url?: string;
      is_available: boolean;
    }) => {
      let vendorId = vendor?.id;
      if (!vendorId) {
        vendorId = await getVendorId();
      }
      if (!vendorId) throw new Error('No vendor ID');

      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, vendor_id: vendorId }])
        .select()
        .single();

      if (error) throw error;
      return { product: data, vendorId };
    },
    onSuccess: async ({ product, vendorId }) => {
      // Optimistically update cache for immediate feedback
      queryClient.setQueryData<any[]>(['products', vendorId], (old) => {
        if (!old) return product ? [product] : [];
        // Avoid duplicates if cache already contains product
        if (product && !old.some((item) => item.id === product.id)) {
          return [product, ...old];
        }
        return old;
      });

      // Invalidate related queries to ensure data consistency across app
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === 'products',
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === 'public-products',
        }),
      ]).catch(console.error);

      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
    },
    onError: (error: any) => {
      const message =
        error?.code === '42P01'
          ? 'Products table not found in Supabase. Please run the database migrations.'
          : error?.message || 'Failed to create product';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      console.error('createProduct error:', error);
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({
      id,
      ...productData
    }: {
      id: string;
      name?: string;
      description?: string;
      price?: number;
      stock_quantity?: number;
      low_stock_threshold?: number;
      category?: string;
      image_url?: string;
      is_available?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product',
        variant: 'destructive',
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
    },
  });

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      if (!vendor?.id) throw new Error('No vendor ID');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${vendor.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    },
  });

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
  };
};

