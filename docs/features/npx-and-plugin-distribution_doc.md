# npx and Claude Code Plugin Distribution

Plan: docs/plans/implementation_plan_npx-and-plugin-distribution_1.md

## What the feature does

Adds two install channels to the existing `install.sh`:

- `npx tpm_os [options] [target-dir]`: identical to running `install.sh`, files land in the repository.
- The `tpm-os` Claude Code plugin: `/plugin marketplace add amansharma2910/tpm_s-kill_bot`, `/plugin install tpm-os@tpm-os`, restart, then `/tpm-os:setup` once per repository. Nothing but `docs/` lands in the repository; the router arrives through a SessionStart hook.

## Implementation detail

- Single source. The repository root is the plugin, and `plugin.json` points at the live `.claude/` files, so no skill, agent, or command exists twice. The npm package ships `install.sh` itself.
- Router delivery. Plugins cannot load a `CLAUDE.md`, so the hook runs `install.sh --emit-router "$CLAUDE_PROJECT_DIR"`. It renders the CLAUDE.md template with the repository's derived name and prints it after a short preamble that maps bare names to their `tpm-os:` namespaced forms. SessionStart stdout becomes session context. No matcher, so it also re-fires after `/clear` and compaction.
- Duplicate guard. `--emit-router` prints nothing if the repository's `CLAUDE.md` already contains "Senior Technical PM Operating System" (an npx or curl install).
- Failure safety. Every `--emit-router` error path exits 0 with no output; an underivable name falls back to `project`.
- Docs seeding. `--docs-only` renders and verifies the full tree, then reconciles only `docs/*` under the normal never-overwrite policy.
- Name-agnostic documentation-mode. It now writes to the path the router's ownership table lists, instead of a rendered `docs/<name>/` path, because plugin skills are not rendered per repository.

## Key files and entry points

- `.claude-plugin/plugin.json`: component paths and the SessionStart hook.
- `.claude-plugin/marketplace.json`: one-plugin marketplace, `source: "."`.
- `plugin/commands/setup.md`: `/tpm-os:setup`.
- `install.sh`: `emit_router`, `emit_preamble`, the `DOCS_ONLY` manifest filter in `main`, and the version and router-size checks in `self_test`.
- `bin/cli.js`, `package.json`: npm entry point.

## Interfaces and contracts

- Exit codes through npx: 0 success, 1 usage or verification failure, 2 conflicts not forced. Missing bash exits 1 with a message.
- Versions: `TPM_SUITE_VERSION`, `package.json`, and `.claude-plugin/plugin.json` must match; the self-test fails otherwise. Plugin users only receive updates when the version changes.
- Router budget: preamble plus router must stay at or under 9500 characters (Claude Code's hook context cap is 10000). Currently 7802.
- Namespacing under the plugin: `/tpm-os:<command>`, `tpm-os:<skill>`, `tpm-os:<agent>`.

## Pointers for developers

- Local plugin test: `claude --plugin-dir <this repo>` from a scratch repository.
- Validation: `claude plugin validate .` (one expected warning about the root `CLAUDE.md`), `npm pack --dry-run`, `./install.sh --self-test`.
- The self-test's tree check ignores extra live files under `docs/` (this repo's own plans and records) but fails on extra config files and missing seeds.
