/**
 * DraggableMetricCards - Reorderable dashboard metric cards
 * Vendors can drag to arrange cards (Total Revenue, Orders, Avg Value, Stock Status)
 * Order is persisted per vendor in localStorage.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const CARD_KEYS = ['revenue', 'orders', 'avg-value', 'stock'] as const;
type CardKey = (typeof CARD_KEYS)[number];

const STORAGE_KEY = 'vendor-dashboard-metric-cards-order';

function loadOrder(vendorId?: string): CardKey[] {
  try {
    const key = vendorId ? `${STORAGE_KEY}-${vendorId}` : STORAGE_KEY;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      const valid = parsed.filter((k) => CARD_KEYS.includes(k as CardKey));
      if (valid.length === CARD_KEYS.length) return valid as CardKey[];
    }
  } catch {
    // ignore
  }
  return [...CARD_KEYS];
}

function saveOrder(vendorId: string | undefined, order: CardKey[]) {
  try {
    const key = vendorId ? `${STORAGE_KEY}-${vendorId}` : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(order));
  } catch {
    // ignore
  }
}

interface SortableCardWrapperProps {
  id: string;
  children: React.ReactNode;
}

function SortableCardWrapper({ id, children }: SortableCardWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/card h-full min-h-[180px]">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-md cursor-grab active:cursor-grabbing opacity-0 group-hover/card:opacity-100 transition-opacity bg-background/80 hover:bg-muted border border-border"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}

interface DraggableMetricCardsProps {
  vendorId?: string;
  children: React.ReactNode;
}

export function DraggableMetricCards({ vendorId, children }: DraggableMetricCardsProps) {
  const childArray = React.Children.toArray(children);
  const [order, setOrder] = useState<CardKey[]>(() => loadOrder(vendorId));

  useEffect(() => {
    setOrder(loadOrder(vendorId));
  }, [vendorId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setOrder((prev) => {
        const oldIndex = prev.indexOf(active.id as CardKey);
        const newIndex = prev.indexOf(over.id as CardKey);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const next = arrayMove(prev, oldIndex, newIndex);
        saveOrder(vendorId, next);
        return next;
      });
    },
    [vendorId]
  );

  if (childArray.length !== 4) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {childArray}
      </div>
    );
  }

  const cardMap: Record<CardKey, number> = {
    revenue: 0,
    orders: 1,
    'avg-value': 2,
    stock: 3,
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {order.map((key) => (
            <SortableCardWrapper key={key} id={key}>
              {childArray[cardMap[key]]}
            </SortableCardWrapper>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
