# Testing Patterns

**Analysis Date:** 2026-04-25

## Test Framework

**Status:** No testing framework detected

The project does not currently have a test framework configured or test files implemented.

## Current Project State

**Test Infrastructure:**
- No `jest.config.*`, `vitest.config.*`, or other test configs present
- No `*.test.*` or `*.spec.*` files found
- No `test/` or `__tests__/` directories
- No testing dependencies in `package.json`

## Dependencies Present

```json
"devDependencies": {
  "@types/node": "^20",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "eslint": "^8",
  "eslint-config-next": "14.2.35",
  "postcss": "^8",
  "tailwindcss": "^3.4.1",
  "typescript": "^5"
}
```

**Notable:** No testing library (`@testing-library/react`, `jest`, `vitest`, `playwright`, `cypress`, etc.)

## Recommendation

To implement testing, add:

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
```

Then create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
  },
})
```

## Test File Organization

**Recommended patterns based on codebase structure:**

1. **Co-located tests:** `src/components/ItemCard.test.tsx`
2. **Hooks tests:** `src/hooks/use-items.test.ts`
3. **Utils tests:** `src/lib/utils.test.ts`

## What to Test

**Priority areas identified from codebase:**

| Component | Test Focus | Location |
|-----------|------------|----------|
| `utils.ts` | `getExpiryStatus`, `formatDate`, `addDaysToToday`, `cn` | `src/lib/` |
| `types.ts` | Type definitions | `src/lib/` |
| `use-items.ts` | CRUD operations (mock Supabase) | `src/hooks/` |
| `use-shelf-life.ts` | Shelf life matching logic | `src/hooks/` |
| `ItemCard` | Expiry status display, delete flow | `src/components/` |

## Mocking Strategy

**Supabase client:** Mock `getSupabase()` calls in hooks tests

```typescript
// Example mock setup
vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ error: null }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
  }),
}))
```

**Lucide icons:** Mock individual icon imports

```typescript
vi.mock('lucide-react', async (importOriginal) => {
  const icons = await importOriginal<typeof import('lucide-react')>()
  return {
    ...icons,
    Check: vi.fn(),
    Plus: vi.fn(),
  }
})
```

---

*Testing analysis: 2026-04-25*