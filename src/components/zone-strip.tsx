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
              "flex flex-col gap-2 p-2.5 rounded-xl border text-left transition-colors",
              isActive
                ? "bg-[#18181B] border-[#18181B] dark:bg-white dark:border-white"
                : "bg-white border-[#e5e5e5] dark:bg-[#262626] dark:border-[#3f3f46]"
            )}
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "h-[22px] w-[22px] rounded-[7px] flex items-center justify-center",
                  isActive
                    ? "bg-white/[0.12] dark:bg-black/[0.10] text-white dark:text-black"
                    : "bg-[#f5f5f5] dark:bg-[#3a3a3a]"
                )}
                style={isActive ? undefined : { color: accent }}
              >
                <Icon size={12} />
              </div>
              {hasExpiring && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
              )}
            </div>
            <div>
              <div
                className={cn(
                  "text-[12px] font-medium leading-none mb-[3px]",
                  isActive
                    ? "text-white/60 dark:text-black/60"
                    : "text-[#737373] dark:text-neutral-400"
                )}
              >
                {key}
              </div>
              <div
                className={cn(
                  "text-[17px] font-semibold leading-none tracking-tight",
                  isActive
                    ? "text-white dark:text-black"
                    : "text-[#18181B] dark:text-white"
                )}
              >
                {zoneItems.length}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
