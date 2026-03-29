# Fridge Tracker

A simple, mobile-first app for tracking what's in your fridge, freezer, and pantry. Built for 2 people sharing a bookmarked URL — no login required.

## Features

- **Add items** with name, quantity, zone (Fridge/Freezer/Pantry), and optional expiry date
- **Auto-suggest expiry dates** for perishable items (e.g. milk → 10 days, chicken → 2 days)
- **Editable shelf life table** — customize default expiry days for any item via the settings gear
- **Expiry highlighting** — amber for expiring within 3 days, red for expired
- **Running low** — tap "Low" to share an item to your Reminders app (uses native share sheet)
- **Single-tap delete** — tap "Used" to remove an item instantly

## Tech Stack

- Next.js 14 (App Router)
- shadcn/ui (Radix + Tailwind)
- Supabase (Postgres database)

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the **SQL Editor** in your Supabase dashboard
3. Copy the contents of `supabase/schema.sql` and run it — this creates the `items` and `shelf_life` tables with seed data
4. Go to **Settings → Data API** (or click **Connect** at the top) and copy your **Project URL** and **Publishable (anon) key**

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key-here
```

### 3. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create foodtracker --public --push
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New → Project**
2. Import your GitHub repository
3. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase publishable key
4. Click **Deploy**

### 3. Share the URL

Bookmark the Vercel URL on both phones. No login needed — both users share the same database.

## Customizing Shelf Life Defaults

Tap the gear icon in the header to open the shelf life settings. You can:

- **Edit** the number of days for any item (e.g. change milk from 10 to 14 days)
- **Add** new keywords with a default shelf life
- **Delete** entries you don't need

Changes are saved to the database immediately and shared between users.
