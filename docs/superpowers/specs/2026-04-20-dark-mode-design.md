# Dark Mode Design

**Date:** 2026-04-20  
**Status:** Approved

## Overview

Add system-preference-based dark mode to Foodtracker. No manual toggle. The app follows the OS dark/light setting automatically via CSS `prefers-color-scheme`. No JavaScript required.

## Approach

Use Tailwind's `"media"` dark mode strategy. Tailwind applies `dark:` variant classes whenever the OS is in dark mode, with no class toggling needed on `<html>`.

## Changes

### 1. `tailwind.config.ts`

Change:
```ts
darkMode: ["class"]
```
To:
```ts
darkMode: "media"
```

### 2. `src/app/globals.css`

Change the `.dark { ... }` block to a media query:

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* existing dark mode CSS variable values */
  }
}
```

All color values remain unchanged — only the selector changes.

### 3. Color token sweep

Replace hardcoded hex colors throughout the codebase with semantic Tailwind classes that map to the CSS variable system:

| Hardcoded class | Semantic replacement |
|---|---|
| `bg-[#f5f5f5]` | `bg-background` |
| `bg-white` | `bg-card` |
| `border-[#e5e5e5]` | `border-border` |
| `text-[#18181B]` | `text-foreground` |
| `text-[#a3a3a3]`, `text-[#737373]` | `text-muted-foreground` |

Primary location: `src/app/page.tsx`. Also scan `src/components/ui/` for any hardcoded colors.

## Out of Scope

- Manual dark mode toggle
- localStorage preference persistence
- Per-component dark mode overrides
