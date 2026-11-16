# MJLum UI implementation · Version 1 / Release 1

Visual design follows [MASTER.md](MASTER.md). Functionality and scoring follow [features.md](../../docs/features.md) and [guide.md](../../docs/guide.md). The accepted UAT feature baseline is `233c446`; the designated release commit is `e50f8ec`.

## Screen mapping

- `/`: start/continue a session, confirm clearing the current session and starting another, choose rules, and browse saved sessions.
- `/rules/hong-kong` → `/rules/edit`: presets/custom rules, dual-handle fan slider, score table, switches, and save/discard dialogs.
- `/session/seat`: player names and explicit starting-dealer selection.
- `/session`: component state switches between table, scoring, history, settlement, statistics, and tool panels; tabs do not use `?view=` routes.
- **Table:** two-column large scores, wind progress, and reserve-player cards. Draw and undo confirmations appear in modals above the table.
- **Scoring:** winner selection, the full configured fan range, self-draw or discarder, special cases, and preview confirmation.
- **Substitution:** separate seated and reserve zones; tap a selected player or seat again to deselect it.
- **History/session settings:** tables with headings, grid lines, aligned numbers, and horizontal scrolling where needed.
- **Settlement:** non-zero net balances and the unallocated pool. **Statistics:** existing counts, rates, titles, and radar charts.
- **Dice:** SVG faces and short rolling animation that respects reduced-motion preferences.

Shared components are in `app/src/components/`. Action icons use Lucide SVG; the Mahjong brand icon is original vector artwork. The production platforms are iOS and Android with local SQLite storage. The web version is a preview with an in-memory database. The delivered theme is light.

Dependencies are pinned in `app/package-lock.json`. `@resvg/resvg-js` is a development dependency for brand-asset export, not an app native module. The in-app loading screen works in Expo Go; verify the native splash in a standalone installation.
