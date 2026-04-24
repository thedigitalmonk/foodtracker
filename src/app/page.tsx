"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Refrigerator, Snowflake, Package, Layers } from "lucide-react";
import { useItems } from "@/hooks/use-items";
import { useShelfLife } from "@/hooks/use-shelf-life";
import { useCategories } from "@/hooks/use-categories";
import { useCategoryAssignments } from "@/hooks/use-category-assignments";
import { ItemList } from "@/components/item-list";
import { AddItemDialog } from "@/components/add-item-dialog";
import { ShelfLifeDialog } from "@/components/shelf-life-dialog";
import { Toast } from "@/components/toast";
import { Item } from "@/lib/types";
import { cn } from "@/lib/utils";

const UNDO_DURATION = 5000;

type Zone = "Fridge" | "Freezer" | "Pantry";

const ZONES: Zone[] = ["Fridge", "Freezer", "Pantry"];

const ZONE_TABS = [
  { zone: "Fridge" as Zone, Icon: Refrigerator },
  { zone: "Freezer" as Zone, Icon: Snowflake },
  { zone: "Pantry" as Zone, Icon: Package },
];

interface PendingDelete {
  id: string;
  name: string;
  timer: ReturnType<typeof setTimeout>;
}

export default function Home() {
  const { items, loading, addItem, deleteItem, updateItem } = useItems();
  const {
    entries: shelfLifeEntries,
    suggestExpiryDate,
    updateDays,
    addEntry,
    deleteEntry,
  } = useShelfLife();
  const { categories, renameCategory } = useCategories();
  const { assignments, assignCategory, inferAndAssign } = useCategoryAssignments();
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [activeZone, setActiveZone] = useState<Zone>("Fridge");
  const [categoryView, setCategoryView] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const pendingRef = useRef<PendingDelete | null>(null);
  pendingRef.current = pendingDelete;

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const commitDelete = useCallback((id: string) => {
    deleteItem(id);
    setPendingDelete(null);
  }, [deleteItem]);

  const handleUsed = useCallback((id: string) => {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timer);
      deleteItem(pendingRef.current.id);
    }

    const item = items.find((i) => i.id === id);
    const name = item?.name ?? "Item";

    const timer = setTimeout(() => commitDelete(id), UNDO_DURATION);
    const next = { id, name, timer };
    setPendingDelete(next);
    pendingRef.current = next;
  }, [items, deleteItem, commitDelete]);

  const handleDecrement = useCallback((id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const qty = parseInt(item.quantity, 10);
    if (isNaN(qty)) return;
    updateItem(id, { name: item.name, quantity: String(qty - 1), zone: item.zone, expiry_date: item.expiry_date });
  }, [items, updateItem]);

  const handleUndo = useCallback(() => {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timer);
      setPendingDelete(null);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timer);
      deleteItem(pendingRef.current.id);
      setPendingDelete(null);
    }
  }, [deleteItem]);

  const displayedItems = pendingDelete
    ? items.filter((i) => i.id !== pendingDelete.id)
    : items;

  const inferringRef = useRef(false);
  const prevItemIdsRef = useRef<Set<string>>(new Set(items.map((i) => i.id)));

  const handleToggleCategories = useCallback(async () => {
    if (inferringRef.current) return;
    const next = !categoryView;
    setCategoryView(next);
    if (next) {
      inferringRef.current = true;
      await inferAndAssign(displayedItems, shelfLifeEntries, categories);
      inferringRef.current = false;
    }
  }, [categoryView, displayedItems, shelfLifeEntries, categories, inferAndAssign]);

  useEffect(() => {
    if (!categoryView || categories.length === 0) return;
    const currentIds = new Set(items.map((i) => i.id));
    const hasNew = items.some((i) => !prevItemIdsRef.current.has(i.id));
    prevItemIdsRef.current = currentIds;
    if (hasNew) {
      inferAndAssign(items, shelfLifeEntries, categories);
    }
  }, [items, categoryView, categories, shelfLifeEntries, inferAndAssign]);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 h-14 bg-card border-b border-border sticky top-0 z-20">
        <h1 className="text-[20px] font-semibold text-foreground">ST Store</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleCategories}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
              categoryView
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            aria-label={categoryView ? "Exit category view" : "Group by category"}
          >
            <Layers size={18} />
          </button>
          <ShelfLifeDialog
            entries={shelfLifeEntries}
            onUpdateDays={updateDays}
            onAdd={addEntry}
            onDelete={deleteEntry}
          />
        </div>
      </header>

      {/* Tab bar */}
      <div className="sticky top-14 z-10 bg-card border-b border-border flex">
        {ZONE_TABS.map(({ zone, Icon }) => {
          const count = displayedItems.filter((i) => i.zone === zone).length;
          const active = activeZone === zone;
          return (
            <button
              key={zone}
              onClick={() => setActiveZone(zone)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-3",
                "text-[13px] font-medium border-b-2 transition-colors",
                active
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground border-transparent"
              )}
            >
              <Icon size={15} />
              <span>{zone}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "text-[11px] font-semibold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1",
                    active ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div
        className="flex-1 pb-24"
        onTouchStart={(e) => {
          touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          };
        }}
        onTouchEnd={(e) => {
          const start = touchStartRef.current;
          touchStartRef.current = null;
          if (!start) return;
          const dx = e.changedTouches[0].clientX - start.x;
          const dy = e.changedTouches[0].clientY - start.y;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 2) {
            const idx = ZONES.indexOf(activeZone);
            if (dx < 0 && idx < ZONES.length - 1) setActiveZone(ZONES[idx + 1]);
            if (dx > 0 && idx > 0) setActiveZone(ZONES[idx - 1]);
          }
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-[14px]">
            Loading...
          </div>
        ) : (
          <ItemList
            items={displayedItems}
            activeZone={activeZone}
            onDelete={handleUsed}
            onDecrement={handleDecrement}
            onEdit={setEditingItem}
            categoryView={categoryView}
            categories={categories}
            assignments={assignments}
            onAssign={assignCategory}
            onRename={renameCategory}
          />
        )}
      </div>

      <AddItemDialog
        onAdd={addItem}
        onEdit={updateItem}
        suggestExpiry={suggestExpiryDate}
        editItem={editingItem}
        onEditClose={() => setEditingItem(null)}
        defaultZone={activeZone}
      />

      {pendingDelete && (
        <Toast
          key={pendingDelete.id}
          message={`${pendingDelete.name} marked as used`}
          onUndo={handleUndo}
          onDismiss={handleDismiss}
          duration={UNDO_DURATION}
        />
      )}
    </main>
  );
}
