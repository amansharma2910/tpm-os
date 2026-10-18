---
description: "Seed this repository's docs/ skeleton (roadmap, changelog, feedback log, plan and fix directories) for the tpm-os plugin."
---

Seed the tpm-os docs skeleton in the current project. From the project root, run:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/install.sh" --docs-only .
```

Existing docs files are never overwritten; they report as kept. Report the created and kept counts from the output in two lines. Do not run the installer without --docs-only: the plugin already provides the router, skills, agents, and commands, and a full install would load every component twice.
