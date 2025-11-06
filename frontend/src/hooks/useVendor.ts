import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useVendor = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['vendor', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID');

      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If table doesn't exist, return null instead of throwing
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.error('vendor_profiles table does not exist. Please run database setup SQL files.');
          return null;
        }
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
    retry: false, // Don't retry on error
  });
};
