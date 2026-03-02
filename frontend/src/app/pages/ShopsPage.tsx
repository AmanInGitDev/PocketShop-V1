/**
 * Shops Page – Browse online vendors for ordering.
 * Shown when user clicks Quick Bites or Fine Dining from the landing page.
 * Displays vendors as cards; clicking navigates to their storefront.
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/constants/routes';
import Logo from '@/features/common/components/Logo';
import { ArrowLeft, Store, MapPin } from 'lucide-react';

interface VendorProfile {
  id: string;
  business_name: string;
  business_type: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  address: string | null;
  city: string | null;
  is_active: boolean;
}

// Map category slug to business types/categories we consider matching
const CATEGORY_FILTERS: Record<string, string[]> = {
  'quick-bites': ['cafe', 'fast-food', 'bakery', 'chinese', 'indian', 'italian', 'desserts'],
  'fine-dining': ['restaurant', 'italian', 'indian'],
};

export default function ShopsPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'quick-bites';
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const title = category === 'fine-dining' ? 'Fine Dining' : 'Quick Bites';
  const subtitle = category === 'fine-dining'
    ? 'Discover restaurants near you'
    : 'Quick meals, snacks & more';

  useEffect(() => {
    async function fetchVendors() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('vendor_profiles')
          .select('id, business_name, business_type, description, logo_url, banner_url, address, city, is_active, metadata')
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching vendors:', error);
          setVendors([]);
          setLoading(false);
          return;
        }

        const profiles = (data || []) as (VendorProfile & { metadata?: { business_category?: string } })[];
        const filters = CATEGORY_FILTERS[category];
        const filtered = filters
          ? profiles.filter((v) => {
              const type = (v.business_type || '').toLowerCase();
              const cat = (v.metadata?.business_category || '').toLowerCase();
              return filters.some((f) => type.includes(f) || cat.includes(f));
            })
          : profiles;

        // If no matches from filter, show all food vendors or all vendors
        const foodTypes = ['restaurant', 'cafe', 'bakery', 'fast-food', 'chinese', 'indian', 'italian', 'desserts'];
        const foodVendors = profiles.filter((v) => {
          const t = (v.business_type || '').toLowerCase();
          return foodTypes.some((f) => t.includes(f));
        });
        const final = filtered.length > 0 ? filtered : (foodVendors.length > 0 ? foodVendors : profiles);

        setVendors(final);
      } catch (err) {
        console.error(err);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVendors();
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <Link to={ROUTES.HOME}>
              <Logo size="md" variant="light" />
            </Link>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
        <p className="text-gray-600 mb-8">{subtitle}</p>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No shops yet</h2>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Be the first to add your business. Create your virtual storefront and start receiving orders.
            </p>
            <Link
              to={ROUTES.BUSINESS}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
            >
              <Store className="w-5 h-5" />
              Add your shop
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                to={`/storefront/${vendor.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-purple-200 transition-all"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {vendor.logo_url ? (
                      <img
                        src={vendor.logo_url}
                        alt={vendor.business_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{vendor.business_name}</h3>
                    {vendor.business_type && (
                      <p className="text-sm text-gray-500 capitalize">{vendor.business_type.replace(/-/g, ' ')}</p>
                    )}
                    {vendor.address && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {vendor.address}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
