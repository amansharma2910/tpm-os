---
type: adr
id: 0001
status: accepted
supersedes: null
related_feature: npx-and-plugin-distribution
created: 2026-10-18
---

# ADR 0001: Deliver the router to plugin users through a SessionStart hook

## Context

The suite depends on its CLAUDE.md router: the routing table, auto-triggers, advisory gate, file ownership, and schemas. Claude Code plugins cannot ship a CLAUDE.md (a root CLAUDE.md in a plugin is not loaded, and `claude plugin validate` warns about it). Plugins can ship skills, commands, agents, and hooks. A SessionStart hook's stdout is added to session context, capped at 10000 characters per hook output.

Every installed file already lives in one source, `install.sh`, guarded by `./install.sh --self-test`. Any plugin design that copies content creates a second source to drift.

## Options Considered

A. SessionStart hook that runs `install.sh --emit-router`, rendering the CLAUDE.md template for the current repository, with the repository root as the plugin and `plugin.json` pointing at the live `.claude/` files. Single source, always on, re-fires after `/clear` and compaction. Costs: a size ceiling, and every plugin session runs a short bash render.

B. Router as a skill. No hook, but skills load only when their description matches, so the routing table, auto-triggers, and advisory gate would be absent from most turns. Rejected: it breaks the suite's core behavior.

C. `/tpm-os:setup` writes CLAUDE.md into the repository. Simple, but every repository gets a copy of the router that plugin updates never refresh, and it collides with existing CLAUDE.md files. Rejected: it reintroduces the per-repo copies the plugin exists to avoid.

D. A separate `plugin/` tree with copied skills, agents, and commands. Rejected: three copies (live, install.sh, plugin) and a wider drift gate for no user benefit.

## Decision

Option A. The repository root is both the `tpm-os` plugin and its own marketplace (`source: "."`). The hook command is `bash "${CLAUDE_PLUGIN_ROOT}/install.sh" --emit-router "${CLAUDE_PROJECT_DIR:-.}"`. It prints a short preamble that maps bare names to their `tpm-os:` forms, then the rendered router. It prints nothing when the repository's own CLAUDE.md already contains the router, and it exits 0 silently on any error. The router is always on wherever the plugin is enabled (user decision 3B).

## Consequences

- The injected text (preamble plus router) must stay at or under 9500 characters. The self-test enforces this; 7802 today. Growth beyond it means trimming the router or moving rarely used sections into a skill.
- Skills ship unrendered, so no skill may name a project-specific path. documentation-mode defers to the router's ownership table; verify_stage check 9 enforces it.
- `TPM_SUITE_VERSION`, `package.json`, and `.claude-plugin/plugin.json` must carry the same version, because plugin caches are keyed by version. The self-test enforces it.
- Plugin-only files (`plugin/commands/setup.md`, `.claude-plugin/`) stay outside `.claude/` and `docs/`, so install.sh users never receive them and the self-test tree check stays exact.
- Installing both the plugin and an npx install in one repository does not duplicate the router, but loads skills twice. The README tells users to pick one method per repository.
- At user scope the router governs every repository the user opens. The README recommends project scope for users who want it limited.
