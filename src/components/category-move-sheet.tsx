"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { Category, Item } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategoryMoveSheetProps {
  item: Item | null;
  categories: Category[];
  currentCategoryId: string | null;
  onClose: () => void;
  onMove: (categoryId: string) => void;
  onCreateCategory: (name: string) => Promise<Category | null>;
}

export function CategoryMoveSheet({
  item,
  categories,
  currentCategoryId,
  onClose,
  onMove,
  onCreateCategory,
}: CategoryMoveSheetProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!item) {
      setIsCreating(false);
      setNewCategoryName("");
      setCreateError(null);
      setSubmitting(false);
    }
  }, [item]);

  useEffect(() => {
    if (isCreating) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(timer);
    }
  }, [isCreating]);

  if (!item) return null;

  const handleCreate = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setCreateError(null);
    const created = await onCreateCategory(trimmed);
    if (!created) {
      setCreateError("Couldn’t create category. Try a different name.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setIsCreating(false);
    setNewCategoryName("");
  };

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
          <div className="px-4 py-3 bg-muted/30">
            {isCreating ? (
              <div className="space-y-2">
                <input
                  ref={inputRef}
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    if (createError) setCreateError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreate();
                    }
                    if (e.key === "Escape" && !submitting) {
                      setIsCreating(false);
                      setNewCategoryName("");
                      setCreateError(null);
                    }
                  }}
                  placeholder="New category name"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewCategoryName("");
                      setCreateError(null);
                    }}
                    disabled={submitting}
                    className="px-3 py-2 text-[13px] text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={!newCategoryName.trim() || submitting}
                    className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-[13px] font-medium text-background disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                    Create
                  </button>
                </div>
                {createError ? (
                  <p className="text-[12px] text-destructive">{createError}</p>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-2 rounded-md px-1 py-1 text-left text-[14px] font-medium text-foreground"
              >
                <Plus size={15} className="shrink-0" />
                <span>New category</span>
              </button>
            )}
          </div>
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
