# AGENTS.md — rules for any AI agent working in this repo

Read this file fully before doing anything. Then read `docs/ARCHITECTURE.md` (how the code is organized) and `docs/ROADMAP.md` (what we're doing now).

## What this project is
Agora (repo name: shemsu) — a sales and inventory tracker for small shops.
Stack: React 18, TypeScript (strict), Vite 5, Tailwind 3, Supabase (Postgres + Auth + RLS), Recharts, lucide-react. Installable as a PWA.

## Commands
- `npm run dev` — dev server on port 3030
- `npm run build` — `tsc && vite build` (this is our main safety check)
- There are no tests or linter yet. Until they exist, "verified" means: `npm run build` passes AND the feature was checked by hand in the browser.

## How we work (always follow this loop)
1. **Discuss first.** For any new feature or page, do NOT write code yet. Ask questions, propose a short plan (files to touch, data needed, edge cases), and wait for my approval.
2. **Build one step at a time.** Only implement the step I approved. If you notice other problems, list them at the end; do not fix them silently.
3. **Verify.** Run `npm run build`. Tell me exactly how to test it by hand (what to click, what should happen).
4. **Update docs.** If you added/moved/removed files, changed the data model, or made an architecture decision, update `docs/ARCHITECTURE.md` in the same change. Tick off the item in `docs/ROADMAP.md`.
5. **Stop and summarize.** List files changed, what to test, and suggest a commit message. Do not start the next step on your own.

## Which file is the source of truth
- `AGENTS.md` (this file) = permanent rules. If anything conflicts with it, this file wins. Only I change it, or you propose a change and I approve.
- `docs/ROADMAP.md` = progress and what to do next. The "Current status" section at the top must always be accurate.
- `docs/specs/<feature>.md` = the plan for one feature. For that feature, follow its spec (as long as it doesn't break the rules here).
- `docs/ARCHITECTURE.md` = how the code is organized right now. Treat it as a map, and if the real code disagrees with it, tell me and fix the doc.

## Progress and updating (do this at the end of every step)
1. Tick the finished item in `docs/ROADMAP.md` and update "Current status" (what's done, what's next, any blockers).
2. If files, tables, or architecture changed, update `docs/ARCHITECTURE.md` (folder map, data model, known issues) and add a dated line to its Decisions log.
3. If a new feature is requested that has no spec yet, create `docs/specs/<feature>.md` from the template in the roadmap and discuss it with me before building.
4. Never edit this file's rules on your own. If you think a rule should change, say so and explain why.

## Adding a feature or scaling up
- New feature: spec first (see above), then build in small steps, each ending with build + hand test + docs update.
- Before adding a new table, page, or dependency, check ARCHITECTURE.md for where it belongs and say where you plan to put it.
- If a file passes ~300 lines or a pattern appears a third time, propose a refactor as its own roadmap step instead of mixing it into feature work.

## Code rules
- Imports use the `@/` alias (maps to `src/`). No long relative paths like `../../..`.
- Folder roles are strict:
  - `src/views/` = one file per page/screen. Keep views thin; move big sections into components.
  - `src/components/<feature>/` = UI pieces for one feature. `components/common/` = reusable, feature-agnostic pieces.
  - `src/services/` = ALL data access (Supabase calls). Components and views never call `supabase` directly.
  - `src/utils/` = pure helper functions (money, dates, revenue math).
  - `src/types/` = shared types. `types/supabase.ts` mirrors the database; update it when the schema changes.
- No `any`. In `catch`, use `unknown` and narrow it. Add types for new data in `src/types/`.
- Money: use `src/utils/currency.ts`. Revenue math: use `src/utils/revenue.ts`. Do not re-implement them.
- Styling: Tailwind classes using the `agora-*` color tokens from `tailwind.config.ts`. Do not hardcode hex colors. Serif headings use `font-serif` (Fraunces). Reuse existing common components (BottomSheet, ListRow, FilterSheet, ListSkeleton) before creating new ones.
- Do not use `alert()` / `confirm()` for new code. Use a modal or bottom sheet.
- Anything that changes several tables at once (sales, refunds, stock) must be a Postgres function (RPC) in `supabase/schema.sql`, not several client-side calls.
- Every new table needs Row Level Security enabled and a policy scoped to the store owner.
- Keep files under ~300 lines. If a file grows past that, propose splitting it.
- Mobile first: check every screen at phone width, then tablet, then desktop.

## Never do
- Never commit `.env` or any key. Only `.env.example` is committed.
- Never add a dependency without asking me and explaining why.
- Never rewrite or reformat files you weren't asked to touch.
- Never delete data, tables, or files without asking.
- Never claim something works unless you ran the build or explained exactly what was and wasn't tested.

## When unsure
Ask me. A short question is cheaper than a wrong 500-line change.
