/**
 * Kitchen Display Page
 * Migrated from Migration_Data/backup-after-f94dab5
 * Live order tickets & production summary for the kitchen.
 */

import React from 'react';
import { KitchenDisplay } from '@/components/orders/KitchenDisplay';

const Kitchen: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Kitchen Display
        </h2>
        <p className="text-muted-foreground mt-1">
          Live order tickets & production summary for the kitchen
        </p>
      </div>
      <KitchenDisplay />
    </div>
  );
};

export default Kitchen;
