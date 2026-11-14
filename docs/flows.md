# 麻雀諗 handover flows

These are end-to-end scenes a coder can implement against. Amounts, badges, and wind labels below are **reference-demonstrated** unless a step is marked as a 麻雀諗 product decision. Confirm results on a stable board after a confirmation completes.

Control names are from the local reference and are not a UI to copy. 麻雀諗 must provide the same functionality with a distinct UI/UX, designed later.

Exact tables and additional worked examples live in [`docs/guide.md`](guide.md).

## 1. Start a four-player session

1. Choose a rules setup (a Hong Kong preset, a saved custom setup, or a one-off 直接使用).
2. Seat four players and enter a name for each. Avatars identify the players. Each running balance starts at 0.
3. If 紀錄莊家及圈風 is on, the board shows a dealer and a circle/wind (a demonstrated start is 東圈東風, with one player marked 莊).
4. Optionally start the external display with the share-screen button. It should show 現時賽果 only. End it with the same button.

## 2. Record an ordinary discard win (全銃)

Preconditions: 全銃, a configured ordinary-win amount F for the entered fan.

1. Open 食糊!. Choose the winner, the fan, and the 出銃者.
2. Preview shows the ordinary-win amount and 總分 F.
3. On confirm: the winner’s balance rises by F; only the discarder pays F; the other seated players are unchanged for that hand.

Demonstrated 5-fan custom-table example: F = 16; c wins from b; b −256 → −272; c −240 → −224; a and d unchanged.

## 3. Record an ordinary discard win (four-player 半銃, including when F is not divisible by 4)

Preconditions: four-player 半銃; 出銃者包自摸 and 出銃者包輸 off; ordinary-win amount F.

1. Open 食糊!. Choose the winner, the fan, and the 出銃者.
2. On confirm: the winner receives F; the discarder pays F/2; each of the other two pays F/4. The dealer does not pay a different amount from the other non-discarder. When F is not divisible by 4, keep decimals; do not integer-round.

Demonstrated F = 15 (3番 食糊分數 edited from 16 to 15), 出銃者 c, winner d, footer 總分 15. Stable board: a −3.75, b −3.75, c −7.5, d +15.

Further integer examples (F = 4096 and F = 32) are in `docs/guide.md`.

## 4. Record a self-draw

Preconditions: four-player; current 自摸倍數 M (demonstrated default 1.50).

1. Open 食糊!. Choose the winner, the fan, and 自摸.
2. Preview shows the ordinary amount, ×M, and 總分 = F × M.
3. On confirm: the winner receives that total; each of the three opponents pays one third. Amounts may show two decimal places (demonstrated 32/3 as −10.67 each).

Demonstrated 10-fan example at ×1.50 from an all-zero table: 512 × 1.50 = 768; a +768; b, c, and d each −256.

Demonstrated later 5-fan example at ×2.00: footer 16 × 2.00 = 32; d +32; a, b, and c each −10.67.

A player who has left the table does not pay.

## 5. Record 一炮多響

1. Open 食糊! with 一炮多響. Add a second (and, if needed, a third) winner. Each winner has their own fan. One 出銃者 pays.
2. Confirm as one hand.

全銃 demonstrated result: a +128, b −388, c +4, d +256, matching the 8-fan, 3-fan, and 9-fan ordinary amounts, with the discarder’s loss equal to the sum.

半銃 demonstrated result (winners d at 7 fan, F1 = 256, and b at 6 fan, F2 = 128; 出銃者 c; other loser a): discarder pays (F1 + F2)/2 = 192; the other loser pays (F1 + F2)/4 = 96; each winner’s net is their own ordinary amount minus a quarter of the other winner’s ordinary amount (d +224, b +64). The preview 總分 for the then-selected winner is that winner’s net, not a raw sum of the two ordinary amounts.

## 6. Record 詐糊

1. Open 食糊! and choose 詐糊 and a 詐糊番數. Set 詐糊賠位自摸 on or off.
2. Confirm.

詐糊賠位自摸 off, 13 fan, ordinary amount 16384: preview 13番分數 詐糊 −16384 ×3, 總分 −49152. The false-win player pays 16384 to each of the other three.

詐糊賠位自摸 on, 13 fan: preview −16384 × 1.50 × 3 = 總分 −73728. Confirmed board from a session that already had decimal 半銃 scores: a 24572.25, b 24572.25, c 24440.5, d −73585 (each of a, b, and c received 24576). The false-win dealer d also caused 過莊: 東圈南風, c 莊.

## 7. Record 出銃者包自摸 or 出銃者包輸

包自摸, 5番, 出銃者 c, footer 64 × 1.50 = 總分 96. Stable board from the F = 15 session: a −3.75, b −3.75, c −103.5, d +111 (only c paid 96). Statistics counted this hand as 自摸 for d (3 食糊 and 1 自摸 after these hands).

包輸 (包自摸 off), 4番, 出銃者 c, footer 總分 32. Stable board: a −3.75, b −3.75, c −135.5, d +143 (only c paid 32).

## 8. Record a 流局, with 流局時過莊 on or off

### 過莊 on

1. In 玩法設定, leave 流局時過莊 on (紀錄莊家及圈風 on).
2. Confirm 流局.
3. 莊 and 圈風 advance. If Jackpot is off, balances are unchanged. If Jackpot is on, each seated player pays the configured contribution into the pool.

Demonstrated Jackpot contribution 10: after the first 流局, each of the four paid 10, Jackpot 0 → 40, and 莊/圈風 advanced (after a prior 詐糊 that left c as 莊 in 東圈南風, the first 流局 made a 莊 in 東圈西風). A second 流局 added another −10 to everyone and left the pool at 80.

A later session with 過莊 on and contribution 10 advanced 東圈東風 / d 莊, Jackpot 0, to 東圈北風 / b 莊, all four −30, Jackpot 120.

### 過莊 off

1. In 玩法設定, turn 流局時過莊 off. 紀錄莊家及圈風 stays on. Confirm the setup (儲存 or 直接使用).
2. Starting board in the demonstration: d has a plain 莊 badge (no 冧 number), 東圈東風, all four scores 0. Jackpot was off.
3. Each confirmed 流局 leaves d as dealer and leaves 東圈東風 unchanged. The dealer badge changes 莊 → 冧1 → 冧2 → 冧3 → 冧4, and later 冧5. Scores stay 0 when Jackpot is off. The badge letter is 冧 (U+51A7).
4. 詳細紀錄 (分數 tab) stayed in 東圈1, with 0 point rows for all four.
5. Opening 食糊! and cancelling it does not increment 冧 and does not change scores. A 冧 increment in this mode comes from a confirmed 流局, not from a cancelled win sheet.

## 9. Jackpot award and split

### 贏取Jackpot

1. Enable Jackpot and accumulate a pool (see flow 8).
2. On 食糊!, turn 贏取Jackpot on.
3. Demonstrated 13番 自摸 with pool 80: footer 16384 × 1.50 + Jackpot 80 = 總分 24656. Ledger: a, b, and c each −8192; d +24656. 8192 = 24576/3; the 80 comes from the pool, not from the other players. After confirm, that award path has emptied the pool. No separate withdraw control was shown besides this toggle and 平分Jackpot.

### 平分Jackpot

1. Tap the on-board Jackpot amount.
2. Choose 平分Jackpot, then who receives it (demonstrated prompt: 平分給哪些玩家？ / 在位玩家), then confirm.
3. Demonstrated all-four split: all four were −50, Jackpot 200, 南圈南風, c 莊. After confirm, all four were 0, Jackpot 0, same 莊 and 圈風 (200/4 = 50 each).

Confirmed splits among a subset of players remain unspecified.

## 10. Undo the latest hand

1. Choose 還原分數 and confirm.
2. Scores and the visible dealer/progress state return to the previous recorded state.

Demonstrated reversal of a substitute’s self-draw of 24: a 872 → 880; b −668 → −660; d −8 → 0; e 24 → 0.

## 11. Change 自摸倍數 or 起糊 / 滿糊

1. In 玩法設定, tap the (×1.50) chip, enter a new 自摸倍數 (demonstrated change to 2, shown as ×2.00). The 自摸 column updates immediately (demonstrated 1: 1/2, 2: 2/4, 3: 4/8, 4: 8/16 at that table).
2. Move 起糊 to 0 if required. Demonstrated 0-fan row: 0.5/0.75, then 1: 1/1.5, 2: 2/3, 3: 4/6 on that 辣辣上 table.
3. In the reference, 滿糊 can be raised to 13 and no 14番 row appears. For 麻雀諗, the user may set 滿糊 above 13 and the app should calculate money for those 番, without inventing an undemonstrated progression.

## 12. Edit, use, save, or delete a custom 新玩法

1. 增加玩法 creates 新玩法. The default custom table starts at 3番起糊 with ordinary-win amount 4 and 8番滿糊, doubling each fan (3: 4/6, 4: 8/12, 5: 16/24, 6: 32/48). Extending 滿糊 to 13 kept doubling through 13: 4096/6144.
2. Edit individual 食糊分數 cells. The matching 自摸分數 updates to the current multiplier. Later fans are not auto-recalculated (after raising fans 3–6, fan 7 stayed 64/96, so 6 and 7 tied).
3. 儲存此玩法嗎？ offers 取消, 直接使用, or 儲存. 放棄設定嗎? discards unsaved edits.
4. Deleting a saved custom setup asks 確定刪除嗎?; after confirm, the list can show 未有自訂玩法.

## 13. Three-player 全銃 (demonstrated 3番4 辣辣上)

Format 三人麻雀, 全銃, 自摸倍數 ×1.33. Demonstrated settings rows: 3: 3/4, 4: 6/8, 5: 12/16, 6: 24/32. Fan 7 was not scrolled into view; fan 8 was peeked and then confirmed in play as 96/128.

Demonstrated settlements:

1. 3番, 出銃者 c, 總分 3: board a +3, b 0, c −3, a 莊, 東圈南風.
2. Then a 3番 自摸: board a +1, b −2, c +1, b 莊, 東圈西風 (winner’s total 4; each of the other two paid 2; 莊 passed).
3. Then 4番 自摸, footer 6 × 1.33 = 8: board a −3, b +6, c −3, b 莊 with 連1, 東圈西風 (each of the two opponents paid 4; the self-draw total equals F × 4/3).

The 3番4 半辣上（三人） preset remains unopened as 玩法設定; only the list caption 3 fan / 3 and 8 fan / 24 is recorded. Do not invent that table.

## 14. Dealer, 連莊, and 過莊 (when 紀錄莊家及圈風 is on)

- A dealer win causes 連莊. A demonstrated sequence showed d 連1 → 連2 → 連3. In another demonstration, d stayed 莊 into 南圈東風 after winning as 北 莊.
- A non-dealer win passes 莊 (see the three-player 3番 自摸 in flow 13, and the dealer 詐糊 過莊 in flow 6).
- A 流局 passes or holds 莊 according to 流局時過莊 (flow 8).
- The dealer can also be set manually (莊家設定), with 重置連莊數 and 重新開始計算圈風 as separate choices.

The complete progression algorithm for every remaining result type, including the exact 連莊 counting convention in every edge case, is still **unspecified** where it was not demonstrated. Do not invent the missing cases.

## 15. Statistics, titles, radar, and 番數?

1. Open 統計數據 at any time in the session. Counts include 食糊, 自摸, and 出銃, for everyone on the roster. Detail cards also show 平均番數, 食糊率, 自摸率, 出銃率, and 平均出銃番數, plus a radar labelled 進攻, 牌力, and 防守.
2. Award titles using the 麻雀諗 product decision in `docs/guide.md`. Do not invent an 平均番數 formula or rate denominators.
3. Demonstrated non-zero cards from one session (board: a −64, b 132, c 68, d −136, 南圈北風, b 莊, Jackpot 0):

| Player | 食糊 | 自摸 | 出銃 | 平均番數 | 食糊率 | 自摸率 | 出銃率 | 平均出銃番數 | Titles shown |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| a | 1 | 0 | 1 | 5 | 4% | 0% | 4% | 3 | 陪跑員 |
| b | 2 | 0 | 0 | 3 | 9% | 0% | 0% | 0 | 陪跑員 |
| c | 3 | 1 | 0 | 3 | 13% | 33% | 0% | 0 | 食糊王, 自摸王, 大牌王 |
| d | 1 | 1 | 4 | 3 | 4% | 100% | 17% | 4 | 自摸王, 出銃王 |

In those cards, 自摸率 matched 自摸/食糊 where 食糊 > 0 (c 1/3, d 1/1). Denominators for 食糊率 and 出銃率 were not printed.

An empty-session card for d showed 0/0/0, 0 平均番數, 0% rates, 0 平均出銃番數, titles 冧莊王 and 陪跑員, and a radar labelled 進攻. How 冧莊王 is awarded remains unspecified.

4. 番數? from 食糊! shows only 現時設定下 / 這裏只需輸入牌型番數.

## 16. Dice

1. Open 擲骰. Use − / + to set 1 to 9 dice, then 擲骰.
2. Read the total and seat label (demonstrated rolls: 35 對家 with 9 dice; 29 自家 with 9; 20 上家 with 6; 13 自家 with 3; 9 自家 with 3; 3 對家 with 1). 下家 did not appear in those rolls.
3. Close the dialog. Scores, 莊, and 圈風 must be unchanged.

## 17. Settlement (找數)

**麻雀諗 product decision:** open 找數 and show each player’s net balance, including anyone on the roster with a non-zero balance. The user finishes payment themselves. Do not generate a transfer list, payment instructions, or a currency label.

The reference’s own demonstrated transfer list, kept only as reference context, is in `docs/guide.md`. How a Jackpot pool would appear in this result view remains unspecified. This view is in the app, not on the external display.

## 18. Substitute a player and start a new session

1. Add a reserve to the roster and substitute them into a seat. The departing player’s result stays with that person; the substitute starts at 0; unseated players do not pay later hands.
2. 新牌局 is distinct from recording the next hand. 沿用現有玩家 and 沿用現時玩法 can be chosen independently. With both off, the flow returns to rules selection and empty seats.

## 19. External display during play

1. Press the in-app share-screen button to start a local display connection (AirPlay is required; another similar path is welcome if supported).
2. The external display shows 現時賽果 only. Open statistics, 找數, settings, history, dice, or any other page in the app.
3. Press the same button to end the connection. Behaviour when the connection drops remains unspecified.
