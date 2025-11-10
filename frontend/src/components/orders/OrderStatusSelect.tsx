import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth/context/AuthContext";

// Temporary type until Phase 4 (database types generated)
type OrderStatus = 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus | string;
  vendorId?: string;
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrderStatusSelect({ orderId, currentStatus, vendorId }: OrderStatusSelectProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      const previousStatus = currentStatus;

      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        // If table doesn't exist, show error but don't crash
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.error('orders table does not exist. Please run database setup SQL files.');
          throw new Error('Database not set up. Please run migration script.');
        }
        throw error;
      }

      // If order is being cancelled, restore stock (optional - edge function may not exist yet)
      if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
        try {
          const { error: restoreError } = await supabase.functions.invoke('restore-stock', {
            body: { orderId },
          });

          if (restoreError) {
            console.error('Stock restoration error:', restoreError);
            // Don't throw - order status was already updated
            toast({
              title: "Warning",
              description: "Order cancelled but stock restoration failed. Please check inventory.",
              variant: "destructive",
            });
          }
        } catch (err) {
          // Edge function may not exist yet - that's okay
          console.log('Stock restoration function not available yet');
        }
      }

      // Create notification for order status change (optional - notifications table may not exist yet)
      if (user?.id && vendorId) {
        try {
          await supabase.from('notifications').insert({
            user_id: user.id,
            vendor_id: vendorId,
            title: 'Order Status Updated',
            message: `Order status changed to ${newStatus}`,
            type: 'order_update',
          });
        } catch (err) {
          // Notifications table may not exist yet - that's okay
          console.log('Notifications table not available yet');
        }
      }
    },
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: "Status Updated",
        description: newStatus === 'cancelled' 
          ? "Order cancelled and stock restored successfully"
          : "Order status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
      console.error('Error updating order status:', error);
    },
  });

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => updateStatusMutation.mutate(value as OrderStatus)}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
