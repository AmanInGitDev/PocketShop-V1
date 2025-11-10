import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useOrderMessages = (orderId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['order-messages', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        // If table doesn't exist, return empty array instead of throwing
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.error('order_messages table does not exist. Please run database setup SQL files.');
          return [];
        }
        throw error;
      }
      return data || [];
    },
    enabled: !!orderId,
    retry: false, // Don't retry on error
  });

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`,
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, query]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, senderName, senderType = 'vendor' }: { message: string; senderName: string; senderType?: 'vendor' | 'customer' }) => {
      const { data, error } = await supabase
        .from('order_messages')
        .insert({
          order_id: orderId,
          sender_type: senderType,
          sender_name: senderName,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-messages', orderId] });
      toast({
        title: 'Message sent',
        description: 'Your message has been sent to the customer',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      console.error('Error sending message:', error);
    },
  });

  return {
    messages: query.data,
    isLoading: query.isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
};

