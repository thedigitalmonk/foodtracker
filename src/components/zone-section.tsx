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
    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
      {/* Zone header */}
      <div className="flex items-center justify-between px-4 py-[14px] border-b border-[#e5e5e5]">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">{meta.emoji}</span>
          <span className="text-[14px] font-semibold text-[#18181B]">
            {meta.label}
          </span>
        </div>
        <span className="text-[12px] text-[#a3a3a3]">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Item cards — no gap between them, dividers via border-b */}
      <div className="divide-y divide-[#e5e5e5]">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
