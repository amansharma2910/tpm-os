---
type: release_checklist
feature: npx-and-plugin-distribution
status: ready
linear_issue: null
created: 2026-10-18
updated: 2026-10-18
---

# Release Checklist: npx-and-plugin-distribution (v0.2.0)

## Readiness

- [x] `./install.sh --self-test` passes (router 7802 of 9500 characters)
- [x] `claude plugin validate .` passes (expected warning: root CLAUDE.md is not loaded by plugins)
- [x] `npm pack --dry-run`: 5 files (LICENSE, README.md, bin/cli.js, install.sh, package.json)
- [x] Prototype verification recorded in the plan, Success Criteria 1 to 6
- [ ] Gap: no QA section in the plan (qa-mode skipped; prototype tests stood in)
- [ ] Gap: no tracking plan (no install metrics defined)

## Rollout

No feature flag: distribution channels are all-or-nothing per version.

1. User commits, tags `v0.2.0`, pushes `main` and the tag (the marketplace reads the repository).
2. `npm publish` (needs a one-time code if the account has 2FA).
3. Post-publish checks in a scratch repository: `npx tpm_os --dry-run` from the registry; `/plugin marketplace add amansharma2910/tpm_s-kill_bot`, `/plugin install tpm-os@tpm-os`, restart, confirm the router and `/tpm-os:setup`.

## Rollback

- npm: within 72 hours `npm unpublish tpm_os@0.2.0`; after that, `npm deprecate tpm_os@0.2.0 "<reason>"` and publish 0.2.1 with the fix.
- Plugin: revert on `main` and bump to 0.2.1; plugin users receive it on update. Users can also `/plugin uninstall tpm-os@tpm-os`.
- curl and clone installs are unaffected; no data migrations exist, and the installer never overwrites docs state.

## Release Notes

Internal: 0.2.0 adds npm and plugin channels over the same install.sh source. The plugin reuses `.claude/` in place and injects the router through a SessionStart hook. The self-test now also enforces version agreement and the router size budget, and tolerates this repository's own docs state.

User-facing: Install the TPM Operating System with `npx tpm_os`, or as a Claude Code plugin: `/plugin marketplace add amansharma2910/tpm_s-kill_bot`, then `/plugin install tpm-os@tpm-os` and `/tpm-os:setup`. Plugin commands are namespaced, for example `/tpm-os:interview`.
