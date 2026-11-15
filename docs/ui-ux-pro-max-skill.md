# UI/UX Pro Max skill — command-line setup

This page is a short command-line introduction for the later UI/UX skill. On this `uat` branch the skill is already present (`.cursor/skills/`, and a generated [`design-system/default/MASTER.md`](../design-system/default/MASTER.md)). This page remains the setup reference; it does not tell a coder to run the installer or a design-system generator again now, or to design the UI now.

Visual UI/UX for 麻雀諗 is still designed later, as stated in [`docs/guide.md`](guide.md). The assistant already named for that later work is [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill). Do not clone that GitHub repository into MJLum. The official installer is the npm package [`ui-ux-pro-max-cli`](https://www.npmjs.com/package/ui-ux-pro-max-cli) (command `uipro`). Do not use the older `uipro-cli` package; its latest release is stale.

Versions below were re-checked on 14 November 2026 (Asia/Hong Kong). npm `ui-ux-pro-max-cli` latest was `2.15.0`, published 14 August 2026, 01:10 HKT. The npm `license` field and the upstream GitHub README say MIT. The npm package README footer says CC-BY-NC-4.0. This page follows the license field and the GitHub README and does not treat the footer as definitive.

## Prerequisites

- Node.js and npm.
- Python 3, which the official README requires for the skill’s search script (standard library only). Check with:

```bash
python3 --version
```

On Windows, if `python3` is not on `PATH`, try `python --version` or `py -3`. If Python is missing, install it from [python.org](https://www.python.org/downloads/) or with the OS package manager (for example `winget`, Homebrew, or apt). The official README asks a human to do that install; it tells AI agents not to install Python on the machine.

## Install from the MJLum checkout

Justin’s Windows checkout is `F:\OneDrive\Documents\side_project\MJLum`. In a Unix shell, `cd` to the same project root instead.

```bash
npm install -g ui-ux-pro-max-cli
cd F:\OneDrive\Documents\side_project\MJLum
uipro init --ai cursor --dry-run
uipro init --ai cursor
```

`--dry-run` only previews the install actions and does not write files. Skip that command to install immediately.

For Cursor, that writes the skill into `.cursor/skills/ui-ux-pro-max`. Those files are what you commit if you want the skill in the repo.

If a global npm install hits a permission error, use the official `npx` fallback from the same project folder instead of installing the CLI globally:

```bash
cd F:\OneDrive\Documents\side_project\MJLum
npx ui-ux-pro-max-cli init --ai cursor
```

A `--global` Cursor install goes to `~/.cursor/skills/` on the machine and is not part of the repo:

```bash
uipro init --ai cursor --global
```

## Other official CLI notes

The official README lists many `--ai` targets (`claude`, `cursor`, `windsurf`, `copilot`, `all`, and others). For this project, use `--ai cursor` unless you intentionally install for a different assistant.

Other official flags and commands, without inventing behaviour:

- `--force` — overwrite existing files (npm package README).
- `--offline` — official compatibility flag; installs bundled templates.
- `uipro versions` — list available versions.
- `uipro uninstall` / `uipro uninstall --ai cursor` / `uipro uninstall --global` — remove a project or global install.
- `uipro update` / `uipro update --global` — official update commands. The GitHub README and the npm package README describe `uipro update` slightly differently; see the sources note below rather than treating one wording as definitive.

The official README also documents optional GitHub authentication flags and environment variables (`--token`, `UI_PRO_MAX_GITHUB_TOKEN`, or `GITHUB_TOKEN`) if unauthenticated GitHub API rate limits are hit. This setup introduction does not require those flags.

The skill is already present in this checkout. product.md already says to use it later to assist UI/UX generation. This page does not tell you to re-run the installer or a design-system generator now, or to design the UI now.

## Official sources

- [UI UX Pro Max GitHub repository](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- [ui-ux-pro-max-cli on npm](https://www.npmjs.com/package/ui-ux-pro-max-cli)
