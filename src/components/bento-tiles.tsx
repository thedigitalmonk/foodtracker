"use client";

import { AlertTriangle, Plus, ChevronRight, Refrigerator, Snowflake, Package, ShoppingBasket, Sparkles, ScanLine } from "lucide-react";
import { Item } from "@/lib/types";
import { getExpiryStatus, getDaysUntil, formatRelativeExpiry, cn } from "@/lib/utils";

const tileBase =
  "flex flex-col rounded-[14px] border p-3.5 cursor-pointer transition-[border-color,transform] active:scale-[0.985] select-none overflow-hidden relative";

// ---------- Expiring soon (col-span-2, amber when items expiring) ----------
export function ExpiringTile({ items, onOpen }: { items: Item[]; onOpen: () => void }) {
  const expiring = items
    .filter((i) => i.expiry_date)
    .map((i) => ({ ...i, status: getExpiryStatus(i.expiry_date), days: getDaysUntil(i.expiry_date)! }))
    .filter((i) => i.status === "expired" || i.status === "expiring-soon")
    .sort((a, b) => a.days - b.days)
    .slice(0, 3);

  const total = expiring.length;
  const hasItems = total > 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        tileBase,
        "col-span-2 min-h-[174px] text-left",
        hasItems
          ? "bg-[#FFFBEB] border-[#FCD34D] dark:bg-amber-950 dark:border-amber-800"
          : "bg-white border-[#e5e5e5] dark:bg-[#262626] dark:border-[#3f3f46]"
      )}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-[#B45309] dark:text-amber-400" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#B45309] dark:text-amber-400">
            Use soon
          </span>
        </div>
        <ChevronRight size={16} className="text-[#B45309] dark:text-amber-400" />
      </div>

      <div className="flex items-baseline gap-1.5 mb-3.5">
        <span className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-[#18181B] dark:text-amber-50">
          {total}
        </span>
        <span className="text-[13px] font-medium text-[#737373] dark:text-amber-200/70">
          item{total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 mt-auto">
        {expiring.map((it) => (
          <div key={it.id} className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-medium text-[#18181B] dark:text-amber-100 truncate">
              {it.name}
            </span>
            <span
              className={cn(
                "text-[11px] font-semibold whitespace-nowrap",
                it.status === "expired"
                  ? "text-[#EF4444] dark:text-red-400"
                  : "text-[#B45309] dark:text-amber-400"
              )}
            >
              {formatRelativeExpiry(it.expiry_date!)}
            </span>
          </div>
        ))}
      </div>
    </button>
  );
}

// ---------- Quick add (col-span-1) ----------
export function QuickAddTile({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className={cn(tileBase, "col-span-1 min-h-[174px] bg-[#fafafa] dark:bg-[#1f1f1f] border-[#e5e5e5] dark:border-[#262626] justify-between text-left")}
    >
      <div className="h-9 w-9 rounded-full bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center text-[#18181B] dark:text-white">
        <Plus size={20} />
      </div>
      <div>
        <div className="text-[16px] font-semibold leading-snug tracking-tight text-[#18181B] dark:text-white mb-1">
          Add item
        </div>
        <div className="text-[12px] text-[#737373] dark:text-neutral-400">
          Photo, barcode, or type
        </div>
      </div>
    </button>
  );
}

// ---------- Recently added (col-span-2) ----------
const ZONE_ACCENT: Record<string, string> = {
  Fridge: "#94A3B8",
  Freezer: "#60A5FA",
  Pantry: "#A78BFA",
};

function ZoneIcon({ zone, size }: { zone: string; size: number }) {
  if (zone === "Fridge") return <Refrigerator size={size} />;
  if (zone === "Freezer") return <Snowflake size={size} />;
  return <Package size={size} />;
}

export function RecentTile({ items, onOpen }: { items: Item[]; onOpen: () => void }) {
  const recent = [...items]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 4);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(tileBase, "col-span-2 min-h-[156px] bg-white border-[#e5e5e5] dark:bg-[#262626] dark:border-[#3f3f46] text-left")}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-[#18181B] dark:text-white">Recently added</span>
        <ChevronRight size={16} className="text-[#a3a3a3]" />
      </div>
      <div className="flex flex-col gap-2">
        {recent.map((it) => (
          <div key={it.id} className="flex items-center gap-2.5">
            <div
              className="h-[26px] w-[26px] rounded-lg flex items-center justify-center shrink-0 bg-[#f5f5f5] dark:bg-[#333]"
              style={{ color: ZONE_ACCENT[it.zone] ?? "#a3a3a3" }}
            >
              <ZoneIcon zone={it.zone} size={13} />
            </div>
            <span className="text-[13px] font-medium text-[#18181B] dark:text-white flex-1 truncate">
              {it.name}
            </span>
            <span className="text-[12px] text-[#a3a3a3]">x{it.quantity}</span>
          </div>
        ))}
        {recent.length === 0 && (
          <span className="text-[13px] text-[#a3a3a3]">No items yet</span>
        )}
      </div>
    </button>
  );
}

// ---------- On hand total (col-span-1) ----------
export function InventoryTile({ items, onOpen }: { items: Item[]; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(tileBase, "col-span-1 min-h-[156px] bg-white border-[#e5e5e5] dark:bg-[#262626] dark:border-[#3f3f46] justify-between text-left")}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#a3a3a3]">
          On hand
        </span>
        <ShoppingBasket size={14} className="text-[#a3a3a3]" />
      </div>
      <div>
        <div className="text-[36px] font-semibold leading-none tracking-[-0.03em] text-[#18181B] dark:text-white">
          {items.length}
        </div>
        <div className="text-[12px] text-[#737373] dark:text-neutral-400 mt-1">across 3 zones</div>
      </div>
    </button>
  );
}

// ---------- Running low (col-span-2) ----------
export function SuggestTile({ items, onOpen }: { items: Item[]; onOpen: () => void }) {
  const low = items
    .filter((i) => parseInt(i.quantity, 10) <= 1 && !i.is_container && i.zone !== "Freezer")
    .slice(0, 6);

  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const handleShare = async () => {
    try {
      if (canShare) {
        const nav = navigator as Navigator & { share: (d: ShareData) => Promise<void> };
        for (const item of low) {
          await nav.share({ title: item.name, text: item.name });
        }
      } else {
        await navigator.clipboard.writeText(low.map((i) => i.name).join("\n"));
      }
    } catch {
      // User cancelled — stop sharing remaining items
    }
    onOpen();
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(tileBase, "col-span-2 min-h-[140px] bg-white border-[#e5e5e5] dark:bg-[#262626] dark:border-[#3f3f46] text-left")}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#18181B] dark:text-white" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#18181B] dark:text-white">
            Running low
          </span>
        </div>
        <ChevronRight size={16} className="text-[#a3a3a3]" />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {low.map((it) => (
          <span
            key={it.id}
            className="text-[12px] font-medium px-2.5 py-1.5 bg-[#f5f5f5] dark:bg-[#333] rounded-full text-[#18181B] dark:text-white"
          >
            {it.name}
          </span>
        ))}
        {low.length === 0 && (
          <span className="text-[13px] text-[#a3a3a3]">All stocked up</span>
        )}
      </div>
      <div className="text-[12px] text-[#737373] dark:text-neutral-400 mt-auto pt-2.5">
        {canShare ? "Tap to share shopping list" : "Tap to copy to clipboard"}
      </div>
    </button>
  );
}

// ---------- Scan barcode (col-span-1) ----------
export function ScanTile({ onScan }: { onScan: () => void }) {
  return (
    <button
      type="button"
      onClick={onScan}
      className={cn(tileBase, "col-span-1 min-h-[140px] bg-white border-[#e5e5e5] dark:bg-[#262626] dark:border-[#3f3f46] justify-between text-left")}
    >
      <ScanLine size={20} className="text-[#18181B] dark:text-white" />
      <div>
        <div className="text-[14px] font-semibold text-[#18181B] dark:text-white mb-0.5">Scan</div>
        <div className="text-[12px] text-[#737373] dark:text-neutral-400">Barcode</div>
      </div>
    </button>
  );
}
