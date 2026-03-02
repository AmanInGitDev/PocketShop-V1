/**
 * Customer Profile – mobile-first profile, orders, and account.
 * Shows profile info, order history, sign out.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/constants/routes';
import Logo from '@/features/common/components/Logo';
import {
  User,
  Mail,
  Phone,
  LogOut,
  ChevronRight,
  Clock,
  Package,
  Loader2,
} from 'lucide-react';

interface OrderSummary {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  vendor?: { business_name: string };
}

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<{ name: string; email: string | null; mobile_number: string } | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from('customer_profiles')
        .select('name, email, mobile_number')
        .eq('user_id', session.user.id)
        .single();
      if (data) setProfile(data);
      else setProfile({
        name: user.full_name || 'Customer',
        email: user.email || null,
        mobile_number: '',
      });
    };
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setOrdersLoading(false);
      return;
    }
    const loadOrders = async () => {
      const { data: cp } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!cp?.id) {
        setOrdersLoading(false);
        return;
      }
      const { data } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          vendor_id
        `)
        .eq('customer_id', cp.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) {
        const vendorIds = [...new Set((data as any[]).map((o) => o.vendor_id))];
        const { data: vendors } = await supabase
          .from('vendor_profiles')
          .select('id, business_name')
          .in('id', vendorIds);
        const vMap = new Map((vendors || []).map((v) => [v.id, v]));
        setOrders(
          (data as any[]).map((o) => ({
            ...o,
            vendor: vMap.get(o.vendor_id),
          }))
        );
      }
      setOrdersLoading(false);
    };
    loadOrders();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.HOME);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to={ROUTES.CUSTOMER_HOME}>
            <Logo size="md" />
          </Link>
          <Link to={ROUTES.HOME} className="text-sm text-gray-500 hover:text-gray-700">
            Main site
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        {!user ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to continue</h2>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Create an account or sign in to track orders and manage your profile.
            </p>
            <Link
              to={ROUTES.CUSTOMER_AUTH}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600"
            >
              Sign in / Sign up
            </Link>
          </div>
        ) : (
          <>
            {/* Profile card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-600">
                    {(profile?.name || user.full_name || 'U')[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {profile?.name || user.full_name || 'Customer'}
                  </h2>
                  {profile?.email && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </p>
                  )}
                  {profile?.mobile_number && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {profile.mobile_number}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* My orders */}
            <section className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">My orders</h3>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600">No orders yet</p>
                  <Link
                    to={ROUTES.SHOPS}
                    className="inline-block mt-3 text-orange-600 font-medium"
                  >
                    Browse shops
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/order-tracking/${order.id}`}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-200"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.vendor?.business_name || 'Order'}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₹{order.total_amount} • {order.status}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </button>
          </>
        )}
      </main>
    </div>
  );
}
