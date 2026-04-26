# Codebase Concerns

**Analysis Date:** 2026-04-25

## Authentication & Authorization

### No Authentication Layer

**Issue:** The application has no authentication or authorization system.
- Files: `src/lib/supabase.ts`, `src/hooks/use-items.ts`, `src/hooks/use-shelf-life.ts`, `src/hooks/use-categories.ts`, `src/hooks/use-category-assignments.ts`
- Impact: Anyone with the Supabase URL and anon key can access the entire database. Data is completely exposed.
- Current mitigation: Depends on Supabase's anonymous access configured at the database level
- Risk: High — no access control, no user isolation, no audit trail for who did what

**Fix approach:** Implement Supabase Auth (email/password or OAuth) and add Row Level Security (RLS) policies to all tables (`items`, `shelf_life`, `categories`, `category_assignments`). Require authenticated sessions via middleware.

### Anonymous Supabase Client

**Issue:** Client uses anon key directly without user context.
- Files: `src/lib/supabase.ts` (lines 5-12)
- Impact: Cannot distinguish between different users; all data operations are anonymous
- Risk: High — no user isolation, data visible to anyone with the app

**Fix approach:** Initialize Supabase client with session from Supabase Auth. Use `createClient` with `auth` options and handle session state in React context.

## Data Handling

### No Input Validation

**Issue:** User-provided fields (`name`, `quantity`, `zone`, `expiry_date`) are inserted directly without validation.
- Files: `src/hooks/use-items.ts` (lines 31-41), `src/components/add-item-dialog.tsx` (lines 123-148)
- Risk: Medium — malformed data could cause runtime errors; no length limits on text fields
- Current mitigation: TypeScript types provide some compile-time checking

**Fix approach:** Add server-side validation in Supabase (CHECK constraints, NOT NULL where appropriate). Add client-side validation for UX feedback before submission.

### No Error Boundaries

**Issue:** No React error boundaries to catch and handle runtime errors gracefully.
- Files: Missing feature
- Risk: Medium — a single component error could crash the entire app

**Fix approach:** Add error boundary components around main feature areas. Provide fallback UI for failures.

## API & External Integrations

### Unprotected API Route

**Issue:** `/api/recognize-food` endpoint has no authentication check.
- Files: `src/app/api/recognize-food/route.ts` (lines 16-102)
- Risk: Medium — could be abused by external actors to consume ANTHROPIC_API_KEY quota
- Current mitigation: API key is server-side only (not exposed to client)

**Fix approach:** Add rate limiting (e.g., Vercel Edge Functions or Upstash Redis). Consider adding a simple secret token in the request header.

### API Key Non-Validation

**Issue:** API key is accessed via `process.env.ANTHROPIC_API_KEY` but not validated on startup.
- Files: `src/app/api/recognize-food/route.ts` (line 17)
- Risk: Low — returns 500 error if missing, but doesn't fail fast

**Fix approach:** Add startup validation in a configuration module that throws if required env vars are missing.

## Technical Debt

### No Database Migrations

**Issue:** No migration files or schema versioning system.
- Files: Missing — relies on manual Supabase dashboard changes
- Risk: Medium — schema changes aren't tracked version control; hard to replicate environment

**Fix approach:** Use Supabase CLI with migration files stored in `supabase/migrations/`. Track schema changes in git.

### No Test Coverage

**Issue:** No test files detected in the project.
- Files: Missing — no `*.test.*` or `*.spec.*` files
- Risk: High — any refactoring or database change could break functionality silently
- Current mitigation: None

**Fix approach:** Add unit tests for utility functions (`src/lib/utils.ts`, `src/lib/food-recognition.ts`, `src/lib/barcode-lookup.ts`). Add integration tests for hooks and API routes. Use Vitest or Jest.

### No Linting Enforcement

**Issue:** Linting is defined but not enforced on CI or pre-commit.
- Files: `package.json` (line 12: `"lint": "next lint"`)
- Risk: Low — code style issues could accumulate

**Fix approach:** Add lint check to CI pipeline. Consider adding pre-commit hooks with `lint-staged`.

### Singleton Supabase Client (Global State)

**Issue:** Supabase client stored in module-level variable `_supabase`.
- Files: `src/lib/supabase.ts` (line 3)
- Risk: Low — works in Next.js but could cause issues with hot module replacement or serverless cold starts

**Fix approach:** Use `useEffect` + React context for client lifecycle, or accept singleton pattern (fine for this use case).

## Security Considerations

### Exposed Environment Configuration

**Issue:** `.env.local` exists (known from earlier exploration) containing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Files: `.env.local`
- Risk: Anonymous key is exposed to client — fine if RLS policies are configured
- Note: Never commit `.env.local` to git (verify `.gitignore`)

### No Rate Limiting on External API

**Issue:** No rate limiting on `/api/recognize-food` endpoint.
- Files: `src/app/api/recognize-food/route.ts`
- Risk: Medium — could exhaust Anthropic API credits if abused

**Fix approach:** Add rate limiting via Vercel Edge Functions or external service.

## Fragile Areas

### Category Inference Runs on Every Render

**Issue:** Category inference logic could trigger excessive API calls.
- Files: `src/app/page.tsx` (lines 105-124)
- Risk: Medium — uses `inferringRef` guard but inference runs on every item add
- Current mitigation: Has debounce-like guard

**Fix approach:** Add debouncing to prevent rapid successive calls. Cache inference results.

### Food Recognition Error Handling

**Issue:** Food recognition failures simply show error messages but don't log details for debugging.
- Files: `src/components/add-item-dialog.tsx` (lines 195-203), `src/app/api/recognize-food/route.ts` (lines 100-101)
- Risk: Low — poor observability for debugging real issues

**Fix approach:** Log structured errors to an observability service (e.g., Sentry) for production debugging.

## Missing Critical Features

### No Offline Support

**Problem:** App requires constant network connection to Supabase.
- Blocks: Ability to view/add items without internet
- Priority: Low for personal use app

### No Data Export

**Problem:** No way to export food inventory data.
- Blocks: Backup, migration, or analysis
- Priority: Low

### No Push Notifications

**Problem:** No notification for expiring items.
- Blocks: Proactive item expiration alerts
- Priority: Low

## Test Coverage Gaps

| Area | What's Not Tested | Risk |
|------|------------------|------|
| All hooks | `use-items`, `use-shelf-life`, `use-categories`, `use-category-assignments` | High — core data logic untested |
| API route | `/api/recognize-food` | High — external integration untested |
| Utils | `expiryDateFromDays`, `addDaysToToday`, `cn` | Medium — utility functions untested |
| Barcode lookup | `barcode-lookup.ts` | Medium — external API call untested |
| Food recognition | `food-recognition.ts` | Medium — image processing untested |

---

*Concerns audit: 2026-04-25*