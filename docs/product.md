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
- Start screen sharing by clicking the share-screen button in the app; end sharing by clicking the same button again. Connection start and end are that toggle. The look of the external scoreboard is left to later AI design.
- The first release is a personal/table tool only, not a public App Store or Play Store app yet.
- The UI language and locale is Traditional Chinese — Hong Kong only.
- Only one device is used at the table. The first release does not support more than one device following the same session.
- The app keeps all in-game records (all the things in the game) across sessions, stored locally only.
- Data is local only: no backup, no cloud, and no account or sign-in requirement. Storage should be kept light.
- The app does not share metadata or session data, including results, history, player information, settlement, or other session information. It is a simple local tool. The share-screen control for an external display is a local display connection, not sharing of metadata.
- Scoring, session, and settings behavior follow the local reference where that behavior is established, as recorded in `docs/guide.md`. Behavior that was not found in the reference remains unspecified.
