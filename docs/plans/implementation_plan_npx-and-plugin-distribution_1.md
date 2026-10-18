---
type: implementation_plan
feature: npx-and-plugin-distribution
version: 1
status: in_progress
unplanned: false
linear_issue: null
created: 2026-10-18
updated: 2026-10-18
---

# Implementation Plan: npx and Claude Code Plugin Distribution (v1)

## 1. Problem Statement

The suite installs only through `install.sh` (curl or a local clone). Users who live in Node tooling expect `npx`, and Claude Code users expect `/plugin install`. A plugin cannot ship `CLAUDE.md`, which is the router the whole suite depends on, so a naive plugin would deliver skills with no routing, no auto-triggers, and no advisory gate.

## 2. Business Objective and End Goal

Lower install friction to one command in each ecosystem without forking the content. End state: `npx tpm_os` and `/plugin install tpm-os@tpm-os` both work, and every installed file still comes from one source that the existing drift gate covers.

## 3. Users and UX

- npx users: run `npx tpm_os` in a project; identical behavior, options, and exit codes to `install.sh`.
- Plugin users: `/plugin marketplace add amansharma2910/tpm_s-kill_bot`, `/plugin install tpm-os@tpm-os`, restart, `/tpm-os:setup` once per repository. Commands, skills, and agents are namespaced `tpm-os:`.

## 4. Functional Requirements

Must:
- M1. `npx tpm_os [options] [target-dir]` runs the bundled `install.sh` with arguments, working directory, stdio, and exit codes (0, 1, 2) passed through.
- M2. The repository root is a valid plugin named `tpm-os` and its own marketplace named `tpm-os` (`source: "."`), with no second copy of any skill, agent, or command.
- M3. A SessionStart hook injects the router rendered with the current repository's name, in every repository where the plugin is enabled (decision 3B: always on).
- M4. The hook prints nothing when the repository's own `CLAUDE.md` already contains the router, so npx and plugin installs never stack two routing tables.
- M5. `/tpm-os:setup` seeds only the `docs/` skeleton via `install.sh --docs-only`, never overwriting existing docs.
- M6. documentation-mode no longer hardcodes `docs/tpm_s-kill_bot/`; it defers to the router's file ownership table.
- M7. Version `0.2.0` in `install.sh`, `package.json`, and `.claude-plugin/plugin.json`; the self-test fails if they disagree.
- M8. The self-test's file tree check ignores extra live files under `docs/` (plans, ADRs, fixes this repo records by using its own suite) and still fails on extra config files or missing seeds. Today the gate fails as soon as this plan exists.

Should:
- S1. The self-test fails if the injected router exceeds a 9500 character budget (Claude Code caps hook context at 10000).
- S2. The README documents all three methods, plugin scope trade-offs, and a release checklist.

Could:
- C1. A GitHub Action that runs the self-test and `claude plugin validate` on push.

Won't:
- W1. A pure Node rewrite of the installer, or Windows support without bash.

## 5. Non-Functional Requirements

- Hook must never fail or slow a session start: every error path in `--emit-router` exits 0 silently; runtime is a single render (well under 1 second).
- bash 3.2 compatibility and the no em dash rule hold for all new code.
- npm package contains only `bin/cli.js`, `install.sh`, `README.md`, `package.json` (21 kB packed).

## 6. Inputs and Outputs

- Hook input: `CLAUDE_PLUGIN_ROOT`, `CLAUDE_PROJECT_DIR`. Output: preamble plus rendered router on stdout (7802 characters today), or nothing.
- `--docs-only` input: target directory. Output: the 11 `docs/` files and the standard report, without the restart and smoke test text.

## 7. Success Criteria

Verified in the scratchpad prototype on 2026-10-18:

1. `claude plugin validate .` passes for both manifests (one expected warning: root `CLAUDE.md` is not loaded by plugins).
2. In a fresh repository with `--plugin-dir`, the session sees `# plugin-target: Senior Technical PM Operating System`, documentation-mode resolves to `docs/plugin-target/DOCUMENTATION.md`, and the prompt "add a dark mode toggle" ran interview-mode, wrote a plan, and registered it on the roadmap.
3. `/tpm-os:setup` created exactly the 11 `docs/` files and nothing else.
4. `--emit-router` printed 0 bytes for a repository installed by `install.sh`, and exited 0 for a nonexistent directory.
5. `npx --package=tpm_os-0.2.0.tgz tpm_os` installed into a directory with a space in its name (derived name `npx-target`); re-run exit 0, conflict exit 2, unknown flag exit 1.
6. `./install.sh --self-test` passes, reporting the router at 7802 of 9500 characters, with this plan present under `docs/plans/`. Negative tests: a stray `.claude/commands/stray.md` fails it, and a missing docs seed fails it.

Still to verify after merge: the marketplace install from GitHub (`/plugin marketplace add amansharma2910/tpm_s-kill_bot`), which exercises the plugin cache copy that local tests cannot, and `npx tpm_os` from the public registry.

## 8. Failure Handling and Fallbacks

- No bash on PATH (npx on plain Windows): `cli.js` prints a clear message naming macOS, Linux, WSL, or Git Bash and exits 1.
- Hook errors (unreadable directory, underivable name): fall back to the name `project` or print nothing; never block the session.
- Router grows past budget: self-test fails before commit; options then are trimming the router or splitting rarely used sections into a skill.
- User enables the plugin and also has an npx install: router is not duplicated (M4), but skills load twice. The README tells users to pick one method per repository.

## 9. Non-Goals

Windows without bash, a Node rewrite, CI auto-publishing, Linear sync, and listing in the official Anthropic marketplace.

## 10. Open Questions

1. License. Resolved 2026-10-18: MIT, LICENSE file added at the repository root.
2. Always-on scope (decision 3B) means the router governs every repository where the plugin is enabled, including ones with unrelated `CLAUDE.md` instructions. The README steers users to project scope; confirm that is enough.

## Chosen Approach

Recorded in docs/adr/0001-plugin-router-delivery.md (accepted). The repository root is both plugin and marketplace, `plugin.json` points at the live `.claude/` files, and a SessionStart hook runs `install.sh --emit-router` to inject the router rendered for the current repository. npx wraps the same `install.sh`. Rejected: router as a skill, setup writing CLAUDE.md per repository, and a copied `plugin/` tree.

## Decisions Recorded

| # | Question | Decision |
|---|---|---|
| 1 | Plugin name | `tpm-os` |
| 2 | npm package name | `tpm_os` (available on the registry as of 2026-10-18) |
| 3 | Cross-repo behavior | B: always on wherever the plugin is enabled |
| 4 | Publishing | B: Claude runs `npm publish` after the user runs `npm login` |
| 5 | Version | A: `0.2.0` everywhere, enforced by the self-test |
| 6 | License | MIT, with a LICENSE file |

## Copy-Ready Changes

### New file: `.claude-plugin/plugin.json`

```json
{
  "name": "tpm-os",
  "version": "0.2.0",
  "description": "Senior technical PM operating system for Claude Code: requirements interviews, ADRs, QA, metrics, fix plans, releases, docs, roadmap, feedback triage, and GTM, recorded as Linear-ready docs.",
  "author": {
    "name": "Aman Sharma",
    "url": "https://github.com/amansharma2910"
  },
  "homepage": "https://github.com/amansharma2910/tpm_s-kill_bot",
  "repository": "https://github.com/amansharma2910/tpm_s-kill_bot",
  "license": "MIT",
  "keywords": ["product-management", "tpm", "planning", "adr", "roadmap", "qa"],
  "skills": "./.claude/skills/",
  "commands": ["./.claude/commands/", "./plugin/commands/setup.md"],
  "agents": [
    "./.claude/agents/repo-surveyor.md",
    "./.claude/agents/impact-analyzer.md",
    "./.claude/agents/doc-crawler.md",
    "./.claude/agents/competitor-researcher.md"
  ],
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"${CLAUDE_PLUGIN_ROOT}/install.sh\" --emit-router \"${CLAUDE_PROJECT_DIR:-.}\""
          }
        ]
      }
    ]
  }
}
```

### New file: `.claude-plugin/marketplace.json`

```json
{
  "name": "tpm-os",
  "description": "The TPM Operating System for Claude Code, published from its source repository.",
  "owner": {
    "name": "Aman Sharma",
    "url": "https://github.com/amansharma2910"
  },
  "plugins": [
    {
      "name": "tpm-os",
      "source": ".",
      "description": "Senior technical PM operating system for Claude Code: requirements interviews, ADRs, QA, metrics, fix plans, releases, docs, roadmap, feedback triage, and GTM.",
      "category": "productivity"
    }
  ]
}
```

### New file: `plugin/commands/setup.md`

````markdown
---
description: "Seed this repository's docs/ skeleton (roadmap, changelog, feedback log, plan and fix directories) for the tpm-os plugin."
---

Seed the tpm-os docs skeleton in the current project. From the project root, run:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/install.sh" --docs-only .
```

Existing docs files are never overwritten; they report as kept. Report the created and kept counts from the output in two lines. Do not run the installer without --docs-only: the plugin already provides the router, skills, agents, and commands, and a full install would load every component twice.
````

### New file: `bin/cli.js` (mode 755)

```js
#!/usr/bin/env node
// npx entry point: runs the bundled install.sh with the caller's arguments,
// working directory, and stdio, and exits with its exit code (0 success,
// 1 usage or verification failure, 2 conflicts not forced).
"use strict";

const { spawnSync } = require("child_process");
const path = require("path");

const script = path.join(__dirname, "..", "install.sh");
const result = spawnSync("bash", [script, ...process.argv.slice(2)], { stdio: "inherit" });

if (result.error) {
  const reason = result.error.code === "ENOENT" ? "bash was not found on PATH" : result.error.message;
  console.error(`tpm_os: ${reason}. The installer needs bash (macOS, Linux, WSL, or Git Bash).`);
  process.exit(1);
}
process.exit(result.status === null ? 1 : result.status);
```

### New file: `package.json`

```json
{
  "name": "tpm_os",
  "version": "0.2.0",
  "description": "One-command installer for the TPM Operating System: a senior technical PM operating system for Claude Code.",
  "bin": {
    "tpm_os": "bin/cli.js"
  },
  "files": [
    "bin/cli.js",
    "install.sh"
  ],
  "scripts": {
    "test": "bash install.sh --self-test"
  },
  "keywords": [
    "claude-code",
    "claude",
    "product-management",
    "tpm",
    "planning"
  ],
  "author": "Aman Sharma",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/amansharma2910/tpm_s-kill_bot.git"
  },
  "homepage": "https://github.com/amansharma2910/tpm_s-kill_bot#readme",
  "bugs": "https://github.com/amansharma2910/tpm_s-kill_bot/issues",
  "engines": {
    "node": ">=16"
  }
}
```

### Edits: `install.sh`, `.claude/skills/documentation-mode/SKILL.md`, `README.md`

````diff
--- a/install.sh
+++ b/install.sh
@@ -10,7 +10,11 @@
 # Usage:
 #   ./install.sh [options] [target-dir]
 #   curl -fsSL https://raw.githubusercontent.com/amansharma2910/tpm_s-kill_bot/main/install.sh | bash -s -- [options] [target-dir]
+#   npx tpm_os [options] [target-dir]
 #
+# The same file also backs the tpm-os Claude Code plugin: its SessionStart
+# hook runs --emit-router and its /tpm-os:setup command runs --docs-only.
+#
 # Maintenance rules (see README.md, Maintainer section):
 #   1. Embedded files use quoted heredocs with the delimiter TPM_FILE.
 #      No embedded file may contain a line consisting of exactly TPM_FILE.
@@ -24,7 +28,7 @@
 
 set -euo pipefail
 
-TPM_SUITE_VERSION="0.1.0"
+TPM_SUITE_VERSION="0.2.0"
 
 # Globals
 TARGET_ARG=""
@@ -36,6 +40,8 @@
 FORCE=0
 DRY_RUN=0
 SELF_TEST=0
+DOCS_ONLY=0
+EMIT_ROUTER=0
 STAGE=""
 MANIFEST=""
 CHECKS_PASSED=0
@@ -68,6 +74,12 @@
                       replaced
   --dry-run           render and verify, report what would change, write
                       nothing
+  --docs-only         install only the docs/ skeleton (used by the plugin's
+                      /tpm-os:setup command)
+  --emit-router       print the rendered CLAUDE.md router to stdout for the
+                      target, or nothing if its CLAUDE.md already holds the
+                      router (used by the plugin's SessionStart hook); never
+                      fails
   --self-test         maintainer mode: render with the pinned name and date,
                       then diff against this clone's live files
   -h, --help          show this help
@@ -77,7 +89,8 @@
   1  usage or verification failure
   2  conflicts reported and not forced
 
-Remote one-liner (after the repo is pushed):
+Remote:
+  npx tpm_os [options] [target-dir]
   curl -fsSL https://raw.githubusercontent.com/amansharma2910/tpm_s-kill_bot/main/install.sh | bash -s -- [options] [target-dir]
 TPM_USAGE
 }
@@ -98,6 +111,8 @@
       --force) FORCE=1; shift ;;
       --dry-run) DRY_RUN=1; shift ;;
       --self-test) SELF_TEST=1; shift ;;
+      --docs-only) DOCS_ONLY=1; shift ;;
+      --emit-router) EMIT_ROUTER=1; shift ;;
       -h|--help) usage; exit 0 ;;
       -*) die "unknown option: $1 (see --help)" ;;
       *)
@@ -689,7 +704,7 @@
 
 ### Step 2: Project documentation
 
-Update `docs/{{PROJECT_NAME}}/DOCUMENTATION.md`:
+Update the project documentation file, at the `DOCUMENTATION.md` path that CLAUDE.md's file ownership table lists for documentation-mode:
 
 1. Project structure
 2. Third-party dependencies (name, version, purpose)
@@ -713,7 +728,7 @@
 
 ## Guardrails
 
-- Write only under docs/{{PROJECT_NAME}}/ and docs/features/.
+- Write only to the project documentation file named in CLAUDE.md's file ownership table, and under docs/features/.
 - When this mode runs as part of the auto-chain, trigger roadmap-mode next.
 TPM_FILE
 
@@ -1203,13 +1218,14 @@
   if grep -rn '{project_name}' "$STAGE" > /dev/null 2>&1; then vfail "{project_name} placeholder leaked"; fi
   if [ "$VERIFY_FAILS" -eq "$pre" ]; then CHECKS_PASSED=$((CHECKS_PASSED + 1)); fi
 
-  # 9. Name agreement: router, documentation-mode, and the docs directory all
-  #    reference the same project name.
+  # 9. Name agreement: the router and the docs directory reference the same
+  #    project name, and documentation-mode defers to the router's ownership
+  #    table (it stays name-agnostic so the plugin can ship it unrendered).
   pre=$VERIFY_FAILS
   grep -q "docs/$PROJECT_NAME/DOCUMENTATION.md" "$STAGE/CLAUDE.md" \
     || vfail "CLAUDE.md ownership row does not reference docs/$PROJECT_NAME/"
-  grep -q "docs/$PROJECT_NAME/" "$STAGE/.claude/skills/documentation-mode/SKILL.md" \
-    || vfail "documentation-mode does not reference docs/$PROJECT_NAME/"
+  grep -q "file ownership table" "$STAGE/.claude/skills/documentation-mode/SKILL.md" \
+    || vfail "documentation-mode does not defer to the CLAUDE.md file ownership table"
   if [ ! -f "$STAGE/docs/$PROJECT_NAME/DOCUMENTATION.md" ]; then
     vfail "docs/$PROJECT_NAME/DOCUMENTATION.md was not staged"
   fi
@@ -1342,6 +1358,11 @@
   fi
 
   printf '\nVerification: %d/%d embedded checks passed against the rendered tree.\n' "$CHECKS_PASSED" "$CHECKS_TOTAL"
+  if [ "$DOCS_ONLY" -eq 1 ]; then
+    printf '\nDocs skeleton only: the tpm-os plugin supplies the router, skills,\n'
+    printf 'agents, and commands, so nothing else was installed.\n'
+    return 0
+  fi
   printf '\nRestart required: skills, agents, and commands load at session start.\n'
   printf 'Restart your Claude Code session in %s before first use.\n' "$TARGET"
   printf '\nSmoke test:\n'
@@ -1381,9 +1402,14 @@
   st_fails=0
   st_warns=0
 
-  # Tree symmetry, both directions.
+  # Tree symmetry, both directions. Extra live files under docs/ are
+  # project state this repo accumulates by using its own suite (plans, ADRs,
+  # fixes), so only extra config files fail.
   printf '%s' "$MANIFEST" | LC_ALL=C sort > "$STAGE/.manifest"
-  (cd "$SOURCE_DIR" && find CLAUDE.md .claude docs -type f) \
+  { (cd "$SOURCE_DIR" && find CLAUDE.md .claude -type f)
+    for rel in $MANIFEST; do
+      case "$rel" in docs/*) if [ -f "$SOURCE_DIR/$rel" ]; then printf '%s\n' "$rel"; fi ;; esac
+    done; } \
     | grep -v '\.DS_Store' | grep -v 'settings\.local\.json' \
     | LC_ALL=C sort > "$STAGE/.actual"
   extra_live="$(comm -13 "$STAGE/.manifest" "$STAGE/.actual")"
@@ -1411,8 +1437,33 @@
         diff -u "$SOURCE_DIR/$rel" "$STAGE/$rel" | head -40 >&2 || true
         st_fails=$((st_fails + 1)) ;;
     esac
+  done
+
+  # Version agreement: plugin caches are keyed by version, so a bump that
+  # misses one manifest means plugin users never receive the update.
+  for vf in package.json .claude-plugin/plugin.json; do
+    if [ ! -f "$SOURCE_DIR/$vf" ]; then
+      printf 'self-test: FAIL: %s missing\n' "$vf" >&2
+      st_fails=$((st_fails + 1))
+      continue
+    fi
+    v="$(grep '"version"' "$SOURCE_DIR/$vf" | head -1 | sed 's/.*"version": *"\([^"]*\)".*/\1/')"
+    if [ "$v" != "$TPM_SUITE_VERSION" ]; then
+      printf 'self-test: FAIL: %s version %s does not match TPM_SUITE_VERSION %s\n' "$vf" "$v" "$TPM_SUITE_VERSION" >&2
+      st_fails=$((st_fails + 1))
+    fi
   done
 
+  # Router size: the plugin injects preamble plus router as SessionStart
+  # context, which Claude Code caps at 10000 characters per hook output.
+  router_chars="$( { emit_preamble; cat "$STAGE/CLAUDE.md"; } | wc -m | tr -d ' ')"
+  if [ "$router_chars" -gt 9500 ]; then
+    printf 'self-test: FAIL: injected router is %s characters (budget 9500, hard cap 10000)\n' "$router_chars" >&2
+    st_fails=$((st_fails + 1))
+  else
+    note "self-test: injected router is $router_chars characters (budget 9500)"
+  fi
+
   if [ "$st_fails" -gt 0 ]; then
     printf 'self-test summary: FAIL (%d failure(s), %d warning(s))\n' "$st_fails" "$st_warns" >&2
     exit 1
@@ -1420,8 +1471,47 @@
   printf 'self-test summary: PASS (%d warning(s))\n' "$st_warns"
 }
 
+# Plugin SessionStart hook: print the router rendered for the target so
+# Claude Code adds it to session context (SessionStart stdout becomes
+# context). Prints nothing when the target's own CLAUDE.md already carries
+# the router (an install.sh install), to avoid a duplicate routing table.
+# Must never fail a session start, so every error path exits 0 silently.
+emit_router() {
+  if [ -z "$TARGET_ARG" ]; then TARGET_ARG="${CLAUDE_PROJECT_DIR:-.}"; fi
+  [ -d "$TARGET_ARG" ] || exit 0
+  TARGET="$(cd "$TARGET_ARG" && pwd)" || exit 0
+  if [ -f "$TARGET/CLAUDE.md" ] && grep -q 'Senior Technical PM Operating System' "$TARGET/CLAUDE.md"; then
+    exit 0
+  fi
+  PROJECT_NAME="$(sanitize_name "$(basename "$TARGET")")"
+  if [ -z "$PROJECT_NAME" ]; then PROJECT_NAME="project"; fi
+  STAMP_DATE="$(date +%Y-%m-%d)"
+  STAGE="$(mktemp -d)" || exit 0
+  render_claude_md
+  emit_preamble
+  cat "$STAGE/CLAUDE.md"
+  exit 0
+}
+
+emit_preamble() {
+  cat <<'TPM_PREAMBLE'
+The tpm-os plugin is active in this session. The router below governs this
+repository exactly as if it were its CLAUDE.md. Plugin components are
+namespaced: skills as tpm-os:<skill> (for example tpm-os:interview-mode),
+subagents as tpm-os:<agent> (for example tpm-os:impact-analyzer), and slash
+commands as /tpm-os:<command> (for example /tpm-os:interview). Read every bare
+mode, agent, or command name below as its tpm-os: form. If docs/roadmap.md
+does not exist yet, the docs skeleton is not seeded: before the first mode
+writes state, recommend /tpm-os:setup once.
+
+TPM_PREAMBLE
+}
+
 main() {
   parse_args "$@"
+  if [ "$EMIT_ROUTER" -eq 1 ]; then
+    emit_router
+  fi
   if [ "$SELF_TEST" -eq 1 ]; then
     self_test
     exit 0
@@ -1430,6 +1520,14 @@
   STAGE="$(mktemp -d)"
   render_all
   verify_stage
+  if [ "$DOCS_ONLY" -eq 1 ]; then
+    docs_manifest=""
+    for rel in $MANIFEST; do
+      case "$rel" in docs/*) docs_manifest="$docs_manifest$rel
+" ;; esac
+    done
+    MANIFEST="$docs_manifest"
+  fi
   reconcile
   report
   if [ "$N_CONFLICTS" -gt 0 ]; then
--- a/.claude/skills/documentation-mode/SKILL.md
+++ b/.claude/skills/documentation-mode/SKILL.md
@@ -15,7 +15,7 @@
 
 ### Step 2: Project documentation
 
-Update `docs/tpm_s-kill_bot/DOCUMENTATION.md`:
+Update the project documentation file, at the `DOCUMENTATION.md` path that CLAUDE.md's file ownership table lists for documentation-mode:
 
 1. Project structure
 2. Third-party dependencies (name, version, purpose)
@@ -39,5 +39,5 @@
 
 ## Guardrails
 
-- Write only under docs/tpm_s-kill_bot/ and docs/features/.
+- Write only to the project documentation file named in CLAUDE.md's file ownership table, and under docs/features/.
 - When this mode runs as part of the auto-chain, trigger roadmap-mode next.
--- a/README.md
+++ b/README.md
@@ -1,23 +1,53 @@
 # tpm_s-kill_bot: Senior Technical PM Operating System for Claude Code
 
-A one-command installable suite that makes Claude Code behave like a senior technical product manager in any repository: requirements discovery, architecture evaluation, QA definition, success metrics, fix planning, release management, documentation, roadmap tracking, feedback triage, and go-to-market strategy.
+An installable suite that makes Claude Code behave like a senior technical product manager in any repository: requirements discovery, architecture evaluation, QA definition, success metrics, fix planning, release management, documentation, roadmap tracking, feedback triage, and go-to-market strategy.
 
 The suite is a CLAUDE.md router, ten interactive skills, four research subagents, ten slash commands, and a docs skeleton whose state files carry Linear-ready YAML frontmatter. It advises and records; it never blocks: work shipped without a plan is flagged `unplanned: true` and surfaced in the roadmap instead of refused.
 
 ## Install
 
-From inside the target project:
+Three ways to install. They deliver the same suite; pick by whether you want the files in your repository.
 
+| Method | Files land in your repo | Updates | Best for |
+|---|---|---|---|
+| npx | Yes: `CLAUDE.md`, `.claude/`, `docs/` | Re-run the command | Teams that review and version the suite with the code |
+| Claude Code plugin | Only `docs/` (via `/tpm-os:setup`) | `/plugin update` | Individuals, or keeping config out of the repo |
+| curl or local clone | Yes, same as npx | Re-run the script | Environments without Node |
+
+### npx
+
+From inside the target project (requires Node 16+ and bash):
+
 ```bash
-curl -fsSL https://raw.githubusercontent.com/amansharma2910/tpm_s-kill_bot/main/install.sh | bash
+npx tpm_os
 ```
 
-Or from a local clone:
+All installer options pass through, for example `npx tpm_os --dry-run` or `npx tpm_os --force /path/to/project`.
 
+### Claude Code plugin
+
+In a Claude Code session:
+
+```
+/plugin marketplace add amansharma2910/tpm_s-kill_bot
+/plugin install tpm-os@tpm-os
+```
+
+Then restart the session and run `/tpm-os:setup` once per repository to seed the `docs/` skeleton. The plugin delivers the router through a SessionStart hook, because plugins cannot ship a `CLAUDE.md`. Everything is namespaced: commands are `/tpm-os:interview`, `/tpm-os:fix`, and so on; skills and subagents carry the `tpm-os:` prefix.
+
+Scope matters. Installed at user scope (the default), the router is active in every repository you open, and its skills auto-trigger on requests like "build X" or "X is broken". To limit it to one repository, pick project scope in the `/plugin` install dialog, or from a shell inside that repository run `claude plugin install tpm-os@tpm-os --scope project`. Project scope also shares the plugin with collaborators through `.claude/settings.json`.
+
+The hook stays silent in any repository whose `CLAUDE.md` already contains the router (an npx or curl install), so the two methods never stack routers. They would still load the skills twice; use one method per repository.
+
+### curl or local clone
+
 ```bash
+curl -fsSL https://raw.githubusercontent.com/amansharma2910/tpm_s-kill_bot/main/install.sh | bash
 ./install.sh /path/to/your/project
 ```
 
+### Project name
+
 The project name is derived from the target directory's basename (spaces become hyphens; only letters, digits, dot, underscore, and hyphen survive; case is preserved) and applied everywhere the suite references it, including `docs/{project-name}/DOCUMENTATION.md`. Then restart your Claude Code session in the target: skills, agents, and commands load at session start.
 
 ## Options
@@ -29,6 +59,8 @@
 | `--date YYYY-MM-DD` | Date stamped into installed docs (default: today; used by tests) |
 | `--force` | Replace differing config files, backing each up to `<path>.bak-<date>` first |
 | `--dry-run` | Render and verify, report what would change, write nothing |
+| `--docs-only` | Install only the `docs/` skeleton (what `/tpm-os:setup` runs) |
+| `--emit-router` | Print the router rendered for the target (what the plugin hook runs); prints nothing if the target's `CLAUDE.md` already holds it |
 | `--self-test` | Maintainer mode: diff the embedded templates against this clone |
 | `-h`, `--help` | Help |
 
@@ -48,7 +80,7 @@
 
 ## Uninstall
 
-The install report doubles as the manifest. From the target project:
+Plugin: `/plugin uninstall tpm-os@tpm-os`. npx, curl, or clone installs: the install report doubles as the manifest. From the target project:
 
 ```bash
 rm -rf CLAUDE.md .claude/skills .claude/agents .claude/commands
@@ -58,7 +90,7 @@
 
 ## Smoke test
 
-After installing and restarting the session:
+After installing and restarting the session (plugin users: prefix commands with `tpm-os:`, for example `/tpm-os:interview`):
 
 1. Restart the Claude Code session in the target repository (skills, agents, and commands all load at session start).
 2. Request a small feature in plain words, for example "add a dark mode toggle". Expect: a one-line route announcement, then interview-mode's challenge step (restatement, right-problem question, simpler alternative, candidate non-goals), then a lettered MCQ batch of 3 to 5 questions ending with a free-text option.
@@ -69,7 +101,7 @@
 
 ## Maintainers
 
-`install.sh` is the package: every installed file lives inside it as a quoted heredoc (delimiter `TPM_FILE`), with `{{PROJECT_NAME}}` and `{{DATE}}` substituted at render time. This repo's own `CLAUDE.md`, `.claude/`, and `docs/` are the live reference install of the same suite.
+`install.sh` is the package for all three install methods. npx runs it through `bin/cli.js`, a thin wrapper that passes arguments, working directory, and exit codes through. The plugin is this repository's root: `.claude-plugin/plugin.json` points at `.claude/skills/`, `.claude/commands/`, the four agent files, and `plugin/commands/setup.md`, and its SessionStart hook runs `install.sh --emit-router`. `.claude-plugin/marketplace.json` lists that one plugin with `source: "."`, so the repository is also its own marketplace. Every installed file lives inside it as a quoted heredoc (delimiter `TPM_FILE`), with `{{PROJECT_NAME}}` and `{{DATE}}` substituted at render time. This repo's own `CLAUDE.md`, `.claude/`, and `docs/` are the live reference install of the same suite.
 
 The working rule: any edit to `CLAUDE.md`, anything under `.claude/`, or a docs seed must be mirrored into the matching heredoc in `install.sh`, and the drift gate must pass before committing:
 
@@ -77,7 +109,7 @@
 ./install.sh --self-test
 ```
 
-The self-test renders with the pinned name and date, runs the nine embedded checks, verifies the file tree matches in both directions, and byte-compares the render against the live files. `CLAUDE.md` and `.claude/**` mismatches fail; docs seed mismatches warn (this repo's own roadmap and changelog may legitimately accumulate state); `docs/tpm_s-kill_bot/DOCUMENTATION.md` is excluded (targets receive a generic starter instead of this repo's self-describing doc).
+The self-test renders with the pinned name and date, runs the nine embedded checks, verifies the file tree matches in both directions, byte-compares the render against the live files, checks that `TPM_SUITE_VERSION`, `package.json`, and `.claude-plugin/plugin.json` carry the same version, and checks that the router the plugin injects stays under its 9500 character budget (Claude Code caps hook context at 10000). `CLAUDE.md` and `.claude/**` mismatches fail; docs seed mismatches warn (this repo's own roadmap and changelog may legitimately accumulate state); `docs/tpm_s-kill_bot/DOCUMENTATION.md` is excluded (targets receive a generic starter instead of this repo's self-describing doc).
 
 Optional pre-commit hook:
 
@@ -85,4 +117,11 @@
 printf '#!/bin/sh\nexec ./install.sh --self-test\n' > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
 ```
 
-Constraints to preserve when editing: no embedded file may contain a line consisting of exactly `TPM_FILE`; every frontmatter `description` stays a double-quoted single line; no em dash characters anywhere; the script stays bash 3.2 compatible (no `sed -i`, no associative arrays, printf only).
+Releasing a new version:
+
+1. Bump the version in `install.sh` (`TPM_SUITE_VERSION`), `package.json`, and `.claude-plugin/plugin.json`. Plugin users only receive updates when this version changes.
+2. `./install.sh --self-test` and `claude plugin validate .` must pass.
+3. Commit, tag (`v<version>`), and push to `main`. The plugin marketplace reads straight from the repository.
+4. `npm publish` for the npx channel.
+
+Constraints to preserve when editing: no embedded file may contain a line consisting of exactly `TPM_FILE`; every frontmatter `description` stays a double-quoted single line; no em dash characters anywhere; documentation-mode stays name-agnostic (it defers to the router's ownership table, because the plugin ships skills unrendered); the script stays bash 3.2 compatible (no `sed -i`, no associative arrays, printf only).
````

## Execution Steps

1. Apply the new files and edits above (the scratchpad prototype is the tested source).
2. `./install.sh --self-test`, `claude plugin validate .`, `npm pack --dry-run`.
3. Documentation-mode updates `docs/tpm_s-kill_bot/DOCUMENTATION.md`; release-mode adds the 0.2.0 CHANGELOG entry; roadmap-mode updates status.
4. User commits; tag `v0.2.0`; push to `main`.
5. User runs `npm login`; Claude runs `npm publish`.
6. Post-publish checks: `npx tpm_os --dry-run` from the registry, and a marketplace install from GitHub in a scratch repository.
