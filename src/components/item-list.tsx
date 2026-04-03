"use client";

import { Item } from "@/lib/types";
import { ZoneSection } from "./zone-section";

const ZONE_ORDER = ["Fridge", "Freezer", "Pantry"] as const;

interface ItemListProps {
  items: Item[];
  onDelete: (id: string) => void;
  onEdit: (item: Item) => void;
}

export function ItemList({ items, onDelete, onEdit }: ItemListProps) {
  const grouped = ZONE_ORDER.map((zone) => ({
    zone,
    items: items.filter((item) => item.zone === zone),
  }));

  return (
    <div className="flex flex-col gap-2">
      {grouped.map(({ zone, items }) => (
        <ZoneSection
          key={zone}
          zone={zone}
          items={items}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
