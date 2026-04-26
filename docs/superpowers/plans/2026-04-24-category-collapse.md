# Category Collapse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a toggle button to the header that groups items into collapsible category sections, with per-item long-press to move between categories and inline category renaming.

**Architecture:** Two new Supabase tables (`categories`, `item_categories`) store category names and M2M item assignments. Auto-inference matches item names against `shelf_life` keywords on first toggle; manual moves set `is_manual=true` and are never overwritten. The existing `ZoneSection` (with dnd-kit) is replaced by `CategorySection` when the toggle is active.

**Tech Stack:** Next.js 14 App Router, React hooks, Supabase, Tailwind CSS, lucide-react, shadcn/ui semantic tokens.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `supabase/migrations/20260424000000_categories.sql` | DB schema + seed |
| Modify | `src/lib/types.ts` | Add `Category`, `Assignment` types |
| Create | `src/hooks/use-categories.ts` | Fetch categories, rename |
| Create | `src/hooks/use-category-assignments.ts` | Fetch assignments, infer, assign |
| Create | `src/components/category-move-sheet.tsx` | Bottom sheet for moving items |
| Create | `src/components/category-section.tsx` | Accordion category groups + long-press |
| Modify | `src/components/item-list.tsx` | Conditionally render `CategorySection` |
| Modify | `src/app/page.tsx` | Toggle state, header button, hook wiring |

---

## Task 1: DB Migration

**Files:**
- Create: `supabase/migrations/20260424000000_categories.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/20260424000000_categories.sql

-- Categories: display name (user-editable) + source_name (immutable, used for shelf_life matching)
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  source_name text not null unique
);

-- Seed from existing shelf_life categories + Other
insert into categories (name, source_name) values
  ('Bakery',       'Bakery'),
  ('Berries',      'Berries'),
  ('Dairy',        'Dairy'),
  ('Deli',         'Deli'),
  ('Fruit',        'Fruit'),
  ('Herbs',        'Herbs'),
  ('Leafy greens', 'Leafy greens'),
  ('Meat',         'Meat'),
  ('Other',        'Other'),
  ('Protein',      'Protein'),
  ('Seafood',      'Seafood'),
  ('Vegetables',   'Vegetables')
on conflict (source_name) do nothing;

-- Item-to-category mapping (one category per item)
create table if not exists item_categories (
  item_id     uuid primary key references items(id) on delete cascade,
  category_id uuid not null references categories(id),
  is_manual   boolean not null default false
);

-- RLS
alter table categories enable row level security;
create policy "Allow all access" on categories for all using (true) with check (true);

alter table item_categories enable row level security;
create policy "Allow all access" on item_categories for all using (true) with check (true);
```

- [ ] **Step 2: Run the migration in Supabase**

Open the Supabase dashboard → SQL Editor → paste and run the migration above.

Verify with:
```sql
select count(*) from categories; -- should be 12
select * from item_categories;   -- should be empty initially
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260424000000_categories.sql
git commit -m "feat: add categories and item_categories tables"
```

---

## Task 2: Add Types

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Append `Category` and `Assignment` to types.ts**

Add at the end of `src/lib/types.ts`:

```typescript
export interface Category {
  id: string;
  name: string;
  source_name: string;
}

export interface Assignment {
  item_id: string;
  category_id: string;
  is_manual: boolean;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add Category and Assignment types"
```

---

## Task 3: useCategories Hook

**Files:**
- Create: `src/hooks/use-categories.ts`

- [ ] **Step 1: Create the hook**

```typescript
// src/hooks/use-categories.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { Category } from "@/lib/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("categories")
      .select("*")
      .order("name");
    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }
    setCategories(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const renameCategory = async (id: string, name: string) => {
    // Optimistic update
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
    const { error } = await getSupabase()
      .from("categories")
      .update({ name })
      .eq("id", id);
    if (error) {
      console.error("Error renaming category:", error);
      await fetchCategories();
    }
  };

  return { categories, loading, renameCategory };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-categories.ts
git commit -m "feat: add useCategories hook"
```

---

## Task 4: useCategoryAssignments Hook

**Files:**
- Create: `src/hooks/use-category-assignments.ts`

- [ ] **Step 1: Create the hook**

```typescript
// src/hooks/use-category-assignments.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { Assignment, Category, Item, ShelfLife } from "@/lib/types";

export function useCategoryAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const fetchAssignments = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("item_categories")
      .select("item_id, category_id, is_manual");
    if (error) {
      console.error("Error fetching assignments:", error);
      return;
    }
    setAssignments(data ?? []);
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Assign an item to a category manually (is_manual = true, never auto-overwritten)
  const assignCategory = async (itemId: string, categoryId: string) => {
    setAssignments((prev) => {
      const rest = prev.filter((a) => a.item_id !== itemId);
      return [...rest, { item_id: itemId, category_id: categoryId, is_manual: true }];
    });
    const { error } = await getSupabase()
      .from("item_categories")
      .upsert({ item_id: itemId, category_id: categoryId, is_manual: true });
    if (error) {
      console.error("Error assigning category:", error);
      await fetchAssignments();
    }
  };

  // Auto-infer categories for items that have no assignment yet.
  // Skips items that already have any assignment (manual or not).
  const inferAndAssign = async (
    items: Item[],
    shelfLifeEntries: ShelfLife[],
    categories: Category[]
  ) => {
    if (items.length === 0 || categories.length === 0) return;

    // Fetch current assignments fresh to avoid stale closure
    const { data: current } = await getSupabase()
      .from("item_categories")
      .select("item_id")
      .in("item_id", items.map((i) => i.id));

    const assignedIds = new Set((current ?? []).map((a) => a.item_id));
    const otherCategory = categories.find((c) => c.source_name === "Other");
    if (!otherCategory) return;

    const upserts = items
      .filter((item) => !assignedIds.has(item.id))
      .map((item) => {
        const lower = item.name.toLowerCase();
        const match = shelfLifeEntries.find((e) =>
          lower.includes(e.keyword.toLowerCase())
        );
        const sourceName = match?.category ?? "Other";
        const category =
          categories.find((c) => c.source_name === sourceName) ?? otherCategory;
        return { item_id: item.id, category_id: category.id, is_manual: false };
      });

    if (upserts.length === 0) return;

    const { error } = await getSupabase()
      .from("item_categories")
      .upsert(upserts);
    if (error) {
      console.error("Error inferring categories:", error);
    }
    await fetchAssignments();
  };

  return { assignments, assignCategory, inferAndAssign };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-category-assignments.ts
git commit -m "feat: add useCategoryAssignments hook with inference"
```

---

## Task 5: CategoryMoveSheet Component

**Files:**
- Create: `src/components/category-move-sheet.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/category-move-sheet.tsx
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
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onMove(category.id);
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/category-move-sheet.tsx
git commit -m "feat: add CategoryMoveSheet bottom sheet component"
```

---

## Task 6: CategorySection Component

**Files:**
- Create: `src/components/category-section.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/category-section.tsx
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
                        if (e.key === "Escape") setRenamingId(null);
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
      />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/category-section.tsx
git commit -m "feat: add CategorySection accordion component with long-press move"
```

---

## Task 7: Update item-list.tsx

**Files:**
- Modify: `src/components/item-list.tsx`

- [ ] **Step 1: Replace file contents**

```typescript
// src/components/item-list.tsx
"use client";

import { Assignment, Category, Item } from "@/lib/types";
import { CategorySection } from "./category-section";
import { ZoneSection } from "./zone-section";

interface ItemListProps {
  items: Item[];
  activeZone: "Fridge" | "Freezer" | "Pantry";
  onDelete: (id: string) => void;
  onDecrement: (id: string) => void;
  onEdit: (item: Item) => void;
  categoryView: boolean;
  categories: Category[];
  assignments: Assignment[];
  onAssign: (itemId: string, categoryId: string) => void;
  onRename: (categoryId: string, name: string) => void;
}

export function ItemList({
  items,
  activeZone,
  onDelete,
  onDecrement,
  onEdit,
  categoryView,
  categories,
  assignments,
  onAssign,
  onRename,
}: ItemListProps) {
  const zoneItems = items.filter((item) => item.zone === activeZone);

  if (categoryView) {
    return (
      <CategorySection
        items={zoneItems}
        categories={categories}
        assignments={assignments}
        onDelete={onDelete}
        onDecrement={onDecrement}
        onEdit={onEdit}
        onAssign={onAssign}
        onRename={onRename}
      />
    );
  }

  return (
    <ZoneSection
      zone={activeZone}
      items={zoneItems}
      onDelete={onDelete}
      onDecrement={onDecrement}
      onEdit={onEdit}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/item-list.tsx
git commit -m "feat: ItemList conditionally renders CategorySection or ZoneSection"
```

---

## Task 8: Update page.tsx

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add imports at the top of page.tsx**

Update the React import line (currently `{ useState, useCallback, useRef }`) to also include `useEffect`:

```typescript
import { useState, useCallback, useRef, useEffect } from "react";
```

After the existing imports, add:

```typescript
import { Layers } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import { useCategoryAssignments } from "@/hooks/use-category-assignments";
```

- [ ] **Step 2: Add hooks and state inside the `Home` component**

After the existing `useShelfLife` destructure, add:

```typescript
const { categories, renameCategory } = useCategories();
const { assignments, assignCategory, inferAndAssign } = useCategoryAssignments();
const [categoryView, setCategoryView] = useState(false);
```

- [ ] **Step 3: Add the toggle handler**

After the existing `handleDismiss` callback, add:

```typescript
const handleToggleCategories = useCallback(async () => {
  const next = !categoryView;
  setCategoryView(next);
  if (next) {
    await inferAndAssign(displayedItems, shelfLifeEntries, categories);
  }
}, [categoryView, displayedItems, shelfLifeEntries, categories, inferAndAssign]);
```

- [ ] **Step 4: Add the new item handler that infers after adding**

After `handleToggleCategories`, add:

```typescript
// Track item IDs so we can infer newly added items
const prevItemIdsRef = useRef<Set<string>>(new Set(items.map((i) => i.id)));
useEffect(() => {
  if (!categoryView || categories.length === 0) return;
  const currentIds = new Set(items.map((i) => i.id));
  const hasNew = items.some((i) => !prevItemIdsRef.current.has(i.id));
  prevItemIdsRef.current = currentIds;
  if (hasNew) {
    inferAndAssign(items, shelfLifeEntries, categories);
  }
}, [items, categoryView, categories, shelfLifeEntries, inferAndAssign]);
```

- [ ] **Step 5: Add the toggle button to the header**

Find the existing header JSX:

```typescript
<header className="flex items-center justify-between px-5 h-14 bg-card border-b border-border sticky top-0 z-20">
  <h1 className="text-[20px] font-semibold text-foreground">Fridge Tracker</h1>
  <ShelfLifeDialog
    entries={shelfLifeEntries}
    onUpdateDays={updateDays}
    onAdd={addEntry}
    onDelete={deleteEntry}
  />
</header>
```

Replace with:

```typescript
<header className="flex items-center justify-between px-5 h-14 bg-card border-b border-border sticky top-0 z-20">
  <h1 className="text-[20px] font-semibold text-foreground">Fridge Tracker</h1>
  <div className="flex items-center gap-2">
    <button
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
```

- [ ] **Step 6: Pass new props to ItemList**

Find the existing `<ItemList ... />` call and replace it:

```typescript
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
```

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire category collapse toggle into page header"
```

---

## Verification

1. **Toggle on** — tap the Layers icon; list should collapse into named category sections.
2. **Toggle off** — tap again; items return to flat dnd-kit list, unchanged.
3. **Auto-inference** — items with a matching shelf_life keyword appear in the right category (e.g. "Milk" → Dairy, "Spinach" → Leafy greens). Items with no match appear in "Other".
4. **Long-press move** — hold any item for ~0.5s; bottom sheet appears listing all categories with current one checked. Tap another category; item moves there immediately.
5. **Manual assignment persists** — toggle off and on again; manually moved item stays in its chosen category.
6. **Rename** — tap "Rename" on any category header; type a new name, press Enter; header updates. Shelf life data is unchanged.
7. **New item while category view is on** — add an item; it appears in the correct inferred category without toggling off.
8. **Empty category hidden** — categories with no items in the current zone are not shown.
