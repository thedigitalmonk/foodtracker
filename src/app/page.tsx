"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { ChevronLeft, Layers } from "lucide-react";
import { useItems } from "@/hooks/use-items";
import { useShelfLife } from "@/hooks/use-shelf-life";
import { useCategories } from "@/hooks/use-categories";
import { useCategoryAssignments } from "@/hooks/use-category-assignments";
import { SearchHeader } from "@/components/search-header";
import { ZoneStrip } from "@/components/zone-strip";
import {
  ExpiringTile,
  QuickAddTile,
  RecentTile,
  InventoryTile,
  SuggestTile,
  ScanTile,
} from "@/components/bento-tiles";
import { ItemList } from "@/components/item-list";
import { ItemCard } from "@/components/item-card";
import { AddItemDialog } from "@/components/add-item-dialog";
import { ShelfLifeDialog } from "@/components/shelf-life-dialog";
import { Toast } from "@/components/toast";
import { Item } from "@/lib/types";
import { cn, getExpiryStatus, getDaysUntil } from "@/lib/utils";

const UNDO_DURATION = 5000;

type Zone = "Fridge" | "Freezer" | "Pantry";
type View = "home" | "zone" | "expiring" | "recent" | "low";

const ZONES: Zone[] = ["Fridge", "Freezer", "Pantry"];

interface PendingDelete {
  id: string;
  name: string;
  timer: ReturnType<typeof setTimeout>;
}

export default function Home() {
  const { items, loading, addItem, deleteItem, updateItem } = useItems();
  const { entries: shelfLifeEntries, suggestExpiryDate, updateDays, addEntry, deleteEntry } = useShelfLife();
  const { categories, renameCategory, createCategory } = useCategories();
  const { assignments, assignCategory, inferAndAssign } = useCategoryAssignments();

  const [view, setView] = useState<View>("home");
  const [activeZone, setActiveZone] = useState<Zone>("Fridge");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [categoryView, setCategoryView] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const pendingRef = useRef<PendingDelete | null>(null);
  pendingRef.current = pendingDelete;
  const inferringRef = useRef(false);
  const prevItemIdsRef = useRef<Set<string>>(new Set(items.map((i) => i.id)));

  const displayedItems = pendingDelete
    ? items.filter((i) => i.id !== pendingDelete.id)
    : items;

  // ---- computed ----
  const filteredItems = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return displayedItems.filter((i) => i.name.toLowerCase().includes(q));
  }, [displayedItems, query]);

  const expiringCount = useMemo(
    () =>
      displayedItems.filter((i) => {
        const s = getExpiryStatus(i.expiry_date);
        return s === "expired" || s === "expiring-soon";
      }).length,
    [displayedItems]
  );

  const expiringItems = useMemo(
    () =>
      displayedItems
        .filter((i) => {
          const s = getExpiryStatus(i.expiry_date);
          return s === "expired" || s === "expiring-soon";
        })
        .sort(
          (a, b) =>
            (getDaysUntil(a.expiry_date) ?? 9999) -
            (getDaysUntil(b.expiry_date) ?? 9999)
        ),
    [displayedItems]
  );

  const recentItems = useMemo(
    () => [...displayedItems].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [displayedItems]
  );

  const lowItems = useMemo(
    () =>
      displayedItems.filter(
        (i) => parseInt(i.quantity, 10) <= 1 && !i.is_container && i.zone !== "Freezer"
      ),
    [displayedItems]
  );

  // ---- handlers ----
  const commitDelete = useCallback(
    (id: string) => {
      deleteItem(id);
      setPendingDelete(null);
    },
    [deleteItem]
  );

  const handleUsed = useCallback(
    (id: string) => {
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
    },
    [items, deleteItem, commitDelete]
  );

  const handleDecrement = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty)) return;
      updateItem(id, {
        name: item.name,
        quantity: String(qty - 1),
        zone: item.zone,
        expiry_date: item.expiry_date,
        is_container: item.is_container,
      });
    },
    [items, updateItem]
  );

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
    if (hasNew) inferAndAssign(items, shelfLifeEntries, categories);
  }, [items, categoryView, categories, shelfLifeEntries, inferAndAssign]);

  const handleQuery = (q: string) => {
    setQuery(q);
    if (q && view !== "home") setView("home");
  };

  const handleZoneSelect = (zone: Zone) => {
    setActiveZone(zone);
    setCategoryView(false);
    setView("zone");
  };

  const handleAddClose = () => {
    setAddOpen(false);
    setEditingItem(null);
  };

  // ---- shared UI helpers ----
  const SectionHeader = ({
    title,
    subtitle,
    onBack,
    actions,
  }: {
    title: string;
    subtitle: string;
    onBack: () => void;
    actions?: React.ReactNode;
  }) => (
    <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
      <button
        type="button"
        onClick={onBack}
        className="h-8 w-8 flex items-center justify-center rounded-full bg-white dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#3f3f46] text-[#18181B] dark:text-white shrink-0"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-[22px] font-semibold leading-tight tracking-tight text-[#18181B] dark:text-white">
          {title}
        </div>
        <div className="text-[13px] text-[#737373] mt-0.5">{subtitle}</div>
      </div>
      {actions}
    </div>
  );

  const ItemListView = ({ list }: { list: Item[] }) => {
    if (list.length === 0) {
      return (
        <div className="flex items-center justify-center py-16 text-[#a3a3a3] text-[13px]">
          Nothing here
        </div>
      );
    }
    return (
      <div className="mx-4 bg-white dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#3f3f46] rounded-[14px] overflow-hidden mb-6">
        {list.map((item, i) => (
          <div
            key={item.id}
            className={
              i > 0
                ? "border-t border-[#f5f5f5] dark:border-[#3f3f46]"
                : ""
            }
          >
            <ItemCard
              item={item}
              onDelete={handleUsed}
              onDecrement={handleDecrement}
              onEdit={setEditingItem}
            />
          </div>
        ))}
      </div>
    );
  };

  // ---- render ----
  return (
    <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a] flex flex-col">
      <SearchHeader
        query={query}
        onQuery={handleQuery}
        onAdd={() => setAddOpen(true)}
        onBell={() => setView("expiring")}
        expiringCount={expiringCount}
      />

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#a3a3a3] text-[14px]">
            Loading…
          </div>
        ) : filteredItems !== null ? (
          /* ── Search results ── */
          <div className="px-4 pt-3 pb-6">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#a3a3a3] mb-2.5">
              {filteredItems.length} result
              {filteredItems.length === 1 ? "" : "s"}
            </div>
            {filteredItems.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-[#a3a3a3] text-[13px]">
                No items match &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div className="bg-white dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#3f3f46] rounded-[14px] overflow-hidden">
                {filteredItems.map((item, i) => (
                  <div
                    key={item.id}
                    className={
                      i > 0
                        ? "border-t border-[#f5f5f5] dark:border-[#3f3f46]"
                        : ""
                    }
                  >
                    <ItemCard
                      item={item}
                      onDelete={handleUsed}
                      onDecrement={handleDecrement}
                      onEdit={setEditingItem}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : view === "home" ? (
          /* ── Bento dashboard ── */
          <>
            <div className="px-4 pt-3 pb-3.5">
              <div className="text-[12px] text-[#737373] dark:text-neutral-400 mb-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="text-[24px] font-semibold leading-tight tracking-tight text-[#18181B] dark:text-white">
                Kitchen 2411
              </div>
            </div>

            <ZoneStrip
              items={displayedItems}
              activeZone={activeZone}
              onZoneSelect={handleZoneSelect}
            />

            <div className="grid grid-cols-3 gap-2.5 px-4 pt-3.5 pb-6">
              <ExpiringTile
                items={displayedItems}
                onOpen={() => setView("expiring")}
              />
              <QuickAddTile onAdd={() => setAddOpen(true)} />
              <RecentTile
                items={displayedItems}
                onOpen={() => setView("recent")}
              />
              <InventoryTile
                items={displayedItems}
                onOpen={() => {
                  setActiveZone("Fridge");
                  setView("zone");
                }}
              />
              <SuggestTile
                items={displayedItems}
                onOpen={() => setView("low")}
              />
              <ScanTile onScan={() => setAddOpen(true)} />
            </div>
          </>
        ) : view === "zone" ? (
          /* ── Zone detail ── */
          <>
            <SectionHeader
              title={activeZone}
              subtitle={`${displayedItems.filter((i) => i.zone === activeZone).length} item${displayedItems.filter((i) => i.zone === activeZone).length === 1 ? "" : "s"}`}
              onBack={() => setView("home")}
              actions={
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleCategories}
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-full border transition-colors",
                      categoryView
                        ? "bg-[#18181B] border-[#18181B] text-white dark:bg-white dark:border-white dark:text-black"
                        : "bg-white dark:bg-[#262626] border-[#e5e5e5] dark:border-[#3f3f46] text-[#18181B] dark:text-white"
                    )}
                    aria-label={categoryView ? "Exit category view" : "Group by category"}
                  >
                    <Layers size={15} />
                  </button>
                  <ShelfLifeDialog
                    entries={shelfLifeEntries}
                    onUpdateDays={updateDays}
                    onAdd={addEntry}
                    onDelete={deleteEntry}
                  />
                </div>
              }
            />

            {/* Zone switcher pills */}
            <div className="flex gap-1.5 px-4 mb-3.5">
              {ZONES.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setActiveZone(z)}
                  className={cn(
                    "flex-1 py-2 text-[12px] font-medium rounded-full border transition-colors",
                    z === activeZone
                      ? "bg-white dark:bg-[#171717] text-[#18181B] dark:text-white border-[#18181B] dark:border-[#fafafa]"
                      : "bg-white dark:bg-[#171717] text-[#737373] border-[#e5e5e5] dark:border-[#262626]"
                  )}
                >
                  {z}
                </button>
              ))}
            </div>

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
              onCreateCategory={createCategory}
            />
          </>
        ) : view === "expiring" ? (
          /* ── Expiring list ── */
          <>
            <SectionHeader
              title="Use soon"
              subtitle={`${expiringItems.length} item${expiringItems.length === 1 ? "" : "s"} expiring within 3 days`}
              onBack={() => setView("home")}
            />
            <ItemListView list={expiringItems} />
          </>
        ) : view === "recent" ? (
          /* ── Recently added ── */
          <>
            <SectionHeader
              title="Recently added"
              subtitle={`Last ${Math.min(recentItems.length, 20)} items`}
              onBack={() => setView("home")}
            />
            <ItemListView list={recentItems.slice(0, 20)} />
          </>
        ) : view === "low" ? (
          /* ── Running low ── */
          <>
            <SectionHeader
              title="Running low"
              subtitle="Items with quantity 1"
              onBack={() => setView("home")}
            />
            <ItemListView list={lowItems} />
          </>
        ) : null}
      </div>

      <AddItemDialog
        open={addOpen || !!editingItem}
        onClose={handleAddClose}
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
