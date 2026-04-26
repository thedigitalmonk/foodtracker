# Architecture

**Analysis Date:** 2026-04-25

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│                src/app/page.tsx (Home)                      │
├──────────────────┬──────────────────┬───────────────────────┤
│  Zone Tabs        │  ItemList        │   AddItemDialog        │
│  Fridge/Freezer/  │  (items by      │   (create/edit)       │
│  Pantry           │   zone)          │                      │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  React Hooks (State Layer)                   │
│         src/hooks/*                                          │
│  useItems, useShelfLife, useCategories, useCategoryAssignments │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Client                          │
│                src/lib/supabase.ts                          │
│  - items table                                             │
│  - categories table                                        │
│  - shelf_life table                                        │
│  - category_assignments table                               │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  External APIs                                              │
│  /api/recognize-food (Anthropic Claude)                   │
│  Barcode lookup, Shelf life inference                      │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Home (page.tsx) | Main orchestration, zone state, undo logic | `src/app/page.tsx` |
| ItemList | Render items, handle delete/decrement actions | `src/components/item-list.tsx` |
| AddItemDialog | Create/edit items with expiry suggestions | `src/components/add-item-dialog.tsx` |
| useItems | Fetch, add, delete, update food items | `src/hooks/use-items.ts` |
| useShelfLife | Shelf life rules and expiry suggestions | `src/hooks/use-shelf-life.ts` |
| useCategories | Category CRUD operations | `src/hooks/use-categories.ts` |
| useCategoryAssignments | Item-category mapping with inference | `src/hooks/use-category-assignments.ts` |

## Pattern Overview

**Overall:** Next.js App Router + Client-Side Data Fetching + Supabase Backend

**Key Characteristics:**
- All pagesuse `"use client"` for client-side rendering
- State managed via custom React hooks wrapping Supabase calls
- Optimistic UI updates for responsiveness
- Zone-based filtering (Fridge/Freezer/Pantry)
- Category grouping with ML-based inference

## Layers

**UI Layer (src/components/):**
- Purpose: Presentational components and user interactions
- Location: `src/components/`
- Contains: Dialogs, cards, lists, sheets
- Depends on: Hooks (state), Types
- Used by: Page components

**State/Data Layer (src/hooks/):**
- Purpose: Manage application state and database interactions
- Location: `src/hooks/`
- Contains: Custom hooks with Supabase integration
- Depends on: lib/supabase, lib/types
- Used by: Components

**External Services (API Routes):**
- Purpose: Server-side API calls (Anthropic Claude for food recognition)
- Location: `src/app/api/recognize-food/route.ts`
- Called by: AddItemDialog via fetch

**Database Layer (lib/):**
- Purpose: Supabase client and type definitions
- Location: `src/lib/supabase.ts`, `src/lib/types.ts`
- Contains: Client singleton, TypeScript interfaces
- Used by: Hooks

## Data Flow

### Primary Request Path

1. **User opens app** → `page.tsx` loads → Calls `useItems()` hook
2. **useItems effect** → Calls Supabase `items` table → Returns sorted items
3. **Items rendered** → Filtered by active zone → Display in `ItemList`

### Add Item Flow

1. User clicks Add button → `AddItemDialog` opens
2. User fills form, optionally takes photo
3. If photo: POST to `/api/recognize-food` → Claude returns food data
4. User confirms → `addItem()` in useItems hook → Supabase insert
5. Refetch items → UI updates

### Category Inference Flow

1. User toggles category view → `useCategoryAssignments.inferAndAssign()`
2. For each unassigned item → Match against shelf life keywords
3. Auto-assign or prompt user → Store in `category_assignments` table

## Key Abstractions

**Item:**
- Represents a food item in inventory
- Fields: id, name, quantity, zone, expiry_date, created_at
- Examples: `src/lib/types.ts`

**Zone:**
- Type: "Fridge" | "Freezer" | "Pantry"
- Used for filtering and organization

**ShelfLife:**
- Keyword-based expiry suggestions
- Fields: keyword, days, category

## Entry Points

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: User navigates to root URL
- Responsibilities: Zone state, item list rendering, undo logic, category inference

**API Route:**
- Location: `src/app/api/recognize-food/route.ts`
- Triggers: POST request with base64 image
- Responsibilities: Call Anthropic Claude, parse response, return food data

## Architectural Constraints

- **Rendering:** All page components use `"use client"` directive - no server components for main UI
- **Global state:** None - state in individual hooks, lifted to page.tsx
- **Circular imports:** None detected
- **Zone switching:** Swipe gesture support in addition to tap

## Anti-Patterns

### Direct Supabase Calls in Components

**What happens:** UI components directly call Supabase methods
**Why it's wrong:** Tight coupling, harder to test, no optimistic updates
**Do this instead:** Use custom hooks in `src/hooks/` that encapsulate data layer

### Missing Error Boundaries

**What happens:** No React error boundaries for graceful failure handling
**Why it's wrong:** App crashes entirely on runtime errors
**Do this instead:** Add ErrorBoundary components around major sections

## Cross-Cutting Concerns

**Validation:** Zod schemas not used - validation in hooks
**Authentication:** Supabase Auth (not visible in this analysis)
**Logging:** console.error for errors, no structured logging
**Error Handling:** try/catch in hooks with console.error + refetch pattern

---

*Architecture analysis: 2026-04-25*