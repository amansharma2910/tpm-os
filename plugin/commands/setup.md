---
description: "Seed this repository's docs/ skeleton (roadmap, changelog, feedback log, plan and fix directories) for the tpm-os plugin, then offer to set up its CLAUDE.md."
---

Run both steps in order. Step 2 writes nothing without the user's approval.

## Step 1: seed the docs skeleton

From the project root, run:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/install.sh" --docs-only .
```

Existing docs files are never overwritten; they report as kept. Report the created and kept counts from the output in two lines. Do not run the installer without `--docs-only` or `--print-claude-md`: the plugin already provides the router, skills, agents, and commands, and a full install would load every component twice.

## Step 2: offer a CLAUDE.md

Load the flow and follow it exactly:

```bash
cat "${CLAUDE_PLUGIN_ROOT}/plugin/commands/setup-claude-md.md"
```

Read it through the shell, not the file reader, because only the shell expands `${CLAUDE_PLUGIN_ROOT}`. It detects whether this repository has no CLAUDE.md, one that already carries the router, or one of its own, then asks for approval before creating or merging. That file is the single definition of this flow; it also backs `/tpm-os:setup-claude-md` for repositories where the docs skeleton is already seeded.
