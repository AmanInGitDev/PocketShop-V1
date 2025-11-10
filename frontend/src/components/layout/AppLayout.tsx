import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useVendor } from "@/features/vendor/hooks/useVendor";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { signOut } = useAuth();
  const { data: vendor } = useVendor();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-background flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              {vendor && (
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{vendor.business_name}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <Button variant="ghost" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
