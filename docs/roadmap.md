---
type: roadmap
created: 2026-09-02
updated: 2026-11-17
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
- [x] claude-md-setup: /tpm-os:setup offers to write the tpm-os instructions into the repository's CLAUDE.md, and /tpm-os:setup-claude-md does it on its own (plan: none, status: applied)

Items with `unplanned: true` in their frontmatter appear here. project-rename and claude-md-setup have no plan documents, so they carry no frontmatter of their own and are recorded directly on these lines.

## Next Up

- claude-md-setup: applied and verified locally on 2026-11-17 (installer self-test passes, `claude plugin validate` passes, and the create and merge paths were exercised in scratch repositories). Not yet released. Plugin and npm users receive it only after a version bump, because 0.3.0 is already on origin/main and on npm; release-mode owns that bump and the CHANGELOG entry.
- npx-and-plugin-distribution: its plan frontmatter still reads `status: in_progress`, but the two external steps it was waiting on are now verifiably done: origin/main carries the renamed repository at 092ad48, and `tpm-os@0.3.0` is published on npm. Status mismatch flagged, not guessed: release-mode should flip the plan to shipped and record the release.
- project-rename: complete. The GitHub rename and the renamed npm publish, both listed as the user's to run, are confirmed done.
