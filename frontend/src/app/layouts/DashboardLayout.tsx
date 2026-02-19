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
  CreditCard, 
  Settings, 
  Store,
  ChefHat,
  Tv2,
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
  description: string;
  icon: React.ReactNode;
  path: string;
  openInNewTab?: boolean;
}

const coreItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', description: 'Overview & insights', icon: <LayoutDashboard className="w-5 h-5" />, path: ROUTES.VENDOR_DASHBOARD_OVERVIEW },
  { id: 'orders', label: 'Orders', description: 'Manage orders', icon: <ShoppingBag className="w-5 h-5" />, path: ROUTES.VENDOR_DASHBOARD_ORDERS },
  { id: 'inventory', label: 'Inventory', description: 'Products & stock', icon: <Package className="w-5 h-5" />, path: ROUTES.VENDOR_DASHBOARD_INVENTORY },
  { id: 'kitchen', label: 'Kitchen', description: 'Kitchen display', icon: <ChefHat className="w-5 h-5" />, path: ROUTES.VENDOR_DASHBOARD_KITCHEN },
  { id: 'pickup-monitor', label: 'Pickup Screen', description: 'Wall display for customers', icon: <Tv2 className="w-5 h-5" />, path: ROUTES.PICKUP_MONITOR, openInNewTab: true },
];

const businessItems: NavItem[] = [
  { id: 'analytics', label: 'Analytics', description: 'Reports & metrics', icon: <BarChart3 className="w-5 h-5" />, path: ROUTES.VENDOR_DASHBOARD_INSIGHTS },
  { id: 'storefront', label: 'Storefront', description: 'Your store view', icon: <Store className="w-5 h-5" />, path: ROUTES.VENDOR_DASHBOARD_STOREFRONT },
  { id: 'payments', label: 'Payments', description: 'Payment tracking', icon: <CreditCard className="w-5 h-5" />, path: ROUTES.VENDOR_DASHBOARD_PAYOUTS },
];

const settingsItems: NavItem[] = [
  { id: 'settings', label: 'Settings', description: 'Preferences & config', icon: <Settings className="w-5 h-5" />, path: ROUTES.VENDOR_DASHBOARD_SETTINGS },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string, openInNewTab?: boolean) => {
    if (openInNewTab) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(path);
    }
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
    <div className="min-h-screen bg-background">
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
            w-64 bg-card border-r border-border
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            overflow-y-auto
            lg:overflow-y-auto
          `}
        >
          {/* Logo Section */}
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="PocketShop" className="w-10 h-10 object-contain" />
              <div>
                <div className="text-foreground text-base font-semibold">PocketShop</div>
                <div className="text-muted-foreground text-xs">Vendor Portal</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-4 py-5">
            <nav className="space-y-6 text-sm">
              {/* CORE */}
              <div>
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Core</p>
                <div className="space-y-1">
                  {coreItems.map((item) => {
                    const isActive = isActiveRoute(item.path);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.path, item.openInNewTab)}
                        onMouseEnter={() => handleNavItemHover(item.path)}
                        className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${isActive ? 'bg-primary/10 text-primary font-semibold border-l-4 border-l-primary -ml-px pl-[11px]' : 'text-foreground hover:bg-muted hover:text-foreground'}`}
                      >
                        {item.icon}
                        <div className="flex flex-col items-start text-left min-w-0 flex-1">
                          <span>{item.label}</span>
                          <span className={`text-xs truncate w-full ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{item.description}</span>
                        </div>
                        {isActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* BUSINESS */}
              <div>
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Business</p>
                <div className="space-y-1">
                  {businessItems.map((item) => {
                    const isActive = isActiveRoute(item.path);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.path, item.openInNewTab)}
                        onMouseEnter={() => handleNavItemHover(item.path)}
                        className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${isActive ? 'bg-primary/10 text-primary font-semibold border-l-4 border-l-primary -ml-px pl-[11px]' : 'text-foreground hover:bg-muted hover:text-foreground'}`}
                      >
                        {item.icon}
                        <div className="flex flex-col items-start text-left min-w-0 flex-1">
                          <span>{item.label}</span>
                          <span className={`text-xs truncate w-full ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{item.description}</span>
                        </div>
                        {isActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* SETTINGS */}
              <div>
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</p>
                <div className="space-y-1">
                  {settingsItems.map((item) => {
                    const isActive = isActiveRoute(item.path);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.path, item.openInNewTab)}
                        onMouseEnter={() => handleNavItemHover(item.path)}
                        className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${isActive ? 'bg-primary/10 text-primary font-semibold border-l-4 border-l-primary -ml-px pl-[11px]' : 'text-foreground hover:bg-muted hover:text-foreground'}`}
                      >
                        {item.icon}
                        <div className="flex flex-col items-start text-left min-w-0 flex-1">
                          <span>{item.label}</span>
                          <span className={`text-xs truncate w-full ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{item.description}</span>
                        </div>
                        {isActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
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
        <main className="flex-1 min-w-0 pt-16 lg:pl-64 bg-background min-h-screen">
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
