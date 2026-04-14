"use client";

import { useState, useCallback, useRef } from "react";
import { useItems } from "@/hooks/use-items";
import { useShelfLife } from "@/hooks/use-shelf-life";
import { ItemList } from "@/components/item-list";
import { AddItemDialog } from "@/components/add-item-dialog";
import { ShelfLifeDialog } from "@/components/shelf-life-dialog";
import { Toast } from "@/components/toast";
import { Item } from "@/lib/types";

const UNDO_DURATION = 5000;

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

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const pendingRef = useRef<PendingDelete | null>(null);
  pendingRef.current = pendingDelete;

  const commitDelete = useCallback((id: string) => {
    deleteItem(id);
    setPendingDelete(null);
  }, [deleteItem]);

  const handleUsed = useCallback((id: string) => {
    // Commit any in-flight delete immediately before starting a new one
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

      {/* Content */}
      <div className="flex-1 px-4 py-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#a3a3a3] text-[14px]">
            Loading...
          </div>
        ) : (
          <ItemList items={displayedItems} onDelete={handleUsed} onDecrement={handleDecrement} onEdit={setEditingItem} />
        )}
      </div>

      <AddItemDialog
        onAdd={addItem}
        onEdit={updateItem}
        suggestExpiry={suggestExpiryDate}
        editItem={editingItem}
        onEditClose={() => setEditingItem(null)}
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
