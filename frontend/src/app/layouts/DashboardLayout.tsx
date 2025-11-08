/**
 * Dashboard Layout Component
 * 
 * Main layout wrapper with sidebar navigation for vendor dashboard.
 * Provides responsive sidebar with dynamic route handling.
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  BarChart3, 
  DollarSign, 
  Settings, 
  Menu,
  X,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { 
  preloadInsights, 
  preloadInsightsOnIdle,
  preloadOrders, 
  preloadInventory, 
  preloadPayouts, 
  preloadSettings 
} from '@/utils/preloaders';
import TopNavbar from '@/components/common/TopNavbar';
import logoImage from '@/assets/images/logo.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: ROUTES.VENDOR_DASHBOARD_OVERVIEW,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingBag className="w-5 h-5" />,
      path: ROUTES.VENDOR_DASHBOARD_ORDERS,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package className="w-5 h-5" />,
      path: ROUTES.VENDOR_DASHBOARD_INVENTORY,
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: <BarChart3 className="w-5 h-5" />,
      path: ROUTES.VENDOR_DASHBOARD_INSIGHTS,
    },
    {
      id: 'payouts',
      label: 'Payouts',
      icon: <DollarSign className="w-5 h-5" />,
      path: ROUTES.VENDOR_DASHBOARD_PAYOUTS,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      path: ROUTES.VENDOR_DASHBOARD_SETTINGS,
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Preload route on hover for faster navigation
  // Uses immediate preload for lightweight routes, idle preload for heavy ones
  const handleNavItemHover = (path: string) => {
    if (path === ROUTES.VENDOR_DASHBOARD_INSIGHTS) {
      // Heavy chunk - use immediate preload on hover (user likely to click)
      preloadInsights().catch(console.error);
    } else if (path === ROUTES.VENDOR_DASHBOARD_ORDERS) {
      preloadOrders().catch(console.error);
    } else if (path === ROUTES.VENDOR_DASHBOARD_INVENTORY) {
      preloadInventory().catch(console.error);
    } else if (path === ROUTES.VENDOR_DASHBOARD_PAYOUTS) {
      preloadPayouts().catch(console.error);
    } else if (path === ROUTES.VENDOR_DASHBOARD_SETTINGS) {
      preloadSettings().catch(console.error);
    }
  };
  
  // Preload insights on idle for users already in dashboard (background prefetch)
  useEffect(() => {
    // Only preload insights on idle if user is on dashboard (not already on insights)
    if (location.pathname.startsWith(ROUTES.VENDOR_DASHBOARD) && !location.pathname.includes(ROUTES.VENDOR_DASHBOARD_INSIGHTS)) {
      preloadInsightsOnIdle();
    }
  }, [location.pathname]);

  const isActiveRoute = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar - Persistent header */}
      <TopNavbar 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
      />

      <div className="flex">
        {/* Sidebar - Logo + Navigation */}
        <aside
          className={`
            fixed top-0 left-0 bottom-0 z-40
            lg:z-30
            w-64 bg-white border-r border-gray-200
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            overflow-y-auto
            lg:overflow-y-auto
          `}
        >
          {/* Logo Section */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="PocketShop" className="w-10 h-10 object-contain" />
              <div>
                <div className="text-gray-900 text-base font-semibold">PocketShop</div>
                <div className="text-gray-500 text-xs">Vendor Portal</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-4 py-5">
            <nav className="space-y-1 text-sm">
              {navItems.map((item) => {
                const isActive = isActiveRoute(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    onMouseEnter={() => handleNavItemHover(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2
                      rounded-md transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pt-16 lg:pl-64 bg-gray-50 min-h-screen">
          {/* Consistent padding wrapper for all pages */}
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
