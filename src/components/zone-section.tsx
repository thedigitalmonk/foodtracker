"use client";

import { Item } from "@/lib/types";
import { ItemCard } from "./item-card";

const ZONE_META: Record<string, { emoji: string; label: string }> = {
  Fridge: { emoji: "🧊", label: "Fridge" },
  Freezer: { emoji: "❄️", label: "Freezer" },
  Pantry: { emoji: "🗄️", label: "Pantry" },
};

interface ZoneSectionProps {
  zone: string;
  items: Item[];
  onDelete: (id: string) => void;
}

export function ZoneSection({ zone, items, onDelete }: ZoneSectionProps) {
  const meta = ZONE_META[zone] ?? { emoji: "📦", label: zone };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 sticky top-0 bg-background py-2 z-10">
        {meta.emoji} {meta.label}
        <span className="text-sm font-normal text-muted-foreground ml-2">
          ({items.length})
        </span>
      </h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
