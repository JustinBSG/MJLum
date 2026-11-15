# 麻雀諗 documentation

The GitHub repository for this app is [MJLum](https://github.com/JustinBSG/MJLum).

麻雀諗 is a table scorekeeper for in-person Hong Kong Mahjong. It is not a tile game. These documents are the product and behaviour source a coder should use to start work. Visual UI/UX is to be designed later and is not specified here. The recorded development approach — Expo / React Native, the second-release wireless second-screen plan, suggested libraries, and open technical decisions — is in [`docs/development.md`](development.md). A build-order feature roadmap is in [`docs/roadmap.md`](roadmap.md).

The app name is only 麻雀諗 (the third character is U+8AD7). Use that spelling in the product, in code comments that name the app, and in further documentation.

## How facts are labelled

Every behavioural fact in these documents is one of the following:

- **麻雀諗 product decision:** a rule decided for 麻雀諗. It is not established as a fact of the local reference, even when it was inspired by something the reference showed.
- **Taken from the local reference** (also called **reference-demonstrated**): behaviour established by the local reference. The first release must provide the same point-counter / table scorekeeper functionality. Do not copy the reference UI.
- **Unspecified:** not demonstrated in the reference and not decided for 麻雀諗. Do not invent a formula, table, or flow to fill the gap. Leave it marked unspecified until it is decided or demonstrated.

Ads that appear in the local reference are the reference app’s ads. They are not 麻雀諗 features. 麻雀諗 has no ads.

## Document map

| File | What it is for |
|---|---|
| [product.md](product.md) | Short product-direction summary: platforms, scope, pricing, language, storage, display, and the already-decided product rules. |
| [features.md](features.md) | Inventory of first-release point-counter / table scorekeeper features (same functionality as the local reference, plus already-decided 麻雀諗 product rules that are not about external display / wireless TV) and what is reserved for a second release, including wireless connection to a smart TV. |
| [roadmap.md](roadmap.md) | Build-order feature roadmap for the already-recorded work: first-release point-counter slices, later UI/UX, and second-release wireless TV. It does not add product decisions. |
| [guide.md](guide.md) | Scoring, session, settings, statistics, and exact demonstrated numbers. This is the rules source. |
| [controls.md](controls.md) | What each demonstrated control does. Control names are from the reference, recorded as behaviour, not as a UI to copy. |
| [flows.md](flows.md) | Handover scenes: end-to-end flows a coder can implement and check against, with the demonstrated numbers to expect. |
| [development.md](development.md) | Tech and development: the Expo approach, the second-release wireless second-screen plan, suggested libraries, and open technical decisions. |
| [ui-ux-pro-max-skill.md](ui-ux-pro-max-skill.md) | Command-line setup reference for the later UI/UX skill. The skill is now present on this branch; this page does not itself reinstall it or generate a design system. |

Read `product.md` and `features.md` first for scope, then `guide.md` for rules, then `controls.md` and `flows.md` for the work sequences. See `roadmap.md` for the build-order feature roadmap, `development.md` for the tech plan, and `ui-ux-pro-max-skill.md` for later skill setup.

## What is deliberately not in these documents

- Screen layout, wireframes, visual style, or a component library. All UI/UX should be designed later by AI, following these documents, using https://github.com/nextlevelbuilder/ui-ux-pro-max-skill to assist generation. Setup for that skill is in [`docs/ui-ux-pro-max-skill.md`](ui-ux-pro-max-skill.md).
- Invented score tables, including any exact progression for 番 above 13, and fans outside the ranges recorded in `guide.md`.
