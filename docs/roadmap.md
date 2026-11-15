# 麻雀諗 development roadmap

This file is a coder-ready build-order roadmap as of 15 November 2026 (Asia/Hong Kong). It arranges already-recorded work into concrete features a coder can implement and check. **It does not add new product decisions.**

Product rules and the release frame are in [`docs/product.md`](product.md) and [`docs/features.md`](features.md). Scoring, session, and settings behaviour is in [`docs/guide.md`](guide.md). Demonstrated controls are in [`docs/controls.md`](controls.md). End-to-end scenes with numbers to check against are in [`docs/flows.md`](flows.md). The Expo approach, suggested libraries, the second-release wireless second-screen plan, and open technical decisions are in [`docs/development.md`](development.md). How facts are labelled is in [`docs/README.md`](README.md). Command-line setup for the later UI/UX skill is in [`docs/ui-ux-pro-max-skill.md`](ui-ux-pro-max-skill.md).

This order is a practical implementation sequence, not a schedule and not a set of effort estimates. Do not invent formulas, tables, history UX, connection-drop behaviour, or other product answers to fill a gap. Leave each gap marked **unspecified** until it is decided or demonstrated.

## How facts are labelled

Every behavioural fact this roadmap points at is already one of the following in the source documents:

- **麻雀諗 product decision:** a rule decided for 麻雀諗.
- **Taken from the local reference** (also called **reference-demonstrated**): behaviour established by the local reference. The first release must provide the same point-counter / table scorekeeper functionality. Do not copy the reference UI.
- **Unspecified:** not demonstrated in the reference and not decided for 麻雀諗. Do not invent a formula, table, or flow to fill the gap.

Ads that appear in the local reference are the reference app’s ads. They are not 麻雀諗 features. 麻雀諗 has no ads.

## Release frame

This frame is already decided. This roadmap does not reopen it.

- **First release** develops the point-counter / table scorekeeper features: exactly the same functionality as the local reference, plus the already-decided 麻雀諗 product rules that are not about external display / wireless TV. Same-functionality includes all reference scoring options, such as 半銃, 詐糊, 出銃者包自摸, 出銃者包輸, and Jackpot, the reference’s other regional rule categories, and the utilities: statistics, titles, a radar chart, a dice utility, and fan-help. Formulas and tables that are still not demonstrated remain **unspecified** and must not be invented. Unspecified scoring formulas stay inside their first-release feature; do not move those options to the second release.
- **Second release** is the wireless connection to a smart TV, together with the related external-display product rules (in-app share-screen start/end, external display shows 現時賽果 only, AirPlay on iPhone, official wireless path on Android, unofficial Android AirPlay senders not fulfilment, official wired HDMI / USB-C Presentation exists but is not the chosen fulfilment).
- Expo / React Native is the recorded development approach. Individual libraries are suggestions unless the live documents already mark them required. Expo itself is required. `expo-dev-client` plus prebuild is required for unique second-screen work in the second release. Expo Go cannot do that second-release work.
- Visual UI/UX is designed later with the skill documented in [`docs/ui-ux-pro-max-skill.md`](ui-ux-pro-max-skill.md). The later UI/UX skill is now present on this `uat` branch; remaining work is in feature 14. First-release features below are functional requirements, not a screen inventory.

Other extra features beyond that first-release point-counter scope can also come in a later release. This file does not invent what those features are. Distribution accounts (Apple Developer Program, Play Console, sideload / TestFlight, and similar) remain an open technical decision in [`docs/development.md`](development.md) and are not a feature slice in this roadmap.

The in-app share-screen button is part of the second-release TV feature, as the current documents already record. This roadmap does not decide whether a first-release build omits that button.

## Features in build order

| # | Feature | Release | Main sources |
|---|---|---|---|
| 1 | Project foundations | First release | product, features, development, guide |
| 2 | Rule setups and presets | First release | guide, features, controls, flows |
| 3 | Session, roster, dealer, 圈風, and 冧 | First release | guide, features, controls, flows |
| 4 | Ordinary wins and 自摸 | First release | guide, features, flows, controls |
| 5 | 半銃 and 一炮多響 | First release | guide, features, flows |
| 6 | 流局 and 連莊 / 過莊 | First release | guide, features, flows, controls |
| 7 | 詐糊, 出銃者包自摸, and 出銃者包輸 | First release | guide, features, flows |
| 8 | Jackpot | First release | guide, features, flows, controls |
| 9 | 找數 / settlement | First release | guide, features, product, flows |
| 10 | Statistics, titles, and radar | First release | guide, features, product, flows |
| 11 | Dice | First release | guide, features, product, controls, flows |
| 12 | Fan-help (番數?) | First release | guide, features, product, flows |
| 13 | History and persistence | First release | guide, features, product, development |
| 14 | UI/UX design system | Later / supporting | product, ui-ux-pro-max-skill, development |
| 15 | Wireless connection to a smart TV | Second release | product, features, development, guide, controls, flows |

## First release

### 1. Project foundations

- **Release:** First release.
- **Covers:** Create the Expo / React Native app for the first-release platforms, iOS and Android. Expo itself is required. Pin the UI language and locale to Traditional Chinese — Hong Kong only (`zh-Hant-HK`), including when the device locale differs. The first release is a personal/table tool only, not a public App Store or Play Store app yet. Only one device is used at the table; do not support more than one device following the same session. Data is local only: no backup, no cloud, and no account or sign-in. Keep storage light. The app does not share metadata or session data (results, history, player information, settlement, or other session information). The app has no ads and is completely free at the current stage. Suggested libraries for a local store, exact score values, and locale are in [`docs/development.md`](development.md); do not treat a suggested package as locked. Never use raw JavaScript `Number` for scores; construct score values from strings or an integer numerator/denominator, never from a previously rounded `Number`. Backup-exclusion caveats for a local-only store (iOS exclusion flag and Android Auto Backup / `allowBackup` conflict) are recorded in [`docs/development.md`](development.md) and must not be resolved by inventing a product rule.
- **Sources:** [`docs/product.md`](product.md), [`docs/features.md`](features.md), [`docs/development.md`](development.md), [`docs/guide.md`](guide.md) (platforms, language, devices, history and storage, sharing).
- **Unspecified (do not invent):** display rounding and storage of non-terminating decimals is an open first-release product gap (for example some 半銃 splits such as 32/3). Implement exact values here; leave the display-rounding rule unspecified in feature 5, where that scoring gap belongs. Distribution accounts remain an open technical decision and are not part of this slice. Do not lock individual libraries. Unique second-screen native work is second-release work (feature 15); `expo-dev-client` plus prebuild is required for that later work, and Expo Go cannot do it.

### 2. Rule setups and presets

- **Release:** First release.
- **Covers:** Choose a rules setup before play: a Hong Kong preset, a saved custom setup, or a one-off configuration (直接使用) without saving. Hong Kong preset families: 3番4, 二五雞, 五一, and 一二蚊, each in 半辣上 and 辣辣上 forms, plus 3番4 半辣上（三人）. Use only opened tables recorded in [`docs/guide.md`](guide.md). Create, edit, use once, save, and delete a custom setup (demonstrated default name 新玩法). Ordinary-win cells are individually editable; editing one fan does not automatically recalculate later fans; the matching 自摸分數 updates from the current 自摸倍數. Deleting a saved custom setup is confirmed first. Player-count format is 四人麻雀 or 三人麻雀, separate from roster size. Payment modes are 全銃 and 半銃. Fan range has 起糊 and 滿糊; in the reference, 起糊 can go to 0 and the 滿糊 slider’s right end is 13. **麻雀諗 product decision:** 滿糊 is user-decidable and may be set above 13; money for 番 above 13 should be calculated, without inventing an undemonstrated progression. 自摸倍數 is editable (usual demonstrated value ×1.50; ×2.00 was also used in play). Optional Jackpot enablement and 流局時每位玩家須付彩池 belong here as rule-setup controls; pool settlements are feature 8. Optional 紀錄莊家及圈風, with 流局時過莊 on or off, belongs here as a rules setting; session progress behaviour is features 3 and 6. The reference’s other regional categories (台灣麻將, 日本麻雀, 碰槓牌（跑馬仔）, 港式台灣麻將) are in first-release scope as visible rule families. Checkable custom-setup and 起糊 / 滿糊 / 自摸倍數 scenes are in [`docs/flows.md`](flows.md) flows 11–13.
- **Sources:** [`docs/guide.md`](guide.md) (rules, presets, custom setups, player count and payment mode, fan range, settings), [`docs/features.md`](features.md), [`docs/controls.md`](controls.md) (玩法設定), [`docs/flows.md`](flows.md).
- **Unspecified (do not invent):** fans outside the opened 3–8 rows of 一二蚊辣辣上 and 3番4 半辣上（三人）; detailed scoring tables and payout rules for the other regional categories; three-player tables and payouts other than the demonstrated 3番4辣辣上 全銃 ×1.33 rows and the opened 3番4 半辣上（三人） 3–8 rows. Saved-rules names, next-hand rule edits, fans below 起糊, and fans above 滿糊 are decided. The exact progression for 番 above 13 is not invented.

### 3. Session, roster, dealer, 圈風, and 冧

- **Release:** First release.
- **Covers:** Start a first session with rules selection, then seats. Names are required before a player can be confirmed. Each seated player has a name, an identifying avatar, and a running net balance starting at 0. A roster may include people beyond the live seats. A reserve can be substituted into a seat; the departing player’s result stays with that person and still counts in settlement; the substitute starts that seat at 0. Players not currently seated do not pay for later hands. Manual dealer selection, with optional 重置連莊數 and 重新開始計算圈風. Session progress as 圈風 (for example 東圈東風) or as a hand count; session info can show the rules name, start date, and hand count. When 紀錄莊家及圈風 is on, show the dealer badge, including 連N after a consecutive dealer win and 冧X (冧 is U+51A7) when a drawn-hand badge applies; 冧X is not the same mark as 連N. The rules that increment 連N or 冧X, and that advance 莊 and 圈風, are in feature 6. Start a new session, with independent options to reuse current players and/or current rules. Undo the latest entry (還原分數) after confirmation, restoring previous scores and the visible dealer/progress state; it is not a manual balance editor. During a session, keep running net balances, a chronological hand/event ledger (events, scores, or combined; forward or reverse), and accumulated session statistics. Confirm score changes on a stable board after a confirmation completes. Checkable seating, substitution, new-session, and undo scenes are in [`docs/flows.md`](flows.md) flows 1, 10, and 18.
- **Sources:** [`docs/guide.md`](guide.md) (seats, roster, substitution, starting a session, undo, dealer and session progress), [`docs/features.md`](features.md), [`docs/controls.md`](controls.md), [`docs/flows.md`](flows.md).
- **Unspecified (do not invent):** roster limits; editing or deleting an existing player; a clearly demonstrated seat-only swap of two seated players; on-state behaviour of new-session reuse options, including how reserves and seats are kept; the on-state of 重新開始計算圈風 (shown off in the inspected reference dialog); undo depth, redo, and editing or deleting an older history row (also noted in feature 13); a separate user-chosen session title; explicit pause, complete, or discard actions beyond viewing settlement and starting a new session.

### 4. Ordinary wins and 自摸

- **Release:** First release.
- **Covers:** Record an ordinary discard win: winner, fan, discarder; preview the calculated hand score and total; confirm. Under demonstrated 全銃, only the configured ordinary-win amount moves from the discarder to the winner; the other seated players are unchanged for that hand. Record a self-draw (自摸): preview shows the fan amount, the current 自摸倍數, and the winner’s total; confirm. In four-player self-draw, the winner’s total is the ordinary amount × 自摸倍數, and each of the three opponents pays one third of that total. A seated-only example showed that a player who had left the table did not pay. After confirmation, running totals, session progress, statistics, and the hand history update together. Use the demonstrated tables and worked examples in [`docs/guide.md`](guide.md) and the checkable scenes in [`docs/flows.md`](flows.md) flows 2, 4, and 13, including the demonstrated three-player 3番4辣辣上 全銃 ×1.33 hands. Demonstrated dealer advance after these hands follows the 連莊 / 過莊 rules in feature 6; do not invent undemonstrated progression cases here.
- **Sources:** [`docs/guide.md`](guide.md) (score entry types, fan range, player count and payment mode), [`docs/features.md`](features.md), [`docs/flows.md`](flows.md), [`docs/controls.md`](controls.md).
- **Unspecified (do not invent):** invalid-entry handling (for example winner = discarder) and numeric validation; three-player tables and self-draw allocation outside the demonstrated 3番4辣辣上 全銃 ×1.33 rows and hands; what happens if a fan is typed below 起糊 or above 滿糊; the exact progression for 番 above 13 (money must be calculated, but the sequence must not be invented). 半銃 splits and 一炮多響 are feature 5.

### 5. 半銃 and 一炮多響

- **Release:** First release.
- **Covers:** Four-player 半銃 ordinary discard wins, including when F is not divisible by 4: with 出銃者包自摸 and 出銃者包輸 off, the winner receives F (the ordinary-win amount for the entered fan); the discarder pays F/2; each of the other two losers pays F/4. When F is not divisible by 4, the same split is used with decimals; there is no integer rounding (demonstrated F = 15 and similar cases in [`docs/guide.md`](guide.md)). In the demonstrated 半銃 hands the dealer did not pay a different amount from the other non-discarder. Four-player 半銃 自摸 matches the already-recorded self-draw rule (winner total = ordinary amount × 自摸倍數; each of the three opponents pays one third). Multiple winners on one discard (一炮多響): recorded together as one hand, with up to three winners in the demonstrated flow; each winner has their own fan; the same discarder pays. The demonstrated 全銃 一炮多響 result matched each winner’s ordinary-win amount, with the discarder’s loss equal to the sum of those amounts. A demonstrated four-player 半銃 一炮多響 (two winners) used a different split, recorded in [`docs/guide.md`](guide.md): the discarder pays (F1 + F2) / 2; the other loser pays (F1 + F2) / 4; each winner’s net is their own ordinary amount minus a quarter of the other winner’s ordinary amount. Checkable scenes are in [`docs/flows.md`](flows.md) flows 3 and 5.
- **Sources:** [`docs/guide.md`](guide.md) (payment mode, score entry types), [`docs/features.md`](features.md), [`docs/flows.md`](flows.md).
- **Unspecified (do not invent):** 半銃 interaction with three-player play; combined 半銃 plus 出銃者包自摸 / 出銃者包輸 cases that were not demonstrated (the 包 options themselves are feature 7); 一炮多響 cases beyond those demonstrated, including any undemonstrated three-winner 半銃 split; **rounding and storage of non-terminating decimals** for display (already an open first-release product gap, for example 32/3). Store exact values; do not invent the display-rounding rule. These scoring options stay in the first release; only the missing formulas stay unspecified.

### 6. 流局 and 連莊 / 過莊

- **Release:** First release.
- **Covers:** Record a drawn hand (流局) after confirmation, as session progress. When 紀錄莊家及圈風 is on and 流局時過莊 is on, a recorded 流局 advances 莊 and 圈風. If Jackpot is off, balances are unchanged by the draw itself; if Jackpot is on, the contribution in feature 8 is applied. When 流局時過莊 is off (紀錄莊家及圈風 still on), 莊 and 圈風 stay put and the dealer badge increments 冧X (冧 is U+51A7). Opening 食糊! and cancelling it does not increment 冧. A dealer win causes 連莊 (demonstrated 連1 → 連2 → 連3, and other recorded cases in [`docs/guide.md`](guide.md)). A non-dealer win passes 莊. A demonstrated dealer 詐糊 caused 過莊; implement that with feature 7 using the recorded result, without inventing further 詐糊 progression. Manual dealer selection may reset 連莊 and/or restart 圈風 as separate choices (feature 3). Checkable scenes are in [`docs/flows.md`](flows.md) flows 8 and 14.
- **Sources:** [`docs/guide.md`](guide.md) (dealer, wind, and session progress; 流局), [`docs/features.md`](features.md), [`docs/flows.md`](flows.md), [`docs/controls.md`](controls.md).
- **Unspecified (do not invent):** the complete dealer / 連莊 progression algorithm for every remaining edge case, including the exact 連莊 counting convention wherever it was not demonstrated; special abortive-hand types or reason codes beyond the demonstrated 流局. Do not invent the missing cases.

### 7. 詐糊, 出銃者包自摸, and 出銃者包輸

- **Release:** First release.
- **Covers:** False-win (詐糊) as a visible first-release option, with the related toggle 詐糊賠位自摸, off and on. Implement the confirmed settlements recorded in [`docs/guide.md`](guide.md): 詐糊賠位自摸 off (the false-win player pays the ordinary amount to each of the other seated players) and on (the demonstrated ×1.50 × 3 total, with a dealer 詐糊 that also caused 過莊). Special payer options 出銃者包自摸 and 出銃者包輸 are two distinct toggles, also first-release visible options, with confirmed four-player settlements in [`docs/guide.md`](guide.md): only the 出銃者 paid the winner total; a 出銃者包自摸 hand counted as 自摸 in the demonstrated statistics. Checkable scenes are in [`docs/flows.md`](flows.md) flows 6 and 7.
- **Sources:** [`docs/guide.md`](guide.md) (score entry types), [`docs/features.md`](features.md), [`docs/flows.md`](flows.md).
- **Unspecified (do not invent):** further 詐糊 effects on statistics beyond the dealer 過莊 already shown; combined 半銃 plus 包-toggle cases that were not demonstrated. Those options stay in the first release; only the missing cases stay unspecified.

### 8. Jackpot

- **Release:** First release.
- **Covers:** Optional Jackpot, off by default. When enabled, 流局時每位玩家須付彩池 starts at 0 and is editable (a typed 010 was used as 10). On a confirmed 流局, each seated player contributes that amount to the pool (demonstrated four-player contributions and stacked 流局 in [`docs/guide.md`](guide.md)). 贏取Jackpot on 食糊! adds the current pool to the winner’s total and empties the pool; the pool amount comes from the pool, not from the other players. 平分Jackpot is opened from the on-board pool amount (請選擇 → 平分Jackpot → 平分給哪些玩家？ among 在位玩家), then confirm. The demonstrated all-four split paid an equal share to each player, cleared the pool to 0, and left 莊 and 圈風 unchanged. Checkable scenes are in [`docs/flows.md`](flows.md) flow 9.
- **Sources:** [`docs/guide.md`](guide.md) (Jackpot), [`docs/features.md`](features.md), [`docs/flows.md`](flows.md), [`docs/controls.md`](controls.md).
- **Decided:** 平分Jackpot gives the whole pool to one or more eligible players. A reserve who never sat is not listed. Taking only part of the pool amount is still open.

### 9. 找數 / settlement

- **Release:** First release.
- **Covers:** 找數 is a user-requested view of every roster player’s net, including a zero and anyone who has left a seat, plus the Jackpot remainder. A non-zero pool is marked 尚未分配. It is not an automatic end-of-hand, end-of-wind, or end-of-session trigger. **麻雀諗 product decision:** the app shows those nets and lets the user finish payment themselves. It does not compute payment instructions, choose transfers, tie-break, or show a currency label. Paid-tracking and payment execution stay out. The empty state when no player has a positive balance (未有玩家分數為正數) still appears. The reference’s demonstrated transfer list stays in [`docs/guide.md`](guide.md) as what the reference showed, not as a 麻雀諗 requirement. Settlement is checked in the app, not on a second-release external display. Checkable scene: [`docs/flows.md`](flows.md) flow 17.
- **Sources:** [`docs/guide.md`](guide.md) (Settlement), [`docs/features.md`](features.md), [`docs/product.md`](product.md), [`docs/flows.md`](flows.md).
- **Unspecified (do not invent):** how a Jackpot pool would appear in this result view.

### 10. Statistics, titles, and radar

- **Release:** First release.
- **Covers:** Session-wide statistics, including everyone on the roster. Demonstrated fields include 食糊, 自摸, 出銃, 平均番數, 食糊率, 自摸率, 出銃率, and 平均出銃番數. In demonstrated cards, 自摸 is a subset of 食糊, and 自摸率 matched 自摸/食糊 where 食糊 > 0. Title badges, including 食糊王, 自摸王, 出銃王, 大牌王, 細牌王, and 陪跑員, using the 麻雀諗 product-decision award rules in [`docs/guide.md`](guide.md) and [`docs/product.md`](product.md): ties share 食糊王, 自摸王, and 出銃王 when that count is at least 1; 大牌王 and 細牌王 go to the highest and lowest 平均番數 among players with at least one 食糊 (the same player may hold both if those averages are equal); 陪跑員 goes to every player who holds none of 食糊王, 自摸王, 出銃王, or 大牌王; holding 細牌王 does not prevent 陪跑員; titles are not automatically exclusive. An empty-session card also showed 冧莊王 (冧 U+51A7). A three-axis radar chart labelled 進攻, 牌力, and 防守. **麻雀諗 product decision:** 0–100, no extra weights; 進攻 = 食糊率, 牌力 = 自摸率, 防守 = 100 − 出銃率; a missing rate is 0 on that axis. A suggested plotting library is in [`docs/development.md`](development.md); do not treat it as locked. Checkable scene: [`docs/flows.md`](flows.md) flow 15.
- **Sources:** [`docs/guide.md`](guide.md) (statistics, titles, radar), [`docs/features.md`](features.md), [`docs/product.md`](product.md), [`docs/flows.md`](flows.md).
- **Unspecified (do not invent):** exact statistic formulas, rate denominators, rounding, substitution treatment, multiple-winner aggregation, the 平均番數 formula, and how 冧莊王 is awarded. Statistics, titles, and radar stay in the first release; only those missing formulas stay unspecified.

### 11. Dice

- **Release:** First release.
- **Covers:** Dice utility (擲骰): a roll only, so players can see where they start collecting tiles from the four walls (bridges) in real life. This purpose wording is a 麻雀諗 product decision, not on-screen copy from the reference. Minimum 1 die, maximum 9. The roll does not assign the dealer or write scores. Implement the demonstrated behaviour recorded in [`docs/guide.md`](guide.md) and [`docs/controls.md`](controls.md) (count control, a total, and a seat label). A small custom control is suggested in [`docs/development.md`](development.md); no game-engine library is suggested. Checkable scene: [`docs/flows.md`](flows.md) flow 16.
- **Sources:** [`docs/guide.md`](guide.md), [`docs/features.md`](features.md), [`docs/product.md`](product.md), [`docs/controls.md`](controls.md), [`docs/flows.md`](flows.md).
- **Unspecified (do not invent):** no additional dice rules are recorded. Do not invent any (for example assigning the dealer from a roll).

### 12. Fan-help (番數?)

- **Release:** First release.
- **Covers:** Fan-help (番數?) is not a separate page. It is opened from the 食糊! dialog by the circled ? beside 番數. The full reference-demonstrated help text is only: title 現時設定下; body 這裏只需輸入牌型番數 (這裏 uses 裏 U+88CF, not 這裡). That is the entire help. This help text is reference-demonstrated, not a 麻雀諗 invention. Checkable scene: [`docs/flows.md`](flows.md) flow 15.
- **Sources:** [`docs/guide.md`](guide.md), [`docs/features.md`](features.md), [`docs/product.md`](product.md), [`docs/flows.md`](flows.md).
- **Unspecified (do not invent):** any fan-help content beyond that short popup. A separate page titled 番數說明 was not shown.

### 13. History and persistence

- **Release:** First release.
- **Covers:** The app keeps all in-game records (all the things in the game) across sessions, stored locally only, and storage should be kept light. During a session, persist running net balances, the chronological hand/event ledger, accumulated session statistics, and the other in-game records already specified in features 3–12. No backup, no cloud, and no account. The app does not share metadata or session data. Suggested local-store libraries and backup-exclusion caveats are in [`docs/development.md`](development.md); do not treat a suggested package as locked.
- **Sources:** [`docs/guide.md`](guide.md) (history and storage, undo), [`docs/features.md`](features.md), [`docs/product.md`](product.md), [`docs/development.md`](development.md).
- **Unspecified (do not invent):** how past sessions are browsed, resumed, or reopened after a new session starts; whether an older history row can be edited or deleted; undo depth and redo; session naming; explicit pause / complete / discard if wanted. Do not invent a history UX to fill those gaps. Keeping all local history remains a first-release requirement; only the missing browse and edit flows stay unspecified.

## Later / supporting

### 14. UI/UX design system

- **Release:** Later / supporting. Visual UI/UX is designed later. This slice is not first-release scoring work and is not second-release TV work.
- **Covers:** The later UI/UX skill is already present on this `uat` branch: skill files under `.cursor/skills/`, and a generated [`design-system/default/MASTER.md`](../design-system/default/MASTER.md). Those files were added in the `docs: config uipro` commit and kept in the later merge on this branch. Remaining work is to review `design-system/default/MASTER.md`, then later use the skill to assist AI generation of a distinct, user-friendly UI/UX that follows the product documents and is not a copy of 麻將計數機. Design the first-release screens and, when second-release work starts, the look of the 現時賽果 external display. This roadmap does not treat the generated MASTER.md values as already-decided product rules, and it does not tell a coder to re-run the installer or a design-system generator now. Setup reference: [`docs/ui-ux-pro-max-skill.md`](ui-ux-pro-max-skill.md).
- **Sources:** [`docs/product.md`](product.md), [`docs/ui-ux-pro-max-skill.md`](ui-ux-pro-max-skill.md), [`docs/development.md`](development.md), [`docs/guide.md`](guide.md) (UI/UX design process), and the generated `design-system/default/MASTER.md` now in the repository (to be reviewed).
- **Unspecified (do not invent):** screen layout, wireframes, visual style, navigation, and information architecture remain to be designed later, after MASTER.md is reviewed. Do not invent them in the product documents. Generated design-system values are not product decisions until they are reviewed and recorded as such.

## Second release

### 15. Wireless connection to a smart TV

- **Release:** Second release. This is not first-release fulfilment.
- **Covers:** Wireless connection to a smart TV on both iOS and Android, together with the related external-display product rules. Start screen sharing by clicking the share-screen button in the app; end sharing by clicking the same button again. Connection start and end are that toggle. Share-screen is a local display connection, not sharing of metadata. The external display shows 現時賽果 only. Settlement and every other page are opened in the app. On iOS / iPhone, the path is AirPlay, showing unique 現時賽果 only (not only a phone-UI mirror). On Android, the path must be an official wireless Android-to-smart-TV path (Wi-Fi Display / Miracast-class Presentation and/or Google Cast — which of those to ship is not yet chosen). Unofficial or commercial Android AirPlay senders are not fulfilment. Official wired HDMI / USB-C Presentation exists, but it is not the chosen fulfilment. Unique 現時賽果 on a second display cannot be developed or verified in Expo Go; use a development build (`expo-dev-client` plus prebuild). The technical plan, official API constraints, suggested modules, and Cast caveats stay in [`docs/development.md`](development.md); do not delete that plan. The look of the 現時賽果 display is left to later AI design (feature 14). Checkable scene: [`docs/flows.md`](flows.md) flow 19. Do not treat this feature as a first-release blocker.
- **Sources:** [`docs/product.md`](product.md), [`docs/features.md`](features.md), [`docs/development.md`](development.md), [`docs/guide.md`](guide.md) (External display), [`docs/controls.md`](controls.md), [`docs/flows.md`](flows.md).
- **Unspecified (do not invent):** behaviour when the connection drops, including the product rule if a drop or a teardown would otherwise show a phone-UI mirror. Open technical decisions that belong to second-release planning, not first-release blockers, remain open as recorded in [`docs/development.md`](development.md): which official Android wireless path to ship (Miracast-class Presentation, Cast, or both); whether a hosted Cast receiver is acceptable under local-only / no-cloud / no-account, and whether relay casting should be off; which TV classes / receiver hardware to design for; how far the in-app share-screen button may rely on a system picker rather than a fully silent connect and disconnect; and the connection-drop / no-mirror fallback. Cast Remote Display is not a viable path. This roadmap does not choose among the remaining official options.
