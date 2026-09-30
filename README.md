# Gareeb Budget

A local-first, mobile-first salary budget planner. React + Tailwind v4 + shadcn/ui-style components (Radix).

- **Local-first**: the budget lives in `localStorage`; no backend, no account.
- **Share link**: the plan is compressed into the URL fragment (`#/s/…`), so it is never sent to a server. Recipients get a read-only snapshot and can "Save a copy".
- **Design system "Paisa"**: OKLCH tokens in `src/index.css` (paper surfaces, money-green primary, saffron accent, needs/wants/savings bucket colors), light + dark.

```
npm install
npm run dev
npm run build
```
