# Implemented interface features

The current version is **Version 1 · Release 1 (1.0.0)**. See the [release record](releases/v1.0.0.md) for the full scope and validation record.

Product behavior follows [guide.md](guide.md); visual design follows [MASTER.md](../design-system/mjlum/MASTER.md).

- **Session setup:** choose rules, edit the fan table and switches, seat players, and select the starting dealer.
- **Table:** large scores, dealer indicators, win entry, and drawn-hand entry. Other utilities are in the More menu.
- **Unseated players:** separate cards below the main table actions show each person's name, reserve status, and accumulated balance, preserving signs and score colors.
- **Substitution:** separate seated and unseated zones identify the outgoing and incoming players. Add new players in the unseated zone. Tap a selected option again to deselect it.
- **Dice:** roll one to nine dice with a short animation, then show individual faces, the total, and the direction. Repeated rolls and count changes are disabled during animation; leaving the panel cleans it up. Reduced-motion mode shows the result immediately. The existing random-number and direction algorithms are preserved.
- **Win entry:** choose winners, select from the full configured minimum-to-cap fan range, choose self-draw or the discarder, set special cases, and confirm the preview.
- **History:** event, score, and combined tables support forward/reverse ordering and the existing editing actions. Event and combined views identify the winning player.
- **Rule limits:** minimum and capped fan values share one dual-handle slider.
- **Draw confirmation:** a modal appears over the current table. Cancelling leaves the session unchanged.
- **Home:** continue the current session or confirm clearing it and starting another, while retaining other saved sessions.
- **Settlement:** player net balances and unallocated pool status.
- **Statistics:** existing counts, rates, titles, and radar charts; interface changes do not introduce new formulas.
- **Numeric input:** Done, Cancel, Delete, decimals, and exact fractions, with existing validation retained.
- **Startup:** the Mahjong mascot and a table-preparation message (正在準備牌桌) remain visible while the local database initializes. Expo Go displays the shared in-app loading screen; verify the complete native splash behavior in a standalone release build.
