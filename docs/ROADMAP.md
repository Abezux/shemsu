# ROADMAP.md — what we're doing, in order

Rule: one step at a time. Discuss → plan → approve → build → verify → update docs → commit. Tick a box only after `npm run build` passes and the step was checked by hand.

## Current status (agents: keep this accurate after every step)
- Last updated: 2026-10-06
- Done: Phases 1–14 of original build; A1 (Repo hygiene: removed tsconfig.tsbuildinfo & .babelrc from git, added README.md).
- In progress: nothing yet
- Next: A2
- Blockers / questions for the owner: none

## Phase A — Clean foundation (do before new features)
- [x] A1. Repo hygiene: remove `tsconfig.tsbuildinfo` from git, delete `.babelrc`, add `README.md` (setup, env vars, Supabase schema steps, commands)
- [ ] A2. Decide the naming: one product name and one package name; update `package.json`, `manifest.json`, `index.html`, localStorage keys
- [ ] A3. Decide on local mock mode: keep as dev-only or remove it; remove silent localStorage fallback on Supabase errors (show an error state instead)
- [ ] A4. Split `services/api.ts` by domain (products, sales, settings, register, analytics helpers) with no behavior change; keep the build green after each split
- [ ] A5. Replace `any` with real types; replace `alert()` / `confirm()` with a modal or bottom sheet
- [ ] A6. Move `seedDemo` out of `Navbar.tsx`
- [ ] A7. Add ESLint + Prettier, then a small test setup (Vitest) covering `utils/revenue.ts` and `utils/currency.ts`
- [ ] A8. Navigation: replace the hand-rolled hash handling with a proper router; remove the `landing` tab from the logged-in app
- [ ] A9. Code splitting: lazy-load views so the first load is smaller
- [ ] A10. `index.html`: allow zoom, set real canonical / OG values (or remove them until a domain exists)

## Phase B — Landing page (restart cleanly)
- [ ] B1. Discuss: who it's for, the one main message, the single call to action, what proof or screenshots exist
- [ ] B2. Write the page outline (sections in order) and approve it
- [ ] B3. Split `LandingView.tsx` into section components under `src/components/landing/`
- [ ] B4. Build section by section on mobile first; review each before moving on
- [ ] B5. Polish: accessibility, reduced motion, performance, real metadata

## Phase C — Features
(Add each feature as a short spec using the template below, then build it one step at a time.)

## Feature spec template
Copy this into `docs/specs/<feature-name>.md` before building anything.
```
# Feature: <name>
Goal: one or two sentences — what the user can do after this ships
Who uses it:
Screens / files likely touched:
Data needed (new tables or columns? new RPC?):
Edge cases:
Out of scope:
Done when: (a checklist someone can test by hand)
Open questions:
```
