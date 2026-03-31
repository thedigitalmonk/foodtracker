"use client";

import { Item } from "@/lib/types";
import { getExpiryStatus, formatDate, cn } from "@/lib/utils";
import { TrendingDown, Check } from "lucide-react";

interface ItemCardProps {
  item: Item;
  onDelete: (id: string) => void;
  onEdit: (item: Item) => void;
}

export function ItemCard({ item, onDelete, onEdit }: ItemCardProps) {
  const status = getExpiryStatus(item.expiry_date);

  const handleRunningLow = async () => {
    const text = item.name;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard: " + text);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 min-h-[68px] gap-3",
        "border-l-4",
        status === "expired" && "bg-[#FFF1F2] border-l-[#EF4444]",
        status === "expiring-soon" && "bg-[#FFFBEB] border-l-[#F59E0B]",
        (status === "ok" || status === "no-date") && "bg-white border-l-transparent"
      )}
    >
      <button
        type="button"
        onClick={() => onEdit(item)}
        className="flex-1 min-w-0 flex flex-col gap-[3px] text-left"
      >
        <div className="flex items-baseline gap-[6px]">
          <span className="font-semibold text-[15px] text-[#18181B] truncate leading-snug">
            {item.name}
          </span>
          <span className="text-[13px] text-[#a3a3a3] shrink-0">
            x{item.quantity}
          </span>
        </div>
        {item.expiry_date && (
          <span
            className={cn(
              "text-[12px] leading-snug",
              status === "expired" && "text-[#EF4444]",
              status === "expiring-soon" && "text-[#B45309]",
              (status === "ok" || status === "no-date") && "text-[#a3a3a3]"
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
          onClick={handleRunningLow}
          className="flex items-center gap-1 h-[29px] px-3 text-[12px] font-semibold text-[#B45309] bg-[#FEF3C7] border border-[#D97706] rounded-[6px] shadow-sm whitespace-nowrap"
        >
          <TrendingDown size={13} />
          Low
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="flex items-center gap-1 h-[29px] px-3 text-[12px] font-semibold text-white bg-[#e7000b] rounded-[6px] shadow-sm whitespace-nowrap"
        >
          <Check size={13} />
          Used
        </button>
      </div>
    </div>
  );
}
