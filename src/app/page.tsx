"use client";

import { useState } from "react";
import { useItems } from "@/hooks/use-items";
import { useShelfLife } from "@/hooks/use-shelf-life";
import { ItemList } from "@/components/item-list";
import { AddItemDialog } from "@/components/add-item-dialog";
import { ShelfLifeDialog } from "@/components/shelf-life-dialog";
import { Item } from "@/lib/types";

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
          <ItemList items={items} onDelete={deleteItem} onEdit={setEditingItem} />
        )}
      </div>

      <AddItemDialog
        onAdd={addItem}
        onEdit={updateItem}
        suggestExpiry={suggestExpiryDate}
        editItem={editingItem}
        onEditClose={() => setEditingItem(null)}
      />
    </main>
  );
}
