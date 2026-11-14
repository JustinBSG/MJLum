# 麻雀諗

The GitHub repository for this app is [MJLum](https://github.com/JustinBSG/MJLum).

麻雀諗 is a table scorekeeper for in-person Hong Kong Mahjong. It is not a tile game.

Product direction as of 14 November 2026:

- The app is a cross-platform mobile app. First-release platforms are iOS and Android.
- The app has no ads.
- At the current stage the app is completely free.
- The UI/UX is distinct, and is not a copy of the existing iPhone app 麻將計數機.
- All UI/UX should be designed by AI. AI should follow the product guide to design the most user-friendly UI/UX, and should use https://github.com/nextlevelbuilder/ui-ux-pro-max-skill to assist generation.
- The app supports showing the scoreboard on a larger screen through a projector or external display. This is required on all first-release platforms (iOS and Android). AirPlay is required. Another similar path is welcome if it is supported, but AirPlay is a must.
- Start screen sharing by clicking the share-screen button in the app; end sharing by clicking the same button again. Connection start and end are that toggle.
- The external display should show 現時賽果 only. Any other page must be opened in the app to check. The reason is that players and the user can check the score immediately, and the developer does not need to design interaction or controls for the external display. The look of that 現時賽果 display is left to later AI design.
- The first release is a personal/table tool only, not a public App Store or Play Store app yet.
- The UI language and locale is Traditional Chinese — Hong Kong only.
- Only one device is used at the table. The first release does not support more than one device following the same session.
- The first release has exactly the same functionality as the local reference. That includes all reference scoring options, such as 半銃, 詐糊, 出銃者包自摸, 出銃者包輸, and Jackpot, even when some formulas were not demonstrated and remain unspecified (those formulas must not be invented). It also includes the reference’s rule categories and utilities, including statistics, titles, a radar chart, a dice utility, and fan-help. The already-decided 麻雀諗 product rules in the bullets above are part of this first release, not extra features: no ads; a distinct UI; Traditional Chinese — Hong Kong only; one device at the table; iOS and Android; local-only data; no metadata sharing; and the required AirPlay / share-screen external display.
- A second release is for extra features: anything beyond that same-functionality first release.
- The app keeps all in-game records (all the things in the game) across sessions, stored locally only.
- Data is local only: no backup, no cloud, and no account or sign-in requirement. Storage should be kept light.
- The app does not share metadata or session data, including results, history, player information, settlement, or other session information. It is a simple local tool. The share-screen control for an external display is a local display connection, not sharing of metadata.
- Scoring, session, and settings behavior follow the local reference where that behavior is established, as recorded in `docs/guide.md`. Additional demonstrated detail now recorded there includes the four-player 半銃 discard-win split, a 半銃 一炮多響 example, a 詐糊 settlement with 詐糊賠位自摸 off, the 五一辣辣上 score table through 13 fan, and Jackpot defaults in rule setup. Behavior that was not found in the reference remains unspecified.
