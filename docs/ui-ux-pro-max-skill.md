# UI/UX Pro Max skill — command-line setup

This page retains the command-line setup reference for the UI/UX skill. The repository already includes the skill under `.cursor/skills/` and `.agents/skills/`, plus a generated [`design-system/default/MASTER.md`](../design-system/default/MASTER.md). Reinstallation or regeneration is not required to use the existing files.

Version 1 / Release 1 UI design is implemented; the adopted specification is [the MJLum design system](../design-system/mjlum/MASTER.md). [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) was selected to assist design work. The historical setup used the npm package [`ui-ux-pro-max-cli`](https://www.npmjs.com/package/ui-ux-pro-max-cli) (command `uipro`), rather than cloning the upstream repository or using the older `uipro-cli` package.

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

The skill is already present. Current product behavior follows [guide.md](guide.md), and the adopted interface follows [the MJLum design system](../design-system/mjlum/MASTER.md). The commands above are installation background, not a requirement to regenerate the completed interface.

## Official sources

- [UI UX Pro Max GitHub repository](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- [ui-ux-pro-max-cli on npm](https://www.npmjs.com/package/ui-ux-pro-max-cli)
