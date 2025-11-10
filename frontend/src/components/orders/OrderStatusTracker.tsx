import { Check, Clock, ChefHat, Package, CheckCircle } from 'lucide-react';

interface OrderStatusTrackerProps {
  currentStatus: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Package },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
];

const statusOrder = ['pending', 'processing', 'ready', 'completed'];

export function OrderStatusTracker({ currentStatus }: OrderStatusTrackerProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className="w-full">
      {isCancelled ? (
        <div className="text-center p-6 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-destructive font-semibold text-lg">Order Cancelled</p>
          <p className="text-sm text-muted-foreground mt-2">
            This order has been cancelled. Please contact the vendor for details.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{
                width: `${(currentIndex / (statusSteps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Status Steps */}
          <div className="relative flex justify-between">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentIndex;
              const isCurrent = step.key === currentStatus;

              return (
                <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`
                      relative z-10 w-16 h-16 rounded-full flex items-center justify-center
                      transition-all duration-300 ease-in-out
                      ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                          : 'bg-muted text-muted-foreground'
                      }
                      ${isCurrent ? 'ring-4 ring-primary/30 animate-pulse' : ''}
                    `}
                  >
                    {isActive && index < currentIndex ? (
                      <Check className="h-8 w-8" />
                    ) : (
                      <Icon className="h-8 w-8" />
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={`
                        text-sm font-medium transition-colors duration-300
                        ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                      `}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-primary font-semibold mt-1">Current</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
