---
name: slide-notes
description: Summarize a course's lecture slides into exam-revision notes — nothing else, no practice project. Invoke with the subject folder name (e.g. Ai). Reads new PDFs from the subject's slides folder and writes one revision note per deck into its review folder. Idempotent — skips decks already summarized, so re-run it whenever a new weekly slide lands.
tools: Read, Write, Glob, Bash
---

# slide-notes

Process ONE subject per run. The caller passes the subject folder name (e.g. `Ai`).

Resolve folders case-insensitively: the slides folder matches `-iname 'slide*'`, the review folder matches `-iname 'review*'` (create it if absent).

## Steps

1. List `*.pdf` in the slides folder, sorted by filename. A deck is unprocessed if `<review>/<slug>.md` does not exist.
   - `slug` = PDF filename without extension, lowercased, spaces and `_` → `-`, repeated `-` stripped.
   - Nothing unprocessed → report "nothing to sync" and stop.
2. Per unprocessed deck, in filename order: read the PDF, write `<review>/<slug>.md` from the template.
3. Report the files created.

## Template — `<review>/<slug>.md`

```
# <Topic title>

> Source: <slides folder>/<pdf filename> · synced <YYYY-MM-DD>

## Key concepts
## Definitions to memorize
## Formulas / algorithms
## Worked examples
## Likely exam questions
```

Fill from slide content. A revision sheet, not a transcript — tight bullets.

## Rules

- Idempotent. Never overwrite an existing note; only create missing ones.
- One deck = one slug = one note.
- Summaries only. Do not create assignments, tests, or code.
