"use client";

import { useState } from "react";
import { Refrigerator, Snowflake, Package, ChevronDown, LucideIcon } from "lucide-react";
import { Item } from "@/lib/types";
import { ItemCard } from "./item-card";

const ZONE_META: Record<string, { icon: LucideIcon; label: string }> = {
  Fridge: { icon: Refrigerator, label: "Fridge" },
  Freezer: { icon: Snowflake, label: "Freezer" },
  Pantry: { icon: Package, label: "Pantry" },
};

interface ZoneSectionProps {
  zone: string;
  items: Item[];
  onDelete: (id: string) => void;
  onEdit: (item: Item) => void;
}

export function ZoneSection({ zone, items, onDelete, onEdit }: ZoneSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const meta = ZONE_META[zone] ?? { icon: Package, label: zone };
  const Icon = meta.icon;

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
      {/* Zone header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-[14px] border-b border-[#e5e5e5] cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-[#18181B]" />
          <span className="text-[14px] font-semibold text-[#18181B]">
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#a3a3a3]">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
          <ChevronDown
            size={16}
            className={`text-[#a3a3a3] transition-transform duration-200 ${expanded ? "" : "-rotate-90"}`}
          />
        </div>
      </button>

      {/* Item cards */}
      {expanded && (
        <div className="divide-y divide-[#e5e5e5]">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
