"use client";

import { useItems } from "@/hooks/use-items";
import { useShelfLife } from "@/hooks/use-shelf-life";
import { ItemList } from "@/components/item-list";
import { AddItemDialog } from "@/components/add-item-dialog";
import { ShelfLifeDialog } from "@/components/shelf-life-dialog";

export default function Home() {
  const { items, loading, addItem, deleteItem } = useItems();
  const {
    entries: shelfLifeEntries,
    suggestExpiryDate,
    updateDays,
    addEntry,
    deleteEntry,
  } = useShelfLife();

  return (
    <main className="max-w-lg mx-auto px-4 pb-24">
      <header className="flex items-center justify-between py-4 sticky top-0 bg-background z-20">
        <h1 className="text-xl font-bold">Fridge Tracker</h1>
        <ShelfLifeDialog
          entries={shelfLifeEntries}
          onUpdateDays={updateDays}
          onAdd={addEntry}
          onDelete={deleteEntry}
        />
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading...
        </div>
      ) : (
        <ItemList items={items} onDelete={deleteItem} />
      )}

      <AddItemDialog onAdd={addItem} suggestExpiry={suggestExpiryDate} />
    </main>
  );
}
