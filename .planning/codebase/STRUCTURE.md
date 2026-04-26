# Codebase Structure

**Analysis Date:** 2026-04-25

## Directory Layout

```
foodtracker/
├── src/
│   ├── app/              # Next.js App Router pages and API
│   ├── components/       # React UI components
│   ├── hooks/           # Custom React hooks (state/data)
│   └── lib/             # Utilities, types, client
├── supabase/             # Database migrations
├── public/              # Static assets (none in this repo)
├── docs/                # Documentation
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

## Directory Purposes

**src/app/ - Next.js App Router:**
- Purpose: Pages, layouts, API routes, static assets
- Contains: page.tsx, layout.tsx, api routes, fonts, icons
- Key files:
  - `src/app/page.tsx` - Main home page
  - `src/app/layout.tsx` - Root layout
  - `src/app/api/recognize-food/route.ts` - Food recognition API

**src/components/ - UI Components:**
- Purpose: Reusable React components
- Contains: Feature components, UI primitives
- Key files:
  - `src/components/add-item-dialog.tsx` - Add/edit item modal
  - `src/components/item-list.tsx` - Item list renderer
  - `src/components/category-section.tsx` - Category grouping view
  - `src/components/ui/` - Primitive UI components (button, dialog, input, select)

**src/hooks/ - Custom Hooks:**
- Purpose: State management and data fetching
- Contains: Data hooks wrapping Supabase, business logic
- Key files:
  - `src/hooks/use-items.ts` - Items CRUD
  - `src/hooks/use-categories.ts` - Category management
  - `src/hooks/use-shelf-life.ts` - Shelf life rules
  - `src/hooks/use-category-assignments.ts` - Item-category mapping

**src/lib/ - Utilities:**
- Purpose: Type definitions, third-party clients, helpers
- Contains: Types, Supabase client, utility functions
- Key files:
  - `src/lib/types.ts` - TypeScript interfaces
  - `src/lib/supabase.ts` - Supabase client singleton
  - `src/lib/utils.ts` - Utility functions (cn, date formatting)
  - `src/lib/food-recognition.ts` - Food recognition logic
  - `src/lib/barcode-lookup.ts` - Barcode lookup helpers

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Main home page with zone tabs and item list
- `src/app/layout.tsx`: Root layout with fonts and metadata

**Configuration:**
- `package.json`: Dependencies and scripts
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `next.config.mjs`: Next.js configuration

**Database:**
- `supabase/schema.sql`: Database schema
- `supabase/migrations/`: SQL migrations

## Naming Conventions

**Files:**
- camelCase with hyphens: `use-items.ts`, `add-item-dialog.tsx`, `category-section.tsx`
- Component files: PascalCase: `ItemList.tsx`, `AddItemDialog.tsx` (when not using default export)
- Hooks: use-* pattern: `use-items.ts`, `use-categories.ts`

**Directories:**
- Lowercase: `components/`, `hooks/`, `lib/`, `app/`

**Types:**
- PascalCase interfaces: `Item`, `ShelfLife`, `Category`, `Assignment`
- Union types: lowercase: `Zone = "Fridge" | "Freezer" | "Pantry"`

## Where to Add New Code

**New Feature Component:**
- Implementation: `src/components/new-feature.tsx`
- Tests: Not detected (jest/vitest not configured)
- Add to `src/components/index.ts` if barrel file created

**New Hook:**
- Implementation: `src/hooks/use-new-hook.ts`
- Depends on: `src/lib/supabase.ts`, `src/lib/types.ts`

**New API Route:**
- Implementation: `src/app/api/feature-name/route.ts`
- Uses: Next.js Route Handlers

**New Types:**
- Add to: `src/lib/types.ts`
- Export for use in hooks and components

**New Utility:**
- Add to: `src/lib/utils.ts`
- Or create new file in `src/lib/` if substantial

## Special Directories

**src/components/ui/ - Primitive Components:**
- Purpose: Reusable base UI components (button, dialog, input, select)
- Generated: No (custom implementation)
- Committed: Yes

**src/app/api/ - API Routes:**
- Purpose: Server-side endpoints
- Contains: recognize-food route

**supabase/ - Database:**
- Purpose: Schema and migrations
- Generated: Via `supabase db push`
- Committed: Yes

---

*Structure analysis: 2026-04-25*