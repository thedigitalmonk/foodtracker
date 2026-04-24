"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Assignment, Category, Item } from "@/lib/types";
import { ItemCard } from "./item-card";
import { CategoryMoveSheet } from "./category-move-sheet";

interface CategorySectionProps {
  items: Item[];
  categories: Category[];
  assignments: Assignment[];
  onDelete: (id: string) => void;
  onDecrement: (id: string) => void;
  onEdit: (item: Item) => void;
  onAssign: (itemId: string, categoryId: string) => void;
  onRename: (categoryId: string, name: string) => void;
  onCreateCategory: (name: string) => Promise<Category | null>;
}

const LONG_PRESS_MS = 500;

export function CategorySection({
  items,
  categories,
  assignments,
  onDelete,
  onDecrement,
  onEdit,
  onAssign,
  onRename,
  onCreateCategory,
}: CategorySectionProps) {
  // expanded[id] = false means collapsed; undefined or true means expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [moveItem, setMoveItem] = useState<Item | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // itemId → categoryId lookup
  const assignmentMap = new Map(assignments.map((a) => [a.item_id, a.category_id]));

  // categoryId → Item[]
  const otherCategory = categories.find((c) => c.source_name === "Other");
  const groups = new Map<string, Item[]>();
  for (const item of items) {
    const catId = assignmentMap.get(item.id) ?? otherCategory?.id ?? "";
    if (!catId) continue;
    if (!groups.has(catId)) groups.set(catId, []);
    groups.get(catId)!.push(item);
  }

  const activeCategories = categories.filter((c) => groups.has(c.id));
  const isExpanded = (id: string) => expanded[id] !== false;

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !isExpanded(id) }));

  const startLongPress = (item: Item) => {
    longPressTimer.current = setTimeout(() => setMoveItem(item), LONG_PRESS_MS);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  if (items.length === 0) {
    return (
      <div className="px-4 py-10 flex items-center justify-center text-[13px] text-muted-foreground">
        No items
      </div>
    );
  }

  return (
    <>
      <div>
        {activeCategories.map((category) => {
          const catItems = groups.get(category.id) ?? [];
          const open = isExpanded(category.id);

          return (
            <div key={category.id} className="border-b border-border">
              {/* Category header */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                >
                  {open ? (
                    <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                  )}

                  {renamingId === category.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => {
                        const trimmed = renameValue.trim();
                        if (trimmed && trimmed !== category.name) {
                          onRename(category.id, trimmed);
                        }
                        setRenamingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        if (e.key === "Escape") {
                          setRenameValue(category.name);
                          setRenamingId(null);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[14px] font-semibold bg-transparent border-b border-foreground outline-none min-w-0 flex-1"
                    />
                  ) : (
                    <span className="text-[14px] font-semibold truncate">
                      {category.name}
                    </span>
                  )}

                  <span className="text-[11px] text-muted-foreground bg-background rounded-full px-1.5 py-px shrink-0">
                    {catItems.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setRenamingId(category.id);
                    setRenameValue(category.name);
                  }}
                  className="text-[12px] text-muted-foreground px-2 py-1 shrink-0"
                >
                  Rename
                </button>
              </div>

              {/* Items */}
              {open && (
                <div className="divide-y divide-border">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      onPointerDown={() => startLongPress(item)}
                      onPointerUp={cancelLongPress}
                      onPointerMove={cancelLongPress}
                      onPointerLeave={cancelLongPress}
                      onPointerCancel={cancelLongPress}
                    >
                      <ItemCard
                        item={item}
                        onDelete={onDelete}
                        onDecrement={onDecrement}
                        onEdit={onEdit}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CategoryMoveSheet
        item={moveItem}
        categories={categories}
        currentCategoryId={
          moveItem ? (assignmentMap.get(moveItem.id) ?? null) : null
        }
        onClose={() => setMoveItem(null)}
        onMove={(categoryId) => {
          if (moveItem) onAssign(moveItem.id, categoryId);
          setMoveItem(null);
        }}
        onCreateCategory={async (name) => {
          const category = await onCreateCategory(name);
          if (moveItem && category) {
            onAssign(moveItem.id, category.id);
            setMoveItem(null);
          }
          return category;
        }}
      />
    </>
  );
}
