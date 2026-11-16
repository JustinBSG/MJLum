# MJLum development

Current device deployment and standalone installation steps are in the [Android and iOS installation guide](deployment.md), including free iPhone signing and offline verification.

**Release status, 17 November 2026: Version 1 · Release 1 (1.0.0) has completed UAT.** Current run and validation commands are in the [App README](../app/README.md); release scope is in [v1.0.0](releases/v1.0.0.md). The package investigation from 14–15 November 2026 below is retained as historical background. Installed versions are defined by `app/package-lock.json`.

Documentation is in English; the app interface remains Traditional Chinese (Hong Kong). The original screen label 現時賽果 means Current Scores; 半銃 means half-discard payment. See the [guide glossary](guide.md#interface-and-rule-terminology) for other literal labels.

This file is the coder-ready tech and development document as of 15 November 2026 (Asia/Hong Kong). It records the chosen development approach, the wireless second-screen plan for the second release, suggested libraries (versions re-checked on 14 November 2026), official API constraints, and remaining open technical decisions.

**麻雀諗 product decision:** Expo / React Native is the development approach. Individual libraries below are **suggestions** unless a sentence states that a piece is required (Expo itself, and `expo-dev-client` plus prebuild for unique second-screen work in the second release) or that an official platform API must be used for a given path. Do not treat a suggested package as locked.

Product rules that this file implements against are in [`docs/guide.md`](guide.md). The first-release UI is implemented in [the design system](../design-system/mjlum/MASTER.md); historical skill setup is in [`docs/ui-ux-pro-max-skill.md`](ui-ux-pro-max-skill.md).

Package versions and “as of” dates in this file were re-checked on 14 November 2026 against npm and official docs. Times from npm and vendor pages that carry a UTC or offset timestamp are given here in Asia/Hong Kong.

## App kind and stack approach

麻雀諗 is a personal/table Hong Kong Mahjong scorekeeper, not a tile game. First-release platforms are iOS and Android.

The recorded approach is [Expo](https://docs.expo.dev/) / React Native. Current Expo documentation treats SDK 58 as the latest reference (`Reference (v58.0.0)`). The npm `expo` package latest tag on this pass was `58.0.25`, published 13 November 2026, 00:40 HKT.

Unique second-screen work needs custom native code (or a third-party native module) that is not in Expo Go. Official Expo documentation describes a [development build](https://docs.expo.dev/develop/development-builds/introduction/) as a debug build that includes [`expo-dev-client`](https://docs.expo.dev/versions/latest/sdk/dev-client/) (recommended version on the SDK 58 docs: `~58.0.20`; npm latest this pass was `58.0.20`, published 13 November 2026, 00:41 HKT). A development build is the app’s own compiled client, in which native libraries and native configuration can be changed. Expo also documents [Continuous Native Generation / prebuild](https://docs.expo.dev/workflow/prebuild/) (`npx expo prebuild`) to generate the `android` and `ios` projects. `npx expo run:android` and `npx expo run:ios` run prebuild automatically if those directories do not yet exist. After installing a library with native code, changing app config, or upgrading the SDK, official guidance is to regenerate with `npx expo prebuild --clean` and rebuild.

Expo Go cannot host that native code. Official prebuild documentation states that Expo Go can load a project only if it includes JavaScript fallbacks for native code absent from the Expo Go runtime. Unique 現時賽果 on a second display is second-release work and cannot be developed or verified in Expo Go; use a development build for that work.

## Local-only constraints

These are already-decided 麻雀諗 product rules:

- Only one device is used at the table.
- Data is local only: no backup, no cloud, and no account.
- The app keeps all in-game records across sessions, stored locally only, and storage should be kept light.
- The app does not share metadata or session data.
- For the second-release external display, share-screen is a local display connection, not a data share.

Google Cast, if it is later chosen, tensions with those rules. The supported custom-scoreboard path is a [Custom Web Receiver](https://developers.google.com/cast/docs/web_receiver): an HTML5 app you host, registered in the [Google Cast SDK Developer Console](https://developers.google.com/cast/docs/registration). A published receiver must be fetched over HTTPS. During development the URL may use HTTP on a private network, but not `localhost`. Live scores can travel on the Cast channel without storing session data on a server, but the TV still downloads receiver code from a hosted URL. Relay casting is an optional console checkbox that allows senders not on the same Wi-Fi as the receiver; whether it should be off is an open decision. The official [Android Sender SDK](https://developers.google.com/cast/docs/android_sender/integrate) is the Play services Cast framework (`com.google.android.gms.cast.framework`) and currently documents a minimum API level of 24. This file records those facts as caveats, not as a decision to adopt Cast.

## External display product rules

These are 麻雀諗 product decisions for the **second release**. They are not first-release fulfilment. The first release develops the point-counter / table scorekeeper features.

- The second-release plan is a **wireless** connection to a smart TV, on both iOS and Android.
- Start and end with the same in-app share-screen button.
- The external display shows **現時賽果 only**. Settlement and every other page are opened in the app.
- On iOS / iPhone, the path is AirPlay unique (not only mirrored) content.
- On Android, the path must be an official wireless Android-to-smart-TV path. Unofficial or commercial Android AirPlay senders are not fulfilment. There is no official Apple AirPlay sender SDK or API for Android apps.
- Official wired HDMI / USB-C Presentation exists on both platforms, but it is **not** the chosen fulfilment.

If unique 現時賽果 stops while the system route stays up, default mirroring of the phone UI would violate the 現時賽果-only rule.

Official start/stop behaviour:

- **iOS.** Starting and ending the system AirPlay route uses system UI, typically [`AVRoutePickerView`](https://developer.apple.com/documentation/avkit/avroutepickerview) (a button that presents a system popover of nearby receivers; `prioritizesVideoDevices` can sort video devices to the top). Official APIs do not document a silent private connect or disconnect. Unique noninteractive content is a `windowExternalDisplayNonInteractive` scene. Beginning in iOS 27, the app receives that scene only after it registers [`UISceneAccessory.externalNonInteractive`](https://developer.apple.com/documentation/uikit/presenting-content-on-a-connected-display). Setting `UISceneAccessoryRegistration.isEnabled` to `false`, or calling `unregisterSceneAccessory`, stops unique content; if the accessory is being presented, unregistering dismisses the scene. Apple’s pages state that when an external display connects and the app does not present unique content, the default is to mirror the primary display (or, on some iPad models with extended display enabled, to present interactive windows). They do **not** literally say that mirroring resumes if unique content is torn down while the AirPlay route remains selected. That is the implied default, and a technical risk, not a documented one-line guarantee. See the conflict note under [Official sources](#official-sources-and-conflicts).
- **Android (Miracast-class).** The system creates a presentation `Display`; the app attaches [`Presentation`](https://developer.android.com/reference/android/app/Presentation). Route selection commonly uses [`MediaRouter`](https://developer.android.com/media/routing/mediarouter) with `ROUTE_TYPE_LIVE_VIDEO` or a `MediaRouteSelector` that includes `CATEGORY_LIVE_VIDEO`, plus a `MediaRouteButton` / `MediaRouteActionProvider`, or system Cast / mirroring settings. Official APIs point to that system route UI, not a silent private toggle of the wireless display route. A presentation is cancelled when its display is removed (`onDisplayRemoved`); `show()` throws `InvalidDisplayException` if the display is gone or not allowed. Official samples also dismiss the presentation in `Activity.onStop()`.
- **Android (Cast).** The official Cast button / `MediaRouteButton` opens a system dialog to start or end the session. `SessionManagerListener` reports session start, end, and suspension. Automatic reconnection is documented for some media-session cases; whether that helps a custom scoreboard is not decided here.

How far the in-app share-screen button may rely on a system picker, rather than a fully silent connect and disconnect, is an open decision. Behaviour when the connection drops remains **unspecified** in the product documents.

## iOS wireless path

The iPhone path is AirPlay to a smart TV, showing unique 現時賽果.

Official pieces:

- System route picker: [`AVRoutePickerView`](https://developer.apple.com/documentation/avkit/avroutepickerview).
- Unique noninteractive external display: scene role `windowExternalDisplayNonInteractive`. Content for this scene spans the full screen and is noninteractive, which matches 現時賽果-only (no controls on the TV).
- Beginning in iOS 27, the app must register `UISceneAccessory.externalNonInteractive` before it receives that scene. In iOS 26 and earlier, the system could connect the scene automatically, and the app opted out by declining to provide content.
- Beginning in iOS 27, [apps built with the latest SDK must adopt the UIKit scene-based life cycle](https://developer.apple.com/documentation/uikit/transitioning-to-the-uikit-scene-based-life-cycle), or they fail to launch. This applies to iOS 27, iPadOS 27, Mac Catalyst 27, tvOS 27, and visionOS 27.

Suggested ways to implement this under Expo (not locked):

- A **custom native module** wrapping `AVRoutePickerView` plus the scene accessory is a valid suggestion if no mature official Expo module covers the path. It requires a development build / prebuild.
- [`expo-scene-accessories`](https://www.npmjs.com/package/expo-scene-accessories) `0.1.0-alpha.0` (npm, 25 September 2026, 18:11 HKT, MIT) is a third-party wrapper. Its README claims `ExternalNonInteractiveAccessory` can render React Native UI on iOS 27+ external or AirPlay displays. Requirements stated by the package: Expo SDK 58+, New Architecture, Xcode 27.1+, a development build; Expo Go is not supported. On Android, on the web, and on older iOS, the components render nothing and `isSceneAccessorySupported()` returns `false`. This does not replace an Android module. It is an iOS 27 alpha and is too early to lock.
- [`react-native-external-display`](https://www.npmjs.com/package/react-native-external-display) `0.6.6` (MIT, last published 1 September 2024, 09:23 HKT) historically renders unique React Native content on an external display, as a native module that would need prebuild. Given that publish date, it is unlikely to implement iOS 27 `UISceneAccessory`. Audit it before any iOS 27 use; it is not a given.

## Android official wireless paths

The official pattern for a dedicated second surface is: the system creates a presentation display, then the app attaches `android.app.Presentation`. [`DisplayManager.getDisplays(DISPLAY_CATEGORY_PRESENTATION)`](https://developer.android.com/reference/android/hardware/display/DisplayManager) lists secondary displays suitable for presentations, including external or wireless displays; when several exist, the first entry is preferred. `DisplayManager.DisplayListener` reports added, changed, and removed displays.

There is no first-party Expo API for Android `Presentation`, `DisplayManager`, or unique iOS external-display scenes in the Expo SDK 58 docs fetched for this pass. A custom native module under Expo is likely required for the Miracast-class path. Samsung Smart View and other manufacturer-only paths are not a portable official Android API and should not be described as fulfilment across Android devices.

### Wi-Fi Display / Miracast-class

Official `Presentation` and `MediaRouter` documentation treat a wireless display like HDMI for unique content: listen for a live-video route, then attach a `Presentation` to `RouteInfo.getPresentationDisplay()`. Apps add `CATEGORY_LIVE_VIDEO` (or platform `ROUTE_TYPE_LIVE_VIDEO`) and handle their own `Presentation`. Starting and ending the system wireless route goes through official route UI or system settings. An in-app share-screen control can wrap that picker and, after a presentation display appears, show unique 現時賽果. It should not be assumed to connect or disconnect Miracast with no system UI.

Typical reach is Miracast / “screen mirroring” TVs and adapters, not the same set as Chromecast. Compatibility varies by phone and TV OEM.

### Google Cast

Cast Remote Display / `CastPresentation` is **not** a viable path. Official [`CastRemoteDisplay`](https://developers.google.com/android/reference/com/google/android/gms/cast/CastRemoteDisplay) text says the feature is deprecated and will be removed, and that `isRemoteDisplaySdkSupported()` always returns `false`.

The supported way to show a custom 現時賽果 UI on a Cast device is a [Custom Web Receiver](https://developers.google.com/cast/docs/web_receiver) hosted by you and registered in the [Cast Developer Console](https://developers.google.com/cast/docs/registration). Styled and Default Media Receivers are media players, not a dedicated scoreboard. Still accurate in the docs fetched this pass:

- One-time, non-refundable US$5 Developer Console registration fee ([Cast developer registration help](https://support.google.com/cast-developer/answer/4512496?hl=en)).
- An application ID for Custom or Styled receivers.
- Unpublished testing requires each Cast device to be registered by serial number, then a wait of fifteen minutes until the status is Ready for Testing, then a restart of the device.
- Published receivers must be HTTPS.
- Relay casting is an optional checkbox.

[`react-native-google-cast`](https://www.npmjs.com/package/react-native-google-cast) can wrap the sender SDK if Cast is later chosen. npm this pass: latest `4.9.1` (26 July 2025, 18:41 HKT, MIT); `next` tag `5.0.0-beta.0` (4 September 2026, 16:28 HKT). It is not usable in Expo Go. **Cast is an official wireless option. It is not a chosen path.** Justin has not accepted the hosted-HTTPS / local-only tension.

### No official AirPlay sender on Android

Apple’s public AirPlay developer documentation describes sending from Apple platforms (iOS, iPadOS, macOS, iTunes). A search of Apple developer documentation on this pass did not find an official AirPlay sender SDK or public sender API for Android apps. Unofficial or commercial Android AirPlay senders are not fulfilment and are not recommended as a fallback.

## Suggested libraries (not locked)

These remain suggestions after the 14 November 2026 re-check, except where a sentence restates a required Expo development-build piece.

| Area | Suggestion | Version observed this pass | Caveats |
|---|---|---|---|
| Expo SDK | Expo SDK 58 | `expo` `58.0.25` (13 Nov 2026, 00:40 HKT). Docs current: v58. | Development approach is chosen; this exact patch is not locked. |
| Dev client | `expo-dev-client` + prebuild | `58.0.20` (13 Nov 2026, 00:41 HKT). SDK 58 docs recommend `~58.0.20`. | Required for unique second-screen native code in the second release. Expo Go cannot do that work. |
| Local store | `expo-sqlite` | `58.0.17` (13 Nov 2026, 00:42 HKT). SDK 58 docs recommend `~58.0.17`. | Fits local sessions, history, tables, and statistics. Backup exclusion is **not** in the `expo-sqlite` API docs fetched this pass; it must be applied at the file or manifest layer. |
| Exact scores | `fraction.js` or `decimal.js` (optional smaller alternative: `big.js`) | `fraction.js` `5.3.4` (22 Aug 2025, 19:44 HKT); `decimal.js` `10.6.0` (7 Jul 2025, 06:50 HKT); `big.js` `7.0.1` (22 Apr 2025, 04:13 HKT). All MIT. | Never use raw JavaScript `Number` for scores. Construct from strings or an integer numerator/denominator, never from a previously rounded `Number`. `fraction.js` keeps exact rationals (for example 32/3 stays 32/3). `decimal.js` is a better fit if the product thinks in decimal money. Display rounding of non-terminating amounts remains an open product gap. |
| Locale | `expo-localization` + `Intl`, pin `zh-Hant-HK` | `expo-localization` `58.0.5` (19 Oct 2026, 21:22 HKT). SDK 58 docs recommend `~58.0.5`. Included in Expo Go; `supportedLocales` config plugin is documented. | `getLocales()` / `useLocales()` return BCP 47 tags such as `zh-Hant-HK`. The product is Traditional Chinese — Hong Kong only, so the app can pin that locale even when the device locale differs. |
| Radar | Custom plot on `react-native-svg` | `15.16.1` (5 Nov 2026, 21:44 HKT, MIT). | Enough for a three-axis 0–100 radar. Optional heavier alternative: `react-native-gifted-charts` `1.4.81` (5 Oct 2026, 15:24 HKT, MIT), which includes a `RadarChart`. |
| Navigation / UI | Expo Router and core React Native UI | `expo-router` `58.0.31` (11 Nov 2026, 22:21 HKT). | Official Expo file-based router. No design-system package is suggested in this pass; UI/UX is designed later with the skill documented in [`docs/ui-ux-pro-max-skill.md`](ui-ux-pro-max-skill.md). |
| Dice | A small custom control | — | 1–9 dice, a total, and a seat label. No game-engine library is suggested. |

### Backup-exclusion caveats for a local-only store

`isExcludedFromBackup` is guidance, must be re-set, and is not a guarantee.

On iOS, Apple’s [`URLResourceValues.isExcludedFromBackup`](https://developer.apple.com/documentation/foundation/urlresourcevalues/isexcludedfrombackup) documentation says the property is useful for excluding cache and other application-support files that are not needed in a backup, that some operations commonly made to user documents reset the flag to `false`, and that the property should not be used on user documents. For a local-only scorekeeper, keep the database out of the Documents directory (Application Support is the usual place for this kind of file), set the exclusion flag, and re-apply it whenever the file is rewritten or replaced. A small native helper or config plugin is likely required. This pass did not find an `isExcludedFromBackup` API in the official `expo-sqlite` reference.

On Android, Auto Backup is on by default for apps that target API 23+. Expo app config supports [`android.allowBackup`](https://docs.expo.dev/versions/latest/config/app/#allowbackup) (Android default is `true`). Official Android documentation and Expo’s description of that flag do not fully agree; see [Official sources and conflicts](#official-sources-and-conflicts). Files under [`getNoBackupFilesDir()`](https://developer.android.com/reference/android/content/Context#getNoBackupFilesDir()) are excluded from Auto Backup by design. Finer `dataExtractionRules` / `fullBackupContent` control may need a config plugin.

## Official sources and conflicts

### Conflicts between official pages

1. **iOS fallback to mirroring.** [Presenting content on a connected display](https://developer.apple.com/documentation/uikit/presenting-content-on-a-connected-display) and [Transitioning to the UIKit scene-based life cycle](https://developer.apple.com/documentation/uikit/transitioning-to-the-uikit-scene-based-life-cycle) state that when an external display connects (cable or AirPlay), the default is to mirror the primary display unless the app presents unique content, and that disabling or unregistering the scene accessory stops unique content and can dismiss the scene. Those pages do not literally say that phone-UI mirroring resumes if unique 現時賽果 is torn down while the AirPlay route stays selected. This file reports that gap rather than inventing a resolution. The product rule if a drop or a teardown would otherwise show a phone-UI mirror remains unspecified.
2. **Android `allowBackup`.** Expo’s app-config documentation for [`android.allowBackup`](https://docs.expo.dev/versions/latest/config/app/#allowbackup) says that if the value is `false`, “no backup or restore of the application will ever be performed.” Official Android [Auto Backup](https://developer.android.com/identity/data/autobackup) documentation says that for apps targeting Android 12 (API 31) or higher, on devices from some manufacturers, `android:allowBackup="false"` disables cloud-based backup and restore (such as Google Drive) but does not disable device-to-device transfers. This file does not invent a resolution. If backup must be excluded comprehensively, `getNoBackupFilesDir()` and `dataExtractionRules` (including a `device-transfer` section) need a separate review.

No other official-page conflicts were found on this pass for the APIs and packages listed above.

### Platform and vendor docs

- [Transitioning to the UIKit scene-based life cycle](https://developer.apple.com/documentation/uikit/transitioning-to-the-uikit-scene-based-life-cycle)
- [Presenting content on a connected display](https://developer.apple.com/documentation/uikit/presenting-content-on-a-connected-display)
- [AVRoutePickerView](https://developer.apple.com/documentation/avkit/avroutepickerview)
- [isExcludedFromBackup](https://developer.apple.com/documentation/foundation/urlresourcevalues/isexcludedfrombackup)
- [Presentation](https://developer.android.com/reference/android/app/Presentation)
- [DisplayManager](https://developer.android.com/reference/android/hardware/display/DisplayManager)
- [MediaRouter overview](https://developer.android.com/media/routing/mediarouter)
- [Auto Backup](https://developer.android.com/identity/data/autobackup)
- [Context.getNoBackupFilesDir()](https://developer.android.com/reference/android/content/Context#getNoBackupFilesDir())
- [Cast registration](https://developers.google.com/cast/docs/registration)
- [Web Receiver overview](https://developers.google.com/cast/docs/web_receiver)
- [Integrate Cast into an Android app](https://developers.google.com/cast/docs/android_sender/integrate)
- [CastRemoteDisplay](https://developers.google.com/android/reference/com/google/android/gms/cast/CastRemoteDisplay)
- [Cast developer registration help](https://support.google.com/cast-developer/answer/4512496?hl=en)

### Expo docs

- [Introduction to development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [expo-dev-client (SDK 58)](https://docs.expo.dev/versions/latest/sdk/dev-client/)
- [Continuous Native Generation (prebuild)](https://docs.expo.dev/workflow/prebuild/)
- [expo-sqlite (SDK 58)](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [expo-localization (SDK 58)](https://docs.expo.dev/versions/latest/sdk/localization/)
- [app.json / app.config.js](https://docs.expo.dev/versions/latest/config/app/)

### Package pages

- [expo](https://www.npmjs.com/package/expo)
- [expo-dev-client](https://www.npmjs.com/package/expo-dev-client)
- [expo-sqlite](https://www.npmjs.com/package/expo-sqlite)
- [expo-localization](https://www.npmjs.com/package/expo-localization)
- [expo-router](https://www.npmjs.com/package/expo-router)
- [expo-scene-accessories](https://www.npmjs.com/package/expo-scene-accessories)
- [react-native-external-display](https://www.npmjs.com/package/react-native-external-display)
- [react-native-google-cast](https://www.npmjs.com/package/react-native-google-cast)
- [fraction.js](https://www.npmjs.com/package/fraction.js)
- [decimal.js](https://www.npmjs.com/package/decimal.js)
- [big.js](https://www.npmjs.com/package/big.js)
- [react-native-svg](https://www.npmjs.com/package/react-native-svg)
- [react-native-gifted-charts](https://www.npmjs.com/package/react-native-gifted-charts)

## Remaining open technical decisions

Do not invent product answers for these gaps. Items 1–5 belong to second-release planning, not first-release blockers.

1. **Android wireless path:** Miracast-class Presentation, Cast, or both. Wireless is chosen for the second-release TV path; wired is not the chosen fulfilment.
2. **Whether a hosted Cast receiver is acceptable** under local-only / no-cloud / no-account, and whether relay casting should be off.
3. **Which TV classes / receiver hardware to design for** (Miracast-compatible TV versus Chromecast / Google TV / other Cast-enabled set).
4. **How far the in-app share-screen button may rely on a system picker** rather than a fully silent connect and disconnect. Official iOS and Android APIs typically present system route UI.
5. **Connection-drop / no-mirror fallback behaviour.** Still unspecified as a product rule, including whether unique 現時賽果 must be torn down in a way that also ends the system route so the display does not fall back to mirroring the phone.
6. **Rounding and storage of non-terminating decimals** (already an open first-release product gap, for example some 半銃 splits such as 32/3).
7. **Distribution accounts** (Apple Developer Program, Play Console, sideload / TestFlight, and similar) remain an open technical decision. This file does not recommend buying accounts.

### Conservative suggestion (not a locked decision)

Among official wireless options, Miracast-class Presentation is more aligned with local-only data than a hosted Cast receiver, because unique 現時賽果 can be attached to a system presentation display without hosting receiver HTML. Cast remains an official option if the hosted-HTTPS and Play services tensions are later accepted. Do not treat wired HDMI / USB-C as the plan.
