"use client";

import { Check } from "lucide-react";
import { Category, Item } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategoryMoveSheetProps {
  item: Item | null;
  categories: Category[];
  currentCategoryId: string | null;
  onClose: () => void;
  onMove: (categoryId: string) => void;
}

export function CategoryMoveSheet({
  item,
  categories,
  currentCategoryId,
  onClose,
  onMove,
}: CategoryMoveSheetProps) {
  if (!item) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onPointerDown={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Title */}
        <p className="text-[13px] text-muted-foreground text-center px-4 py-2">
          Move{" "}
          <span className="font-semibold text-foreground">
            &ldquo;{item.name}&rdquo;
          </span>{" "}
          to&hellip;
        </p>

        {/* Category list */}
        <div className="divide-y divide-border max-h-[55vh] overflow-y-auto">
          {categories.map((category) => {
            const isCurrent = category.id === currentCategoryId;
            return (
              <button
                key={category.id}
                onClick={() => {
                  if (!isCurrent) onMove(category.id);
                  else onClose();
                }}
                className={cn(
                  "w-full flex items-center justify-between px-5 py-4 text-left",
                  isCurrent
                    ? "text-foreground font-medium"
                    : "text-foreground"
                )}
              >
                <span className="text-[15px]">{category.name}</span>
                {isCurrent && (
                  <Check size={16} className="text-foreground shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Safe area spacer */}
        <div className="h-8" />
      </div>
    </>
  );
}
