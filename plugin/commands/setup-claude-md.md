---
description: "Write or update this repository's CLAUDE.md so it carries the tpm-os instructions. Asks first, writes only on approval."
---

Set up this repository's CLAUDE.md to carry the tpm-os instructions. Nothing is written without explicit approval from the user.

Why this exists: a plugin cannot ship a CLAUDE.md, so the router reaches the session through a SessionStart hook that rebuilds it every time. Writing it into the repository makes the instructions durable, reviewable in diffs, and shared with collaborators, and the hook then goes quiet because the file already holds the router.

## Step 1: detect the current state

From the project root:

```bash
if [ ! -f CLAUDE.md ]; then printf 'state: absent\n'; elif grep -q 'Senior Technical PM Operating System' CLAUDE.md; then printf 'state: present\n'; else printf 'state: other\n'; fi
[ -f docs/roadmap.md ] && printf 'docs: seeded\n' || printf 'docs: not seeded\n'
```

If docs are not seeded, say in one line that /tpm-os:setup seeds the docs skeleton, then carry on: the CLAUDE.md work does not depend on it.

## Step 2: route on the state

### state: present

Say in one line that CLAUDE.md already carries the tpm-os router, so there is nothing to do. Ask nothing. Write nothing.

### state: absent

Ask once:

> This repository has no CLAUDE.md. Write one carrying the tpm-os instructions?
> A. Yes, create CLAUDE.md.
> B. No, keep relying on the session hook.
> C. Something else (describe it).

On A, run from the project root:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/install.sh" --print-claude-md . > CLAUDE.md.tpm-os-new && mv CLAUDE.md.tpm-os-new CLAUDE.md
```

Write through the temporary file, never straight into CLAUDE.md: a failed render would otherwise leave an empty CLAUDE.md behind, which reads as state `other` on the next run. Then go to step 3.

### state: other

The repository already has its own CLAUDE.md. Merge, never replace.

1. Read the existing CLAUDE.md in full.
2. Run `bash "${CLAUDE_PLUGIN_ROOT}/install.sh" --print-claude-md .` and read its output. That is the tpm-os instruction set rendered for this repository.
3. Report in at most eight lines: which tpm-os sections will be added, that the existing content stays, and every place an existing instruction contradicts a tpm-os default. Look specifically for a different docs layout against the file ownership table, a different writing or commit convention against the interaction and writing style section, and existing mode, agent, or command names that collide with tpm-os ones. Never resolve a contradiction silently.
4. Ask once:

> Merge the tpm-os instructions into your CLAUDE.md?
> A. Yes, merge as described.
> B. Yes, but my instruction wins where the two conflict.
> C. No, leave CLAUDE.md as it is.
> D. Something else (describe it).

5. On A or B, back the file up, then write the merged file:

```bash
cp CLAUDE.md "CLAUDE.md.bak-$(date +%Y-%m-%d)"
```

Merge rules:

- Keep the existing content first and verbatim. Existing text keeps its own wording and punctuation; the no-em-dash rule applies only to text you write.
- Append the `--print-claude-md` output below it, separated by a `---` rule on its own line. Copy it verbatim: the tables and frontmatter templates are contracts the skills parse, so do not paraphrase, reorder, or trim them. Its heading is a second H1, which is fine in an instruction file.
- Under answer B, edit only the specific lines in the appended block that lose the conflict, and state what you changed. Everything else stays verbatim.
- Do not delete or rewrite anything the user did not agree to change.

6. Verify the write:

```bash
grep -q 'Senior Technical PM Operating System' CLAUDE.md && printf 'marker: ok\n' || printf 'marker: MISSING\n'
```

If the marker is missing, the file failed its purpose: the SessionStart hook will keep injecting the full router every session and the project ends up with two routing tables. Fix the file before reporting anything.

## Step 3: report

Report in at most four lines:

- What was written: created, or merged with the backup path.
- Any conflict the user chose to keep, and the line it changed.
- That the router hook goes quiet from the next session start, because CLAUDE.md now carries the router.
- That the backup file can be deleted once the diff looks right.

If the user declined, say in one line that nothing was written and the session hook keeps supplying the router.
