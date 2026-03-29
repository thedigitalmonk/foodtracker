"use client";

import { Item } from "@/lib/types";
import { getExpiryStatus, formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ItemCardProps {
  item: Item;
  onDelete: (id: string) => void;
}

export function ItemCard({ item, onDelete }: ItemCardProps) {
  const status = getExpiryStatus(item.expiry_date);

  const handleRunningLow = async () => {
    const text = `Buy ${item.name}`;
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
        "flex items-center justify-between rounded-lg border p-4 min-h-[56px] transition-colors",
        status === "expired" && "border-red-400 bg-red-50",
        status === "expiring-soon" && "border-amber-400 bg-amber-50",
        status === "ok" && "border-gray-200 bg-white",
        status === "no-date" && "border-gray-200 bg-white"
      )}
    >
      <div className="flex-1 min-w-0 mr-3">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-base truncate">{item.name}</span>
          <span className="text-sm text-muted-foreground shrink-0">
            x{item.quantity}
          </span>
        </div>
        {item.expiry_date && (
          <div
            className={cn(
              "text-sm mt-0.5",
              status === "expired" && "text-red-600 font-medium",
              status === "expiring-soon" && "text-amber-600 font-medium",
              status === "ok" && "text-muted-foreground"
            )}
          >
            {status === "expired"
              ? `Expired ${formatDate(item.expiry_date)}`
              : `Expires ${formatDate(item.expiry_date)}`}
          </div>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-9 px-3"
          onClick={handleRunningLow}
        >
          Low
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="text-xs h-9 px-3"
          onClick={() => onDelete(item.id)}
        >
          Used
        </Button>
      </div>
    </div>
  );
}
