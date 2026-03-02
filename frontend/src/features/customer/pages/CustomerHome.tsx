/**
 * Customer Home – mobile-first discovery and ordering hub.
 * Browse shops, recent orders, quick access to food categories.
 */

import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Logo from '@/features/common/components/Logo';
import {
  ChevronRight,
  Store,
  MapPin,
  Clock,
  ShoppingBag,
} from 'lucide-react';

const CATEGORY_IMAGES = {
  quickBites: '/images/categories/quick-bites.png',
  fineDining: '/images/categories/fine-dining.png',
};

export default function CustomerHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={ROUTES.CUSTOMER_HOME}>
                <Logo size="md" />
              </Link>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user ? `Hi, ${user.full_name?.split(' ')[0] || 'there'}` : 'Discover'}
                </p>
                <p className="text-xs text-gray-500">Order from local stores</p>
              </div>
            </div>
            <Link
              to={ROUTES.CUSTOMER_AUTH}
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              {user ? 'Profile' : 'Sign in'}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        {/* Location / Search - placeholder for future location picker */}
        <button
          onClick={() => navigate(ROUTES.SHOPS)}
          className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 mb-6 text-left hover:border-orange-200 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500">Delivery location</p>
            <p className="font-medium text-gray-900 truncate">
              Search for area, street name...
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>

        {/* Quick categories */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">What are you craving?</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate(`${ROUTES.SHOPS}?category=quick-bites`)}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all text-left"
            >
              <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center overflow-hidden">
                <img
                  src={CATEGORY_IMAGES.quickBites}
                  alt="Quick Bites"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Quick Bites</p>
                <p className="text-xs text-gray-500">Snacks, cafe, fast food</p>
              </div>
            </button>
            <button
              onClick={() => navigate(`${ROUTES.SHOPS}?category=fine-dining`)}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all text-left"
            >
              <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center overflow-hidden">
                <img
                  src={CATEGORY_IMAGES.fineDining}
                  alt="Fine Dining"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Fine Dining</p>
                <p className="text-xs text-gray-500">Restaurants & more</p>
              </div>
            </button>
          </div>
        </section>

        {/* Browse all shops */}
        <section className="mb-8">
          <Link
            to={ROUTES.SHOPS}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Store className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Browse all shops</p>
                <p className="text-sm text-gray-500">Discover nearby stores</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </section>

        {/* For signed-in: recent orders placeholder */}
        {user && (
          <section>
            <Link
              to={ROUTES.CUSTOMER_PROFILE}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">My orders</p>
                  <p className="text-sm text-gray-500">Track and reorder</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </section>
        )}

        {/* Distinct options to leave app - For Business, Back to main site */}
        <section className="mt-8 space-y-3">
          <Link
            to={ROUTES.BUSINESS}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-200 transition-colors"
          >
            <span className="font-medium text-gray-900">For Business</span>
            <span className="text-sm text-gray-500">Add your shop</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <Link
            to={ROUTES.HOME}
            className="block text-center text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            Back to main site
          </Link>
        </section>
      </main>

      {/* Floating cart button - when items in cart */}
      {cartCount > 0 && (
        <button
          onClick={() => navigate(ROUTES.SHOPS)}
          className="fixed bottom-24 right-4 z-30 flex items-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="font-semibold">{cartCount} items</span>
        </button>
      )}
    </div>
  );
}
