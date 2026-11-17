# Changelog

All notable changes to this project are documented in this file.

The format follows Keep a Changelog (https://keepachangelog.com/en/1.1.0/). Entries use the categories Added, Changed, Fixed, and Removed.

## [Unreleased]

## [0.4.0] - 2026-11-17

### Added

- `/tpm-os:setup` now offers to write the tpm-os instructions into the repository's `CLAUDE.md`, and writes nothing until you approve. No `CLAUDE.md` yet: it creates one from the same template npx installs. One already there: the instructions are appended below your own content, after you see which sections are added and where your instructions conflict with a tpm-os default, with the original backed up to `CLAUDE.md.bak-<date>`. One already carrying the router: nothing happens.
- `/tpm-os:setup-claude-md`: the same question on its own, for repositories whose `docs/` skeleton is already seeded.
- Installer flag `--print-claude-md`: prints the `CLAUDE.md` a plugin-installed project should carry (the router plus a `## Plugin component names` section) to stdout and writes nothing. The extra section exists because the SessionStart hook goes silent once a `CLAUDE.md` holds the router, taking its namespacing preamble with it.
- Self-test check on the printed `CLAUDE.md`: the router marker the hook greps for, the naming section, no unsubstituted tokens, no em dashes.

### Changed

- `plugin/commands/setup-claude-md.md` is the single definition of the CLAUDE.md flow; `plugin/commands/setup.md` reads it rather than restating it, so the two entry points cannot drift.

## [0.3.0] - 2026-10-19

### Changed

- Renamed the project to `tpm-os` throughout: the npm package (`npx tpm-os`, previously `npx tpm_os`), the repository (`amansharma2910/tpm-os`, previously `amansharma2910/tpm_s-kill_bot`), the curl one-liner URL, this repository's docs directory (`docs/tpm-os/`), and the router title. The plugin name, the marketplace name, and the `/tpm-os:` command namespace were already `tpm-os` and are unchanged, so plugin users see no change in how they invoke anything.
- The `tpm_os` npm package is removed from the registry in favor of `tpm-os`. It was published on 2026-10-18 and unpublished inside npm's 72 hour window, so the old name no longer resolves at all rather than resolving to a stale copy.
- The self-test's documentation exclusion now derives from the pinned project name instead of a hardcoded path, so a future rename cannot silently downgrade that check to a warning.

## [0.2.0] - 2026-10-18

### Added

- `npx tpm-os`: npm package that runs the bundled installer with all options and exit codes passed through.
- `tpm-os` Claude Code plugin: `/plugin marketplace add amansharma2910/tpm-os`, then `/plugin install tpm-os@tpm-os`. The router is injected by a SessionStart hook, and `/tpm-os:setup` seeds the docs skeleton.
- Installer flags `--docs-only` and `--emit-router`.
- Self-test checks: version agreement across install.sh, package.json, and plugin.json, and a 9500 character budget for the injected router.
- MIT LICENSE file.

### Changed

- documentation-mode now writes to the path listed in the router's file ownership table instead of a hardcoded `docs/<name>/` path.
- The self-test's file tree check ignores extra project state under `docs/` and still fails on extra config files or missing seeds.
- README covers all three install methods, plugin scope, and the release process.
