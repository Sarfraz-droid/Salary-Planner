# Gareeb Budget

A local-first, mobile-first salary budget planner. React + Tailwind v4 + shadcn/ui-style components (Radix).

- **Local-first**: the budget lives in `localStorage`; no backend, no account.
- **Smart add**: type "swiggy 450" and it fills name, amount, bucket and icon. Optional on-device AI (MiniLM via transformers.js, ~25 MB, runs in the browser) handles names keywords miss.
- **Auto-balance**: lock fixed items; the rest flex so the plan always fits your salary.
- **Trip planner**: plan trips with a budget, dates and costs by category.
- **Share link**: the plan is compressed into the URL fragment (`#/s/…`), so it is never sent to a server. Recipients get a read-only snapshot and can "Save a copy".
- **Design system "Paisa"**: OKLCH tokens in `src/index.css` (monochrome black & white; buckets are told apart by lightness), light + dark.

```
npm install
npm run dev
npm run build
```
