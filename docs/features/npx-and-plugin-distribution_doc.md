# npx and Claude Code Plugin Distribution

Plan: docs/plans/implementation_plan_npx-and-plugin-distribution_1.md

## What the feature does

Adds two install channels to the existing `install.sh`:

- `npx tpm-os [options] [target-dir]`: identical to running `install.sh`, files land in the repository.
- The `tpm-os` Claude Code plugin: `/plugin marketplace add amansharma2910/tpm-os`, `/plugin install tpm-os@tpm-os`, restart, then `/tpm-os:setup` once per repository. `docs/` lands in the repository, and `/tpm-os:setup` then asks whether the router should land there too as a `CLAUDE.md`. Decline and the router keeps arriving through the SessionStart hook.

## Implementation detail

- Single source. The repository root is the plugin, and `plugin.json` points at the live `.claude/` files, so no skill, agent, or command exists twice. The npm package ships `install.sh` itself.
- Router delivery. Plugins cannot load a `CLAUDE.md`, so the hook runs `install.sh --emit-router "$CLAUDE_PROJECT_DIR"`. It renders the CLAUDE.md template with the repository's derived name and prints it after a short preamble that maps bare names to their `tpm-os:` namespaced forms. SessionStart stdout becomes session context. No matcher, so it also re-fires after `/clear` and compaction.
- Duplicate guard. `--emit-router` prints nothing if the repository's `CLAUDE.md` already contains "Senior Technical PM Operating System" (an npx or curl install).
- Failure safety. Every `--emit-router` error path exits 0 with no output; an underivable name falls back to `project`.
- Docs seeding. `--docs-only` renders and verifies the full tree, then reconciles only `docs/*` under the normal never-overwrite policy.
- CLAUDE.md offer. `--print-claude-md` prints the rendered router plus a `## Plugin component names` section to stdout and writes nothing; the command decides where it lands. The extra section exists because the hook goes silent once a `CLAUDE.md` holds the router, taking its namespacing preamble with it. `resolve_target_and_name` runs with stdout on stderr so a derived-name note can never land inside the file.
- Three detection states. No `CLAUDE.md` (create from the printed output through a temp file, never a bare redirect), one carrying the marker (report and stop), one of the project's own (append the printed output below the existing content after a `---` rule, backing the original up to `CLAUDE.md.bak-<date>`). Nothing is written without approval, and every contradiction between an existing instruction and a tpm-os default is surfaced rather than resolved silently.
- Marker contract. The written file must contain the literal string "Senior Technical PM Operating System"; the command greps for it after writing. Without it the hook re-injects the full router every session and the repository carries two routing tables.
- Command split. `plugin/commands/setup-claude-md.md` holds the flow and backs `/tpm-os:setup-claude-md` for repositories whose docs are already seeded. `plugin/commands/setup.md` reads it rather than restating it, so the two entry points cannot drift.
- Name-agnostic documentation-mode. It now writes to the path the router's ownership table lists, instead of a rendered `docs/<name>/` path, because plugin skills are not rendered per repository.

## Key files and entry points

- `.claude-plugin/plugin.json`: component paths and the SessionStart hook.
- `.claude-plugin/marketplace.json`: one-plugin marketplace, `source: "."`.
- `plugin/commands/setup.md`: `/tpm-os:setup`.
- `plugin/commands/setup-claude-md.md`: `/tpm-os:setup-claude-md`, and the single definition of the CLAUDE.md flow.
- `install.sh`: `emit_router`, `emit_preamble`, `print_claude_md`, `emit_plugin_note`, the `DOCS_ONLY` manifest filter in `main`, and the version, router-size, and printed-CLAUDE.md checks in `self_test`.
- `bin/cli.js`, `package.json`: npm entry point.

## Interfaces and contracts

- Exit codes through npx: 0 success, 1 usage or verification failure, 2 conflicts not forced. Missing bash exits 1 with a message.
- Versions: `TPM_SUITE_VERSION`, `package.json`, and `.claude-plugin/plugin.json` must match; the self-test fails otherwise. Plugin users only receive updates when the version changes.
- Router budget: preamble plus router must stay at or under 9500 characters (Claude Code's hook context cap is 10000). Currently 7786.
- Namespacing under the plugin: `/tpm-os:<command>`, `tpm-os:<skill>`, `tpm-os:<agent>`. A repository that keeps its own `CLAUDE.md` carries the same mapping in its `## Plugin component names` section, because the hook preamble no longer runs there.
- `--print-claude-md` writes nothing and exits 0; all other output goes to stderr, so the caller can redirect stdout straight into a file.

## Pointers for developers

- Local plugin test: `claude --plugin-dir <this repo>` from a scratch repository.
- Validation: `claude plugin validate .` (one expected warning about the root `CLAUDE.md`), `npm pack --dry-run`, `./install.sh --self-test`.
- Setup flow check, from a scratch repository: `--docs-only`, then `--print-claude-md . > CLAUDE.md`, then `--emit-router .` must print nothing. With a foreign `CLAUDE.md` in place, `--emit-router` must still print the full router.
- The self-test's tree check ignores extra live files under `docs/` (this repo's own plans and records) but fails on extra config files and missing seeds.
