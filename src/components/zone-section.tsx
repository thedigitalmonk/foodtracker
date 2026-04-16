"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Item } from "@/lib/types";
import { ItemCard } from "./item-card";
import { SortableItemCard } from "./sortable-item-card";

interface ZoneSectionProps {
  zone: string;
  items: Item[];
  onDelete: (id: string) => void;
  onDecrement: (id: string) => void;
  onEdit: (item: Item) => void;
}

function loadOrder(zone: string): string[] | null {
  try {
    const stored = localStorage.getItem(`zone-order-${zone}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveOrder(zone: string, ids: string[]) {
  try {
    localStorage.setItem(`zone-order-${zone}`, JSON.stringify(ids));
  } catch {}
}

export function ZoneSection({ zone, items, onDelete, onDecrement, onEdit }: ZoneSectionProps) {
  const [orderedIds, setOrderedIds] = useState<string[]>(() => {
    const stored = loadOrder(zone);
    if (!stored) return items.map((i) => i.id);
    const storedSet = new Set(stored);
    const newIds = items.filter((i) => !storedSet.has(i.id)).map((i) => i.id);
    return [...stored, ...newIds];
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const sortedItems = useMemo(() => {
    const itemMap = new Map(items.map((i) => [i.id, i]));
    const ordered = orderedIds
      .filter((id) => itemMap.has(id))
      .map((id) => itemMap.get(id)!);
    const newItems = items.filter((i) => !orderedIds.includes(i.id));
    return [...ordered, ...newItems];
  }, [items, orderedIds]);

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = sortedItems.findIndex((i) => i.id === active.id);
    const newIndex = sortedItems.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(sortedItems, oldIndex, newIndex);
    const newIds = reordered.map((i) => i.id);

    setOrderedIds(newIds);
    saveOrder(zone, newIds);
  };

  if (items.length === 0) {
    return (
      <div className="px-4 py-10 flex items-center justify-center text-[13px] text-[#a3a3a3]">
        No items
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedItems.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="divide-y divide-[#e5e5e5]">
          {sortedItems.map((item) => (
            <SortableItemCard
              key={item.id}
              item={item}
              onDelete={onDelete}
              onDecrement={onDecrement}
              onEdit={onEdit}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeItem && (
          <div className="shadow-xl opacity-95">
            <ItemCard
              item={activeItem}
              onDelete={onDelete}
              onDecrement={onDecrement}
              onEdit={onEdit}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
