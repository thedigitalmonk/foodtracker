"use client";

import { Inbox } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <Inbox size={32} className="text-[#d1d5db]" />
        <p className="text-[14px] font-medium text-[#71717A]">No items yet</p>
        <p className="text-[12px] text-[#a3a3a3]">Tap + to add your first item</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
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
