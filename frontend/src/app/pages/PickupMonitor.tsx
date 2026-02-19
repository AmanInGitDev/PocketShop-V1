/**
 * Pickup Monitor - Public wall display for ready orders
 * Migrated from Migration_Data/backup-after-f94dab5
 * Customers collect their order when their number appears.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Tv2 } from 'lucide-react';

interface ReadyOrder {
  id: string;
  order_number: string;
  customer_name: string | null;
  total_amount: number;
  updated_at: string;
}

export default function PickupMonitor() {
  const [readyOrders, setReadyOrders] = useState<ReadyOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchReadyOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, total_amount, updated_at')
      .eq('status', 'ready')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setReadyOrders(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReadyOrders();

    const channel = supabase
      .channel('pickup-monitor')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
      }, () => {
        fetchReadyOrders();
      })
      .subscribe();

    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(clockInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 px-8 py-4 flex items-center justify-between bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pickup Monitor</h1>
            <p className="text-xs text-gray-400">Collect your order when your number appears</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-3xl font-mono font-bold text-green-400">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-xs text-gray-400">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-gray-800 flex items-center justify-center">
            <Tv2 className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </header>

      <div className="px-8 py-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse shadow-md shadow-green-400/50" />
          <span className="text-lg font-semibold text-green-400">
            {readyOrders.length} order{readyOrders.length !== 1 ? 's' : ''} ready for pickup
          </span>
        </div>
      </div>

      <main className="flex-1 p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-400" />
          </div>
        ) : readyOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-gray-600">
            <Package className="h-32 w-32 opacity-20" />
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">No orders ready</p>
              <p className="text-xl">Orders will appear here when ready for pickup</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            <AnimatePresence mode="popLayout">
              {readyOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.5, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -40 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="relative"
                >
                  <div className="absolute inset-0 rounded-2xl bg-green-400/20 blur-xl" />
                  <div className="relative bg-gray-900 border-2 border-green-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 shadow-2xl shadow-green-900/50 min-h-[180px]">
                    <div className="absolute top-3 right-3 h-3 w-3 rounded-full bg-green-400 animate-pulse" />
                    <div className="text-6xl font-black font-mono text-green-400 leading-none tracking-tighter">
                      {order.order_number || order.id.slice(0, 8)}
                    </div>
                    {order.customer_name && (
                      <div className="text-sm font-semibold text-gray-300 truncate w-full">
                        {order.customer_name}
                      </div>
                    )}
                    <div className="mt-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-bold tracking-widest uppercase">
                      Ready ✓
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 px-8 py-3 bg-gray-900 text-center">
        <p className="text-sm text-gray-500">
          Please collect your order from the counter · This display updates automatically
        </p>
      </footer>
    </div>
  );
}
