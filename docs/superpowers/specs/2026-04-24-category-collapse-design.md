# Category Collapse Feature — Design Spec

_Date: 2026-04-24_

---

## Context

The fridge tracker currently shows all items in a flat list per zone (Fridge / Freezer / Pantry). Users want to be able to collapse that list into named category groups — Dairy, Vegetables, Meat, Other, etc. — so related items are easier to scan. Categories can be renamed and items can be moved between them manually. The feature is toggled from the header.

---

## Database Schema

Two new Supabase tables:

### `categories`
```sql
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,       -- display name, user can rename
  source_name text NOT NULL UNIQUE        -- original seeded name, never changes, used for shelf_life matching
);
```
Pre-seeded with the 11 categories already used in `shelf_life.category` (Dairy, Meat, Vegetables, Leafy greens, Berries, Fruit, Herbs, Seafood, Bakery, Deli, Protein) plus one fixed `Other` entry (`source_name = 'Other'`).

`source_name` is immutable — it is never updated, only `name` changes on rename.

### `item_categories`
```sql
CREATE TABLE item_categories (
  item_id     uuid REFERENCES items(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_manual   boolean NOT NULL DEFAULT false,
  PRIMARY KEY (item_id)
);
```
- One row per item (item_id is the PK — an item belongs to exactly one category at a time).
- `is_manual = false` → auto-inferred from shelf_life keyword match, can be re-inferred.
- `is_manual = true` → user moved this item; never auto-overwritten.

---

## Auto-Inference

When the category view is first enabled (or a new item has no `item_categories` row), the app infers the category:

1. Take the item's `name` (lowercased).
2. Search `shelf_life` rows for a keyword that is a substring of the item name (same logic as `suggestExpiryDate` in `use-shelf-life.ts`).
3. If a match is found, look up the `categories` row where `source_name = shelf_life.category`. This survives renames since `source_name` never changes.
4. Insert a row in `item_categories` with `is_manual = false`.
5. If no match → assign to the `Other` category with `is_manual = false`.

Auto-infer runs once per item (on first toggle or on item creation while category view is active). It does not re-run for items with `is_manual = true`.

---

## UI

### Header Button

A grid/layers icon button placed to the **left** of the existing settings (⚙) icon. Tapping toggles category view on/off. Active state uses a filled/highlighted icon to indicate the mode is on.

### Category View Layout

Accordion sections, one per category. Categories with no items are hidden.

Each section header shows:
- Chevron (▶ collapsed / ▼ expanded)
- Category name
- Item count badge
- Inline rename: tapping the category name puts it into an inline text input; pressing Enter or blurring saves.

Tapping the chevron or header row (outside the name) expands/collapses that section. Default: all sections expanded on first open.

Items within a section render identically to the normal `ItemCard`. Existing expiry status colors and layouts are preserved.

### Moving Items — Long-Press Bottom Sheet

Long-pressing any item card in category view opens a bottom sheet:
- Title: `Move "[item name]" to…`
- A scrollable list of all categories
- Current category is highlighted with a checkmark
- Tapping a different category reassigns the item: updates `item_categories` row, sets `is_manual = true`
- Tapping the current category or closing the sheet does nothing

### Rename

Tapping a category name activates an inline `<input>` in place. On save:
- Updates `categories.name` in Supabase
- Re-renders the header immediately (optimistic update)
- Does **not** affect `shelf_life` rows — those continue to store their original category string

### "Other" Category

Behaves like any other category — can be renamed, items can be moved in or out. Its `id` in the DB is fixed; its `name` can change via rename.

---

## State & Data Flow

- New hook `useCategories()` — fetches `categories` table, exposes rename mutation.
- New hook `useCategoryAssignments(zone)` — fetches `item_categories` joined with `categories` for the active zone. Exposes `assignCategory(itemId, categoryId)`.
- `page.tsx` gains a `categoryView: boolean` toggle state.
- When `categoryView = true`, render a new `CategorySection` component instead of `ZoneSection`.
- Drag-and-drop (dnd-kit) is **disabled** in category view; long-press handles reordering instead.

---

## Out of Scope

- Creating new categories (only rename existing ones; new categories emerge from shelf_life data or seeding)
- Deleting categories
- Category view on Freezer / Pantry (same logic applies, no extra work needed — zone filter already passes through)
- Re-ordering categories

---

## Verification

1. Toggle the category button — list should collapse into category groups.
2. Toggle again — list returns to normal flat view, unchanged.
3. Add a new item while category view is on — it should appear in the correct category immediately.
4. Long-press an item → bottom sheet appears → tap a different category → item moves.
5. Rename a category → name updates everywhere, shelf_life data untouched.
6. Item with no shelf_life keyword match → appears in "Other".
7. Manually moved item (`is_manual = true`) is not re-inferred on re-toggle.
