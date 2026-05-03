"use client";

import { Refrigerator, Snowflake, Package } from "lucide-react";
import { Item } from "@/lib/types";
import { getExpiryStatus, cn } from "@/lib/utils";

type Zone = "Fridge" | "Freezer" | "Pantry";

interface ZoneStripProps {
  items: Item[];
  activeZone: Zone;
  onZoneSelect: (zone: Zone) => void;
}

const ZONE_CONFIG = [
  { key: "Fridge" as Zone, Icon: Refrigerator, accent: "#94A3B8" },
  { key: "Freezer" as Zone, Icon: Snowflake, accent: "#60A5FA" },
  { key: "Pantry" as Zone, Icon: Package, accent: "#A78BFA" },
];

export function ZoneStrip({ items, activeZone, onZoneSelect }: ZoneStripProps) {
  return (
    <div className="grid grid-cols-3 gap-2 px-4">
      {ZONE_CONFIG.map(({ key, Icon, accent }) => {
        const zoneItems = items.filter((i) => i.zone === key);
        const hasExpiring = zoneItems.some((i) => {
          const s = getExpiryStatus(i.expiry_date);
          return s === "expired" || s === "expiring-soon";
        });
        const isActive = activeZone === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onZoneSelect(key)}
            className={cn(
              "flex flex-col gap-2 p-2.5 rounded-xl border text-left transition-[border-color]",
              isActive
                ? "bg-white dark:bg-[#171717] border-[#18181B] dark:border-[#fafafa]"
                : "bg-white dark:bg-[#171717] border-[#e5e5e5] dark:border-[#262626]"
            )}
          >
            <div className="flex items-center justify-between">
              <div
                className="h-[22px] w-[22px] rounded-[7px] flex items-center justify-center bg-[#f5f5f5] dark:bg-[#262626]"
                style={{ color: accent }}
              >
                <Icon size={12} />
              </div>
              {hasExpiring && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
              )}
            </div>
            <div>
              <div className="text-[12px] font-medium leading-none mb-[3px] text-[#737373] dark:text-neutral-400">
                {key}
              </div>
              <div className="text-[17px] font-semibold leading-none tracking-tight text-[#18181B] dark:text-white">
                {zoneItems.length}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
