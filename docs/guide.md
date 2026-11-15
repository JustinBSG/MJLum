# 麻雀諗

The GitHub repository for this app is [MJLum](https://github.com/JustinBSG/MJLum).

This document is the scoring and session guide for 麻雀諗. It records decided product direction as of 15 November 2026, and the demonstrated rules a complete scorekeeper app will need. Where a flow, screen, or rule has not been specified yet, it is marked as **unspecified**. Those sections describe the intended topic only; they do not invent UI layout, control labels, or scoring rules.

Scoring, session, and settings behaviour that is marked **taken from the local reference** (reference-demonstrated) is established by that reference and should be followed. **麻雀諗 product decisions** are decided for this app and must not be treated as reference-established fact. Behaviour that was not found in the reference and has not been decided is marked **unspecified** and must not be invented. This document does not copy a competitor UI. Ads that appear in the local reference are the reference app’s, not 麻雀諗 features.

`docs/product.md` is the short product-direction summary. `docs/features.md` lists first-release features. `docs/controls.md` lists demonstrated controls. `docs/flows.md` has end-to-end handover scenes. `docs/README.md` explains how facts are labelled.

## What the app is for

麻雀諗 is a table scorekeeper for in-person Hong Kong Mahjong. It is not a tile game: it does not deal, draw, or display a playable wall of tiles, and it is not meant to replace physical tiles at the table.

Players use the app to keep and show scores during a live game. In the second release, the scoreboard can also be shown on a smart TV wirelessly.

## Decided product direction

The following points are decided:

- The app is a cross-platform mobile app. First-release platforms are iOS and Android.
- The app has no ads.
- At the current stage the app is completely free.
- The UI/UX is distinct, and is not a copy of the existing iPhone app 麻將計數機.
- All UI/UX should be designed by AI. AI should follow this guide to design the most user-friendly UI/UX, and should use https://github.com/nextlevelbuilder/ui-ux-pro-max-skill to assist generation. This is a design-process decision; this document does not include those designs.
- The first release is a personal/table tool only, not a public App Store or Play Store app yet.
- The UI language and locale is Traditional Chinese — Hong Kong only.
- Only one device is used at the table. The first release does not support more than one device following the same session.
- The first release has exactly the same functionality as the local reference. That includes all reference scoring options, such as 半銃, 詐糊, 出銃者包自摸, 出銃者包輸, and Jackpot. Formulas that have been demonstrated are recorded in the sections below. Formulas that still have not been demonstrated remain unspecified and must not be invented. The first release also includes the reference’s rule categories (including 台灣麻將, 日本麻雀, 碰槓牌（跑馬仔）, and 港式台灣麻將) and utilities (statistics, titles, a radar chart, a dice utility, and fan-help). The already-decided 麻雀諗 product rules in the list above that are not about external display / wireless TV are part of this first release, not extra features: no ads; a distinct UI; Traditional Chinese — Hong Kong only; one device at the table; iOS and Android; local-only data; and no metadata sharing.
- The second release is the wireless connection to a smart TV, together with the related external-display product rules recorded in the External display section. Other extra features beyond the first-release point-counter scope can also come in a later release.
- The app keeps all in-game records (all the things in the game) across sessions, stored locally only.
- Data is local only: no backup, no cloud, and no account or sign-in requirement. Storage should be kept light.
- The app does not share metadata or session data, including results, history, player information, settlement, or other session information. It is a simple local tool. For the second-release external display, the share-screen control is a local display connection, not sharing of metadata.
- Scoring, session, and settings behavior follow the local reference where that behavior is established, as recorded in the sections below. Behavior that was not found in the reference remains unspecified.

Visual design and navigation remain unspecified and are left to later AI UI/UX design. Expo plus libraries is the recorded development approach for building the iOS and Android apps; individual libraries are suggestions unless stated otherwise. Details are in [`docs/development.md`](development.md) and [`docs/product.md`](product.md).

## First release and second release

The first release develops the point-counter / table scorekeeper features: exactly the same functionality as the local reference, together with the already-decided 麻雀諗 product rules listed above that are not about external display / wireless TV.

Same-functionality here means the scoring, session, settings, statistics, titles, radar chart, dice utility, fan-help, and other behaviors established in the local reference, including options whose formulas were not demonstrated. Those undemonstrated formulas stay **unspecified** and must not be invented. The first release does not copy the reference UI.

The already-decided 麻雀諗 product rules that apply in the first release are: no ads; a distinct UI; Traditional Chinese — Hong Kong only; one device at the table; iOS and Android; local-only data with all in-game records kept across sessions; and no sharing of metadata or session data.

The second release is the wireless connection to a smart TV, together with the related external-display product rules recorded in the External display section. Other extra features beyond that first-release point-counter scope can also come in a later release.

## How screens and functions fit together

The following function areas are planned so the app can serve as a table scorekeeper. Screen names, information architecture, and how the user moves between them are **unspecified**. UI/UX for these areas is to be designed later by AI, following this guide and using https://github.com/nextlevelbuilder/ui-ux-pro-max-skill to assist generation.

- **Scoreboard / table view:** planned as the in-app view that shows current scores. Other pages are opened in the app to check. In the second release, the external display shows 現時賽果 only.
- **Session and scoring entry:** planned as the way players start or continue a game and record scoring events. Scoring and session behavior that was taken from the local reference is recorded below.
- **Settlement:** a user-requested view of current net session balances. 麻雀諗 shows those results and lets the user finish payment themselves (product decision). Details are in the Settlement section.
- **Statistics, titles, and radar chart:** included in the first release. Session-wide statistics follow the local reference where that behaviour is established. Title-award rules and the radar mapping are 麻雀諗 product decisions, recorded below. Rate denominators and the 平均番數 formula remain unspecified.
- **Dice utility and fan-help:** included in the first release. These are table utilities; their established behaviour, the 麻雀諗 dice purpose, and the demonstrated 番數? text are recorded below.
- **Sharing of metadata or session data:** not supported. The app is a simple local tool and does not share results, history, player information, settlement, or other session information.
- **Settings:** follow the local reference, as listed in the Settings section. The app itself is ad-free (this is a product rule, not an optional setting), and the UI language and locale is Traditional Chinese — Hong Kong only.
- **External display (second release):** planned as a wireless connection to a smart TV, showing 現時賽果 only, on iOS and Android. On iOS / iPhone the path is AirPlay for unique 現時賽果. On Android the path must be an official wireless path (Miracast-class Presentation and/or Cast — not yet chosen). Unofficial Android AirPlay senders are not fulfilment. Official wired HDMI / USB-C Presentation exists, but is not the chosen fulfilment. The user starts and ends the connection with the same share-screen button in the app. Any other page must be opened in the app to check. The reason is that players and the user can check the score immediately, and the developer does not need to design interaction or controls for the external display. The look of that 現時賽果 display is left to later AI design. Behavior when the connection drops is unspecified. Technical detail is in `docs/development.md`.
- **History:** the app keeps all in-game records across sessions, stored locally only. How the user browses, resumes, or deletes past sessions is unspecified, except that storage is local only and should be kept light.

No wireframes, component list, or visual style are specified in this document on purpose.

## How to use it

Intended use, at a high level:

1. People play Hong Kong Mahjong in person with physical tiles.
2. One device at the table is used to keep the table's scores in 麻雀諗. The recorder enters who won, the fan value, and how the win happened; the app applies the chosen score table.
3. Optionally, in the second release, 現時賽果 is shown on a smart TV wirelessly. The user starts and ends that connection with the share-screen button in the app. Any other page is opened in the app to check.

Detailed first-run, player-setup, and in-game screen layout are **unspecified** and are left to later AI UI/UX design, following this guide. End-to-end functional flows, with demonstrated numbers to check against, are in `docs/flows.md`.

## Platforms

First-release platforms are iOS and Android. Wireless connection to a smart TV is second-release work, not first-release fulfilment.

Expo plus libraries is the recorded development approach for building the iOS and Android apps; individual libraries are suggestions unless stated otherwise. Details are in [`docs/development.md`](development.md) and [`docs/product.md`](product.md).

## Language and locale

The UI language and locale is Traditional Chinese — Hong Kong only. Other languages and locales are not in scope unless later decided.

## Devices at the table

Only one device is used at the table. The first release does not support more than one device following the same session.

## History and storage

The app keeps all in-game records (all the things in the game) across sessions. Data is local only: no backup, no cloud, and no account or sign-in requirement. Storage should be kept light.

**Taken from the local reference:** during a session, the app keeps running net balances, a chronological hand/event ledger, and accumulated session statistics. The ledger can emphasize events, score changes, or a combined view, and can be shown in forward or reverse order.

**Unspecified:** how past sessions are browsed, resumed, or reopened after a new session starts; and whether an older history row can be edited or deleted. Statistic fields that were demonstrated are recorded below; rate denominators and the 平均番數 formula remain unspecified.

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
- Visible Hong Kong preset families include 3番4, 二五雞, 五一, and 一二蚊, each in 半辣上 and 辣辣上 forms, plus a three-player 3番4 半辣上 variant. Their meaning is the visible start and cap amounts and score tables, not an extra invented formula. Different presets can share a starting amount but differ later in the table; the whole table should be inspected. The visible summaries use 全銃. The list of presets may continue beyond what was captured.

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

Opened Hong Kong preset tables are recorded below. Fans outside a shown range stay empty.

**一二蚊辣辣上**, opened for 3–8. Self-draw totals are ×1.50. Fans above 8 were not on that screen.

| Fan | Ordinary-win amount (食糊分數) | Self-draw total (自摸分數) |
|---:|---:|---:|
| 3 | 32 | 48 |
| 4 | 64 | 96 |
| 5 | 128 | 192 |
| 6 | 256 | 384 |
| 7 | 512 | 768 |
| 8 | 1024 | 1536 |

**3番4 半辣上（三人）**, opened for 3–8 at ×1.50. The self-draw total is 1.5S, split across the two opponents. Fans outside 3–8 were not on that screen. This preset does not use the 3番4辣辣上 three-player ×1.33.

| Fan | Ordinary-win amount (食糊分數) | Self-draw total (自摸分數) |
|---:|---:|---:|
| 3 | 3 | 4.5 |
| 4 | 6 | 9 |
| 5 | 9 | 13.5 |
| 6 | 12 | 18 |
| 7 | 18 | 27 |
| 8 | 24 | 36 |

Two 辣辣上 tables were recorded first, for the range then on screen.

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

**3番4辣辣上**, with the default 3–8 range:

| Fan | Ordinary-win amount (食糊分數) | Self-draw total (自摸分數) |
|---:|---:|---:|
| 3 | 4 | 6 |
| 4 | 8 | 12 |
| 5 | 16 | 24 |
| 6 | 32 | 48 |
| 7 | 64 | 96 |
| 8 | 128 | 192 |

With sliders at 1番起糊 / 13番滿糊, the same doubling continued. Demonstrated additional rows include 1: 1/1.5, 2: 2/3, and 6–13: 32/48 through 4096/6144 (13: 4096/6144). With 起糊 at 0 (leftmost), a 0-fan row 0.5/0.75 was shown, then 1: 1/1.5, 2: 2/3, 3: 4/6.

The following **半辣上** tables were opened through 13 (滿糊 at the right-hand end). Self-draw totals are the ordinary amount × 1.50 unless a different 自摸倍數 is set.

**3番4 半辣上** (3–13):

| Fan | Ordinary-win amount (食糊分數) | Self-draw total (自摸分數) |
|---:|---:|---:|
| 3 | 4 | 6 |
| 4 | 8 | 12 |
| 5 | 12 | 18 |
| 6 | 16 | 24 |
| 7 | 24 | 36 |
| 8 | 32 | 48 |
| 9 | 48 | 72 |
| 10 | 64 | 96 |
| 11 | 96 | 144 |
| 12 | 128 | 192 |
| 13 | 192 | 288 |

**二五雞 半辣上** (3–13):

| Fan | Ordinary-win amount (食糊分數) | Self-draw total (自摸分數) |
|---:|---:|---:|
| 3 | 8 | 12 |
| 4 | 16 | 24 |
| 5 | 24 | 36 |
| 6 | 32 | 48 |
| 7 | 48 | 72 |
| 8 | 64 | 96 |
| 9 | 96 | 144 |
| 10 | 128 | 192 |
| 11 | 192 | 288 |
| 12 | 256 | 384 |
| 13 | 384 | 576 |

**五一 半辣上** (3–13):

| Fan | Ordinary-win amount (食糊分數) | Self-draw total (自摸分數) |
|---:|---:|---:|
| 3 | 16 | 24 |
| 4 | 32 | 48 |
| 5 | 48 | 72 |
| 6 | 64 | 96 |
| 7 | 96 | 144 |
| 8 | 128 | 192 |
| 9 | 192 | 288 |
| 10 | 256 | 384 |
| 11 | 384 | 576 |
| 12 | 512 | 768 |
| 13 | 768 | 1152 |

**一二蚊 半辣上**, default 3起 / 8滿: 3: 32/48, 4: 64/96, 5: 96/144, 6: 128/192, and fan 8 peeked as 256/384. With sliders at 0起 / 13滿:

| Fan | Ordinary-win amount (食糊分數) | Self-draw total (自摸分數) |
|---:|---:|---:|
| 0 | 4 | 6 |
| 1 | 8 | 12 |
| 2 | 16 | 24 |
| 3 | 32 | 48 |
| 4 | 64 | 96 |
| 5 | 96 | 144 |
| 6 | 128 | 192 |
| 7 | 192 | 288 |
| 8 | 256 | 384 |
| 9 | 384 | 576 |
| 10 | 512 | 768 |
| 11 | 768 | 1152 |
| 12 | 1024 | 1536 |
| 13 | 1536 | 2304 |

A saved custom setup can be deleted: the reference asks 確定刪除嗎?, and after confirmation the custom list can show 未有自訂玩法. Adding a custom setup (增加玩法) creates another 新玩法. The default custom table starts at 3番起糊 with ordinary-win amount 4 and 8番滿糊, doubling each fan (3: 4/6, 4: 8/12, 5: 16/24, 6: 32/48). Extending 滿糊 to 13 kept doubling through 13: 4096/6144. Ordinary-win cells are individually editable; the matching 自摸分數 updates to ×1.50 of that cell. Editing one fan does not automatically recalculate later fans: after raising fans 3–6, fan 7 stayed 64/96, so 6 and 7 tied. That unsaved custom was then abandoned (放棄設定嗎? confirmed), returning to 未有自訂玩法. After configuration, 儲存此玩法嗎？ offers 取消, 直接使用, or 儲存; a saved setup appears under 自訂玩法.

The first release includes the reference’s other regional categories (台灣麻將, 日本麻雀, 碰槓牌（跑馬仔）, 港式台灣麻將) as part of the same-functionality scope. Detailed scoring for those categories was not established in the reference, remains **unspecified**, and must not be invented.

**Opened 3–8 rows:** 一二蚊辣辣上 is 32, 64, 128, 256, 512, 1024, with self-draw 48, 96, 192, 384, 768, 1536. 3番4 半辣上（三人） is 3, 6, 9, 12, 18, 24. Fans outside 3–8 were not on those screens. The other regional categories still have no scoring table.

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

When F is not divisible by 4, the same split is used with decimals; there is no integer rounding. Demonstrated 3番 ordinary discard after 食糊分數 was edited 16 → 15, 出銃者 c, winner d, footer 總分 15:

| Player | Change |
|---|---:|
| a | −3.75 |
| b | −3.75 |
| c (出銃者) | −7.5 |
| d (winner) | +15 |

A later four-player 半銃 self-draw of 12 fan matched the already-recorded self-draw rule (winner total = ordinary amount × 1.50; each of the three opponents pays one third). 12-fan amounts: 8192 × 1.50 = 12288 total; each of a, b, and c paid 4096; d received 12288.

**Taken from the local reference (three-player):** a 3番4辣辣上 setup used as 三人麻雀, 全銃, 自摸倍數 ×1.33, had settings rows 3: 3/4, 4: 6/8, 5: 12/16, 6: 24/32. Fan 7 was not scrolled into view; fan 8 was peeked and then confirmed in play as 96/128.

Demonstrated three-player settlements:

- 3番, 出銃者 c, 總分 3: a +3, b 0, c −3, a 莊, 東圈南風.
- Then a 3番 自摸 (total 4; each of the other two paid 2): a +1, b −2, c +1, b 莊, 東圈西風.
- Then 4番 自摸, footer 6 × 1.33 = 8 (self-draw total equals F × 4/3; each of the two opponents paid 4): a −3, b +6, c −3, b 莊 with 連1, 東圈西風.

**Unspecified:** 半銃 combined with 出銃者包自摸 or 出銃者包輸. Three-player 半銃, the 3番4辣辣上 全銃 ×1.33 rows, and the 3番4 半辣上（三人） 3–8 rows at ×1.50 are decided. Switching to three players does not by itself change another setup to 4/3.

### Fan range and the score table

**Taken from the local reference:**

- Fan range has a minimum winning threshold (起糊) and a cap (滿糊). A two-handle range control is used in the reference. 起糊 can be moved to 0 (leftmost). 滿糊 was moved from 8 through 10 to 13, where the control sat at its right-hand end. No 14番 row and no cap above 13 were shown in the reference. No out-of-range typed fan entry was demonstrated (editing 食糊分數 16 → 15 is an ordinary-win cell edit, not an out-of-range fan).
- Ordinary-win amounts (食糊分數) are entered per fan level in the rules.
- Self-draw amounts (自摸分數) are derived as ordinary amount × the current 自摸倍數, and that figure is the winner’s **total** gain. The demonstrated default multiplier is ×1.50. The multiplier is editable: tapping the (×1.50) chip opens a 自摸倍數 dialog (value 1.5, keypad). Changing it to 2 made the chip (×2.00) and updated the 自摸 column (demonstrated 1: 1/2, 2: 2/4, 3: 4/8, 4: 8/16 on that table). In four-player self-draw, each of the three opponents pays one third of the winner’s total. A later 5番 自摸 at ×2.00 had footer 16 × 2.00 = 32; d +32; a, b, and c each −10.67 (32/3 shown to two decimals).
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

**麻雀諗 product decision:** 滿糊 is user-decidable and may be set above 13. Money for 番 above 13 should be calculated. Do not invent the exact progression above 13; use only tables and rows that were demonstrated, and leave any further sequence unspecified until it is decided.

**Unspecified:** what happens in the reference if a user tries to type a fan below 起糊 or above 滿糊; any exact 滿糊 progression above 13; and three-player self-draw allocation outside the demonstrated ×1.33 hands above. Decimal display to two places was shown (for example −10.67 and the F = 15 半銃 split).

### Jackpot

**Taken from the local reference:** Jackpot is an optional shared pool. When it is enabled, the rules specify how much each player contributes to the pool on a drawn hand.

In an opened 五一辣辣上 rule setup, Jackpot 啟用 was off by default. Turning it on reveals 流局時每位玩家須付彩池, which started at 0 and is editable. A typed 010 was used as 10.

**流局 contribution.** After a first confirmed 流局 with contribution 10, each of the four paid 10, Jackpot went 0 → 40, and 莊/圈風 advanced because 流局時過莊 was on (board a 24562.25, b 24562.25, c 24430.5, d −73595, 東圈西風, a 莊, following a prior 詐糊 settlement). A second 流局 put another −10 on everyone and left the pool at 80 (ledger 南 and 西 rows all −10). A later session with the same contribution and 過莊 on went from 東圈東風 / d 莊, Jackpot 0, after stacked 流局, to 東圈北風 / b 莊, all four −30, Jackpot 120.

**贏取Jackpot.** 食糊! has a 贏取Jackpot toggle. A 13番 自摸 with it on, pool 80, showed footer 16384 × 1.50 + Jackpot 80 = 總分 24656. Ledger 北: a, b, and c each −8192; d +24656. 8192 = 24576/3; the 80 comes from the pool, not from the other players. After confirm, that award path emptied the pool. No separate withdraw control was shown besides this toggle and 平分Jackpot.

**平分Jackpot.** Tapping the on-board Jackpot amount opens 請選擇 → 平分Jackpot → 平分給哪些玩家？ (在位玩家), then confirm. Demonstrated all-four split: all four were −50, Jackpot 200, 南圈南風, c 莊; after confirm, all four were 0, Jackpot 0, same 莊 and 圈風 (200/4 = 50 each).

The first release includes Jackpot as a visible option.

**麻雀諗 product decision:** 平分Jackpot gives the whole current pool to one or more players who are sitting now. Nobody selected cannot confirm. Someone who has left the table is not a recipient. Taking only part of the pool is not in this scope. 找數 shows the pool remainder and marks a non-zero pool 尚未分配. It does not list transfers.

### Dealer, wind, and session progress

**Taken from the local reference:**

- Tracking dealer and circle/wind progress is an optional rules setting, independent of the point table. When it is on, a further setting controls whether the dealer passes on a drawn hand (流局時過莊).
- When 流局時過莊 is on, a recorded 流局 advances 莊 and 圈風. If Jackpot is off, balances are unchanged by the draw itself; if Jackpot is on, the contribution is applied as recorded above.
- When 流局時過莊 is off (紀錄莊家及圈風 still on), a confirmed 流局 leaves 莊 and 圈風 put. The dealer badge changes from a plain 莊 (no number) to 冧1, 冧2, 冧3, 冧4, and later 冧5 in the demonstration, using 冧 (U+51A7). Starting board: d 莊, 東圈東風, all scores 0. After those 流局, d remained dealer, 東圈東風 stayed, and scores stayed 0 (Jackpot was off). 詳細紀錄 (分數 tab) stayed in 東圈1 with 0 point rows. Opening 食糊! and cancelling it did not increment 冧.
- A dealer win causes 連莊. A demonstrated sequence showed d 連1 → 連2 → 連3. In another demonstration, d stayed 莊 into 南圈東風 after winning as 北 莊. A three-player dealer 自摸 left b 莊 with 連1 and the same 圈風. A non-dealer win passes 莊 (see the three-player 3番 自摸, and a dealer 詐糊 that caused 過莊: 東圈南風, c 莊).
- A dealer can be selected manually. When doing so, a consecutive-dealer count (連莊) can be reset, and circle/wind counting can be restarted, as separate choices.
- Session progress can be shown as circle/wind (for example 東圈東風) or as a hand count. The session can also show the active rules name, start date, and hand count (for example 玩法, 開始日期, 總局數, 牌局進度, and 進度顯示方式 圈風 or 局數). A consecutive-dealer mark (連N) can appear on the dealer tile after a consecutive dealer win; 連1 was shown. 冧X is the drawn-hand badge when 流局時過莊 is off; it is not the same mark as 連N.
- Mid-session rule values can be inspected. Whether they can be edited, and what that would do to already-recorded hands, is not established.

**Unspecified:** the complete dealer-progression algorithm for every remaining result type, including the exact 連莊 counting convention in every edge case; and mid-session rule edits. Do not invent the missing cases.

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

詐糊賠位自摸 on was later confirmed. 詐糊番數 13, footer −16384 × 1.50 × 3 = 總分 −73728. Stable board from a session that already had decimal 半銃 scores: a 24572.25, b 24572.25, c 24440.5, d −73585 (each of a, b, and c received 24576). The false-win dealer d also caused 過莊: 東圈南風, c 莊.

- **Special payer options (出銃者包自摸 and 出銃者包輸):** two distinct toggles, now confirmed on a stable board, continuing from the F = 15 半銃 board (a −3.75, b −3.75, c −7.5, d +15).
  - 出銃者包自摸 on, 5番, 出銃者 c, footer 64 × 1.50 = 總分 96. Stable board: a −3.75, b −3.75, c −103.5, d +111 (only c paid 96). After these hands, statistics showed d with 3 食糊 and 1 自摸, so the 包自摸 hand counted as 自摸.
  - 出銃者包輸 on (包自摸 off), 4番, 出銃者 c, footer 總分 32. Stable board: a −3.75, b −3.75, c −135.5, d +143 (only c paid 32).
- **Drawn hand (流局):** used when a hand ends without a winner and should still be recorded as session progress, after confirmation. Dealer and wind behaviour depends on 流局時過莊, and pool behaviour depends on Jackpot, as recorded in the Dealer and Jackpot sections.

After confirmation, running totals, session progress, statistics, and the hand history update.

The first release includes 詐糊, 出銃者包自摸, and 出銃者包輸 as visible options. Confirmed settlements for 詐糊賠位自摸 off and on, 出銃者包自摸, and 出銃者包輸 are now recorded.

**Unspecified:** further 詐糊 effects on statistics beyond the dealer 過莊 already shown; combined 半銃 plus 包-toggle cases that were not demonstrated; invalid-entry handling (for example winner = discarder, or invalid multi-winner sets); numeric validation; and special abortive-hand types or reason codes beyond the demonstrated 流局. The undemonstrated cases must not be invented.

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

**麻雀諗 product decision:** settlement (找數) shows every roster player’s net, including a zero and anyone who has left a seat, plus the Jackpot remainder. A non-zero pool is marked 尚未分配. The user finishes payment themselves. 麻雀諗 does not compute payment instructions, does not choose a set of transfers, and does not need a transfer-choice algorithm, tie-breaking among transfer sets, or a currency label. Paid-tracking and payment execution stay out.

Settlement is checked in the app. When a second-release external display is connected, it is not checked on that display. That display shows 現時賽果 only. The share-screen connection remains a local display connection, not a share of session data to another person or service.

## Statistics, titles, radar, dice, and fan-help

These utilities are part of the same-functionality first release, not extra features for a later release. Layout and visual design are left to later AI design. This section records established behavior, not a UI to copy.

**Taken from the local reference:**

- Statistics are session-wide. They include everyone on the roster, including a player who has left a seat and a reserve player added before taking a seat.
- The overview counts recorded wins (食糊), self-draw wins (自摸), and occasions of dealing a winning discard (出銃). In the demonstrated totals, 自摸 is a subset of 食糊, not an extra category added on top of it.
- Individual player details also show 平均番數, 食糊率, 自摸率, 出銃率, and 平均出銃番數. In demonstrated cards, 自摸率 matched 自摸/食糊 where 食糊 > 0. Exact denominators for 食糊率 and 出銃率, the 平均番數 formula, rounding, substitution treatment, and multiple-winner aggregation were not printed and are not established.
- Title badges summarize performance. Demonstrated titles include 自摸王, 出銃王, 食糊王, 大牌王, 細牌王, 陪跑員, and 冧莊王 (冧 U+51A7; shown on an empty-session card together with 陪跑員). More than one player can hold the same title at once, so a title is not automatically exclusive (in the demonstrated list, c and d both had 6 出銃 and both showed 出銃王). How 冧莊王 is awarded remains unspecified.
- A radar chart is a visual summary of a player across three labelled dimensions: 進攻, 牌力, and 防守. No numeric scale, weights, or formula was established in the reference; the 麻雀諗 mapping is recorded below as a product decision.
- A dice utility (擲骰) can be used at the table to roll dice. The demonstrated dialog is − / 擲骰 / +. The count ranges from 1 to 9. A roll shows a total and a seat label (對家, 自家, and 上家 were seen; 下家 did not appear in those rolls). Demonstrated rolls: 35 對家 (9 dice), 29 自家 (9), 20 上家 (6), 13 自家 (3), 9 自家 (3), 3 對家 (1). After the dialog closed, scores were still 0 and d was still 莊 with 東圈東風: the roll did not assign the dealer or write scores. The button label is 擲骰, not 重擲.
- Fan-help is opened from the 食糊! dialog by the circled ? beside 番數. It is not a separate page. The full demonstrated help text is only: title 現時設定下; body 這裏只需輸入牌型番數 (這裏 uses 裏 U+88CF, not 這裡). A separate page titled 番數說明 was not shown, and no further help content was opened. This help text is reference-demonstrated, not a 麻雀諗 invention.

Demonstrated statistics list in one session:

| Player | 食糊 | 自摸 | 出銃 | Titles shown |
|---|---:|---:|---:|---|
| a | 4 | 1 | 0 | 細牌王, 陪跑員 |
| b | 8 | 0 | 2 | 食糊王 |
| c | 2 | 0 | 6 | 出銃王 |
| d | 7 | 3 | 6 | 自摸王, 大牌王, 出銃王 |

The same session’s detail card for d showed 7食糊, 3自摸, 6出銃, 7平均番數, 37%食糊率, 43%自摸率, 32%出銃率, and 5平均出銃番數, plus a radar chart labelled 進攻, 牌力, and 防守. In that card, 43% 自摸率 matches 3/7. 37% 食糊率 and 32% 出銃率 are consistent with 7/19 and 6/19, but the card did not itself display the denominator, and an earlier session-info view in the same session had shown 總局數 8, so the denominators stay unspecified.

A later session’s board was a −64, b 132, c 68, d −136, 南圈北風, b 莊, Jackpot 0. Detail cards:

| Player | 食糊 | 自摸 | 出銃 | 平均番數 | 食糊率 | 自摸率 | 出銃率 | 平均出銃番數 | Titles shown |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| a | 1 | 0 | 1 | 5 | 4% | 0% | 4% | 3 | 陪跑員 |
| b | 2 | 0 | 0 | 3 | 9% | 0% | 0% | 0 | 陪跑員 |
| c | 3 | 1 | 0 | 3 | 13% | 33% | 0% | 0 | 食糊王, 自摸王, 大牌王 |
| d | 1 | 1 | 4 | 3 | 4% | 100% | 17% | 4 | 自摸王, 出銃王 |

In those cards, 自摸率 matched 自摸/食糊 where 食糊 > 0 (c 1/3, d 1/1). An empty-session card for d showed 0/0/0, 0 平均番數, 0% rates, 0 平均出銃番數, titles 冧莊王 and 陪跑員, and a radar labelled 進攻.

**麻雀諗 product decision (15 November 2026).** Counts stay on the player, not the seat. H is a completed normal hand while seated, including a normal 流局, and excludes 詐糊, undo, a cancelled entry, a pure balance change, a pool payout, and a seat change. W includes 自摸. Z includes 出銃者包自摸, and that payer does not gain D. One 一炮多響 adds 1 to D and adds every winner’s scoring fan to L. F and L use the scoring fan. Rates are 自摸率 100×Z/W, 食糊率 100×W/H, 出銃率 100×D/H, 平均番數 F/W, and 平均出銃番數 L/D. A zero denominator is shown as 「—」. Display uses two-decimal half-up from the raw counts: floor(100x+0.5)/100, with the count fraction beside a percent, for example 33.33%（1/3）. 平均出銃番數 is labelled 多響番數合計.

Titles remain not automatically exclusive.

- **食糊王:** every player whose 食糊 count equals the highest 食糊 count, provided that highest count is at least 1. If every 食糊 count is 0, no one receives 食糊王.
- **自摸王:** every player whose 自摸 count equals the highest 自摸 count, provided that highest count is at least 1. If every 自摸 count is 0, no one receives 自摸王.
- **出銃王:** every player whose 出銃 count equals the highest 出銃 count, provided that highest count is at least 1. If every 出銃 count is 0, no one receives 出銃王. Ties share the title, as in the demonstrated list where c and d both had 6 出銃 and both showed 出銃王.
- **大牌王:** highest unrounded F/W among players with at least 3 食糊.
- **細牌王:** lowest unrounded F/W among those same players. If fewer than two players are eligible, or every eligible average is equal, neither title is awarded.
- **冧莊王:** longest automatic 留莊 of at least 3. The count starts at 0. A dealer win, including 一炮多響 that includes the dealer, or a 流局 while 流局時過莊 is off, adds 1. 過莊 returns it to 0. A manual dealer change does not add to the record. A non-dealer 詐糊 that leaves the dealer in place adds 1 and does not add W.
- **陪跑員:** every player who holds none of 食糊王, 自摸王, 出銃王, or 大牌王. Holding 細牌王 or 冧莊王 does not prevent 陪跑員. If every player holds at least one of those four titles, no one receives 陪跑員.

The demonstrated title list is consistent with this rule. Other players’ 平均番數 were not shown, so that screen does not independently prove the 大牌王 / 細牌王 averages.

**麻雀諗 product decision (15 November 2026).** Each radar axis is 0–100 with no extra weights. 進攻 = 100×W/H. 防守 = 100×(1−D/H). 牌力 = 100×clamp((F/W−起糊)/(滿糊−起糊), 0, 1). H = 0 shows 未有資料 for 進攻 and 防守. W = 0 or 起糊 = 滿糊 shows 未有資料 for 牌力. A missing axis is not drawn as 0.

**麻雀諗 product decision:** the dice utility is only a roll so players can see where they start collecting tiles from the four walls (bridges) in real life. Minimum 1 die, maximum 9 dice. It does not assign the dealer or write scores. This purpose sentence is not on-screen copy from the reference; the demonstrated UI is recorded above.

**Unspecified:** fan-help content beyond the short popup recorded above. Separate money attribution for a substitute, while the playing statistics stay with that person, is decided and not yet a control.

## Sharing

The app does not share metadata or session data, including results, history, player information, settlement, or other session information. It is a simple local tool.

The second-release share-screen control for an external display is a local display connection, not sharing of metadata. Do not add result-card, profile, or settlement sharing.

## Settings

Settings follow the local reference. This is a behavior and options inventory, not a UI to copy. Defaults are recorded only when the reference states them or clearly shows a remaining selected value in a documented flow. UI language is Traditional Chinese — Hong Kong only; a language-switch setting is not implied. The app is ad-free, and that is not an optional setting.

### Rule setup

| Setting | Meaning | Default, if stated |
|---|---|---|
| 玩法名稱 | Name of this rules setup | Demonstrated default: 新玩法 |
| 人數 | Game format: 四人麻雀 or 三人麻雀 | In the demonstrated custom-setup flow, four-player remained selected. Not independently labelled as a global product default. |
| 全銃 / 半銃 | How a discard-win loss is allocated. 全銃 is demonstrated as the winner receiving the ordinary amount from the discarder only. Four-player 半銃 ordinary discard (including when F is not divisible by 4), self-draw, and 一炮多響 splits are recorded in the Player count and Score entry sections. 半銃 plus three-player play, and combined 半銃 plus 包-toggle cases, remain unspecified. | In one demonstrated custom-setup flow, 全銃 remained selected. A later edited 五一辣辣上 configuration was used with 半銃. Not independently labelled as a global default. |
| 番數設定 (min / max) | Minimum winning fan (起糊) and capped fan (滿糊) | Not generally stated. 起糊 can go to 0. 滿糊 was moved from 8 through 10 to 13, where the control sat at its right-hand end in the reference. For 麻雀諗, 滿糊 may be set above 13 (product decision); do not invent undemonstrated rows. |
| 食糊分數 (per fan) | Editable ordinary-win amount for each fan level in range | No universal default. Depends on the chosen preset or custom edits. The demonstrated custom 3–10 table is recorded in the Fan range section; opened 辣辣上 and 半辣上 tables are recorded in the Rules, presets section. Editing one cell does not automatically recalculate later fans. |
| 自摸分數 / 自摸倍數 | Displayed self-draw total, derived from the ordinary amount × the current multiplier | Demonstrated default ×1.50. The multiplier is editable (×2.00 was used in play). |
| Jackpot 啟用 | Optional shared pool associated with drawn hands. Included in the first release as a visible option. 流局 contributions, 贏取Jackpot, and 平分Jackpot are recorded in the Jackpot section. | Off in the opened 五一辣辣上 rule setup. |
| 流局時每位玩家須付彩池 | When Jackpot is on: numeric contribution each player owes the pool on a drawn hand | The field is hidden when Jackpot is off. When first revealed, the value started at 0 and is editable. A typed 010 was used as 10. Applying the contribution in play is recorded in the Jackpot section. |
| 紀錄莊家及圈風 | Enable dealer and circle/wind progress tracking (does not change score-table amounts) | On in the opened 五一辣辣上 rule setup, and enabled in the played reference sessions. Not independently labelled as a global product default. |
| 流局時過莊 | When dealer/wind tracking is on: whether the dealer passes on a drawn hand | On in some demonstrated setups; off in another. Both states are recorded in the Dealer section. |

After configuration, the setup is confirmed. An edited-preset path may offer to cancel, use the configuration once without saving, or save it as a custom rules entry.

### In-session controls

| Control | Meaning | Default / inspected state, if stated |
|---|---|---|
| Who is dealer | Select the current dealer | No default stated (chosen by the user) |
| 重置連莊數 | Reset consecutive-dealer count when manually setting the dealer | Shown on in the inspected reference dialog; downstream count behavior was not independently tested |
| 重新開始計算圈風 | Restart circle/wind counting when manually setting the dealer | Off leaves 圈風. On sets 東圈東風 immediately and can be undone. The change does not add a 留莊 record. |
| Progress display: 圈風 / 局數 | Display choice for session progress (not a score change) | Both options exist; alternative main-table formatting is unspecified |
| History emphasis: events / scores / combined | What the ledger emphasizes | No default stated |
| History order | Ledger order, forward or reverse | No default stated |

**Unspecified:** any preference layer beyond the rule setup and the in-session display/dealer controls listed.

## External display

External-display support is a decided 麻雀諗 product requirement for the **second release**, not first-release fulfilment: 現時賽果 can be shown on a smart TV wirelessly.

The following are decided for the second release:

- The plan is a wireless connection to a smart TV, on both iOS and Android.
- On iOS / iPhone, the path is AirPlay, showing unique 現時賽果 only (not only a phone-UI mirror).
- On Android, the path must be an official wireless Android-to-smart-TV path (Wi-Fi Display / Miracast-class Presentation and/or Google Cast — which of those to ship is not yet chosen). Unofficial or commercial Android AirPlay senders are not fulfilment.
- Official wired HDMI / USB-C Presentation exists, but it is not the chosen fulfilment.
- Start screen sharing by clicking the share-screen button in the app; end sharing by clicking the same button again. Connection start and end are that toggle. Share-screen is a local display connection, not sharing of metadata.
- The external display should show 現時賽果 only. Any other page must be opened in the app to check.
- The reason is that players and the user can check the score immediately, and the developer does not need to design interaction or controls for the external display.
- The look of that 現時賽果 display is left to later AI design.

The following are still **unspecified** (second-release planning, not first-release blockers):

- What happens if the external display disconnects during a session
- Which official Android wireless path to ship (Miracast-class Presentation, Cast, or both), and the other open technical decisions recorded in `docs/development.md`

The local reference does not demonstrate live external-display behavior. The share-screen toggle and the 現時賽果-only rule above remain the decided 麻雀諗 display model for the second release. Technical detail is in `docs/development.md`.

## Unanswered questions

These decisions are still open and should be specified before implementation is treated as complete. The first release still includes the corresponding options and categories; the gaps below are missing formulas or flows, not a decision to omit the feature.

Resolved, 14 November 2026, and recorded in the sections above (kept here only as a pointer):

- Four-player 半銃 rounding when F is not divisible by 4 uses decimals and does not integer-round.
- 詐糊 with 詐糊賠位自摸 on, including a confirmed settlement and a dealer 過莊.
- 出銃者包自摸 and 出銃者包輸 confirmed four-player settlements.
- Jackpot 流局 contribution, 贏取Jackpot, and 平分Jackpot (all-four split).
- 起糊 can go to 0; 自摸倍數 is editable; decimal display to two places was shown.
- 流局時過莊 off: 莊 and 圈風 stay put, and 冧X increments.
- Opened 半辣上 tables (3番4, 二五雞, 五一, 一二蚊 including 0起/13滿) and further 3番4辣辣上 rows.
- Demonstrated three-player 3番4辣辣上 全銃 ×1.33 rows and hands.
- Dice UI and 1–9 limits; 番數? full text; statistics fields including 平均番數 and rates.
- Statistic formulas, denominators, two-decimal half-up display, 一炮多響 aggregation, and 冧莊王 (15 November 2026).
- 新牌局 reuse switches prefill the next session and do not block it. Both on keeps people, seats, and rules. Players only returns to 玩法設定 with those people. Rules only opens empty seats with the same rules. Both off opens 玩法設定 with empty seats. Scores, statistics, history, 連莊, and 圈風 reset. A non-zero Jackpot pool must be allocated or the old session kept; it is not carried silently. A change of seat count asks who sits, and anyone not chosen stays a reserve (15 November 2026).
- Settlement transfer-choice is not needed (麻雀諗 product decision).

Resolved as already recorded in [`docs/development.md`](development.md) and [`docs/product.md`](product.md) (kept here only as a pointer, 15 November 2026):

- The technical approach for building the iOS and Android apps is Expo plus libraries. Individual libraries remain suggestions unless those documents mark them required.

Still open:

1. Combined 半銃 plus 出銃者包自摸 / 出銃者包輸 cases that were not demonstrated. Three-player 半銃 and a general 半銃 一炮多響 are decided.
2. Three-player tables other than the demonstrated 3番4辣辣上 全銃 rows and the opened 3番4 半辣上（三人） 3–8 rows. That 半辣上 preset uses ×1.50. Switching to three players does not by itself change another setup to 4/3.
3. Detailed scoring tables and payout rules for the reference’s other regional categories (台灣麻將, 日本麻雀, 碰槓牌（跑馬仔）, 港式台灣麻將). 一二蚊辣辣上 and 3番4 半辣上（三人） now have their opened 3–8 rows; fans outside that range were not shown.
4. The complete dealer / 連莊 progression algorithm for every remaining edge case, including a 一炮多響 that does not include the dealer. 重新開始計算圈風 on now sets 東圈東風.
5. Invalid-entry handling and numeric validation.
6. Roster limits. Rename, delete of a never-seated reserve, a direct seat swap, and 入原玩家帳 are decided.
7. Editing a hand after the rules changed mid-session. Undo and redo cover the latest branch. An older win can be revised when every later row has a stored action.
8. Past sessions can be opened read-only, resumed, paused, completed, voided, or permanently deleted. A voided session stays in the list and is marked 作廢.
9. Special abortive-hand types or reason codes beyond the demonstrated 流局.
10. What happens if the external display disconnects during a session (second-release planning, not a first-release blocker).

This list can grow as product decisions are made. New decided rules should be added to the sections above and removed from this still-open list.
