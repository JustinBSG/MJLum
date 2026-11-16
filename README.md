# MJLum — 麻雀諗

A mobile scorekeeper for in-person Hong Kong Mahjong. Record winning hands, track player balances, and review settlement totals while everyone plays with physical tiles.

MJLum runs on one device at the table, stores records locally, and requires no account. The app has no ads, cloud sync, or session-data sharing. Its interface is Traditional Chinese (Hong Kong).

## Current release

**Version 1 · Release 1** has completed UAT and is available on `main`.

| Item | Value |
|---|---|
| App version | `1.0.0` |
| Release / native build | `1` |
| Git tag | [`v1.0.0`](https://github.com/JustinBSG/MJLum/tree/v1.0.0) |
| Target platforms | iOS and Android |

See the [release notes](docs/releases/v1.0.0.md) for the release scope and validation record. This is a source-code release; signed installers and app-store distribution are separate steps.

## Features

- **Rules and score tables:** Hong Kong Mahjong presets, custom tables, configurable fan limits, payout settings, and a numeric keypad for amounts.
- **Player management:** seats, dealer selection, substitutions, seat swaps, and separate displays for seated and unseated players.
- **Hand scoring:** select winners, fan values, and self-draw or discard outcomes; preview balance changes before recording. Supported special cases include multiple winners, half-discard payments, false-win penalties, and liability payments.
- **Live scores and progress:** large balance displays, dealer indicators, prevailing-wind or hand-count views, and confirmation dialogs for draws and undo.
- **History and settlement:** locally saved sessions, event and score tables, undo/redo, supported record edits, net balances, and unallocated Jackpot funds. Settlement does not generate transfer pairings.
- **Statistics and utilities:** player counts and rates, titles, radar charts, and animated rolls of one to nine dice with reduced-motion support.
- **Table-friendly interface:** large touch targets, clear selection states, a light theme, and an original Mahjong-tile mascot and loading screen.

Scoring follows the documented product rules. Unsupported combinations remain blocked rather than receiving an assumed formula. See the [scoring and session guide](docs/guide.md) for details.

## Quick start

You need Node.js **22.13+ within the 22.x series**, or **24.3+ within the 24.x series**, npm, and Expo Go on your phone.

From the repository root:

```powershell
cd app
npm ci
npx expo start --go --lan
```

Connect your phone and computer to the same Wi-Fi network, then scan the QR code shown in the terminal. Keep the terminal running while testing.

If the app still shows an older interface, first update your checkout, then restart Expo with a clean bundler cache:

```powershell
npx expo start --go --lan --clear
```

Expo Go supports UI testing and the in-app loading screen. Validate the complete native splash screen and home-screen icon in a standalone build.

To install the app on a phone and use it without Metro or the same Wi-Fi network, follow the [standalone installation guide](docs/deployment.md). It covers Android APKs, free iPhone installation with Xcode, and iOS distribution through EAS and TestFlight.

## Development

The app uses **Expo SDK 58**, **React Native 0.88**, **React 19.3**, **Expo Router**, and **SQLite**. Dependency versions are pinned in [`app/package-lock.json`](app/package-lock.json).

Run checks from the `app` directory:

```powershell
npm run lint
npx tsc --noEmit
npm test
```

The release passed lint, TypeScript, 103 automated tests, and production bundle exports for iOS and Android.

| Location | Purpose |
|---|---|
| [`app/src/app/`](app/src/app/) | Screens and navigation |
| [`app/src/components/`](app/src/components/) | Shared controls, tables, score displays, and animations |
| [`app/src/session/`](app/src/session/) | Session state, hand processing, history, and statistics |
| [`app/src/rules/`](app/src/rules/) | Presets and custom rule configuration |
| [`app/src/score/`](app/src/score/) | Exact-score arithmetic |
| [`app/src/storage/`](app/src/storage/) | Local SQLite storage |
| [`design-system/mjlum/`](design-system/mjlum/) | Visual guidelines and implementation notes |

iOS and Android persist records locally. The web version is an interface preview with in-memory storage; refreshing it clears that preview's data.

## Documentation

| Document | Contents |
|---|---|
| [Documentation index](docs/README.md) | Product scope and document map |
| [Release notes](docs/releases/v1.0.0.md) | Version 1 · Release 1 |
| [Standalone installation](docs/deployment.md) | Android APK, free iPhone signing, EAS distribution, offline checks, and troubleshooting |
| [Product and scoring guide](docs/guide.md) | Scoring rules, session behavior, and evidence behind decisions |
| [Feature guide](docs/features.md) | Implemented features and interactions |
| [App development guide](app/README.md) | Setup, checks, storage, and brand-asset generation |
| [Design system](design-system/mjlum/MASTER.md) | Colors, typography, accessibility, and interaction guidelines |

Version 1 covers Hong Kong Mahjong scorekeeping. Wireless TV score display is planned for the second release; other regional Mahjong variants are outside the current release.
