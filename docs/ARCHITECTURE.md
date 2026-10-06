# ARCHITECTURE.md — how this codebase is organized

Last reviewed: 2026-10-06. Agents: update this file whenever structure, data model, or decisions change.

## Stack
React 18 + TypeScript (strict) + Vite 5 + Tailwind 3 + Supabase (Postgres, Auth, RLS) + Recharts + lucide-react. PWA via `public/sw.js` and `public/manifest.json`.

## Folder map
```
src/
  main.tsx            App entry
  App.tsx             Top-level flow + hash-based navigation (no router library)
  globals.css         CSS variables, .font-serif, .ledger-card, .ledger-row
  context/
    AuthContext.tsx   Session, user, store; sign in/up/out; local mock mode for dev
  views/              One file per screen
    LandingView       Public marketing page (685 lines, needs splitting)
    AuthView          Login / signup
    OnboardingView    First-time store setup (demo catalog or empty)
    SellView          Register: product grid, cart, checkout
    InventoryView     Product list, add/edit, restock
    SalesView         Sales history, refunds, voids
    AuditView         Stock movement / activity log
    AnalyticsView     Charts and metrics
  components/
    common/           BottomSheet, FilterSheet, ListRow, ListSkeleton, ProductAvatar, ImagePlaceholder
    navigation/       Navbar (also exports Sidebar), AgoraLogo
    pos/              ProductTile, CartDrawer, CheckoutModal
    inventory/        AddEditProductModal, RestockModal
    sales/            SaleDetailModal, VoidSaleModal
    reports/          RegisterClosureModal
    analytics/        DrilldownModal
    settings/         SettingsModal
  services/api.ts     The ONE data layer: a single `api` object (about 1,100 lines)
  lib/supabase.ts     Supabase client + isSupabaseConfigured()
  lib/seed.ts         Demo catalog products
  types/              index.ts (app types), supabase.ts (DB types)
  utils/              currency.ts, formatters.ts, revenue.ts
supabase/schema.sql   Tables, RLS policies, and RPC functions (run in Supabase SQL editor)
public/               sw.js, manifest.json, icons
```

## How the app flows
`App.tsx` decides what to render, in order:
1. loading → spinner
2. no user → `LandingView`, or `AuthView` if the URL hash is `#login` / `#signup`
3. user but no store → `OnboardingView`
4. user + store → app shell (Navbar + Sidebar) showing the tab from the URL hash: `#sell`, `#inventory`, `#sales`, `#audit`, `#analytics`

## Data model (Supabase)
Tables: `stores`, `custom_attribute_definitions`, `products`, `sales`, `sale_payments`, `sale_items`, `refunds`, `register_closures`, `stock_movements`.
- One owner per store (`stores.owner_user_id`). RLS is enabled on every table; policies restrict rows to the store owner via `is_store_owner()`.
- Multi-step operations are atomic Postgres functions: `create_sale_transaction`, `process_refund_transaction`, `void_sale_transaction`, `close_register_transaction`. Call them via `supabase.rpc` from `services/api.ts`.

## Data access
- Views call `api.*` methods. Only `services/api.ts` talks to Supabase.
- `api.ts` also contains pure analytics helpers (`getMetricTrends`, `getRevenueTrendData`, `getHourlySalesData`, `getStockHealthData`, `getSmartRestockSuggestions`, `getTopFavorites`) and `seedDemo`.

## Local mock mode
If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing, `AuthContext` and `api.ts` fall back to `localStorage`. This is blocked in production mode. Some `api.ts` methods also fall back to localStorage when a Supabase call fails (see Known issues).

## Design system
Tokens live in `tailwind.config.ts` under `agora.*` (bg, card, border, ink, terracotta, brass, sage, brick, gold). Fonts: Fraunces (serif headings), Inter (body). Shared look classes: `.ledger-card`, `.ledger-row`.

## Known issues (cleanup candidates, roughly by priority)
1. `services/api.ts` is one 1,100+ line file mixing Supabase queries, localStorage fallbacks, analytics math, and seeding.
2. On Supabase errors some methods silently return localStorage data, which can hide real failures and show wrong data.
3. Dual real/mock mode adds about 17 `isSupabaseConfigured()` branches in `api.ts` plus more in `AuthContext`. Decide: keep as a dev-only mode or remove.
4. About 17 uses of `any`; about 18 `alert()` / `confirm()` calls.
5. Hand-rolled hash navigation in `App.tsx`; a `landing` tab also exists inside the logged-in app. Production bundle is one 962 kB JS file (no code splitting).
6. `LandingView.tsx` is 685 lines in one file; the large views (Sell, Inventory, Analytics, Sales) are 450–510 lines each and load their own data inline.
7. `Navbar.tsx` calls `api.seedDemo()` (data logic inside a navigation component).
8. Repo hygiene: `tsconfig.tsbuildinfo` is committed though ignored; `.babelrc` references `next/babel` but this is a Vite project; no README, tests, linter, or formatter.
9. Naming: standardized product name to "Agora", package to "agora", and localStorage keys to "agora_*" (with legacy key fallback).
10. `index.html`: `user-scalable=no` blocks pinch-zoom (accessibility); canonical/OG URLs and image are placeholders.
11. Minor: `is_store_owner()` is `SECURITY DEFINER` without a fixed `search_path`.

## Decisions log
- 2026-10-06: A1 repo hygiene — untracked tsconfig.tsbuildinfo from git, removed unused .babelrc, and added project README.md.
- 2026-10-06: A2 naming — standardized product name to "Agora", package name to "agora", and local storage keys to "agora_*" (with automatic fallback migration for legacy shemsu_* keys).
