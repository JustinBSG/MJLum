# 麻雀諗 UI implementation

The existing MASTER.md remains the base. The five page overrides document the mobile-specific changes requested by the user.

## Screen map

- `/`: start or resume, rules and history.
- `/rules/hong-kong` → `/rules/edit`: choose and review rules, with an explicit continue action.
- `/session/seat`: named players and dealer; start is disabled until valid.
- `/session?view=scores`: two-column scoreboard, signed balances, dealer, collapsible tools and ledger.
- `/session?view=entry`: winner, fan presets or typed fan, self-draw/discarder, optional advanced rules and preview before confirmation.
- `/session?view=settle`: non-zero roster nets and unallocated pool; no transfer algorithm.
- `/session?view=stats`: counts first, expandable rates, titles and radar.

Uses existing repositories and scoring engine. iOS and Android persist locally with SQLite. The existing web repository is in-memory, for preview only; refreshing clears its data. No new dependency was added.

Product source: docs/guide.md, as designated by docs/README.md. The requested docs/product.md and docs/features.md do not exist in this repository.

Shared accessible controls and semantic tokens: app/src/components/table-ui.tsx. Dark mode is deferred; the app explicitly uses the light theme.

Verification: TypeScript, Expo lint, the existing 103 tests, and browser interaction through rules → seats → three-fan self-draw → updated scores → settlement → statistics. Browser widths checked: 375, 768, 1024 and 1440. Native device rendering and VoiceOver/TalkBack still require device verification.
