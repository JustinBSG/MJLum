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
- Start screen sharing by clicking the share-screen button in the app; end sharing by clicking the same button again. Connection start and end are that toggle.
- The external display should show 現時賽果 only. Any other page must be opened in the app to check. The reason is that players and the user can check the score immediately, and the developer does not need to design interaction or controls for the external display. The look of that 現時賽果 display is left to later AI design.
- The first release is a personal/table tool only, not a public App Store or Play Store app yet.
- The UI language and locale is Traditional Chinese — Hong Kong only.
- Only one device is used at the table. The first release does not support more than one device following the same session.
- The first release has exactly the same functionality as the local reference. That includes all reference scoring options, such as 半銃, 詐糊, 出銃者包自摸, and Jackpot, even when some formulas were not demonstrated and remain unspecified (those formulas must not be invented). It also includes the reference’s rule categories (including 台灣麻將, 日本麻雀, 碰槓牌（跑馬仔）, and 港式台灣麻將) and utilities (statistics, titles, a radar chart, a dice utility, and fan-help). The already-decided 麻雀諗 product rules in the list above are part of this first release, not extra features: no ads; a distinct UI; Traditional Chinese — Hong Kong only; one device at the table; iOS and Android; local-only data; no metadata sharing; and the required AirPlay / share-screen external display.
- A second release is for extra features: anything beyond that same-functionality first release.
- The app keeps all in-game records (all the things in the game) across sessions, stored locally only.
- Data is local only: no backup, no cloud, and no account or sign-in requirement. Storage should be kept light.
- The app does not share metadata or session data, including results, history, player information, settlement, or other session information. It is a simple local tool. The share-screen control for an external display is a local display connection, not sharing of metadata.
- Scoring, session, and settings behavior follow the local reference where that behavior is established, as recorded in the sections below. Behavior that was not found in the reference remains unspecified.

Visual design, navigation, and the technical approach for building the iOS and Android apps are unspecified.

## First release and second release

The first release should have exactly the same functionality as the local reference, together with the already-decided 麻雀諗 product rules listed above. Those product rules are not extra features and are not postponed to a later release.

Same-functionality here means the scoring, session, settings, statistics, titles, radar chart, dice utility, fan-help, and other behaviors established in the local reference, including options whose formulas were not demonstrated. Those undemonstrated formulas stay **unspecified** and must not be invented. The first release does not copy the reference UI.

The already-decided 麻雀諗 product rules that apply in the first release are: no ads; a distinct UI; Traditional Chinese — Hong Kong only; one device at the table; iOS and Android; local-only data with all in-game records kept across sessions; no sharing of metadata or session data; and the required AirPlay / share-screen external display.

A second release is for extra features: anything beyond that same-functionality first release.

## How screens and functions fit together

The following function areas are planned so the app can serve as a table scorekeeper. Screen names, information architecture, and how the user moves between them are **unspecified**. UI/UX for these areas is to be designed later by AI, following this guide and using https://github.com/nextlevelbuilder/ui-ux-pro-max-skill to assist generation.

- **Scoreboard / table view:** planned as the in-app view that shows current scores. Other pages are opened in the app to check; the external display shows 現時賽果 only.
- **Session and scoring entry:** planned as the way players start or continue a game and record scoring events. Scoring and session behavior that was taken from the local reference is recorded below.
- **Settlement:** planned as a user-requested view of who should pay whom to reconcile current net session balances, as taken from the local reference. Details are in the Settlement section.
- **Statistics, titles, and radar chart:** included in the first release. Session-wide statistics, title badges, and a player radar chart follow the local reference where that behavior is established. Exact formulas and award rules remain unspecified.
- **Dice utility and fan-help:** included in the first release. These are table utilities; their established behavior and remaining gaps are recorded below.
- **Sharing of metadata or session data:** not supported. The app is a simple local tool and does not share results, history, player information, settlement, or other session information.
- **Settings:** follow the local reference, as listed in the Settings section. The app itself is ad-free (this is a product rule, not an optional setting), and the UI language and locale is Traditional Chinese — Hong Kong only.
- **External display:** planned as a projector or larger-screen display of 現時賽果 only, on all first-release platforms (iOS and Android). AirPlay is required. Another similar path is welcome if it is supported. The user starts and ends the connection with the same share-screen button in the app. Any other page must be opened in the app to check. The reason is that players and the user can check the score immediately, and the developer does not need to design interaction or controls for the external display. The look of that 現時賽果 display is left to later AI design. Behavior when the connection drops is unspecified.
- **History:** the app keeps all in-game records across sessions, stored locally only. How the user browses, resumes, or deletes past sessions is unspecified, except that storage is local only and should be kept light.

No wireframes, component list, or visual style are specified in this document on purpose.

## How to use it

Intended use, at a high level:

1. People play Hong Kong Mahjong in person with physical tiles.
2. One device at the table is used to keep the table's scores in 麻雀諗. The recorder enters who won, the fan value, and how the win happened; the app applies the chosen score table.
3. Optionally, 現時賽果 is shown on a larger screen through a projector or external display. The user starts and ends that connection with the share-screen button in the app. Any other page is opened in the app to check. AirPlay is required for this; another similar path is welcome if it is supported.

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

**Unspecified:** how past sessions are browsed, resumed, or reopened after a new session starts; whether an older history row can be edited or deleted; and exact statistic formulas (statistics themselves are in the first release).

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
- Visible Hong Kong preset families include 3番4, 二五雞, 五一, and 一二蚊, each in 半辣上 and 辣辣上 forms, plus a three-player 3番4 半辣上 variant. Their meaning is the visible start and cap amounts and score tables, not an extra invented formula. Different presets can share a starting amount but differ later in the table; the whole table should be inspected. The visible summaries use 全銃. The list of presets may continue beyond what was captured. The table does not specify every intermediate fan amount for each preset.

Visible Hong Kong preset minimum and cap amounts:

| Preset | Minimum shown | Amount at minimum | Cap shown | Amount at cap |
|---|---:|---:|---:|---:|
| 3番4 半辣上 | 3 fan | 4 | 8 fan | 32 |
| 3番4 辣辣上 | 3 fan | 4 | 8 fan | 128 |
| 二五雞 半辣上 | 3 fan | 8 | 8 fan | 64 |
| 二五雞 辣辣上 | 3 fan | 8 | 8 fan | 256 |
| 五一 半辣上 | 3 fan | 16 | 8 fan | 128 |
| 五一 辣辣上 | 3 fan | 16 | 8 fan | 512 |
| 一二蚊 半辣上 | 3 fan | 32 | 8 fan | 256 |
| 一二蚊 辣辣上 | 3 fan | 32 | 8 fan | 1024 |
| 3番4 半辣上（三人） | 3 fan | 3 | 8 fan | 24 |

Two opened Hong Kong preset tables were recorded in full for the range then on screen.

**五一辣辣上**, after 滿糊 was extended from the default 8 to 13 (the range control sat at its right-hand end at 13; no higher cap was shown). 自摸分數 is labelled ×1.50:

| Fan | Ordinary-win amount (食糊分數) | Self-draw total (自摸分數) |
|---:|---:|---:|
| 3 | 16 | 24 |
| 4 | 32 | 48 |
| 5 | 64 | 96 |
| 6 | 128 | 192 |
| 7 | 256 | 384 |
| 8 | 512 | 768 |
| 9 | 1024 | 1536 |
| 10 | 2048 | 3072 |
| 11 | 4096 | 6144 |
| 12 | 8192 | 12288 |
| 13 | 16384 | 24576 |

**二五雞辣辣上**, with the default 3–8 range:

| Fan | Ordinary-win amount (食糊分數) | Self-draw total (自摸分數) |
|---:|---:|---:|
| 3 | 8 | 12 |
| 4 | 16 | 24 |
| 5 | 32 | 48 |
| 6 | 64 | 96 |
| 7 | 128 | 192 |
| 8 | 256 | 384 |

A saved custom setup can be deleted: the reference asks 確定刪除嗎?, and after confirmation the custom list can show 未有自訂玩法. Adding a custom setup (增加玩法) creates another 新玩法. The default custom table starts at 3番起糊 with ordinary-win amount 4 and 8番滿糊, doubling each fan (3: 4/6, 4: 8/12, 5: 16/24, 6: 32/48). Extending 滿糊 to 13 kept doubling through 13: 4096/6144. Ordinary-win cells are individually editable; the matching 自摸分數 updates to ×1.50 of that cell. Editing one fan does not automatically recalculate later fans: after raising fans 3–6, fan 7 stayed 64/96, so 6 and 7 tied. That unsaved custom was then abandoned (放棄設定嗎? confirmed), returning to 未有自訂玩法. After configuration, 儲存此玩法嗎？ offers 取消, 直接使用, or 儲存; a saved setup appears under 自訂玩法.

The first release includes the reference’s other regional categories (台灣麻將, 日本麻雀, 碰槓牌（跑馬仔）, 港式台灣麻將) as part of the same-functionality scope. Detailed scoring for those categories was not established in the reference, remains **unspecified**, and must not be invented.

**Unspecified:** saved-rule rename, name-length, and duplicate-name behavior; intermediate amounts for Hong Kong presets that were not opened in full (including 半辣上 tables); and the detailed scoring tables and payout rules for those other regional categories.

### Player count and payment mode

**Taken from the local reference:**

- Player count is a format choice of four-player (四人麻雀) or three-player (三人麻雀), and is separate from how many people are on the session roster. Only four-player scoring was fully demonstrated.
- Payment modes in the reference include 全銃 and 半銃. Under demonstrated 全銃, an ordinary discard win transfers only the configured ordinary-win amount from the discarder to the winner; the other seated players are unchanged for that hand.
- Under demonstrated four-player 半銃, with 出銃者包自摸 and 出銃者包輸 off, an ordinary discard win is split as follows, where F is the ordinary-win amount (食糊分數) for the entered fan: the winner receives F; the discarder (出銃者) pays F/2; each of the other two losers pays F/4. In the demonstrated hands the dealer did not pay a different amount from the other non-discarder.

Demonstrated 11-fan 半銃 ordinary win, F = 4096, 出銃者 d. a was dealer (西圈西風) and paid the same 1024 as c, not double:

| Player | Before | After | Change |
|---|---:|---:|---:|
| a | 9716 | 8692 | −1024 |
| b | 10404 | 14500 | +4096 |
| c | 8428 | 7404 | −1024 |
| d | −28548 | −30596 | −2048 |

Demonstrated 4-fan 半銃 ordinary win, F = 32, 出銃者 d:

| Player | Before | After | Change |
|---|---:|---:|---:|
| a | 8692 | 8684 | −8 |
| b | 14500 | 14532 | +32 |
| c | 7404 | 7396 | −8 |
| d | −30596 | −30612 | −16 |

A later four-player 半銃 self-draw of 12 fan matched the already-recorded self-draw rule (winner total = ordinary amount × 1.50; each of the three opponents pays one third). 12-fan amounts: 8192 × 1.50 = 12288 total; each of a, b, and c paid 4096; d received 12288.

**Unspecified:** 半銃 rounding when F is not divisible by 4; 半銃 interaction with 出銃者包自摸, 出銃者包輸, and three-player play; and detailed three-player layout, score-table construction, and self-draw allocation. These formulas must not be invented.

### Fan range and the score table

**Taken from the local reference:**

- Fan range has a minimum winning threshold (起糊) and a cap (滿糊). A two-handle range control is used in the reference. In demonstrated setups, 起糊 stayed at 3, and 滿糊 was moved from 8 through 10 to 13, where the control sat at its right-hand end. No cap above 13 and no 起糊 below 3 were shown. Those observations do not by themselves prove the complete allowed range.
- Ordinary-win amounts (食糊分數) are entered per fan level in the rules.
- Self-draw amounts (自摸分數) are derived in the demonstrated rules as ordinary amount × 1.50, and that figure is the winner’s **total** gain. In four-player self-draw, each of the three opponents pays one third of that total.
- Those table values belong to a given rules setup, not a single universal Hong Kong table.

The main demonstrated custom table, with minimum 3 and cap 10:

| Fan | Ordinary-win amount (食糊分數) | Self-draw total (自摸分數) |
|---:|---:|---:|
| 3 | 4 | 6 |
| 4 | 8 | 12 |
| 5 | 16 | 24 |
| 6 | 32 | 48 |
| 7 | 64 | 96 |
| 8 | 128 | 192 |
| 9 | 256 | 384 |
| 10 | 512 | 768 |

Example of the self-draw derivation: 512 × 1.50 = 768 total; 256 paid by each of the three opponents.

**Unspecified:** allowed min/max endpoints beyond the demonstrated 起糊 3 and 滿糊 sitting at 13 on the right-hand end of the control; what happens if a user tries to enter a fan below 起糊 or above 滿糊; whether the 1.50 multiplier can be edited; decimal handling, rounding, and three-player self-draw allocation.

### Jackpot

**Taken from the local reference:** Jackpot is an optional shared pool. When it is enabled, the rules specify how much each player contributes to the pool on a drawn hand.

In the opened 五一辣辣上 rule setup, Jackpot 啟用 was off by default. Turning it on reveals 流局時每位玩家須付彩池, which started at 0 and is editable; a value of 10 was later shown in the save-or-use dialog. In the following play, the Jackpot display stayed at 0, and no drawn-hand contribution was recorded, so how a 流局 payment hits the pool, and how the pool is awarded, withdrawn, or settled, were not demonstrated.

The first release includes Jackpot as a visible option. Default off, and a contribution field that starts at 0 when first enabled, are now recorded; award and distribution remain unspecified.

**Unspecified:** how the pool is awarded, withdrawn, or settled in play, including a 流局 contribution actually being applied. These formulas must not be invented.

### Dealer, wind, and session progress

**Taken from the local reference:**

- Tracking dealer and circle/wind progress is an optional rules setting, independent of the point table. When it is on, a further setting controls whether the dealer passes on a drawn hand (流局時過莊).
- In the demonstrated configuration (both settings on, Jackpot off), a recorded draw advances dealer/wind progress and leaves balances unchanged.
- A dealer can be selected manually. When doing so, a consecutive-dealer count (連莊) can be reset, and circle/wind counting can be restarted, as separate choices.
- Session progress can be shown as circle/wind (for example 東圈東風) or as a hand count. The session can also show the active rules name, start date, and hand count (for example 玩法, 開始日期, 總局數, 牌局進度, and 進度顯示方式 圈風 or 局數). A consecutive-dealer mark (連N) can appear on the dealer tile after a consecutive dealer win; 連1 was shown.
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

- **Ordinary win from a discard:** select the winner, the fan value, and the discarder (出銃者); review the calculated hand score and total; confirm. In the demonstrated custom table, a 5-fan ordinary win transfers 16 from the discarder only; the other seated players are unchanged for that hand. Demonstrated result: player c wins 5 fan from player b; b changes from −256 to −272; c changes from −240 to −224; a and d do not change for that hand.
- **Self-draw (自摸):** the same entry, with self-draw chosen instead of another player as the payer. The preview shows the fan amount, the self-draw multiplier, and the winner’s total gain. Demonstrated 10-fan self-draw from an all-zero table: 512 × 1.50 = 768 total; after confirmation, a is +768 and b, c, and d each pay 256. A later seated-only example also showed a self-draw worth 24 total costing each of the three seated opponents 8; a player who had left the table did not pay.
- **Multiple winners on one discard (一炮多響):** more than one player can win from the same discard, recorded together as one hand, with up to three winners in the demonstrated flow. Each additional winner has their own fan value; the same discarder pays. The demonstrated result matched each winner’s ordinary-win amount, with the discarder’s loss equal to the sum of those amounts:

| Player | Before | After | Change |
|---|---:|---:|---:|
| a | 752 | 880 | +128 |
| b | −272 | −660 | −388 |
| c | −224 | −220 | +4 |
| d | −256 | 0 | +256 |

Total received 128 + 4 + 256 = 388, matching b’s loss. The increments correspond to the configured 8-fan, 3-fan, and 9-fan ordinary-win amounts.

A later four-player 半銃 一炮多響 hand used a different split. Winners were d at 7 fan (F1 = 256) and b at 6 fan (F2 = 128), 出銃者 c, other loser a. The entry preview for the then-selected winner d showed 7番分數 256 and 總分 224 (that selected winner’s net, not a raw sum of the two ordinary amounts). After confirmation:

| Player | Before | After | Change |
|---|---:|---:|---:|
| a | 11876 | 11780 | −96 |
| b | 12388 | 12452 | +64 |
| c | 10684 | 10492 | −192 |
| d | −34948 | −34724 | +224 |

This matches: the discarder pays (F1 + F2) / 2 = 192; the other loser pays (F1 + F2) / 4 = 96; each winner’s net is their own ordinary amount minus a quarter of the other winner’s ordinary amount (256 − 32 = 224, and 128 − 64 = 64). The entry can add a second winner, and tapping a winner sets that winner’s fan.

- **False-win (詐糊):** a false or invalid win option in the entry. A related toggle, 詐糊賠位自摸, was shown.

Demonstrated 13-fan 詐糊, with 詐糊賠位自摸 off. The preview footer showed 13番分數 詐糊 −16384 ×3 and 總分 −49152. After confirmation, the false-win player d paid 16384 to each of a, b, and c:

| Player | Before | After | Change |
|---|---:|---:|---:|
| a | 116 | 16500 | +16384 |
| b | 488 | 16872 | +16384 |
| c | −508 | 15876 | +16384 |
| d | −96 | −49248 | −49152 |

A preview only, not confirmed on a stable board: 詐糊賠位自摸 on, 13 fan, −16384 × 1.50 × 3 = 總分 −73728. That preview must not be treated as a confirmed settlement.

- **Special payer options (出銃者包自摸 and 出銃者包輸):** two distinct toggles. Enabled transactions were not confirmed on a stable board. Previews only: 出銃者包自摸 on, 5 fan, 出銃者 selected, footer 64 × 1.50 and 總分 96; 出銃者包輸 on (包自摸 off), 4 fan, 出銃者 selected, footer 32 and 總分 32. These previews must not be treated as confirmed settlements.
- **Drawn hand (流局):** used when a hand ends without a winner and should still be recorded as session progress, after confirmation. In the demonstrated setup (流局時過莊 on, Jackpot off), draws advance dealer/wind indicators while balances remain unchanged.

After confirmation, running totals, session progress, statistics, and the hand history update.

The first release includes 詐糊, 出銃者包自摸, and 出銃者包輸 as visible options. The 詐糊 settlement with 詐糊賠位自摸 off is now recorded; 詐糊賠位自摸 on, 出銃者包自摸, and 出銃者包輸 remain unspecified.

**Unspecified:** 詐糊 when 詐糊賠位自摸 is on; 詐糊 effects on dealer progress or statistics; the exact calculation and eligible situations for 出銃者包自摸 and 出銃者包輸; invalid-entry handling (for example winner = discarder, or invalid multi-winner sets); numeric validation; and special abortive-hand types or reason codes beyond the demonstrated 流局. The undemonstrated formulas must not be invented.

### Undo

**Taken from the local reference:** the latest entry can be undone (還原分數), after confirmation, restoring the previous scores and the visible dealer/progress state. Undo restores a previous state; it is not an input for manually choosing a new balance. The practical correction is to undo and re-enter the correct result.

Demonstrated latest-entry undo, reversing a substitute’s self-draw of 24:

| Player | Before undo | After undo |
|---|---:|---:|
| a | 872 | 880 |
| b | −668 | −660 |
| d | −8 | 0 |
| e | 24 | 0 |

**Unspecified:** undo depth, redo, and editing or deleting an arbitrary older history row.

## Settlement

**Taken from the local reference:**

- Settlement (找數) is a user-requested, on-demand view of current **net** session balances, not an automatic end-of-hand, end-of-wind, or end-of-session trigger, and not a replay of each historical hand.
- It displays payment instructions as payer → recipient → amount, and must use the complete session roster, including a former player who still has a non-zero balance.
- If no player has a positive balance, the empty state is that there is no positive-balance recipient yet (未有玩家分數為正數). Opening settlement while everyone is at zero is normal.
- Settlement calculates and displays payment instructions. It does not itself mark payments as paid, move money, or expose a currency-code setting in the reference.

Demonstrated balances from before the undo above, including an unseated player:

| Player | Net balance |
|---|---:|
| a | +872 |
| b | −668 |
| c, no longer seated | −220 |
| d | −8 |
| e | +24 |

Demonstrated transfers:

| Who pays | Who receives | Payment |
|---|---|---:|
| c | e | 24 |
| c | a | 196 |
| b | a | 668 |
| d | a | 8 |

This reconciles: c pays 24 + 196 = 220; b pays 668; d pays 8; e receives 24; a receives 196 + 668 + 8 = 872. Total paid equals total received: 896. The four current table balances alone would not reconcile.

The transfer list above is what the local reference demonstrated. It is not a 麻雀諗 requirement.

**麻雀諗 product decision (14 November 2026):** settlement (找數) should show the session result — each player’s net balance, including anyone on the roster who still has a non-zero balance — and let the user finish the payment themselves. 麻雀諗 does not compute payment instructions, does not choose a set of transfers, and does not need a transfer-choice algorithm, tie-breaking among transfer sets, or a currency label. Paid-tracking and payment execution stay out. How a Jackpot pool would appear in this result view remains unspecified.

Settlement is checked in the app, not on the external display. The external display shows 現時賽果 only. The share-screen connection remains a local display connection, not a share of session data to another person or service.

## Statistics, titles, radar, dice, and fan-help

These utilities are part of the same-functionality first release, not extra features for a later release. Layout and visual design are left to later AI design. This section records established behavior, not a UI to copy.

**Taken from the local reference:**

- Statistics are session-wide. They include everyone on the roster, including a player who has left a seat and a reserve player added before taking a seat.
- The overview counts recorded wins (食糊), self-draw wins (自摸), and occasions of dealing a winning discard (出銃). In the demonstrated totals, 自摸 is a subset of 食糊, not an extra category added on top of it.
- Individual player details also show average fan, win rate, self-draw rate, deal-in rate, and average deal-in fan. Exact denominators, rounding, substitution treatment, and multiple-winner aggregation are not established.
- Title badges summarize performance. Demonstrated titles include 自摸王, 出銃王, 食糊王, 大牌王, 細牌王, and 陪跑員. More than one player can hold the same title at once, so a title is not automatically exclusive (in the demonstrated list, c and d both had 6 出銃 and both showed 出銃王).
- A radar chart is a visual summary of a player across three labelled dimensions: 進攻, 牌力, and 防守. No numeric scale, weights, or formula was established in the reference.
- A dice utility can be used at the table to roll dice. In the demonstration, a dice result does not automatically choose the dealer, record a hand, or change a balance. Any count-adjustment limits, randomness details, and extra input methods are unspecified.
- Fan-help is opened from the 食糊 entry dialog by the circled ? beside 番數. A short popup was shown with the text 現時設定下 and 這裏只需輸入牌型番數. A separate page titled 番數說明 was not shown, and no further help content was opened.

Demonstrated statistics list in one session:

| Player | 食糊 | 自摸 | 出銃 | Titles shown |
|---|---:|---:|---:|---|
| a | 4 | 1 | 0 | 細牌王, 陪跑員 |
| b | 8 | 0 | 2 | 食糊王 |
| c | 2 | 0 | 6 | 出銃王 |
| d | 7 | 3 | 6 | 自摸王, 大牌王, 出銃王 |

The same session’s detail card for d showed 7食糊, 3自摸, 6出銃, 7平均番數, 37%食糊率, 43%自摸率, 32%出銃率, and 5平均出銃番數, plus a radar chart labelled 進攻, 牌力, and 防守. In that card, 43% 自摸率 matches 3/7. 37% 食糊率 and 32% 出銃率 are consistent with 7/19 and 6/19, but the card did not itself display the denominator, and an earlier session-info view in the same session had shown 總局數 8, so the denominators stay unspecified.

**麻雀諗 product decision (14 November 2026), derived from the meaning of each title, not established as reference fact.** Titles remain not automatically exclusive, as already demonstrated. Counts and 平均番數 are the session figures already shown in statistics; how 平均番數 is computed is still unspecified and is not invented here.

- **食糊王:** every player whose 食糊 count equals the highest 食糊 count, provided that highest count is at least 1. If every 食糊 count is 0, no one receives 食糊王.
- **自摸王:** every player whose 自摸 count equals the highest 自摸 count, provided that highest count is at least 1. If every 自摸 count is 0, no one receives 自摸王.
- **出銃王:** every player whose 出銃 count equals the highest 出銃 count, provided that highest count is at least 1. If every 出銃 count is 0, no one receives 出銃王. Ties share the title, as in the demonstrated list where c and d both had 6 出銃 and both showed 出銃王.
- **大牌王:** every player who has at least one 食糊 and whose 平均番數 is the highest among such players.
- **細牌王:** every player who has at least one 食糊 and whose 平均番數 is the lowest among such players. The same player may hold both 大牌王 and 細牌王 when those averages are equal (for example only one player has a win, or all such averages are tied).
- **陪跑員:** every player who holds none of 食糊王, 自摸王, 出銃王, or 大牌王. Holding 細牌王 does not prevent 陪跑員, as demonstrated when a held both. If every player holds at least one of those four titles, no one receives 陪跑員.

The demonstrated title list is consistent with this rule. Other players’ 平均番數 were not shown, so that screen does not independently prove the 大牌王 / 細牌王 averages.

**麻雀諗 product decision (14 November 2026), derived from the meaning of the three axes, not established as reference fact.** The radar is calculated from the already-displayed session rates. It does not invent rate denominators; those denominators remain unspecified, as recorded above. Each axis uses a 0–100 scale matching the percentage rates, with no extra weights:

- **進攻** = 食糊率
- **牌力** = 自摸率
- **防守** = 100 − 出銃率

Use the displayed rates as they are. If a rate is not yet available, that axis is 0.

**Unspecified:** exact statistic formulas, rate denominators, rounding, substitution treatment, multiple-winner aggregation, the 平均番數 formula, dice count limits, and any fan-help content beyond the short popup recorded above.

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
| 全銃 / 半銃 | How a discard-win loss is allocated. 全銃 is demonstrated as the winner receiving the ordinary amount from the discarder only. Four-player 半銃 ordinary discard and 一炮多響 splits are recorded in the Player count and Score entry sections. Rounding when F is not divisible by 4, and interaction with 出銃者包自摸, 出銃者包輸, and three-player play, remain unspecified. | In one demonstrated custom-setup flow, 全銃 remained selected. A later edited 五一辣辣上 configuration was used with 半銃. Not independently labelled as a global default. |
| 番數設定 (min / max) | Minimum winning fan (起糊) and capped fan (滿糊) | Not generally stated. Demonstrated flows keep 起糊 at 3 and move 滿糊 from 8 through 10 to 13, where the control sat at its right-hand end. Allowed endpoints beyond that are unspecified. |
| 食糊分數 (per fan) | Editable ordinary-win amount for each fan level in range | No universal default. Depends on the chosen preset or custom edits. The demonstrated custom 3–10 table is recorded in the Fan range section; the opened 五一辣辣上 and 二五雞辣辣上 tables are recorded in the Rules, presets section. Editing one cell does not automatically recalculate later fans. |
| 自摸分數 | Displayed self-draw total, derived from the ordinary amount | Displayed multiplier ×1.50 in verified examples. Whether the multiplier can be edited is unspecified. |
| Jackpot 啟用 | Optional shared pool associated with drawn hands. Included in the first release as a visible option. Award and distribution remain unspecified and must not be invented. | Off in the opened 五一辣辣上 rule setup. |
| 流局時每位玩家須付彩池 | When Jackpot is on: numeric contribution each player owes the pool on a drawn hand | The field is hidden when Jackpot is off. When first revealed, the value started at 0 and is editable. Decimal and rounding rules, and applying the contribution in play, are unspecified. |
| 紀錄莊家及圈風 | Enable dealer and circle/wind progress tracking (does not change score-table amounts) | On in the opened 五一辣辣上 rule setup, and enabled in the played reference sessions. Not independently labelled as a global product default. |
| 流局時過莊 | When dealer/wind tracking is on: whether the dealer passes on a drawn hand | On in the opened 五一辣辣上 rule setup, and enabled in the demonstrated configuration. Off-state is unspecified. |

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

**Unspecified:** any preference layer beyond the rule setup and the in-session display/dealer controls listed.

## External display

External-display support is a decided product requirement: 現時賽果 can be shown on a larger screen through a projector or external display.

The following are decided:

- This is required on all first-release platforms (iOS and Android).
- AirPlay is required. Another similar path is welcome if it is supported, but AirPlay is a must.
- Start screen sharing by clicking the share-screen button in the app; end sharing by clicking the same button again. Connection start and end are that toggle.
- The external display should show 現時賽果 only. Any other page must be opened in the app to check.
- The reason is that players and the user can check the score immediately, and the developer does not need to design interaction or controls for the external display.
- The look of that 現時賽果 display is left to later AI design.

The following are still **unspecified**:

- What happens if the external display disconnects during a session
- Which other similar path, if any, ships in addition to AirPlay

The local reference does not demonstrate live external-display behavior. The share-screen toggle and the 現時賽果-only rule above remain the decided 麻雀諗 display model.

## Unanswered questions

These decisions are still open and should be specified before implementation is treated as complete. The first release still includes the corresponding options and categories; the gaps below are missing formulas or flows, not a decision to omit the feature.

1. 半銃 rounding when F is not divisible by 4, and 半銃 interaction with 出銃者包自摸, 出銃者包輸, and three-player play. (The four-player ordinary discard split, a matching self-draw, and a 半銃 一炮多響 example are now recorded above.)
2. Three-player scoring details (layout, score table, self-draw allocation, and the three-player preset table).
3. Detailed scoring tables and payout rules for the reference’s other regional categories (台灣麻將, 日本麻雀, 碰槓牌（跑馬仔）, 港式台灣麻將); and intermediate amounts for Hong Kong presets that were not opened in full.
4. 詐糊 when 詐糊賠位自摸 is on (previewed, not confirmed); and 詐糊 effects on dealer progress and statistics. (The 詐糊 settlement with 詐糊賠位自摸 off is now recorded above.)
5. 出銃者包自摸 and 出銃者包輸 eligible situations and exact confirmed calculations. (Previews are recorded above and must not be treated as confirmed settlements.)
6. Jackpot award, withdrawal, in-play 流局 contribution, and settlement. (Default off, and a contribution field that starts at 0 when first enabled, are now recorded.)
7. Fan min/max endpoints beyond the demonstrated 起糊 3 and 滿糊 sitting at 13 on the right-hand end of the control; and what happens if a fan is entered outside the configured range.
8. Whether the 1.50 self-draw multiplier is editable, and rounding / decimal rules.
9. The complete dealer / 連莊 progression algorithm, including the off-state of 流局時過莊.
10. Saved-rules rename, name-length, and duplicate-name behavior; mid-session rule edits. (Delete of a saved custom setup was demonstrated.)
11. Invalid-entry handling and numeric validation.
12. Roster limits, and editing or deleting an existing player.
13. Undo depth, redo, and editing or deleting an older history row.
14. How past sessions are browsed or resumed while still keeping all local history; session naming; explicit pause / complete / discard if wanted.
15. On-state behavior of new-session reuse options (retain players and/or rules).
16. (Resolved, 14 November 2026.) Settlement transfer-choice, tie-breaking among transfer sets, and a currency label are not needed. Settlement shows the session result and the user finishes payment themselves, as recorded in the Settlement section.
17. Exact statistic formulas, rate denominators, rounding, substitution treatment, multiple-winner aggregation, and the 平均番數 formula; dice count limits; and any fan-help content beyond the short 番數 popup recorded above. (Title awards and the radar-chart mapping are now recorded as 麻雀諗 product decisions.)
18. Special abortive-hand types or reason codes beyond the demonstrated 流局.
19. What happens if the external display disconnects during a session.
20. What technical approach will be used to build the iOS and Android apps?

This list can grow as product decisions are made. New decided rules should be added to the sections above and removed from this list.
