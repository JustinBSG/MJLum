# MJLum App

Version 1 · Release 1: app version `1.0.0`, iOS build `1`, Android version code `1`, and Expo extra release `1`. See the [release record](../docs/releases/v1.0.0.md).

## Environment and development

Use Node.js 22.13+ within 22.x or 24.3+ within 24.x, with npm. Dependency versions are pinned in `package-lock.json`. The app uses Expo SDK 58, React Native 0.88, Expo Router, and SQLite.

Run from this directory:

```powershell
npm ci
npx expo start --go --lan
```

Connect the phone and computer to the same Wi-Fi network, then scan the terminal QR code with Expo Go. Keep the terminal running while testing. If the interface looks outdated, first update the relevant Git branch, then run:

```powershell
npx expo start --go --lan --clear
```

## Standalone installation

Follow the [standalone installation guide](../docs/deployment.md) for Android APKs, free iPhone installation with Xcode Personal Team and seven-day signing renewal, EAS/TestFlight distribution, offline checks, and Xcode/Developer Mode troubleshooting. A standalone installation runs without Expo Go, Metro, or a computer on the same Wi-Fi network.

## Validation

```powershell
npm run lint
npx tsc --noEmit
npm test
```

## Source code and data

- `src/app/`: Expo Router screens. The table, scoring, history, settlement, and statistics share internal panels under `/session`.
- `src/session/`, `src/score/`, `src/rules/`: session state, exact-score arithmetic, and scoring rules.
- `src/storage/`: local SQLite storage on iOS and Android.
- `src/components/`: tables, numeric keypad, dual-handle slider, dice animation, loading screen, and shared buttons.
- The web version uses an in-memory database for previews. Refreshing it clears that preview's data.

## Brand assets

After editing `src/constants/brand.ts`, run `npm run generate:brand` to generate the app icon, Android adaptive icons, splash artwork, and favicon. The export tool is a development dependency.

Expo Go supports interface testing and the in-app loading screen. Verify the native splash screen and home-screen icon in a standalone build. Native compilation, signing, and store distribution are separate release steps; pushing `main` does not create or upload installers.
