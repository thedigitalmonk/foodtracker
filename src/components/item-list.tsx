// src/components/item-list.tsx
"use client";

import { Assignment, Category, Item } from "@/lib/types";
import { CategorySection } from "./category-section";
import { ZoneSection } from "./zone-section";

interface ItemListProps {
  items: Item[];
  activeZone: "Fridge" | "Freezer" | "Pantry";
  onDelete: (id: string) => void;
  onDecrement: (id: string) => void;
  onEdit: (item: Item) => void;
  categoryView: boolean;
  categories: Category[];
  assignments: Assignment[];
  onAssign: (itemId: string, categoryId: string) => void;
  onRename: (categoryId: string, name: string) => void;
}

export function ItemList({
  items,
  activeZone,
  onDelete,
  onDecrement,
  onEdit,
  categoryView,
  categories,
  assignments,
  onAssign,
  onRename,
}: ItemListProps) {
  const zoneItems = items.filter((item) => item.zone === activeZone);

  if (categoryView) {
    return (
      <CategorySection
        items={zoneItems}
        categories={categories}
        assignments={assignments}
        onDelete={onDelete}
        onDecrement={onDecrement}
        onEdit={onEdit}
        onAssign={onAssign}
        onRename={onRename}
      />
    );
  }

  return (
    <ZoneSection
      zone={activeZone}
      items={zoneItems}
      onDelete={onDelete}
      onDecrement={onDecrement}
      onEdit={onEdit}
    />
  );
}
