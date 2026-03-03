/**
 * Order tracking – mobile-first order status view.
 * Safe area and touch-target friendly for PWA / web app.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ChevronLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
      {/* Header - mobile optimized */}
      <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm pt-[env(safe-area-inset-top,0px)]">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-3 -ml-3 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 touch-target"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-slate-300" />
          </button>
          <h1 className="flex-1 text-lg font-semibold text-gray-900 dark:text-slate-100">Order tracking</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
              <Package className="h-6 w-6" />
              Order tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Order ID: <code className="text-sm bg-muted dark:bg-slate-800 px-1.5 py-0.5 rounded">{orderId ?? '—'}</code>
            </p>
            <p className="text-sm text-muted-foreground">
              Order details will appear here once the full flow is complete.
            </p>
            <Button
              onClick={() => navigate(ROUTES.CUSTOMER_HOME)}
              className="w-full h-12 touch-target"
            >
              Back to home
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
