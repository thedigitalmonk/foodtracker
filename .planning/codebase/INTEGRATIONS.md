# External Integrations

**Analysis Date:** 2026-04-25

## APIs & External Services

**AI/ML Food Recognition:**
- Anthropic Claude API - Food identification from images
  - Endpoint: `https://api.anthropic.com/v1/messages`
  - Model: `claude-sonnet-4-6` (2025-05-14)
  - Auth: `ANTHROPIC_API_KEY` env var
  - Usage: `src/app/api/recognize-food/route.ts` - POST endpoint receives base64 image, returns JSON with food name, category, quantity, shelf life

**Barcode Lookup:**
- Open Food Facts API - Free, open product database
  - Endpoint: `https://world.openfoodfacts.org/api/v0/product/{barcode}.json`
  - Auth: None (User-Agent header required: `FoodTracker/1.0`)
  - Usage: `src/lib/barcode-lookup.ts` - `lookupBarcode()` function returns product name

## Data Storage

**Database:**
- Supabase (PostgreSQL)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` env var
  - Client: `@supabase/supabase-js` v2.100.1
  - Auth: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anonymous key)
  - Implementation: `src/lib/supabase.ts` - Singleton client with lazy initialization

**File Storage:**
- Supabase Storage (implied by Supabase usage)

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (implied)
  - Implementation: Supabase client handles auth via anonymous key
  - No custom auth implementation detected

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry, LogRocket, etc.)

**Logs:**
- Console logging via `console.error`
  - Example: `src/app/api/recognize-food/route.ts:74`

## CI/CD & Deployment

**Hosting:**
- Vercel (detected `vercel.json`)

**CI Pipeline:**
- Not detected in repository (no GitHub Actions config)

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `ANTHROPIC_API_KEY` - Anthropic API key for food recognition

**Secrets location:**
- `.env.local` file (gitignored)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2026-04-25*