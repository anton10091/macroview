# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

**MacroView** is a Next.js 16 (App Router) macro-economic analytics platform for investors, currently covering Thailand. The UI is in Russian. All pages are `'use client'` components using inline styles (no CSS modules or Tailwind).

### Route structure

- `/` — homepage with country cards grid (`app/page.js`)
- `/thailand` — full Thailand macro analysis page with tabbed sections (`app/thailand/page.js`)
- `/thailand/diary` — Thailand investment diary, paginated list fetched from Supabase (`app/thailand/diary/page.js`)
- `/thailand/diary/[id]` — individual diary entry page with prev/next navigation (`app/thailand/diary/[id]/page.js`)

### Key patterns

**Data fetching on Thailand page** (`/thailand`): Live GDP and inflation data is fetched from the World Bank API (`api.worldbank.org`). Static values (interest rate, real estate yield, P/E ratio, etc.) are hardcoded in a `STATIC` object. Falls back to hardcoded historical data on fetch error.

**Investment rating algorithm** (`app/thailand/page.js`): Three scoring functions — `calcMacroScore`, `calcRealEstateScore`, `calcEquityScore` — produce normalized 0–1 scores. The final rating is a weighted average (macro 30%, real estate 35%, equity 35%) mapped to "Позитивно / Нейтрально / Осторожно".

**Supabase** (`app/lib/supabase.js`): Single shared client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The diary reads from a `diary_entries` table with columns: `id`, `title`, `emoji`, `date`, `excerpt`, `text`, `tags`, `priority`, `color`, `bg`, `source`, `source_url`, `published`, `created_at`.

**Navigation**: Two separate nav components exist — `app/components/Nav.js` (used on `/` and `/thailand`) and an inline `Navbar` component defined locally inside the diary pages. The diary pages also include an inline `LiveTicker` scrolling bar.

**Charts**: Recharts library (`AreaChart`, `LineChart`, `BarChart`) with a shared custom `TT` tooltip component inline in each file.

### Environment variables

Create a `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
