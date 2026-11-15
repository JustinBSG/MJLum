# 麻雀諗 features

This inventory is for the first release, unless a row says otherwise. Behaviour details and exact numbers are in [`docs/guide.md`](guide.md). Labels follow [`docs/README.md`](README.md).

The first release develops the point-counter / table scorekeeper features: exactly the same functionality as the local reference, plus the already-decided 麻雀諗 product rules that are not about external display / wireless TV. The second release is the wireless connection to a smart TV, together with the related external-display product rules. A build-order roadmap of this work is in [`docs/roadmap.md`](roadmap.md). UI/UX for every feature is to be designed later; this list is functional, not a screen inventory. Ads are not a feature of 麻雀諗.

## Product frame (麻雀諗 product decisions)

- Table scorekeeper for in-person Hong Kong Mahjong; not a tile game.
- iOS and Android in the first release.
- No ads; completely free at the current stage.
- Distinct UI/UX, not a copy of 麻將計數機.
- Traditional Chinese — Hong Kong only.
- One device at the table; no multi-device session following.
- Personal/table tool only, not a public store app yet.
- Local-only data: no backup, no cloud, no account. Keep storage light. Keep all in-game records across sessions, locally.
- No sharing of metadata or session data (results, history, player information, settlement, or other session information).

## Scoring and rule setups (reference-demonstrated functionality)

- Choose a rules setup before play: Hong Kong presets, a saved custom setup, or a one-off configuration (直接使用) without saving.
- Hong Kong preset families: 3番4, 二五雞, 五一, and 一二蚊, each in 半辣上 and 辣辣上 forms, plus 3番4 半辣上（三人）. Opened tables, including the 3–8 rows of 一二蚊辣辣上 and 3番4 半辣上（三人）, are in `docs/guide.md`. Fans outside a shown range stay empty.
- Create, edit, use once, save, and delete a custom setup (demonstrated default name 新玩法). Ordinary-win cells are individually editable; editing one fan does not automatically recalculate later fans. Deleting a saved custom setup is confirmed first.
- Player-count format: 四人麻雀 or 三人麻雀, separate from roster size.
- Payment modes: 全銃 and 半銃, with the demonstrated splits recorded in `docs/guide.md`.
- Fan range: 起糊 and 滿糊. In the reference, 起糊 can go to 0 and the 滿糊 slider’s right end is 13. **麻雀諗 product decision:** 滿糊 is user-decidable and may be set above 13; money for 番 above 13 should be calculated, without inventing an undemonstrated progression.
- Self-draw multiplier (自摸倍數) is editable in the reference; the usual demonstrated value is ×1.50, and ×2.00 was also used in play.
- Optional Jackpot: off by default; when enabled, 流局時每位玩家須付彩池 starts at 0 and is editable (a typed 010 was used as 10). Drawn-hand contributions, 贏取Jackpot on 食糊!, and 平分Jackpot from the on-board pool amount are demonstrated.
- Optional dealer and circle/wind tracking (紀錄莊家及圈風), with 流局時過莊 on or off.
- Other regional categories from the reference, including 台灣麻將, 日本麻雀, 碰槓牌（跑馬仔）, and 港式台灣麻將, are in first-release scope. Their detailed scoring remains unspecified and must not be invented.

## Session, seats, and history (reference-demonstrated functionality)

- Start a first session with rules selection, then seats. Names are required before a player can be confirmed. Each seated player has a name, an identifying avatar, and a running net balance starting at 0.
- A roster may include people beyond the live seats. A reserve can be substituted into a seat; the departing player’s result stays with that person and still counts in settlement; the substitute starts that seat at 0. Players not currently seated do not pay for later hands.
- Manual dealer selection, with optional 重置連莊數 and 重新開始計算圈風.
- Session progress as 圈風 (for example 東圈東風) or as a hand count; session info can show the rules name, start date, and hand count.
- Running net balances, a chronological hand/event ledger (events, scores, or combined; forward or reverse), and accumulated session statistics.
- Start a new session, with independent options to reuse current players and/or current rules.
- Undo the latest entry (還原分數) after confirmation.
- History keeps all in-game records across sessions, locally only. How past sessions are browsed, resumed, or deleted remains unspecified, except that storage is local and should be kept light.

## Score entry (reference-demonstrated functionality)

- Ordinary discard win: winner, fan, discarder; preview; confirm.
- Self-draw (自摸): preview shows fan amount, multiplier, and winner total; confirm.
- Multiple winners on one discard (一炮多響): up to three winners in the demonstrated flow, each with their own fan; one combined hand.
- False-win (詐糊), with the related toggle 詐糊賠位自摸, off and on.
- Special payer options: 出銃者包自摸 and 出銃者包輸, two distinct toggles.
- Drawn hand (流局), after confirmation. With 流局時過莊 on, a 流局 advances 莊 and 圈風. With 流局時過莊 off, 莊 and 圈風 stay put and the dealer badge increments 冧X (冧 is U+51A7).
- Fan-help (番數?), opened from the circled ? beside 番數 on 食糊!, not as a separate page. Full demonstrated text is in `docs/guide.md`.

## Settlement (麻雀諗 product decision, with a reference example kept for context)

- 找數 is a user-requested view of each non-zero net, including anyone who has left a seat with a balance, plus the Jackpot remainder. A zero is omitted. A non-zero pool is marked 尚未分配.
- 麻雀諗 shows those nets and lets the user finish payment themselves. It does not compute payment instructions, choose transfers, tie-break, or show a currency label.
- The reference’s demonstrated transfer list is recorded in `docs/guide.md` as what the reference showed, not as a 麻雀諗 requirement.
- Settlement is checked in the app. When a second-release external display is connected, it is not checked on that display.

## Statistics, titles, radar, and dice

- Session-wide statistics, including everyone on the roster. Demonstrated fields include 食糊, 自摸, 出銃, 平均番數, 食糊率, 自摸率, 出銃率, and 平均出銃番數. In demonstrated cards, 自摸 is a subset of 食糊, and 自摸率 matched 自摸/食糊 where 食糊 > 0. Rate denominators and the 平均番數 formula were not printed and remain unspecified.
- Title badges, including 食糊王, 自摸王, 出銃王, 大牌王, 細牌王, and 陪跑員. Award rules are a 麻雀諗 product decision, recorded in `docs/guide.md`. Titles are not automatically exclusive. An empty-session card also showed 冧莊王 (冧 U+51A7); how that title is awarded remains unspecified.
- A three-axis radar chart labelled 進攻, 牌力, and 防守. The 0–100 mapping is a 麻雀諗 product decision, recorded in `docs/guide.md`.
- Dice utility (擲骰): a roll only, so players can see where they start collecting tiles from the four walls (bridges) in real life. This purpose wording is a 麻雀諗 product decision, not on-screen copy. Minimum 1 die, maximum 9. The roll does not assign the dealer or write scores. The demonstrated reference UI is in `docs/guide.md` and `docs/controls.md`.

## External display (second release; 麻雀諗 product decisions)

These rules belong to the second release, not first-release fulfilment.

- The second release is the wireless connection to a smart TV.
- Share-screen toggle in the app starts and ends a local display connection.
- The external display shows 現時賽果 only. Settlement and every other page are opened in the app.
- The documented plan is wireless to a smart TV: AirPlay on iOS for unique 現時賽果; an official wireless path on Android (Miracast-class Presentation and/or Cast — not yet chosen). Unofficial Android AirPlay senders are not fulfilment. Official wired HDMI / USB-C Presentation exists, but is not the chosen fulfilment.
- Behaviour when the connection drops remains unspecified.
- The look of the 現時賽果 display is left to later AI design.
- The technical plan is in [`docs/development.md`](development.md). Open technical decisions about that path belong to second-release planning, not first-release blockers.

## Second release

The second release is the wireless connection to a smart TV, together with the related external-display product rules in the section above. Other extra features beyond the first-release point-counter scope can also come in a later release. Do not treat unspecified formulas as postponed features: the corresponding scoring options and categories still belong in the first release; only the missing formula stays unspecified.
