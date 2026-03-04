/**
 * Pickup Monitor - Public wall display for ready orders
 * Migrated from Migration_Data/backup-after-f94dab5
 * Customers collect their order when their number appears.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock } from 'lucide-react';

interface ReadyOrder {
  id: string;
  order_number: string;
  customer_name: string | null;
  total_amount: number;
  updated_at: string;
}

/** Extract short pickup code (e.g. "S4UZ1GC8") for large display */
function getPickupCode(orderNumber: string, fallback: string): string {
  if (!orderNumber) return fallback.slice(-8).toUpperCase();
  const parts = orderNumber.split('-');
  return parts[parts.length - 1] || orderNumber.slice(-8).toUpperCase();
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

  const isHeroMode = readyOrders.length >= 1 && readyOrders.length <= 2;

  return (
    <div className="min-h-screen text-white flex flex-col overflow-hidden">
      {/* Background: deep base + soft radial glow behind content */}
      <div className="fixed inset-0 bg-slate-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_40%,rgba(16,185,129,0.08)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_100%_80%_at_70%_60%,rgba(5,150,105,0.04)_0%,transparent_50%)]" />

      <header className="relative z-10 border-b border-emerald-500/20 px-6 md:px-10 py-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/30">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Pickup Monitor</h1>
            <p className="text-sm text-slate-400 mt-0.5">Collect your order when your number appears</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl md:text-3xl font-mono font-bold text-emerald-400 tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-800/80 flex items-center justify-center border border-slate-700/50">
            <Clock className="h-6 w-6 text-emerald-400/80" />
          </div>
        </div>
      </header>

      <div className="relative z-10 px-6 md:px-10 py-3 border-b border-emerald-500/10 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
          <span className="text-base md:text-lg font-semibold text-emerald-400">
            {readyOrders.length} order{readyOrders.length !== 1 ? 's' : ''} ready for pickup
          </span>
        </div>
      </div>

      <main
        className={`relative z-10 flex-1 p-6 md:p-12 flex ${
          isLoading || readyOrders.length === 0
            ? 'items-center justify-center'
            : readyOrders.length === 1
              ? 'items-start justify-start md:pl-16 md:pt-16'
              : isHeroMode
                ? 'items-start justify-start md:pl-12 md:pt-12'
                : 'items-start justify-center'
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-14 w-14 border-2 border-emerald-500/30 border-t-emerald-400" />
            <p className="text-slate-500">Loading orders…</p>
          </div>
        ) : readyOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 text-slate-500">
            <div className="rounded-3xl bg-slate-800/50 p-8 border border-slate-700/50">
              <Package className="h-24 w-24 mx-auto text-emerald-500/30" />
            </div>
            <div className="text-center max-w-md">
              <p className="text-3xl md:text-4xl font-bold text-slate-400 mb-2">No orders ready</p>
              <p className="text-lg text-slate-600">Orders will appear here when ready for pickup</p>
            </div>
          </div>
        ) : (
          <div
            className={
              isHeroMode
                ? 'grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-4xl'
                : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full max-w-7xl'
            }
          >
            <AnimatePresence mode="popLayout">
              {readyOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 rounded-3xl bg-emerald-500/10 blur-2xl" />
                  <div
                    className={`relative bg-slate-900/90 border-2 border-emerald-500/50 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 shadow-2xl backdrop-blur-sm overflow-hidden ${
                      isHeroMode ? 'min-h-[240px] md:min-h-[280px]' : 'min-h-[200px]'
                    }`}
                  >
                    <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-400/20" />
                    <div
                      className={`font-black font-mono text-emerald-400 leading-none tracking-tight ${
                        isHeroMode ? 'text-5xl md:text-7xl' : 'text-4xl md:text-5xl'
                      }`}
                    >
                      {getPickupCode(order.order_number, order.id)}
                    </div>
                    {order.order_number && order.order_number.includes('-') && (
                      <p className="text-xs text-slate-500 font-mono">{order.order_number}</p>
                    )}
                    {order.customer_name && (
                      <p className="text-base font-semibold text-slate-300 truncate max-w-full">
                        {order.customer_name}
                      </p>
                    )}
                    <div className="mt-1 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-sm font-bold tracking-widest uppercase">
                      Ready ✓
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-slate-800 px-6 md:px-10 py-4 bg-slate-900/60 text-center">
        <p className="text-sm text-slate-500">
          Please collect your order from the counter · Updates automatically
        </p>
      </footer>
    </div>
  );
}
