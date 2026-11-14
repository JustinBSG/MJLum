# 麻雀諗

The GitHub repository for this app is [MJLum](https://github.com/JustinBSG/MJLum).

This document is a product and function guide for 麻雀諗. It records decided product direction as of 14 November 2026, and the main areas a complete scorekeeper app will need. Where a flow, screen, or rule has not been specified yet, it is marked as **unspecified** or **planned**. Those sections describe the intended topic only; they do not invent UI layout, control labels, or scoring rules.

Scoring, session, and settings behavior that is marked **taken from the local reference** is established by that reference and should be followed. Behavior that was not found in the reference is marked **unspecified** and still needs a later decision. This document does not copy a competitor UI.

`docs/product.md` is the short product-direction summary. This file is the longer guide.

## What the app is for

麻雀諗 is a table scorekeeper for in-person Hong Kong Mahjong. It is not a tile game: it does not deal, draw, or display a playable wall of tiles, and it is not meant to replace physical tiles at the table.

Players use the app to keep and show scores during a live game. The scoreboard can also be shown on a larger screen through a projector or external display.

## Decided product direction

The following points are decided:

- The app is a cross-platform mobile app. First-release platforms are iOS and Android.
- The app has no ads.
- At the current stage the app is completely free.
- The UI/UX is distinct, and is not a copy of the existing iPhone app 麻將計數機.
- All UI/UX should be designed by AI. AI should follow this guide to design the most user-friendly UI/UX, and should use https://github.com/nextlevelbuilder/ui-ux-pro-max-skill to assist generation. This is a design-process decision; this document does not include those designs.
- The app supports showing the scoreboard on a larger screen through a projector or external display. This is required on all first-release platforms (iOS and Android). AirPlay is required. Another similar path is welcome if it is supported, but AirPlay is a must.
- Start screen sharing by clicking the share-screen button in the app; end sharing by clicking the same button again. Connection start and end are that toggle. The look of the external scoreboard is left to later AI design.
- The first release is a personal/table tool only, not a public App Store or Play Store app yet.
- The UI language and locale is Traditional Chinese — Hong Kong only.
- Only one device is used at the table. The first release does not support more than one device following the same session.
- The app keeps all in-game records (all the things in the game) across sessions, stored locally only.
- Data is local only: no backup, no cloud, and no account or sign-in requirement. Storage should be kept light.
- The app does not share metadata or session data, including results, history, player information, settlement, or other session information. It is a simple local tool. The share-screen control for an external display is a local display connection, not sharing of metadata.
- Scoring, session, and settings behavior follow the local reference where that behavior is established, as recorded in the sections below. Behavior that was not found in the reference remains unspecified.

Visual design, navigation, and the technical approach for building the iOS and Android apps are unspecified.

## How screens and functions fit together

The following function areas are planned so the app can serve as a table scorekeeper. Screen names, information architecture, and how the user moves between them are **unspecified**. UI/UX for these areas is to be designed later by AI, following this guide and using https://github.com/nextlevelbuilder/ui-ux-pro-max-skill to assist generation.

- **Scoreboard / table view:** planned as the view that shows current scores, and as the content that can be sent to an external display.
- **Session and scoring entry:** planned as the way players start or continue a game and record scoring events. Scoring and session behavior that was taken from the local reference is recorded below.
- **Settlement:** planned as a user-requested view of who should pay whom to reconcile current net session balances, as taken from the local reference. Details are in the Settlement section.
- **Sharing of metadata or session data:** not supported. The app is a simple local tool and does not share results, history, player information, settlement, or other session information.
- **Settings:** follow the local reference, as listed in the Settings section. The app itself is ad-free (this is a product rule, not an optional setting), and the UI language and locale is Traditional Chinese — Hong Kong only.
- **External display:** planned as a projector or larger-screen scoreboard on all first-release platforms (iOS and Android). AirPlay is required. Another similar path is welcome if it is supported. The user starts and ends the connection with the same share-screen button in the app. The look of the external scoreboard is left to later AI design. Behavior when the connection drops is unspecified.
- **History:** the app keeps all in-game records across sessions, stored locally only. How the user browses, resumes, or deletes past sessions is unspecified, except that storage is local only and should be kept light.

No wireframes, component list, or visual style are specified in this document on purpose.

## How to use it

Intended use, at a high level:

1. People play Hong Kong Mahjong in person with physical tiles.
2. One device at the table is used to keep the table's scores in 麻雀諗. The recorder enters who won, the fan value, and how the win happened; the app applies the chosen score table.
3. Optionally, the scoreboard is shown on a larger screen through a projector or external display. The user starts and ends that connection with the share-screen button in the app. AirPlay is required for this; another similar path is welcome if it is supported.

Detailed first-run, player-setup, and in-game screen steps are **unspecified** and are left to later AI UI/UX design, following this guide.

## Platforms

First-release platforms are iOS and Android. Projector and external-display support is required on all first-release platforms.

The technical approach for building the iOS and Android apps is **unspecified**.

## Language and locale

The UI language and locale is Traditional Chinese — Hong Kong only. Other languages and locales are not in scope unless later decided.

## Devices at the table

Only one device is used at the table. The first release does not support more than one device following the same session.

## History and storage

The app keeps all in-game records (all the things in the game) across sessions. Data is local only: no backup, no cloud, and no account or sign-in requirement. Storage should be kept light.

**Taken from the local reference:** during a session, the app keeps running net balances, a chronological hand/event ledger, and accumulated session statistics. The ledger can emphasize events, score changes, or a combined view, and can be shown in forward or reverse order.

**Unspecified:** how past sessions are browsed, resumed, or reopened after a new session starts; whether an older history row can be edited or deleted; and exact statistic formulas if statistics are shown.

## UI/UX design process

All UI/UX should be designed by AI. AI should follow this guide to design the most user-friendly UI/UX, and should use https://github.com/nextlevelbuilder/ui-ux-pro-max-skill to assist generation.

This is a design-process decision only. This document does not include screen designs, wireframes, or a visual style, and those should not be invented here.

## Scoring and session flow

Scoring and session behavior follow the local reference where that behavior is established. Names such as 全銃, 自摸, and 流局 below are rule and behavior names, not a UI to copy. Screen layout remains **unspecified** and is left to later AI design.

The app is a table scorekeeper: people play in person and agree each hand’s result. The recorder enters who won, the fan value, and how the win happened. The app applies the chosen score table, previews the calculated hand score and total, and on confirm updates the winner and paying players together and records the hand. It does not read tiles or decide whether a hand is legal.

Three numbers are distinct:

- **Fan (番 / 番數):** the scoring level entered for a winning hand.
- **Hand score (食糊分數 / 自摸分數):** the amount the selected rules assign to that result.
- **Running balance:** the player’s accumulated net result across recorded hands.

Amount editing that is established is in **rule setup** (ordinary-win amounts in the fan table). At hand entry, the user reviews the preview and confirms. An in-entry override of the calculated total is **unspecified**.

### Rules, presets, and custom setups

**Taken from the local reference:**

- Rules can be chosen from Hong Kong presets or created as a named custom setup. A custom setup can be saved for reuse, or used once without saving. The demonstrated default custom name is 新玩法.
- Visible Hong Kong preset families include 3番4, 二五雞, 五一, and 一二蚊, each in 半辣上 and 辣辣上 forms, plus a three-player 3番4 半辣上 variant. Their meaning is the visible start/cap amounts and score tables, not an extra invented formula. Different presets can share a starting amount but differ later in the table; the whole table should be inspected.
- Other regional categories appear in the reference (台灣麻將, 日本麻雀, 碰槓牌（跑馬仔）, 港式台灣麻將), but their full scoring was not established.

**Unspecified:** whether first-release 麻雀諗 includes only 香港麻雀 or also those other categories; saved-rule rename, delete, name-length, and duplicate-name behavior.

### Player count and payment mode

**Taken from the local reference:**

- Player count is a format choice of four-player (四人麻雀) or three-player (三人麻雀), and is separate from how many people are on the session roster. Only four-player scoring was fully demonstrated.
- Payment modes include 全銃 and 半銃. Under demonstrated 全銃, an ordinary discard win transfers only the configured ordinary-win amount from the discarder to the winner; the other seated players are unchanged for that hand.

**Unspecified:** 半銃 payer split, rounding, and interaction with special cases; detailed three-player layout, score-table construction, and self-draw allocation.

### Fan range and the score table

**Taken from the local reference:**

- Fan range has a minimum winning threshold (起糊) and a cap (滿糊).
- Ordinary-win amounts (食糊分數) are entered per fan level in the rules.
- Self-draw amounts (自摸分數) are derived in the demonstrated rules as ordinary amount × 1.50, and that figure is the winner’s **total** gain. In four-player self-draw, each of the three opponents pays one third of that total. Example: 512 × 1.50 = 768 total; 256 paid by each of the three opponents.
- Those table values belong to a given rules setup, not a single universal Hong Kong table.

**Unspecified:** allowed min/max endpoints; what happens if a user tries to enter a fan below 起糊 or above 滿糊; whether the 1.50 multiplier can be edited; decimal handling, rounding, and three-player self-draw allocation.

### Jackpot

**Taken from the local reference:** Jackpot is an optional shared pool. When it is enabled, the rules specify how much each player contributes to the pool on a drawn hand. The demonstrated scoring sequence had Jackpot off.

**Unspecified:** default on/off and default contribution amount; how the pool is displayed, awarded, withdrawn, or settled.

### Dealer, wind, and session progress

**Taken from the local reference:**

- Tracking dealer and circle/wind progress is an optional rules setting, independent of the point table. When it is on, a further setting controls whether the dealer passes on a drawn hand (流局時過莊).
- In the demonstrated configuration (both settings on, Jackpot off), a recorded draw advances dealer/wind progress and leaves balances unchanged.
- A dealer can be selected manually. When doing so, a consecutive-dealer count (連莊) can be reset, and circle/wind counting can be restarted, as separate choices.
- Session progress can be shown as circle/wind (for example 東圈東風) or as a hand count. The session can also show the active rules name, start date, and hand count.
- Mid-session rule values can be inspected. Whether they can be edited, and what that would do to already-recorded hands, is not established.

**Unspecified:** the complete dealer-progression algorithm for every result type (including when the winner is or is not the dealer); the off-state of 流局時過莊; the exact 連莊 counting convention; and mid-session rule edits.

### Seats, roster, and substitution

**Taken from the local reference:**

- A session has a live table of active seats (four in the demonstrated four-player game) and a separate roster that may include additional people.
- Each seated player has a name, an identifying avatar, and a running net balance starting at 0. A name is required before that player can be confirmed.
- A further person can be added to the roster without adding another live seat, then substituted into a seat. The departing player’s balances and history stay with that person and still count in settlement. The substitute starts that seat at 0 and does not inherit the previous occupant’s result. Players not currently seated do not pay for later hands.

**Unspecified:** maximum roster size; deleting a player; editing an existing name or avatar; and a clearly demonstrated seat-only swap of two seated players.

### Starting a session and starting a new session

**Taken from the local reference:**

- A first session begins with rules selection, then seats. If a session is already open, starting a new session is distinct from recording the next hand.
- Starting a new session can offer, independently, to reuse the current players and/or the current rules. With both reuse options off, the flow returns to rules selection and empty seats.

**Unspecified:** a separate user-chosen session title, distinct from the rules name and the start date; on-state behavior of the reuse options, including reserve players and seats; an explicit pause, complete, or discard action beyond viewing settlement and starting a new session; and how a previous session remains browsable after a new one starts.

### Score entry types

**Taken from the local reference:**

- **Ordinary win from a discard:** select the winner, the fan value, and the discarder (出銃者); review the calculated hand score and total; confirm.
- **Self-draw (自摸):** the same entry, with self-draw chosen instead of another player as the payer. The preview shows the fan amount, the self-draw multiplier, and the winner’s total gain.
- **Multiple winners on one discard (一炮多響):** more than one player can win from the same discard, recorded together as one hand. Each additional winner has their own fan value; the same discarder pays. The demonstrated result matched each winner’s ordinary-win amount, with the discarder’s loss equal to the sum of those amounts.
- **False-win (詐糊):** a false or invalid win option exists in the fan selector.
- **Special payer option (出銃者包自摸):** a distinct liability/payment setting whose wording refers to the discarder covering a self-draw-related liability. It was off in the inspected examples.
- **Drawn hand (流局):** used when a hand ends without a winner and should still be recorded as session progress, after confirmation. In the demonstrated setup (流局時過莊 on, Jackpot off), draws advance dealer/wind indicators while balances remain unchanged.

After confirmation, running totals, session progress, statistics, and the hand history update.

**Unspecified:** 詐糊 penalty, who pays whom, and effects on dealer progress or statistics; the exact calculation and eligible situations for 出銃者包自摸; invalid-entry handling (for example winner = discarder, or invalid multi-winner sets); and numeric validation.

### Undo

**Taken from the local reference:** the latest entry can be undone, after confirmation, restoring the previous scores and the visible dealer/progress state. Undo restores a previous state; it is not an input for manually choosing a new balance. The practical correction is to undo and re-enter the correct result.

**Unspecified:** undo depth, redo, and editing or deleting an arbitrary older history row.

## Settlement

**Taken from the local reference:**

- Settlement is a user-requested view of current **net** session balances, not an automatic end-of-hand, end-of-wind, or end-of-session trigger, and not a replay of each historical hand.
- It displays payment instructions as payer → recipient → amount, and must use the complete session roster, including a former player who still has a non-zero balance.
- If no player has a positive balance, the empty state is that there is no positive-balance recipient yet. Opening settlement while everyone is at zero is normal.
- Settlement calculates and displays payment instructions. It does not itself mark payments as paid, move money, or expose a currency-code setting in the reference.

**Unspecified:** the exact method for choosing a particular set of transfers; how a Jackpot pool would appear in settlement; and whether a currency label is needed. Paid-tracking and payment execution are not established, and 麻雀諗 is a simple local tool, so these stay out unless later decided.

How the final settlement is presented on an connected external display is left to later AI design, within the no-metadata-sharing rule (the external display is a local scoreboard, not a share of session data to another person or service).

## Sharing

The app does not share metadata or session data, including results, history, player information, settlement, or other session information. It is a simple local tool.

The share-screen control for an external display is a local display connection, not sharing of metadata. Do not add result-card, profile, or settlement sharing.

## Settings

Settings follow the local reference. This is a behavior and options inventory, not a UI to copy. Defaults are recorded only when the reference states them or clearly shows a remaining selected value in a documented flow. UI language is Traditional Chinese — Hong Kong only; a language-switch setting is not implied. The app is ad-free, and that is not an optional setting.

### Rule setup

| Setting | Meaning | Default, if stated |
|---|---|---|
| 玩法名稱 | Name of this rules setup | Demonstrated default: 新玩法 |
| 人數 | Game format: 四人麻雀 or 三人麻雀 | In the demonstrated custom-setup flow, four-player remained selected. Not independently labelled as a global product default. |
| 全銃 / 半銃 | How a discard-win loss is allocated. 全銃 is demonstrated as the winner receiving the ordinary amount from the discarder only. 半銃 is offered, but its calculation is unspecified. | In the demonstrated custom-setup flow, 全銃 remained selected. Not independently labelled as a global default. |
| 番數設定 (min / max) | Minimum winning fan (起糊) and capped fan (滿糊) | Not generally stated. In the custom-setup demonstration the cap is first seen at 8 and is then moved to 9 and 10; the minimum stays at 3. Allowed endpoints are unspecified. |
| 食糊分數 (per fan) | Editable ordinary-win amount for each fan level in range | No universal default. Depends on the chosen preset or custom edits. |
| 自摸分數 | Displayed self-draw total, derived from the ordinary amount | Displayed multiplier ×1.50 in verified examples. Whether the multiplier can be edited is unspecified. |
| Jackpot 啟用 | Optional shared pool associated with drawn hands | Default not stated. |
| 流局時每位玩家須付彩池 | When Jackpot is on: numeric contribution each player owes the pool on a drawn hand | Default amount not stated. The field is hidden when Jackpot is off. Decimal and rounding rules are unspecified. |
| 紀錄莊家及圈風 | Enable dealer and circle/wind progress tracking (does not change score-table amounts) | Default not stated. Enabled in the played reference session. |
| 流局時過莊 | When dealer/wind tracking is on: whether the dealer passes on a drawn hand | Default not stated. Enabled in the demonstrated configuration. Off-state is unspecified. |

After configuration, the setup is confirmed. An edited-preset path may offer to cancel, use the configuration once without saving, or save it as a custom rules entry.

### In-session controls

| Control | Meaning | Default / inspected state, if stated |
|---|---|---|
| Who is dealer | Select the current dealer | No default stated (chosen by the user) |
| 重置連莊數 | Reset consecutive-dealer count when manually setting the dealer | Shown on in the inspected reference dialog; downstream count behavior was not independently tested |
| 重新開始計算圈風 | Restart circle/wind counting when manually setting the dealer | Shown off in the inspected reference dialog; on-state is unspecified |
| Progress display: 圈風 / 局數 | Display choice for session progress (not a score change) | Both options exist; alternative main-table formatting is unspecified |
| History emphasis: events / scores / combined | What the ledger emphasizes | No default stated |
| History order | Ledger order, forward or reverse | No default stated |

**Unspecified:** any preference layer beyond the rule setup and the in-session display/dealer controls listed; whether 麻雀諗 should include a dice utility or fan-help content (both appear in the reference, but their full behavior was not established).

## External display

External-display support is a decided product requirement: the scoreboard can be shown on a larger screen through a projector or external display.

The following are decided:

- This is required on all first-release platforms (iOS and Android).
- AirPlay is required. Another similar path is welcome if it is supported, but AirPlay is a must.
- Start screen sharing by clicking the share-screen button in the app; end sharing by clicking the same button again. Connection start and end are that toggle.
- The look of the external scoreboard is left to later AI design.

The following are still **unspecified**:

- What happens if the external display disconnects during a session
- Which other similar path, if any, ships in addition to AirPlay

## Other reference behavior still open for 麻雀諗

The local reference also includes session statistics, title badges, a player radar chart, and a dice utility. Exact formulas, award rules, and full utility behavior were not established. Whether 麻雀諗 includes these features is **unspecified**.

## Unanswered questions

These decisions are still open and should be specified before implementation is treated as complete:

1. 半銃 calculation (payer split, rounding, and interaction with self-draw, 一炮多響, 出銃者包自摸, and three-player play).
2. Three-player scoring details (layout, score table, self-draw allocation, and the three-player preset table).
3. Whether first-release 麻雀諗 includes only 香港麻雀, or also the other categories whose detailed scoring was not established.
4. 詐糊 penalty, who pays whom, and effects on dealer progress and statistics.
5. 出銃者包自摸 eligible situations and exact calculation.
6. Jackpot award, balance, withdrawal, and settlement behavior, plus default on/off and default contribution.
7. Fan min/max endpoints, and what happens if a fan is entered outside the configured range.
8. Whether the 1.50 self-draw multiplier is editable, and rounding / decimal rules.
9. The complete dealer / 連莊 progression algorithm, including the off-state of 流局時過莊.
10. Saved-rules rename, delete, name-length, and duplicate-name behavior; mid-session rule edits.
11. Invalid-entry handling and numeric validation.
12. Roster limits, and editing or deleting an existing player.
13. Undo depth, redo, and editing or deleting an older history row.
14. How past sessions are browsed or resumed while still keeping all local history; session naming; explicit pause / complete / discard if wanted.
15. On-state behavior of new-session reuse options (retain players and/or rules).
16. Settlement transfer-choice algorithm, and whether a currency label is needed.
17. Whether statistics, titles, a radar chart, a dice utility, and fan-help are in scope, and if so their exact formulas.
18. What happens if the external display disconnects during a session.
19. What technical approach will be used to build the iOS and Android apps?

This list can grow as product decisions are made. New decided rules should be added to the sections above and removed from this list.
