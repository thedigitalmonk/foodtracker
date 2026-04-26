# Technology Stack

**Analysis Date:** 2026-04-25

## Languages

**Primary:**
- TypeScript 5 - All source code (`src/`)
- JavaScript (React) - Client-side in components

**Secondary:**
- CSS - TailwindCSS (utility classes)

## Runtime

**Environment:**
- Node.js >=20

**Package Manager:**
- npm (version from package-lock.json)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 14.2.35 - Full-stack React framework
- React 18 - UI library
- TailwindCSS 3.4.1 - Utility-first CSS framework

**Testing:**
- ESLint 8 (with eslint-config-next 14.2.35)

**Build/Dev:**
- TypeScript 5 (compiler)
- PostCSS 8 (CSS processing)
- Next.js built-in build system

## Key Dependencies

**UI Components:**
- @radix-ui/react-dialog 1.1.15 - Accessible dialogs
- @radix-ui/react-label 2.1.8 - Accessible labels
- @radix-ui/react-select 2.2.6 - Accessible selects
- lucide-react 0.460.0 - Icons
- @dnd-kit/core 6.3.1 / @dnd-kit/sortable 10.0.0 - Drag and drop
- class-variance-authority 0.7.1 - Component variants
- tailwindcss-animate 1.0.7 - Animation utilities

**Utilities:**
- tailwind-merge 3.5.0 - Tailwind class merging
- clsx 2.1.1 - Conditional classes
- @zxing/browser 0.1.5 / @zxing/library 0.21.3 - Barcode scanning (ZXing)

**Database:**
- @supabase/supabase-js 2.100.1 - Supabase client

**AI/ML:**
- Anthropic API (Claude Sonnet 4-20250514) via REST - Food image recognition

## Configuration

**Environment:**
- `.env.local` file exists (contains Supabase and Anthropic credentials)
- Use `@/*` path alias mapping to `./src/*`

**Build:**
- `next.config.mjs` - Minimal config (no custom settings)
- `tailwind.config.ts` - Custom theme with shadcn/ui colors
- `postcss.config.mjs` - TailwindCSS processing
- `tsconfig.json` - Strict mode, bundler module resolution
- `.eslintrc.json` - Linting rules

## Platform Requirements

**Development:**
- Node.js >=20
- npm or yarn

**Production:**
- Vercel (detected `vercel.json` file)
- Environment: Edge-compatible (streaming not used)

---

*Stack analysis: 2026-04-25*