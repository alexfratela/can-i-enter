---
doc: checklist
status: draft
---

# Build Checklist

Build mode: fast — the learner was not at the keyboard for this session; every slice was
verified mechanically and the verdicts are reproducible from `node test/run.js`.

## Slices

- [x] **1. You can check one saved rules page from the command line and read the quotes**
  Becomes usable: `node src/cli.js --id build-with-ai-basics` prints a verdict and six findings,
  each with the sentence it came from.
  Why now: it proves the whole path end to end — page in, sentences, checks, verdict, output —
  before any of it has a second surface to drift from.
  PRD ref: `prd.md > The Core Journey` (steps 3–5)
  Spec ref: `spec.md > Components` (`rules-text.js`, `checks.js`, `verdict.js`, `engine.js`, `cli.js`)
  Verify (mechanical): the command exits 0 and prints `VERDICT: ELIGIBLE` for the Italy profile.
  Commit: `Read a rules page and answer six questions with quotes`

- [x] **2. The same page answers a different person differently**
  Becomes usable: the Brazil profile on the same page returns `BLOCKED`, quoting the sentence
  that names Brazil.
  Why now: one page, two people, two answers is the shortest proof that the tool is reading the
  document rather than summarising the hackathon.
  PRD ref: `prd.md > The six checks` (country)
  Verify (mechanical): `test/run.js` — "the same page BLOCKS a resident of an excluded country".
  Commit: `Block on an excluded country and quote the clause`

- [x] **3. Silence is visible as silence**
  Becomes usable: pages that never mention countries, ages or deadlines come back `UNCLEAR`,
  with the words "the rules do not say" on the rows that had no answer.
  Why now: this is the kernel (`scope.md > The Unique Kernel`). Everything else is a
  summariser without it.
  Verify (mechanical): `test/run.js` — boilerplate page, and the Galuxium page's empty quote.
  Commit: `Never read silence as permission`

- [x] **4. Cutting the clause out changes the verdict**
  Becomes usable: delete the excluded-countries paragraph from the saved page and the verdict
  for the same person stops being green.
  Why now: it is the demo beat and the strongest single test — it proves the answer is produced
  from the document, not remembered.
  Verify (mechanical): `test/run.js` — "cut the excluded-countries paragraph out".
  Commit: `Degrade into honesty when the source loses the answer`

- [x] **5. The web page, same answers**
  Becomes usable: `node src/web/server.js`, a profile form, a Check button per recorded page, a
  URL field, and the verdict card with quotes and read dates.
  Why now: the video has to show something, and the page is how a non-programmer would use it.
  Spec ref: `spec.md > Components` (`web/server.js`, `web/app.js`)
  Verify (mechanical): `POST /api/check` returns the same verdict the command line prints for
  both profiles (checked 2026-09-23 on port 5177).
  Commit: `Add the local web surface`

- [x] **6. The tests say what is true**
  Becomes usable: `node test/run.js` — twelve checks, including "every quote is a literal
  substring of the page" across four pages and two profiles.
  Why now: the claim this project makes is falsifiable, so it should be falsified on demand.
  Verify (mechanical): 12 of 12 passed, and the suite goes red under each of nine deliberate
  sabotages applied to a throwaway copy of the project (one flipped check each), while an
  inert edit leaves it green.
  Commit: `Prove the quotes are real`

## Revisions

- **2026-09-23 — the cue `residents of` was wrong.** Slice 4 failed the first time it ran: after
  cutting the exclusion paragraph, the country check went green anyway, quoting a sentence about
  W-9 tax forms. A cue that only says "residents" carries no meaning about being barred. Removed
  from `src/vocabulary.js`; the slice-4 test is what caught it.
- **2026-09-23 — quotes that were headings.** The student check was quoting "3. Eligibility" and
  the hardware check was quoting a sentence about marketing opt-ins. Both were answers of the
  right shape and the wrong content. Quotes now need a minimum length and the hardware check
  requires the sentence to be about equipment at all.
