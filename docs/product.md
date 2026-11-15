# 麻雀諗

The GitHub repository for this app is [MJLum](https://github.com/JustinBSG/MJLum).

麻雀諗 is a table scorekeeper for in-person Hong Kong Mahjong. It is not a tile game.

This file is the short product-direction summary as of 15 November 2026. Detailed scoring and session behaviour is in [`docs/guide.md`](guide.md). The feature inventory is in [`docs/features.md`](features.md). Demonstrated controls are in [`docs/controls.md`](controls.md). Handover flows are in [`docs/flows.md`](flows.md). How facts are labelled is explained in [`docs/README.md`](README.md). The recorded development approach is in [`docs/development.md`](development.md). The build-order feature roadmap is in [`docs/roadmap.md`](roadmap.md). Command-line setup for the later UI/UX skill is in [`docs/ui-ux-pro-max-skill.md`](ui-ux-pro-max-skill.md).

## Already-decided 麻雀諗 product rules

These are 麻雀諗 product decisions. The rules in this list apply to the first release. External-display / wireless TV rules are second-release work and are listed under First release and second release below.

- The app is a cross-platform mobile app. First-release platforms are iOS and Android.
- The app has no ads.
- At the current stage the app is completely free.
- The UI/UX is distinct, and is not a copy of the existing iPhone app 麻將計數機.
- All UI/UX should be designed by AI. AI should follow the product documents to design the most user-friendly UI/UX, and should use https://github.com/nextlevelbuilder/ui-ux-pro-max-skill to assist generation. How a coder would install that skill is in [`docs/ui-ux-pro-max-skill.md`](ui-ux-pro-max-skill.md). This pass does not include those designs.
- The first release is a personal/table tool only, not a public App Store or Play Store app yet.
- The UI language and locale is Traditional Chinese — Hong Kong only.
- Only one device is used at the table. The first release does not support more than one device following the same session.
- Data is local only: no backup, no cloud, and no account or sign-in requirement. Storage should be kept light.
- The app keeps all in-game records (all the things in the game) across sessions, stored locally only.
- The app does not share metadata or session data, including results, history, player information, settlement, or other session information. It is a simple local tool.

## First release and second release

The first release develops the point-counter / table scorekeeper features: exactly the same functionality as the local reference, plus the already-decided 麻雀諗 product rules listed above that are not about external display / wireless TV.

Same-functionality includes all reference scoring options, such as 半銃, 詐糊, 出銃者包自摸, 出銃者包輸, and Jackpot, including cases whose formulas were later demonstrated and are now recorded in `docs/guide.md`. It also includes the reference’s other regional rule categories and the utilities: statistics, titles, a radar chart, a dice utility, and fan-help. Formulas and tables that are still not demonstrated remain **unspecified** and must not be invented.

The second release is the wireless connection to a smart TV, together with the related external-display product rules:

- The plan is to show the scoreboard on a smart TV wirelessly, on both iOS and Android. This is second-release work, not first-release fulfilment.
- On iOS / iPhone, the path is AirPlay, showing unique 現時賽果 only (not only a phone-UI mirror).
- On Android, the path must be an official wireless Android-to-smart-TV path (Wi-Fi Display / Miracast-class Presentation and/or Google Cast — which of those to ship is not yet chosen). Unofficial or commercial Android AirPlay senders are not the fulfilment path.
- Official wired HDMI / USB-C Presentation exists, but it is not the chosen fulfilment.
- Start screen sharing by clicking the share-screen button in the app; end sharing by clicking the same button again. Connection start and end are that toggle. Share-screen is a local display connection, not sharing of metadata.
- The external display should show 現時賽果 only. Any other page, including settlement, must be opened in the app to check. The reason is that players and the user can check the score immediately, and the developer does not need to design interaction or controls for the external display. The look of that 現時賽果 display is left to later AI design.

Open technical decisions about the Android wireless path, Cast hosting, TV classes, the system picker, and connection-drop / no-mirror fallback belong to second-release planning, not first-release blockers. Details are in [`docs/development.md`](development.md).

Other extra features beyond that first-release point-counter scope can also come in a later release.

Visual design and navigation remain to be designed later. Expo plus libraries is the recorded development approach for building the iOS and Android apps; individual libraries are suggestions unless stated otherwise. Details are in [`docs/development.md`](development.md).

## Further 麻雀諗 product decisions

These are also 麻雀諗 product decisions, not reference-established fact. The exact wording and any remaining gaps are in `docs/guide.md`.

- **Titles:** 食糊王, 自摸王, and 出銃王 go to every player tied for the highest count of that event, if that count is at least 1. 大牌王 and 細牌王 compare the unrounded 平均番數 F/W, and only players with at least 3 食糊 are eligible. If fewer than two players are eligible, or every eligible average is equal, neither title is awarded. 冧莊王 goes to every player tied for the longest automatic 留莊 of at least 3. 陪跑員 goes to every player who holds none of 食糊王, 自摸王, 出銃王, or 大牌王. Holding 細牌王 or 冧莊王 does not prevent 陪跑員. Titles are not automatically exclusive.
- **Radar:** 0–100, no extra weights. 進攻 = 100×W/H, 防守 = 100×(1−D/H), 牌力 = 100×clamp((F/W−起糊)/(滿糊−起糊), 0, 1). H = 0 leaves 進攻 and 防守 as 未有資料. W = 0 or 起糊 = 滿糊 leaves 牌力 as 未有資料. A missing axis is not plotted as 0.
- **找數:** shows each non-zero net, including anyone who has left a seat with a balance, plus the Jackpot remainder. A zero is omitted. A non-zero pool is marked 尚未分配. The user finishes payment themselves. No payment instructions, transfer list, transfer-choice algorithm, tie-breaking, or currency label. The reference’s demonstrated transfer list stays in `docs/guide.md` as what the reference showed, not as a 麻雀諗 requirement.
- **Dice:** only a roll so players can see where they start collecting tiles from the four walls (bridges) in real life. Minimum 1 die, maximum 9 dice. The roll does not assign the dealer or write scores. The purpose text is not on-screen copy from the reference. The demonstrated reference UI is recorded in `docs/guide.md`.
- **滿糊:** in the local reference, the slider’s right end is 13, there is no 14番 row, and no out-of-range typed entry was shown. For 麻雀諗, 滿糊 is user-decidable and may be set above 13; money for 番 above 13 should be calculated. Do not invent the exact progression above 13. Use the demonstrated tables in `docs/guide.md` only where they were recorded.
- **番數?:** not a separate page. It is opened from the 食糊! dialog by the circled ? beside 番數. The full reference-demonstrated help text is only: title 現時設定下; body 這裏只需輸入牌型番數 (這裏 uses 裏 U+88CF, not 這裡). That is the entire help. This help text is reference-demonstrated, not a 麻雀諗 invention.

## Scoring and settings

Scoring, session, and settings behaviour follow the local reference where that behaviour is established, as recorded in `docs/guide.md`. That file now includes the demonstrated four-player 半銃 splits (including when F is not divisible by 4), 半銃 自摸 and an editable self-draw multiplier, 半銃 一炮多響, 詐糊 with 詐糊賠位自摸 off and on, 出銃者包自摸 and 出銃者包輸, the demonstrated 辣辣上 and 半辣上 tables, custom 新玩法 edit and delete behaviour, 起糊 down to 0, Jackpot 流局 contributions, 贏取Jackpot, 平分Jackpot, 莊 / 連莊 / 過莊, 流局時過莊 on and off, demonstrated three-player settlements, statistics fields, and the dice UI.

Behaviour that was not found in the reference and has not been decided remains unspecified.
