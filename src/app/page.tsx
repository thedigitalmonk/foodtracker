"use client";

import { useState, useCallback, useRef } from "react";
import { Refrigerator, Snowflake, Package } from "lucide-react";
import { useItems } from "@/hooks/use-items";
import { useShelfLife } from "@/hooks/use-shelf-life";
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
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [activeZone, setActiveZone] = useState<Zone>("Fridge");

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

  return (
    <main className="max-w-[375px] mx-auto min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 h-14 bg-white border-b border-[#e5e5e5] sticky top-0 z-20">
        <h1 className="text-[20px] font-semibold text-[#18181B]">Fridge Tracker</h1>
        <ShelfLifeDialog
          entries={shelfLifeEntries}
          onUpdateDays={updateDays}
          onAdd={addEntry}
          onDelete={deleteEntry}
        />
      </header>

      {/* Tab bar */}
      <div className="sticky top-14 z-10 bg-white border-b border-[#e5e5e5] flex">
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
                  ? "text-[#18181B] border-[#18181B]"
                  : "text-[#a3a3a3] border-transparent"
              )}
            >
              <Icon size={15} />
              <span>{zone}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "text-[11px] font-semibold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1",
                    active ? "bg-[#18181B] text-white" : "bg-[#f5f5f5] text-[#737373]"
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
        className="flex-1 py-4 pb-24"
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
          <div className="flex items-center justify-center py-20 text-[#a3a3a3] text-[14px]">
            Loading...
          </div>
        ) : (
          <ItemList
            items={displayedItems}
            activeZone={activeZone}
            onDelete={handleUsed}
            onDecrement={handleDecrement}
            onEdit={setEditingItem}
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
