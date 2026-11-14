# 麻雀諗 demonstrated controls

This file records what each demonstrated control does. Names and placements are taken from the local reference and are recorded as behaviour, not as a UI to copy. 麻雀諗 must provide the same functionality with a distinct UI/UX, designed later.

Confirm score changes on a stable board after a confirmation completes. Do not treat a mid-animation board as a settled result.

Ads, store-rating prompts, and similar promotional surfaces that appear in the local reference are the reference app’s. They are not 麻雀諗 controls or features.

The share-screen button and the External display section below are second-release work, not first-release fulfilment.

## Rule setup (玩法設定)

| Control | What it does |
|---|---|
| Regional categories (香港, and the other reference categories 台灣麻將, 日本麻雀, 碰槓牌（跑馬仔）, 港式台灣麻將) | Choose a rule family. First release includes these categories. Detailed scoring outside the recorded Hong Kong tables remains unspecified. |
| 預設玩法 list | Choose a Hong Kong preset (3番4, 二五雞, 五一, 一二蚊, each in 半辣上 and 辣辣上, plus 3番4 半辣上（三人）). The visible list captions include minimum and cap amounts. Opening a preset shows its editable table. |
| 自訂玩法 / 增加玩法 | Create a custom setup. The demonstrated default name is 新玩法. A second add creates another 新玩法. |
| 玩法名稱 | Names this rules setup. |
| 人數: 四人麻雀 / 三人麻雀 | Sets the scoring format, separately from how many people are on the roster. |
| 全銃 / 半銃 | Sets how a discard-win loss is allocated. See `docs/guide.md` for the demonstrated splits. |
| 起糊 / 滿糊 (two-handle range control in the reference) | Sets the minimum winning fan and the cap. In the reference, 起糊 can be moved to 0 (leftmost) and the 滿糊 control’s right end is 13. For 麻雀諗, 滿糊 may be set above 13 (product decision); do not invent undemonstrated rows. |
| 食糊分數 (per fan) | Editable ordinary-win amount for each fan in range. Editing one cell updates that row’s 自摸分數 by the current 自摸倍數, but does not automatically recalculate later fans. |
| 自摸分數 / 自摸倍數 | Displays the self-draw total. Tapping the multiplier chip (for example (×1.50)) opens a 自摸倍數 dialog with a keypad. Changing it (for example to 2, shown as ×2.00) updates the 自摸 column and later 食糊! previews. |
| Jackpot 啟用 | Turns the optional shared pool on or off. Demonstrated default: off. |
| 流局時每位玩家須付彩池 | Visible when Jackpot is on. Starts at 0 when first revealed, and is editable. A typed 010 was used as 10. Each seated player pays that amount into the pool on a confirmed 流局. |
| 紀錄莊家及圈風 | Turns dealer and circle/wind tracking on or off. This does not itself change score-table amounts. |
| 流局時過莊 | Visible when dealer/wind tracking is on. On: a confirmed 流局 advances 莊 and 圈風. Off: 莊 and 圈風 stay put, and the dealer badge increments 冧X (冧 U+51A7). |
| 儲存此玩法嗎？ (取消 / 直接使用 / 儲存) | After leaving configuration: cancel, use the setup once without saving, or save it as a custom entry. |
| 放棄設定嗎? | Confirms abandoning unsaved custom edits. After confirm, the custom list can return to 未有自訂玩法. |
| 確定刪除嗎? | Confirms deleting a saved custom setup. After confirm, the custom list can show 未有自訂玩法. |

## Starting and seating

| Control | What it does |
|---|---|
| Rules selection, then seats | A first session starts by choosing rules, then seating players. |
| Player name and avatar | Each seated player has both. A name is required before that player can be confirmed. Running balance starts at 0. |
| Add a further person to the roster | Adds someone without adding a live seat, so they can later be substituted in. |
| 换人/换位 (substitution) | Puts a roster player into a seat. The departing player’s balances and history stay with that person and still count in settlement. The substitute starts that seat at 0 and does not inherit the previous occupant’s result. Players not currently seated do not pay for later hands. |
| 新牌局 | Starts a new session, distinct from recording the next hand. If a session is already open, this is offered as a separate action. |
| 沿用現有玩家 / 沿用現時玩法 | Independent reuse options when starting a new session. With both off, the flow returns to rules selection and empty seats. On-state behaviour, including how reserves and seats are kept, remains unspecified. |

## In-play scoreboard and session

| Control | What it does |
|---|---|
| Scoreboard (現時賽果 in the app) | Shows current running balances, dealer, circle/wind or hand count, and, when enabled, the Jackpot pool amount. |
| 食糊! | Opens hand entry for a win (ordinary, 自摸, 一炮多響, or 詐糊). |
| Winner, fan (番數), and 出銃者 or 自摸 | The recorder enters who won, the fan value, and how the win happened. The app previews 食糊分數 / 自摸分數 and 總分, then on confirm updates everyone together and records the hand. The app does not read tiles or decide legality. |
| 一炮多響 | Allows more than one winner on the same discard, recorded as one hand (up to three winners demonstrated). Each additional winner has their own fan; tapping a winner sets that winner’s fan. |
| 詐糊 | Records a false or invalid win. The related toggle is 詐糊賠位自摸. |
| 詐糊賠位自摸 | When off, the false-win player pays the ordinary-win amount to each other seated player. When on, that per-player amount is multiplied by the self-draw multiplier (demonstrated 13-fan totals are in `docs/guide.md`). A dealer’s confirmed 詐糊 also caused 過莊 in the demonstrated session. |
| 出銃者包自摸 | When on, with an 出銃者 selected, that discarder alone pays the self-draw total. The hand counted as 自摸 in statistics. |
| 出銃者包輸 | When on (包自摸 off), with an 出銃者 selected, that discarder alone pays the ordinary-win amount. |
| 贏取Jackpot | A toggle on 食糊!. When on, the winner’s total adds the current pool, and the pool comes from Jackpot, not from the other players. After confirm the pool is emptied. |
| 番數? (circled ? beside 番數) | Opens the short help popup over 食糊!. Title: 現時設定下. Body: 這裏只需輸入牌型番數 (裏 U+88CF). That is the entire demonstrated help. It is not a separate page. |
| 流局 / 確定流局 | Records a drawn hand after confirmation. Score effect depends on Jackpot (see above). Dealer/wind effect depends on 流局時過莊 (see above). |
| 還原分數 | Undoes the latest entry after confirmation, restoring previous scores and the visible dealer/progress state. It is not a manual balance editor. Undo depth, redo, and editing an older row remain unspecified. |
| 詳細紀錄 | Ledger of recorded hands/events. Can emphasize events, scores, or a combined view, and can be shown in forward or reverse order. During a demonstrated 流局時過莊-off sequence, the 分數 tab stayed in 東圈1. |
| 統計數據 | Session-wide statistics, titles, and radar. Includes everyone on the roster. Fields are in `docs/guide.md`. |
| On-board Jackpot amount | Tapping the pool amount opens 請選擇 → 平分Jackpot → 平分給哪些玩家？ (在位玩家), then confirm. A demonstrated all-four split of 200 paid 50 to each player and cleared the pool to 0, leaving 莊 and 圈風 unchanged. Confirmed subset splits remain unspecified. |
| 找數 | Opens settlement. In 麻雀諗 this shows net balances only; see `docs/guide.md`. Checked in the app, not on a second-release external display. |
| 莊家設定 | Manually selects the current dealer. |
| 重置連莊數 | When setting the dealer manually, can reset the consecutive-dealer count. Shown on in the inspected reference dialog; downstream count behaviour was not independently tested. |
| 重新開始計算圈風 | When setting the dealer manually, can restart circle/wind counting. Shown off in the inspected reference dialog; on-state remains unspecified. |
| 進度顯示方式: 圈風 / 局數 | Display choice for session progress; it does not itself change scores. |
| 擲骰 | Opens the dice utility. See below. |
| Share-screen button (second release) | Starts a local external-display connection; pressing the same button again ends it. The external display shows 現時賽果 only. This control is second-release work, not first-release fulfilment. |

## Dice (擲骰)

Demonstrated reference UI, not a layout to copy:

- The dialog has − / 擲骰 / +. The button label is 擲骰, not 重擲.
- − and + change the number of dice. Minimum 1, maximum 9.
- 擲骰 rolls and shows a total plus a seat label. Demonstrated labels: 對家, 自家, 上家. 下家 did not appear in the demonstrated rolls.
- Closing the dialog left scores unchanged and left the current 莊 and 圈風 unchanged.

**麻雀諗 product decision:** the roll is only so players can see where they start collecting tiles from the four walls (bridges) in real life. It does not assign the dealer or write scores. That purpose sentence is not on-screen copy from the reference.

## External display (second release)

This section is second-release work, not first-release fulfilment. There are no separate controls on the external display. The only connection control is the in-app share-screen button. The external surface shows 現時賽果 only; any other page is opened in the app.
