"use client";

import { Item } from "@/lib/types";
import { ZoneSection } from "./zone-section";

interface ItemListProps {
  items: Item[];
  activeZone: "Fridge" | "Freezer" | "Pantry";
  onDelete: (id: string) => void;
  onDecrement: (id: string) => void;
  onEdit: (item: Item) => void;
}

export function ItemList({ items, activeZone, onDelete, onDecrement, onEdit }: ItemListProps) {
  const zoneItems = items.filter((item) => item.zone === activeZone);

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
