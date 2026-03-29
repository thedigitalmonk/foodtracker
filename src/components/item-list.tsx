"use client";

import { Item } from "@/lib/types";
import { ZoneSection } from "./zone-section";

const ZONE_ORDER = ["Fridge", "Freezer", "Pantry"] as const;

interface ItemListProps {
  items: Item[];
  onDelete: (id: string) => void;
}

export function ItemList({ items, onDelete }: ItemListProps) {
  const grouped = ZONE_ORDER.map((zone) => ({
    zone,
    items: items.filter((item) => item.zone === zone),
  })).filter((group) => group.items.length > 0);

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">No items yet</p>
        <p className="text-sm mt-1">Tap + to add your first item</p>
      </div>
    );
  }

  return (
    <div>
      {grouped.map(({ zone, items }) => (
        <ZoneSection
          key={zone}
          zone={zone}
          items={items}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
