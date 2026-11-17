---
type: roadmap
created: 2026-09-02
updated: 2026-11-17
---

# Roadmap

## Milestones

- v0.2.0: npx and Claude Code plugin distribution (npx-and-plugin-distribution).
- v0.3.0: project renamed to tpm-os (project-rename). Live on GitHub and npm, verified 2026-11-17.
- v0.4.0: setup commands offer a CLAUDE.md (claude-md-setup). Prepared 2026-11-17, not yet tagged or published.

## Feature Checklist

- [x] npx-and-plugin-distribution: Install the suite with `npx tpm-os` or as the `tpm-os` Claude Code plugin (plan: v1, status: shipped)

## Business Objective Coverage

None yet. Populated from tracking plan verdicts. Neither npx-and-plugin-distribution nor claude-md-setup has a tracking plan, so neither install volume nor acceptance of the CLAUDE.md offer is measured.

## Unplanned Work

- [x] project-rename: Rename the project to tpm-os throughout, replacing tpm_s-kill_bot and tpm_os (plan: none, status: applied)
- [x] claude-md-setup: /tpm-os:setup offers to write the tpm-os instructions into the repository's CLAUDE.md, and /tpm-os:setup-claude-md does it on its own (plan: none, status: applied)

Items with `unplanned: true` in their frontmatter appear here. project-rename and claude-md-setup have no plan documents, so they carry no frontmatter of their own and are recorded directly on these lines.

## Next Up

- claude-md-setup: applied and verified locally on 2026-11-17. Version bumped to 0.4.0 in install.sh, package.json, and .claude-plugin/plugin.json, with the changelog entry and docs/releases/claude-md-setup_release_checklist.md written. Three steps remain, all the user's to run: push `main`, tag `v0.4.0`, and `npm publish`. The line flips to shipped once the post-publish checks in that checklist pass.
- npx-and-plugin-distribution: shipped. The plan is flipped and its release checklist is marked released, confirmed by origin/main carrying the rename at 092ad48 and `tpm-os@0.3.0` resolving on npm.
- Measurement gap worth closing before the next release: no tracking plan exists for either shipped feature. metrics-mode would define install and setup events, including how often the CLAUDE.md offer is accepted, declined, or merged.
