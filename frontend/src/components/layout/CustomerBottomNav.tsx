import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export function CustomerBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = useCart();
  const cartItemCount = getTotalItems();

  // Don't show on checkout, order confirmation, or auth pages
  if (
    location.pathname.includes('/checkout') ||
    location.pathname.includes('/order-confirmation') ||
    location.pathname.includes('/order-feedback') ||
    location.pathname.includes('/customer-auth') ||
    location.pathname.includes('/payment-')
  ) {
    return null;
  }

  // On storefront pages, handle cart click to show cart/checkout
  const handleCartClick = () => {
    if (location.pathname.includes('/storefront/')) {
      // Scroll to top where cart button is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Trigger custom event that PublicStorefront can listen to
      window.dispatchEvent(new CustomEvent('showCart'));
    } else {
      // Navigate back to storefront if we have vendorId
      const vendorId = new URLSearchParams(location.search).get('vendorId');
      if (vendorId) {
        navigate(`/storefront/${vendorId}`);
      } else {
        navigate('/customer-home');
      }
    }
  };

  const isActive = (path: string) => {
    if (path === '/storefront') {
      return location.pathname.includes('/storefront/');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/customer-home',
      onClick: () => navigate('/customer-home'),
    },
    {
      icon: ShoppingBag,
      label: 'Orders',
      path: '/customer-profile',
      onClick: () => navigate('/customer-profile'),
    },
    {
      icon: ShoppingCart,
      label: 'Cart',
      path: '/storefront',
      badge: cartItemCount > 0 ? cartItemCount : undefined,
      onClick: handleCartClick,
    },
    {
      icon: User,
      label: 'Profile',
      path: '/customer-profile',
      onClick: () => navigate('/customer-profile'),
    },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-swiggy-lg z-40 md:hidden"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <motion.button
              key={item.label}
              onClick={item.onClick}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-1 flex-1 relative h-full"
            >
              <div className="relative">
                <Icon
                  className={`h-6 w-6 transition-colors ${
                    active ? 'text-[#fc8019]' : 'text-gray-400'
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </motion.div>
                )}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  active ? 'text-[#fc8019]' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-[#fc8019] rounded-b-full"
                  initial={false}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}

