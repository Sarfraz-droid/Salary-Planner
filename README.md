# Gareeb Budget

A local-first, mobile-first salary budget planner. React + Tailwind v4 + shadcn/ui-style components (Radix).

- **Local-first**: the budget lives in `localStorage`; no backend, no account.
- **Trip planner**: plan trips with a budget, dates and costs by category, and see how much to save per month.
- **Share link**: the plan is compressed into the URL fragment (`#/s/…`), so it is never sent to a server. Recipients get a read-only snapshot and can "Save a copy".
- **Design system "Paisa"**: OKLCH tokens in `src/index.css` (monochrome black & white; buckets are told apart by lightness), light + dark.

```
npm install
npm run dev
npm run build
```
