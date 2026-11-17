---
type: release_checklist
feature: claude-md-setup
status: ready
linear_issue: null
created: 2026-11-17
updated: 2026-11-17
---

# Release Checklist: claude-md-setup (v0.4.0)

## Readiness

- [x] `./install.sh --self-test` passes, including the three-way version check at 0.4.0 and the new printed-CLAUDE.md check (router 7786 of 9500 characters)
- [x] `claude plugin validate .claude-plugin/plugin.json` passes (expected warning: root CLAUDE.md is not loaded by plugins)
- [x] `claude plugin validate plugin/commands` passes, both command files
- [x] `npm pack --dry-run`: 5 files (LICENSE, README.md, bin/cli.js, install.sh, package.json), 24.4 kB
- [x] Create path verified in a scratch repository: `--docs-only`, then `--print-claude-md . > CLAUDE.md`, then `--emit-router .` prints nothing
- [x] Merge path verified in a scratch repository: a foreign `CLAUDE.md` leaves `--emit-router` printing the full router, and the appended result silences it
- [x] Derived-name note goes to stderr, so a directory name needing sanitizing cannot leak into the written file
- [ ] Gap: no plan (the work was requested directly and is recorded as unplanned in docs/roadmap.md)
- [ ] Gap: no QA section and no acceptance criteria (the verifications above stood in)
- [ ] Gap: no tracking plan, so no `review_due` and no post-launch metrics verdict

## Rollout

No feature flag: distribution channels are all-or-nothing per version, and the unit of rollout is the version number itself. Plugin caches are keyed by version, so 0.4.0 in all three manifests is what makes existing users receive anything.

1. Commit the bump and push `main`, then tag `v0.4.0`. The marketplace manifest and the curl one-liner are read straight from `main`.
2. `npm publish` (needs a one-time code if the account has 2FA).
3. Post-publish checks in a scratch repository: `npx tpm-os@latest --dry-run` from the registry; `/plugin marketplace add amansharma2910/tpm-os`, `/plugin install tpm-os@tpm-os`, restart, then `/tpm-os:setup` and `/tpm-os:setup-claude-md`, confirming the question appears and that declining writes nothing.

## Rollback

- npm: within 72 hours `npm unpublish tpm-os@0.4.0`; after that, `npm deprecate tpm-os@0.4.0 "<reason>"` and publish 0.4.1 with the fix.
- Plugin: revert on `main` and bump to 0.4.1; plugin users receive it on update.
- Existing installs are unaffected. This release adds a command and a flag; it changes no file the installer already wrote, and `--docs-only` keeps its never-overwrite policy.
- Repositories that accepted a `CLAUDE.md` during this release keep it after a rollback. It is a plain file under their version control, and its `CLAUDE.md.bak-<date>` sibling holds the pre-merge original.
- Point of no return: none. No data migrations exist.

## Release Notes

Internal: 0.4.0 turns the plugin's router delivery into a choice. `--print-claude-md` renders the same template the SessionStart hook injects, plus a naming section that replaces the hook preamble once the file exists, and the setup commands decide where it lands after asking. The flow is defined once, in `plugin/commands/setup-claude-md.md`, and `setup.md` reads it. The marker contract is the part to protect in future edits: a written `CLAUDE.md` that does not contain "Senior Technical PM Operating System" leaves the hook injecting a second routing table every session.

User-facing: Run `/tpm-os:setup` in a repository and it now asks whether to write the tpm-os instructions into your `CLAUDE.md`, instead of rebuilding them from a hook every session. An empty repository gets a new file; a repository that already has a `CLAUDE.md` gets the instructions merged below its own content, after you see what changes and where the two disagree, with a dated backup. Nothing is written until you approve, and declining keeps the previous behavior. Run `/tpm-os:setup-claude-md` to answer later.
