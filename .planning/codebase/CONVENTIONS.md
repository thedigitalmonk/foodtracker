# Coding Conventions

**Analysis Date:** 2026-04-25

## Naming Patterns

**Files:**
- PascalCase for React components: `CategorySection.tsx`, `ItemCard.tsx`
- kebab-case for utility files: `food-recognition.ts`, `barcode-lookup.ts`
- `use-` prefix for custom hooks: `use-items.ts`, `use-shelf-life.ts`, `use-categories.ts`

**Functions:**
- camelCase for functions and methods: `fetchItems`, `addItem`, `deleteItem`
- PascalCase for React components: `CategorySection`, `ItemCard`
- Verb-prefixed for mutation operations: `addItem`, `deleteItem`, `updateItem`
- `get` prefix for data retrieval: `getExpiryStatus`, `formatDate`

**Variables:**
- camelCase: `items`, `loading`, `expiryDate`
- PascalCase for TypeScript interfaces: `Item`, `Category`, `ShelfLife`
- Uppercase for constants: `ZONES` array (`["Fridge", "Freezer", "Pantry"]`)

**Types:**
- PascalCase interfaces: `Item`, `Category`, `ShelfLife`, `Assignment`
- PascalCase types: `ExpiryStatus` (union type: `"expired" | "expiring-soon" | "ok" | "no-date"`)

## Code Style

**Formatting:**
- Tool: ESLint (extends `next/core-web-vitals`, `next/typescript`)
- No Prettier config detected — ESLint formatting only

**TypeScript:**
- Strict mode enabled in `tsconfig.json`
- Explicit return types for async functions (e.g., `Promise<boolean>`)
- Omit pattern for create/update payloads: `Omit<Item, "id" | "created_at">`

**Imports:**
- Path alias: `@/*` maps to `./src/*`
- React imports: `"use client"` directive on all client components
- Named imports from `lucide-react` for icons
- Type imports where applicable

**Order:**
1. `"use client"` directive
2. React/internal imports
3. Third-party library imports (Radix UI, dnd-kit, etc.)
4. Local `@/` imports

## Component Patterns

**Function Components:**
```typescript
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // implementation
}
```

**Props Interface:**
```typescript
interface ComponentNameProps {
  prop1: Type;
  prop2: Type;
  onEvent: (arg: Type) => void;
}
```

**State Management:**
- `useState` for local component state
- `useRef` for DOM refs and timers
- Custom hooks (`use-*.ts`) for data fetching and business logic
- No global state management library detected

## Hook Patterns

**Data Fetching Hook (e.g., `use-items.ts`):**
```typescript
export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    // Supabase query
    // error handling with console.error
    // setItems(data ?? [])
    // setLoading(false)
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // CRUD operations with error handling
  const addItem = async (...): Promise<boolean> => { ... };
  const deleteItem = async (id: string) => { ... };
  const updateItem = async (...): Promise<boolean> => { ... };

  return { items, loading, addItem, deleteItem, updateItem };
}
```

## Error Handling

- Console error logging: `console.error("Error fetching items:", error)`
- Early returns on errors in async functions
- Boolean return for operations: `Promise<boolean>` for success/failure
- No custom error types detected

## CSS/Tailwind Patterns

- Tailwind CSS with custom color variables (`--border`, `--foreground`, etc.)
- CSS-in-JS not used — inline Tailwind classes only
- `cn()` utility for conditional classes (clsx + tailwind-merge)
- Design tokens from shadcn/ui pattern:
  - `text-[14px]`, `text-[15px]` for font sizes
  - `h-10`, `h-11` for heights
  - `rounded-lg`, `rounded-full` for radius
  - `gap-2`, `gap-3` for spacing
  - `px-4`, `py-3` for padding

**Color Usage:**
- `text-foreground`, `text-muted-foreground` for text
- `bg-primary`, `bg-destructive` for backgrounds
- `border-border` for borders
- Dark mode via `dark:` prefix (e.g., `dark:bg-amber-950/30`)

## React Patterns

**Client Components:**
- `"use client"` directive on all interactive components
- No React Server Components used

**Refs:**
- `useRef` for timer management (long press, debounce)
- `useRef` for DOM element access

**Effects:**
- `useEffect` with dependency arrays
- eslint-disable comments for known false positives: `// eslint-disable-line react-hooks/exhaustive-deps`

## API Patterns

**Route Handlers:**
- Location: `src/app/api/[endpoint]/route.ts`
- Standard Request/Response handling
- Error responses with status codes

**Utilities:**
- Shared utilities in `src/lib/utils.ts`
- Type utilities in `src/lib/types.ts`

---

*Convention analysis: 2026-04-25*