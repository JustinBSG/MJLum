# Standalone installation: Android and iOS

For MJLum Version 1 · Release 1 (`1.0.0`, build `1`). Instructions checked on 17 November 2026 (Asia/Hong_Kong).

A standalone build installs **麻雀諗** as its own app, with JavaScript and assets included. The scorekeeper can run without Expo Go, Metro, USB, or a computer on the same Wi-Fi. Sessions use the phone's local SQLite database.

Building, downloading, and signing require internet access. Apple may also require signing verification before a device can launch an app. These requirements are separate from MJLum's offline scorekeeping. This guide does not indicate that an installer has already been built or uploaded.

## Choose a method

| Method | Build computer | Account requirements | Installation and renewal |
|---|---|---|---|
| Android APK through EAS | Windows, Mac, or Linux | Expo account; no Google Play account for direct installation | Download and install a signed APK |
| Free iPhone Personal Team | Mac with Xcode | Free Apple Account | Install to your own phone; renew every 7 days |
| iPhone Ad Hoc through EAS | Windows, Mac, or Linux | Expo account and paid Apple Developer membership | Register each phone; signing has an expiry |
| iPhone TestFlight | EAS cloud builds can start from Windows | Expo account, paid Apple Developer membership, App Store Connect | Invite testers; each beta build lasts up to 90 days |

An `expo export` output is a bundle, not an installable APK or iPhone app. Expo Go remains a development-preview option.

Sources: [Expo setup](https://docs.expo.dev/build/setup/), [APK builds](https://docs.expo.dev/build-reference/apk/), [internal distribution](https://docs.expo.dev/build/internal-distribution/), [Apple free-account limits](https://developer.apple.com/help/account/basics/about-your-developer-account), and [TestFlight](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/).

## 1. Prepare the source and identifiers

Use Git, npm, and Node.js 22.13+ within 22.x or 24.3+ within 24.x. For a new checkout:

```bash
git clone https://github.com/JustinBSG/MJLum.git
cd MJLum/app
npm ci
```

For an existing checkout, update `main` before entering `app` and installing dependencies. All build commands below run from **`app`**, where `package.json` is located. Windows users use PowerShell; Mac users use Terminal.

The current `main` branch already sets both identifiers to `com.justinbsg.mjlum` in `app/app.json`. Verify that this identifier is available to your signing account. For an older checkout or a separately owned fork, these fields belong inside the existing platform objects:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.justinbsg.mjlum"
    },
    "android": {
      "package": "com.justinbsg.mjlum"
    }
  }
}
```

**This shows field locations, not a replacement for the whole file.** Keep the icons, localization, plugins, version, build numbers, and `extra` settings. If EAS has added `extra.eas.projectId`, retain it and use the Expo account that owns or can access that project. Do not copy another project's ID.

The repository is already linked to an Expo project through `extra.eas.projectId`. For this project, sign in with an account that has access. For a separately owned fork, link your own project through EAS configuration instead of reusing that project ID. Keep identifiers stable so later builds update the same app. See [Expo app configuration](https://docs.expo.dev/versions/v58.0.0/config/app/).

## 2. EAS setup for APK and Ad Hoc builds

Skip this section for the free Mac/Xcode iPhone method in section 4.

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

Follow the prompts to verify the linked Expo project. Cloud compilation uploads source code; it does not add cloud synchronization to the app's session data.

The repository already includes **`app/eas.json`** with the profiles below. Verify these settings before building; for an older checkout, create the file or merge the profiles while preserving project-specific options:

```json
{
  "cli": {
    "appVersionSource": "local"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "developmentClient": false,
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {}
  }
}
```

Here, `preview` produces an internal build containing the app code. `developmentClient: false` avoids a development-client build that expects Metro. Version values come from local configuration. EAS is available to Expo Free-plan accounts within current service limits; check your account's quota before building.

Sources: [EAS setup](https://docs.expo.dev/build/setup/) and [internal distribution](https://docs.expo.dev/build/internal-distribution/).

## 3. Android: build and install an APK

After sections 1 and 2:

```bash
npx eas-cli@latest build --platform android --profile preview
```

For signing, let EAS generate a keystore or supply the existing key for the app. Retain access to that key for updates.

When the build succeeds:

1. Open the build page or installation URL printed by EAS.
2. Download the `.apk` onto the phone, or transfer it over USB.
3. Open it and follow Android's installation prompts. If requested, allow installation from the browser or file manager being used.
4. Launch **麻雀諗** from the home screen.
5. Complete the standalone verification in section 7.

Direct installation requires an **APK**. A Play Store **AAB** cannot be installed this way. Google Play membership is required for Play Store distribution, not for this direct APK workflow. See [Expo's APK installation guide](https://docs.expo.dev/build-reference/apk/).

## 4. iPhone: free installation with Mac and Xcode

### Requirements

- A Mac with compatible macOS and full Xcode, including support for the connected iPhone's OS.
- CocoaPods for the generated iOS project; follow [Expo's local iOS environment setup](https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=physical&mode=development-build&buildEnv=local).
- A free Apple Account signed in under **Xcode → Settings → Accounts**.
- An iPhone and USB cable.

This method does not require EAS or paid Apple Developer membership. Windows cannot run the Xcode workflow locally.

### Finish Xcode setup

Open Xcode and complete its first-launch licence and component-installation prompts. In Mac Terminal:

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
xcode-select -p
xcodebuild -version
```

The directory is **`/Applications`**, with an **s**. Adjust the path if Xcode has a different name or location. A successful `xcode-select --switch` may print nothing; `sudo` password entry also shows no characters.

Verify that `xcode-select -p` shows the full Xcode developer directory and that `xcodebuild -version` prints a version and build number. See [Apple's component setup](https://developer.apple.com/documentation/xcode/downloading-and-installing-additional-xcode-components).

### Generate the project and configure signing

After section 1, run from `app`:

```bash
npx expo prebuild --platform ios
open ios/*.xcworkspace
```

In Xcode, select the main app project and its app target under **Targets**. In **Signing & Capabilities**, enable **Automatically manage signing** and choose your account's **Personal Team**. Confirm the bundle identifier matches `app.json`. Select the app target, not the Pods project.

Native directories are generated from configuration and plugins. Do not hand-create them. Regenerating with `prebuild --clean` can remove local Xcode signing changes, so configure signing again if necessary. See [Expo signing setup](https://expo.fyi/setup-xcode-signing).

### Pair the phone and enable Developer Mode

1. Connect and unlock the iPhone; accept **Trust This Computer** if prompted.
2. On the phone, open **Settings → Privacy & Security → Developer Mode** and enable it.
3. Tap **Restart**. After reboot, unlock the phone, confirm **Enable / Turn On**, and enter the passcode.
4. If Developer Mode is missing, initiate pairing in Xcode first. Follow any developer-certificate trust prompt on the phone.

The post-restart confirmation is required. See [Apple's Developer Mode instructions](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device).

### Install a Release build

From `app`:

```bash
npx expo run:ios --device --configuration Release
```

Choose the connected physical iPhone. `Release` embeds JavaScript and assets for operation without Metro. Xcode still signs it for your personal device; this is not an App Store distribution build. See [Expo's device and Release build options](https://docs.expo.dev/more/expo-cli/#compiling-ios).

### Renew free signing

Personal Team provisioning lasts **7 days**, with up to **3 installed apps per device**. After expiry, reconnect and repeat the Release build command with the same account and bundle identifier. Update the existing installation rather than deleting it to preserve local records where supported. See [Apple's free-account limits](https://developer.apple.com/help/account/basics/about-your-developer-account).

## 5. iPhone: Ad Hoc through EAS

This method requires a **paid Apple Developer membership** and registered iPhones. EAS compilation can be started from Windows without a local Mac.

After sections 1 and 2, register the target phone:

```bash
npx eas-cli@latest device:create
```

Open the registration link on the iPhone and complete UDID enrollment. Then build:

```bash
npx eas-cli@latest build --platform ios --profile preview
```

Complete the Apple signing prompts, include the registered phone in the provisioning profile, and install using the completed build's link. Adding a phone requires a new build or re-signing with its UDID included. Ad Hoc signing expires; this is not a permanent unrestricted installation.

Apple may require online signing verification, including first launch for affected teams. Complete verification before offline testing. See [Expo Ad Hoc distribution](https://docs.expo.dev/build/internal-distribution/) and [Apple provisioning verification](https://developer.apple.com/help/account/provisioning-profiles/provisioning-profile-updates).

## 6. Optional: TestFlight and app stores

TestFlight uses a paid developer account and App Store Connect, and avoids per-phone UDID registration. Create the matching app record in App Store Connect, then build and submit:

```bash
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --latest
```

Confirm the selected build and complete compliance and test information. Invite testers through TestFlight; external testing may require review. Each beta build is available for up to **90 days**. See [Apple's TestFlight workflow](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/).

Public store distribution also requires the store's account, signing, submission, and review process. Pushing `main` or building an installer does not publish it. See [Expo store builds](https://docs.expo.dev/deploy/build-project/).

## 7. Verify standalone operation and updates

1. Open the installed **麻雀諗** app from the home screen.
2. Stop Metro on the computer and disconnect USB.
3. Create a test session, record a hand, and inspect scores and history.
4. Fully close and reopen the app; confirm the test session persists.
5. After required Apple verification, disconnect Wi-Fi/mobile data and record another hand. The scorekeeper should continue working without the development computer.
6. Check the native icon, loading screen, and dice animation on the physical device.

This is a manual checklist, not a claim that every signing and installation method was executed by the documentation author. Actual validation needs the device, signing account, and installer.

Expo Go, web preview, and standalone installations use separate storage environments. Records do not automatically transfer between them. Uninstalling the app or clearing its data can erase sessions. Preserve the application identifier and signing identity when updating.

For later builds, keep `expo.version`, `ios.buildNumber`, `android.versionCode`, `extra.release`, and release notes consistent. Store uploads generally require a new platform build number. Keep the historical `v1.0.0` tag unchanged.

## 8. Troubleshooting

| Symptom | Action |
|---|---|
| Xcode must be fully installed | Open full Xcode, finish setup, select its developer directory, and check `xcodebuild -version` |
| npm reports unknown Expo flags | Run the commands directly with `npx expo`, rather than forwarding flags through `npm start` |
| Invalid directory `/Application/…` | Use `/Applications/Xcode.app/Contents/Developer`, with an **s** |
| No output after `xcode-select --switch` | Verify success using `xcode-select -p` |
| Password typing appears blank | Normal for `sudo`; enter the Mac password and press Return |
| Error 70 / timeout with `Developer Mode disabled` | Enable it on the iPhone, restart, and confirm activation after reboot |
| A different error 70 | Read the specific destination reason; the number alone is not a diagnosis |
| Missing signing team/certificate | Sign in to Xcode Accounts and choose Personal Team on the app target |
| Phone absent/unavailable | Unlock it, reconnect USB, trust the computer, and check pairing and OS support in Xcode |
| CocoaPods failure | Resolve the specific tool/pod error from prebuild using the local iOS setup guide |
| App requests a development server | Rebuild with iOS `--configuration Release` or the non-development EAS `preview` profile |
| Android artifact is `.aab` | Rebuild using the APK profile |
| Ad Hoc app will not install on another phone | Confirm its UDID is included in that build's profile |
| Free iPhone installation stops after a week | Rebuild and reinstall to renew Personal Team signing |
| Standalone app shows an old interface | Verify the checkout/commit, then rebuild and reinstall; clearing Metro cache alone does not replace an installed release |

For iOS failures, collect the complete destination/signing message, `xcode-select -p`, and `xcodebuild -version`. Expo writes build details to `app/.expo/xcodebuild.log`. Omit credentials and private signing keys from shared diagnostics.
