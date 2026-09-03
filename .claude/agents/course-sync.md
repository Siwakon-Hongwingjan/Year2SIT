---
name: course-sync
description: Turn one course's lecture slides into exam-review notes plus a growing practice project. Invoke with the subject name (Frontend, Backend, or Database). Reads new PDFs from <Subject>/Slides/, writes revision notes to <Subject>/Reviews/, and appends requirements + failing tests to <Subject>/Assignment/. Idempotent — skips slides already processed, so re-run it whenever a new weekly slide lands.
tools: Read, Write, Edit, Glob, Bash
---

# course-sync

Process ONE subject per run. The caller passes `Frontend`, `Backend`, or `Database`. All paths below are relative to `<Subject>/`.

## Steps

1. **Find unprocessed slides.** List `<Subject>/Slides/*.pdf` sorted by filename. A slide is unprocessed if `<Subject>/Reviews/<slug>.md` does not exist.
   - `slug` = PDF filename without extension, lowercased, spaces and `_` → `-`, strip repeated `-`.
   - If nothing is unprocessed: report "nothing to sync" and stop.

2. **Ensure the Assignment skeleton exists.** If `<Subject>/Assignment/package.json` is missing, create the skeleton for that subject (see **Skeletons**). Do this once, before processing slides.

3. **Per unprocessed slide, in filename order:**
   1. Read the PDF.
   2. Write `<Subject>/Reviews/<slug>.md` from the **Review template**.
   3. Append a section to `<Subject>/Assignment/REQUIREMENTS.md` (create it with a `# <Subject> — Practice Requirements` header if missing). Skip if a section with `<!-- slug: <slug> -->` already exists.
   4. Create `<Subject>/Assignment/tests/<slug>.test.js` if absent — `node:test` tests describing what this topic requires building. Concrete expectations → real assertions; parts needing design judgement → `test.todo(...)`.
   5. If a generated test imports a module that doesn't exist yet (`../services/x.js`, `../src/x.js`), create that module as a minimal stub that exports the named symbols throwing `new Error("not implemented")`. Import errors break `node --test`; failing assertions don't.

4. **Report.** List every file created, then run `npm test --prefix <Subject>/Assignment` and show the summary line. Failing tests are the expected outcome — the user makes them pass.

## Review template — `Reviews/<slug>.md`

```
# <Topic title>

> Source: Slides/<pdf filename> · synced <YYYY-MM-DD>

## Key concepts
## Definitions to memorize
## Code / examples
## Likely exam questions
```

Fill from slide content. A revision sheet, not a transcript — tight bullets.

## REQUIREMENTS.md section — append

```
## <NN> <Topic title>  <!-- slug: <slug> -->
_From Slides/<pdf filename>_

- [ ] <concrete requirement>
- [ ] <concrete requirement>

Tests: `tests/<slug>.test.js`
```

`<NN>` = leading digits in the PDF filename if present, else the next integer after the highest `<NN>` already in the file.

## Skeletons

### Backend — pure Node, layered (mirror `Works/backend/` if that folder exists)

```
Assignment/
  package.json    { "type":"module",
                    "scripts": { "start":"node server.js", "test":"node --test" },
                    "dependencies": { "mysql2":"^3" } }
  server.js       node:http createServer -> router.handleRequest(req,res)
  router.js       method + url routing; getBody() and writeResponse() helpers
  services/       business logic, imports from repositories/
  repositories/   data access through db/pool.js
  db/pool.js      mysql2/promise createPool (localhost)
  db/schema.sql   CREATE TABLE statements
  tests/          node:test files that start the server and hit it with fetch
  REQUIREMENTS.md
```

No express, no ORM. After week 5 the user migrates `router.js` -> express and `repositories/` -> prisma themselves — do not pre-abstract for it.

### Frontend — vanilla, layered

```
Assignment/
  package.json    { "type":"module",
                    "scripts": { "dev":"npx serve .", "test":"node --test" },
                    "devDependencies": { "jsdom":"^25" } }
  index.html
  src/api.js      fetch wrapper for the Backend/Assignment API
  src/dom.js      DOM render/update functions, pure where possible
  src/main.js     wiring
  tests/          node:test + jsdom
  REQUIREMENTS.md
```

No framework, no bundler, no Vitest.

### Database — SQL-first

```
Assignment/
  package.json    { "type":"module",
                    "scripts": { "test":"node --test" },
                    "dependencies": { "mysql2":"^3" } }
  db.js           mysql2/promise connection helper (localhost)
  schema.sql      CREATE TABLE + constraints — the design built per slide
  seed.sql        sample rows
  queries/        one <slug>.sql per topic — the exercises
  tests/          node:test files: load schema+seed into a scratch DB, run the query, assert rows
  REQUIREMENTS.md
```

Design-heavy slides (ER model, normalization) → tests mostly `test.todo(...)` plus checks that `schema.sql` loads and expected tables exist. No ORM, no migration tool.

## Rules

- Idempotent. Never overwrite an existing review note, requirement section, or test file. Only add new ones.
- One slide = one slug = one review note = one requirement section = one test file.
- Write skeletons and failing tests only. Never implement `src/`, `services/`, or `repositories/` logic — that's the user's practice.
- `node --test` must run the generated tests without import errors.
