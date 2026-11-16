# 麻雀諗 — score-entry

Overrides to ../MASTER.md for the physical-table Expo / React Native app.

- Keep Minimalism / Soft UI Evolution, 4/8-point spacing, navy primary #1E3A8A, background #F8FAFC, white surfaces.
- User-requested override: no purple CTA; use navy with white text. Ink #17243B, muted #475569, border #CBD5E1. Positive #166534, negative #B42318, always show signs and text.
- Use platform sans-serif with Hong Kong Traditional Chinese fallback, not Playfair Display. Body 16/24, headings 24/34, balances 36/44 with tabular numbers.
- Mobile tool layout, not FAQ/marketing layout. No search requirement for a four-person scoreboard.
- Touch controls ≥52 units, gap ≥8, visible 3-unit focus ring, explicit selected state, safe areas and scrolling.
- Lucide SVG; no emoji, gradients, glass or decorative animation. Respect system reduced-motion preferences; dice rolling has a short functional animation.
- Traditional Chinese (Hong Kong) UI only; use 彩池 for Jackpot UI.
- Product source: docs/guide.md as designated by docs/README.md. docs/product.md links to that guide; docs/features.md records the implemented Version 1 / Release 1 UI.
- Keep existing exact-score engine, local repositories, player attribution and statistics formulas. Settlement shows non-zero roster balances and unallocated pool; no transfer calculation or payment tracking.
