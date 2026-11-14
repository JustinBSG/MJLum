# 麻雀諗

The GitHub repository for this app is [MJLum](https://github.com/JustinBSG/MJLum).

This document is a product and function guide for 麻雀諗. It records decided product direction as of 14 November 2026, and the main areas a complete scorekeeper app will need. Where a flow, screen, or rule has not been specified yet, it is marked as **unspecified** or **planned**. Those sections describe the intended topic only; they do not invent UI layout, control labels, or scoring rules.

`docs/product.md` is the short product-direction summary. This file is the longer guide.

## What the app is for

麻雀諗 is a table scorekeeper for in-person Hong Kong Mahjong. It is not a tile game: it does not deal, draw, or display a playable wall of tiles, and it is not meant to replace physical tiles at the table.

Players use the app to keep and show scores during a live game. A later version is also intended to show the scoreboard on a larger screen.

## Decided product direction

The following points are decided:

- The app is a cross-platform mobile app.
- The app has no ads.
- The UI/UX is distinct, and is not a copy of the existing iPhone app 麻將計數機.
- The app supports showing the scoreboard on a larger screen through a projector or external display, via AirPlay or another similar path.

Platform list, visual design, navigation, and scoring rules beyond this direction are unspecified.

## How screens and functions fit together

The following function areas are planned so the app can serve as a table scorekeeper. Screen names, information architecture, and how the user moves between them are **unspecified**.

- **Scoreboard / table view:** planned as the view that shows current scores, and as the content that can be sent to an external display.
- **Session and scoring entry:** planned as the way players start or continue a game and record scoring events.
- **Settlement:** planned as the way results are calculated and shown at the end of a hand, a round, or a session. The exact breakpoints are unspecified.
- **Sharing:** planned as a way to share results or session information. The method and contents are unspecified.
- **Settings:** planned as the place for app or session preferences. The setting list is unspecified, except that the app itself is ad-free (this is a product rule, not an optional setting).
- **External display:** planned as a projector or larger-screen scoreboard, via AirPlay or another similar path. The exact connection flow, what is shown on the external screen versus the phone or tablet, and behavior when the connection drops are unspecified.

No wireframes, component list, or visual style are specified in this document on purpose.

## How to use it

Intended use, at a high level:

1. People play Hong Kong Mahjong in person with physical tiles.
2. One or more people use 麻雀諗 on a phone or tablet to keep the table's scores.
3. Optionally, the scoreboard is shown on a larger screen through a projector or external display, via AirPlay or another similar path.

Detailed first-run, player-setup, and in-game steps are **unspecified**.

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
- Whether running totals, hand history, or both are kept
- How a tied, abortive, or invalid hand is handled
- How the final result is presented on the device and, if connected, on the external display

## Sharing

Sharing is **planned** and the details are **unspecified**, including:

- What can be shared (for example a final result, a running scoreboard, or a session history)
- How it is shared (for example a system share sheet, an image, or another path)
- Whether shared output is meant for the players at the table, for later records, or both
- Whether a share includes only scores, or also player names and other session metadata

## Settings

Settings are **planned**. No setting keys, defaults, or screens are specified yet.

The app is ad-free. That is a product decision and should not be implemented as a setting that turns ads on.

Other settings that may need a later decision include language, display or external-screen behavior, scoring-rule options, and session defaults. None of these are decided here.

## External display

External-display support is a decided product requirement: the scoreboard can be shown on a larger screen through a projector or external display, via AirPlay or another similar path.

The following are still **unspecified**:

- Which platforms in the cross-platform app will support this first
- Whether AirPlay is the only first-release path, or another similar path ships at the same time
- What the larger screen shows, and whether it is a dedicated scoreboard layout
- How the user starts, confirms, or ends the connection
- What happens if the external display disconnects during a session

## Unanswered questions

These decisions are still open and should be specified before implementation is treated as complete:

1. Which mobile platforms are in the first release, and what “cross-platform” means in practice?
2. What Hong Kong Mahjong scoring rules and variants will the app support?
3. Does the user enter calculated amounts, or does the app calculate scores from structured inputs?
4. What is the session model (players, seats, dealer, winds, hands, rounds)?
5. When and how does settlement run, and what does the result look like?
6. What can be shared, and through which mechanism?
7. Which settings exist, and what are their defaults?
8. How should the external scoreboard look, and which connection paths are in scope for the first release?
9. What languages and locales should the UI support?
10. Should the app store history across sessions, and where is that data kept?
11. Is the app for a single device at the table, or can more than one device follow the same session?

This list can grow as product decisions are made. New decided rules should be added to the sections above and removed from this list.
