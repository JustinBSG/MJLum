# MJLum documentation

The current release is **Version 1 · Release 1 (1.0.0 / Build 1)**. UAT was accepted on 17 November 2026 (Hong Kong time). The source branch is `main`; release tag `v1.0.0` points to `e50f8ec`.

MJLum (麻雀諗) is a scorekeeper for in-person Hong Kong Mahjong. The third character of its Chinese name is 諗 (U+8AD7). Players use physical tiles; the app records their results.

| Document | Purpose |
|---|---|
| [releases/v1.0.0.md](releases/v1.0.0.md) | First-release scope, provenance, versions, and validation record |
| [deployment.md](deployment.md) | Android APKs, free iPhone installation and renewal, EAS/TestFlight, offline checks, and troubleshooting |
| [guide.md](guide.md) | Scoring, session behavior, and product decisions, with reference evidence distinguished from inference |
| [product.md](product.md) | Entry point to product rules |
| [features.md](features.md) | Implemented features and interface interactions |
| [development.md](development.md) | Development background and second-release TV display planning |
| [../app/README.md](../app/README.md) | Environment setup, Expo Go, validation, and asset-generation commands |
| [../design-system/mjlum/MASTER.md](../design-system/mjlum/MASTER.md) | Adopted design system |
| [../design-system/mjlum/IMPLEMENTATION.md](../design-system/mjlum/IMPLEMENTATION.md) | Screen mapping and shared components |
| [ui-ux-pro-max-skill.md](ui-ux-pro-max-skill.md) | Design-skill installation and usage background |

## Documentation language

Write documentation headings, explanations, and instructions in English. Keep the app's Chinese name, exact interface labels, preset names, and reference quotations when needed to identify them accurately, and provide an English explanation. The app interface remains Traditional Chinese (Hong Kong).

## Scope and evidence

The first release supports Hong Kong Mahjong on one device, with local data, no accounts, no ads, and no cloud synchronization or data sharing. Wireless TV score display is planned for the second release. Taiwanese Mahjong, Japanese Mahjong, Pong/Kong (horse-racing) variants, and Hong Kong-style Taiwanese Mahjong are deferred until later.

The guide distinguishes **MJLum product decisions**, **reference-demonstrated behavior**, and **unspecified behavior**. A release designation does not turn a proposed formula into reference evidence. Unsupported scoring combinations remain blocked in the implementation.

## Promoting documentation from UAT to main

Documentation corrections and translations belong on `main` so users see them in the default branch. Commit and validate them on `uat`, review the differences, then promote the documentation commit to `main` and push both branches. If UAT also contains unreleased application changes, promote only the relevant documentation commits or files instead of merging unrelated work.

Keep published release tags at their designated commits. Documentation updates after `e50f8ec` appear on the branch tips; they do not move `v1.0.0` or change the app version.
