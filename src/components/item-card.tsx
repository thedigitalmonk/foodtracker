"use client";

import { Item } from "@/lib/types";
import { getExpiryStatus, formatDate, cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ItemCardProps {
  item: Item;
  onDelete: (id: string) => void;
  onDecrement: (id: string) => void;
  onEdit: (item: Item) => void;
}

export function ItemCard({ item, onDelete, onDecrement, onEdit }: ItemCardProps) {
  const status = getExpiryStatus(item.expiry_date);

  const handleUsed = async () => {
    const qty = parseInt(item.quantity, 10);
    if (!isNaN(qty) && qty > 1) {
      onDecrement(item.id);
    } else {
      if (navigator.share) {
        try {
          await navigator.share({ text: item.name });
        } catch {
          // User cancelled share
        }
      }
      onDelete(item.id);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 min-h-[68px] gap-3",
        "border-l-4",
        status === "expired" && "bg-destructive/10 border-l-destructive",
        status === "expiring-soon" && "bg-amber-50 dark:bg-amber-950/30 border-l-amber-500",
        (status === "ok" || status === "no-date") && "bg-card border-l-transparent"
      )}
    >
      <button
        type="button"
        onClick={() => onEdit(item)}
        className="flex-1 min-w-0 flex flex-col gap-[3px] text-left"
      >
        <div className="flex items-baseline gap-[6px]">
          <span className="font-semibold text-[15px] text-foreground truncate leading-snug">
            {item.name}
          </span>
          <span className="text-[13px] text-muted-foreground shrink-0">
            x{item.quantity}
          </span>
        </div>
        {item.expiry_date && (
          <span
            className={cn(
              "text-[12px] leading-snug",
              status === "expired" && "text-destructive",
              status === "expiring-soon" && "text-amber-700 dark:text-amber-400",
              (status === "ok" || status === "no-date") && "text-muted-foreground"
            )}
          >
            {status === "expired"
              ? `Expired ${formatDate(item.expiry_date)}`
              : `Expires ${formatDate(item.expiry_date)}`}
          </span>
        )}
      </button>

      <div className="flex items-center gap-[6px] shrink-0">
        <button
          onClick={handleUsed}
          className="flex items-center gap-1 h-[29px] px-3 text-[12px] font-semibold text-destructive-foreground bg-destructive rounded-[6px] shadow-sm whitespace-nowrap"
        >
          <Check size={13} />
          Used
        </button>
      </div>
    </div>
  );
}
