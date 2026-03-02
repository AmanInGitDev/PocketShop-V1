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
  User,
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="px-4 sm:px-6 py-4 sm:py-3 max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <Link to={ROUTES.CUSTOMER_HOME} className="shrink-0">
              <Logo size="md" variant="light" />
            </Link>
            <Link
              to={user ? ROUTES.CUSTOMER_PROFILE : ROUTES.CUSTOMER_AUTH}
              className="shrink-0 w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label={user ? 'Open profile' : 'Sign in'}
            >
              <User className="w-5 h-5 text-gray-700 dark:text-slate-200" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto w-full">
        {/* Quick categories */}
        <section className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-5 tracking-tight">
            What are you craving?
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <button
              onClick={() => navigate(`${ROUTES.SHOPS}?category=quick-bites`)}
              className="flex items-center gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900/60 transition-all text-left"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center overflow-hidden">
                <img
                  src={CATEGORY_IMAGES.quickBites}
                  alt="Quick Bites"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 leading-tight">Quick Bites</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">Snacks, cafe, fast food</p>
              </div>
            </button>
            <button
              onClick={() => navigate(`${ROUTES.SHOPS}?category=fine-dining`)}
              className="flex items-center gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900/60 transition-all text-left"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center overflow-hidden">
                <img
                  src={CATEGORY_IMAGES.fineDining}
                  alt="Fine Dining"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 leading-tight">Fine Dining</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">Restaurants & more</p>
              </div>
            </button>
          </div>
        </section>

        {/* Location / Search - optional (pickup) */}
        <button
          onClick={() => navigate(ROUTES.SHOPS)}
          className="w-full flex items-center gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 mb-10 text-left hover:border-orange-200 dark:hover:border-orange-900/60 transition-colors"
        >
          <div className="w-11 h-11 shrink-0 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-0.5">
              Choose location
            </p>
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-slate-100 truncate">
              Search for area, street name...
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0" />
        </button>

        {/* Browse all shops */}
        <section className="mb-8 sm:mb-10">
          <Link
            to={ROUTES.SHOPS}
            className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-900/60 transition-colors"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-11 h-11 shrink-0 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Store className="w-5 h-5 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100">Browse all shops</p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Discover nearby stores</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0" />
          </Link>
        </section>

        {/* For signed-in: recent orders placeholder */}
        {user && (
          <section className="mb-8 sm:mb-10">
            <Link
              to={ROUTES.CUSTOMER_PROFILE}
              className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-900/60 transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-11 h-11 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/25 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100">My orders</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Track and reorder</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0" />
            </Link>
          </section>
        )}

        {/* Distinct options - For Business, Back to main site */}
        <section className="mt-10 sm:mt-12 space-y-4">
          <Link
            to={ROUTES.BUSINESS}
            className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-900/60 transition-colors"
          >
            <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100">For Business</span>
            <span className="text-sm text-gray-500 dark:text-slate-400">Add your shop</span>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0" />
          </Link>
          <Link
            to={ROUTES.HOME}
            className="block text-center text-sm sm:text-base text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 py-4"
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
