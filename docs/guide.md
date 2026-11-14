# 麻雀諗

The GitHub repository for this app is [MJLum](https://github.com/JustinBSG/MJLum).

This document is a product and function guide for 麻雀諗. It records decided product direction as of 14 November 2026, and the main areas a complete scorekeeper app will need. Where a flow, screen, or rule has not been specified yet, it is marked as **unspecified** or **planned**. Those sections describe the intended topic only; they do not invent UI layout, control labels, or scoring rules.

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
- The first release is a personal/table tool only, not a public App Store or Play Store app yet.
- The UI language and locale is Traditional Chinese — Hong Kong only.
- Only one device is used at the table. The first release does not support more than one device following the same session.
- The app keeps history across sessions.
- Data is local only: no backup, no cloud, and no account or sign-in requirement. Storage should be kept light.

Visual design, navigation, the technical approach for building the iOS and Android apps, and scoring rules are unspecified.

## How screens and functions fit together

The following function areas are planned so the app can serve as a table scorekeeper. Screen names, information architecture, and how the user moves between them are **unspecified**. UI/UX for these areas is to be designed later by AI, following this guide and using https://github.com/nextlevelbuilder/ui-ux-pro-max-skill to assist generation.

- **Scoreboard / table view:** planned as the view that shows current scores, and as the content that can be sent to an external display.
- **Session and scoring entry:** planned as the way players start or continue a game and record scoring events.
- **Settlement:** planned as the way results are calculated and shown at the end of a hand, a round, or a session. The exact breakpoints are unspecified.
- **Sharing:** planned as a way to share results or session information. The method and contents are unspecified.
- **Settings:** planned as the place for app or session preferences. The setting list is unspecified, except that the app itself is ad-free (this is a product rule, not an optional setting), and the UI language and locale is Traditional Chinese — Hong Kong only.
- **External display:** planned as a projector or larger-screen scoreboard on all first-release platforms (iOS and Android). AirPlay is required. Another similar path is welcome if it is supported. The exact connection flow, what is shown on the external screen versus the phone or tablet, and behavior when the connection drops are unspecified.
- **History:** planned as local history across sessions. Details of what is stored and how it is browsed are unspecified, except that storage is local only and should be kept light.

No wireframes, component list, or visual style are specified in this document on purpose.

## How to use it

Intended use, at a high level:

1. People play Hong Kong Mahjong in person with physical tiles.
2. One device at the table is used to keep the table's scores in 麻雀諗.
3. Optionally, the scoreboard is shown on a larger screen through a projector or external display. AirPlay is required for this; another similar path is welcome if it is supported.

Detailed first-run, player-setup, and in-game steps are **unspecified**.

## Platforms

First-release platforms are iOS and Android. Projector and external-display support is required on all first-release platforms.

The technical approach for building the iOS and Android apps is **unspecified**.

## Language and locale

The UI language and locale is Traditional Chinese — Hong Kong only. Other languages and locales are not in scope unless later decided.

## Devices at the table

Only one device is used at the table. The first release does not support more than one device following the same session.

## History and storage

The app keeps history across sessions. Data is local only: no backup, no cloud, and no account or sign-in requirement. Storage should be kept light.

What history records contain, and how the user browses or deletes them, are **unspecified**.

## UI/UX design process

All UI/UX should be designed by AI. AI should follow this guide to design the most user-friendly UI/UX, and should use https://github.com/nextlevelbuilder/ui-ux-pro-max-skill to assist generation.

This is a design-process decision only. This document does not include screen designs, wireframes, or a visual style, and those should not be invented here.

## Scoring and session flow

This area is **unspecified**. The guide only names topics that a Hong Kong Mahjong table scorekeeper will eventually need to settle, not the rules the app will use:

- How a session is created, named, or resumed
- How many players are supported, and how player names or seats are entered
- Whether and how dealer, prevailing wind, round, or hand number are tracked
- How a scoring event is entered (for example, who won, who paid, and on what basis)
- Whether the app calculates points from fan or other inputs, or only stores amounts the user enters
- How mistakes are corrected, and whether a hand or session can be undone or edited
- How a session is paused, completed, or discarded

Until these are decided, the app's scoring behavior should not be assumed.

## Settlement

Settlement is **planned** and the details are **unspecified**, including:

- When settlement happens (each hand, each round, end of session, or some combination)
- How payments among players are calculated and displayed
- Whether running totals, hand history, or both are kept during a session
- How a tied, abortive, or invalid hand is handled
- How the final result is presented on the device and, if connected, on the external display

## Sharing

Sharing is **planned** and the details are **unspecified**, including:

- What can be shared (for example a final result, a running scoreboard, or a session history)
- How it is shared (for example a system share sheet, an image, or another path)
- Whether shared output is meant for the players at the table, for later records, or both
- Whether a share includes only scores, or also player names and other session metadata

## Settings

Settings are **planned**. No setting keys, defaults, or screens are specified yet, except as follows.

The app is ad-free. That is a product decision and should not be implemented as a setting that turns ads on.

The UI language and locale is Traditional Chinese — Hong Kong only. A language-switch setting is not implied.

Other settings that may need a later decision include display or external-screen behavior, scoring-rule options, and session defaults. None of these are decided here.

## External display

External-display support is a decided product requirement: the scoreboard can be shown on a larger screen through a projector or external display.

The following are decided:

- This is required on all first-release platforms (iOS and Android).
- AirPlay is required. Another similar path is welcome if it is supported, but AirPlay is a must.

The following are still **unspecified**:

- What the larger screen shows, and whether it is a dedicated scoreboard layout
- How the user starts, confirms, or ends the connection
- What happens if the external display disconnects during a session
- Which other similar path, if any, ships in addition to AirPlay

## Unanswered questions

These decisions are still open and should be specified before implementation is treated as complete:

1. What Hong Kong Mahjong scoring rules and variants will the app support?
2. Does the user enter calculated amounts, or does the app calculate scores from structured inputs?
3. What is the session model (players, seats, dealer, winds, hands, rounds)?
4. When and how does settlement run, and what does the result look like?
5. What can be shared, and through which mechanism?
6. Which settings exist, and what are their defaults? (The UI language is already Traditional Chinese — Hong Kong only; ads stay off as a product rule.)
7. How should the external scoreboard look, how does the user start, confirm, or end the connection, and what happens if the display disconnects during a session?
8. What technical approach will be used to build the iOS and Android apps?

Scoring-rule questions (1–4, and any scoring-rule options under settings) remain unspecified and are not decided in this document.

This list can grow as product decisions are made. New decided rules should be added to the sections above and removed from this list.
