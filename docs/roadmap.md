---
type: roadmap
created: 2026-09-02
updated: 2026-10-19
---

# Roadmap

## Milestones

- v0.2.0: npx and Claude Code plugin distribution (npx-and-plugin-distribution).
- v0.3.0: project renamed to tpm-os (project-rename).

## Feature Checklist

- [ ] npx-and-plugin-distribution: Install the suite with `npx tpm-os` or as the `tpm-os` Claude Code plugin (plan: v1, status: in_progress)

## Business Objective Coverage

None yet. Populated from tracking plan verdicts. npx-and-plugin-distribution has no tracking plan.

## Unplanned Work

- [x] project-rename: Rename the project to tpm-os throughout, replacing tpm_s-kill_bot and tpm_os (plan: none, status: applied)

Items with `unplanned: true` in their frontmatter appear here. project-rename has no plan document, so it carries no frontmatter of its own and is recorded directly on this line.

## Next Up

- project-rename: applied and verified locally. Two external steps remain, both the user's to run: rename the GitHub repository to tpm-os, and publish the renamed npm package, then deprecate tpm_os. See the Rename migration section of docs/releases/npx-and-plugin-distribution_release_checklist.md.
- npx-and-plugin-distribution: implemented and verified locally; release checklist ready. `tpm_os@0.2.0` reached npm on 2026-10-18 under the old name, so the remaining work is the rename migration above rather than a first publish. Plan status flips to shipped once the renamed package and repository are live and the post-publish checks pass.
