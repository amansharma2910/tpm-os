---
type: release_checklist
feature: npx-and-plugin-distribution
status: ready
linear_issue: null
created: 2026-10-18
updated: 2026-10-19
---

# Release Checklist: npx-and-plugin-distribution (v0.2.0, superseded by v0.3.0 after the rename)

## Readiness

- [x] `./install.sh --self-test` passes (router 7786 of 9500 characters)
- [x] `claude plugin validate .` passes (expected warning: root CLAUDE.md is not loaded by plugins)
- [x] `npm pack --dry-run`: 5 files (LICENSE, README.md, bin/cli.js, install.sh, package.json)
- [x] Prototype verification recorded in the plan, Success Criteria 1 to 6
- [ ] Gap: no QA section in the plan (qa-mode skipped; prototype tests stood in)
- [ ] Gap: no tracking plan (no install metrics defined)

## Rollout

No feature flag: distribution channels are all-or-nothing per version.

1. User commits, tags `v0.3.0`, pushes `main` and the tag (the marketplace reads the repository). The rename raised the version from 0.2.0; see the Rename migration section below.
2. `npm publish` (needs a one-time code if the account has 2FA).
3. Post-publish checks in a scratch repository: `npx tpm-os --dry-run` from the registry; `/plugin marketplace add amansharma2910/tpm-os`, `/plugin install tpm-os@tpm-os`, restart, confirm the router and `/tpm-os:setup`.

## Rename migration (tpm_os to tpm-os)

`tpm_os@0.2.0` was published to npm on 2026-10-18, so the rename needs these steps in order. The renamed artifacts carry 0.3.0, so version numbers never go backwards across the rename and plugin users, whose caches are keyed by version, actually receive the update:

1. Rename the GitHub repository to `tpm-os`. Done 2026-10-20. GitHub redirects the old path, so existing marketplace references keep resolving, but the canonical URLs in `package.json`, `.claude-plugin/plugin.json`, and the README now point at the new name.
2. Commit and push the rename to `main`, then tag `v0.3.0`. The marketplace manifest and the curl one-liner are read straight from `main`, so both channels serve the old naming until this lands.
3. `npm publish` the renamed package, which produces `tpm-os@0.3.0`. `tpm-os` was unclaimed on the registry as of 2026-10-20. Publish before removing the old package, so no window exists in which neither name resolves.
4. Remove the old name: `npm unpublish tpm_os --force`. Removing the whole package rather than just `tpm_os@0.2.0` is deliberate: a version-only unpublish leaves the `0.0.0-stage` placeholder in place and `npx tpm_os` keeps resolving to it. npm permits a full unpublish only within 72 hours of first publish, a window that closes 2026-10-21 15:43 UTC; after that, `npm deprecate tpm_os "renamed to tpm-os, run npx tpm-os"` is the only remaining option.
5. Re-run the post-publish checks above against `npx tpm-os@latest`.

Existing installs are unaffected: npx and curl installs are already-written files, and plugin users were always on the `tpm-os` plugin name.

## Rollback

- npm: within 72 hours `npm unpublish tpm-os@0.3.0`; after that, `npm deprecate tpm-os@0.3.0 "<reason>"` and publish 0.3.1 with the fix.
- Plugin: revert on `main` and bump to 0.3.1; plugin users receive it on update. Users can also `/plugin uninstall tpm-os@tpm-os`.
- curl and clone installs are unaffected; no data migrations exist, and the installer never overwrites docs state.

## Release Notes

Internal: 0.2.0 adds npm and plugin channels over the same install.sh source. The plugin reuses `.claude/` in place and injects the router through a SessionStart hook. The self-test now also enforces version agreement and the router size budget, and tolerates this repository's own docs state.

User-facing: Install the TPM Operating System with `npx tpm-os`, or as a Claude Code plugin: `/plugin marketplace add amansharma2910/tpm-os`, then `/plugin install tpm-os@tpm-os` and `/tpm-os:setup`. Plugin commands are namespaced, for example `/tpm-os:interview`.
