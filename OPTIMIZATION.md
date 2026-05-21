# McToken site optimization notes

This repo was tuned for **speed and cleanliness** without changing how the site looks. Use this doc when asking for more work in Cursor or with another developer.

## What was already done

| Phase | Focus | Result |
|-------|--------|--------|
| **1** | Dead dependencies, polyfills, Font Awesome, unused assets/fonts, orphan `Utility.vue` | Smaller `dist/`, ~1,200 fewer npm packages |
| **2** | Lazy-load below-fold sections, remove daisyUI, dedupe imports | Main CSS −42 KB, main JS −33 KB (first paint) |
| **3** | SEO meta, Open Graph, `robots.txt`, `sitemap.xml` | Done — `public/og-image.png` (Moonman), tags in `index.html` |
| **4** | Guardrail scripts (this doc, Knip, ESLint) | Catches regressions before deploy |

## Guardrail commands

Run these before shipping changes:

```bash
npm run check             # All guardrails + production build (use before deploy)
npm run check:dead-code   # Knip — unused deps, files, exports
npm run check:deps        # depcheck — unused package.json entries
npm run lint              # ESLint — unused imports only
npm run build             # Must pass
```

## The rule for future changes

> **Do not change anything visual.** Compare before/after build sizes if needed.

That means: no color, font, spacing, copy, or section layout changes unless you explicitly ask.

## Copy-paste prompts for Cursor

**Cleanup**

- *"Run `npm run check:dead-code` and fix real issues. No visual changes."*
- *"Remove asset files nothing references. List every deleted file."*

**Performance (invisible)**

- *"Lazy-load new below-fold sections. Must look identical when scrolled."*
- *"Before/after: `npm run build` and report main JS/CSS gzip sizes."*

**SEO (mostly invisible on the page)**

- *"Update Open Graph description or swap `public/og-image.png`. No layout changes."*
- Preview after deploy: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/), [opengraph.xyz](https://www.opengraph.xyz/)

## Env vars (production)

See `.env.example`. Never commit `.env`, `.env.local`, or `.env.development.local`.

## Kept on purpose

- `src/assets/trade-previews/toke-jupiter-mobile.png` — used by `npm run process:trade-previews`, not shown on the live page
- `three` + async `HeroMoonGlobe` — hero moon (heavy but intentional)
- `@upstash/redis` — Vercel API snapshots only (not in the browser bundle)
