---
doc: spec
status: draft
---

# Can I Enter? — Technical Spec

## How This Works, In Plain Language

Three pieces, and none of them are clever.

The first piece takes a rules page — a file we saved on 2026-09-23, or one fetched live —
and strips the web page away until only the sentences are left. It never rewrites a word.
That matters: everything the tool shows you afterwards is one of those sentences, copied
whole.

The second piece is six small questions asked of that pile of sentences: is your country
excluded, are you old enough, do you have to be a student, do you need equipment you don't
own, when does it close, and what do you have to hand in. Each question looks for the
sentence that answers it and reports one of three things — clear, blocker, or *the rules do
not say*. The third answer is the one the product exists for.

The third piece turns six answers into one word, by a rule printed on the page itself: any
blocker means `BLOCKED`; otherwise any unanswered question that could have blocked you means
`UNCLEAR`; only if all of them are clear do you get `ELIGIBLE`.

There is no language model anywhere in this path (`prd.md > Product Decisions`). A model is
exactly the component that would produce a confident sentence that is not in the document,
and this tool's whole value is that it cannot do that. The cost is real and accepted: it
understands the phrasings in `src/vocabulary.js` and says "the rules do not say" about the
rest.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

1. They open `http://localhost:5173`. The profile form is filled from the browser's local
   storage — country, age, student, hardware, hours, and the date to check against.
2. They press **Check** on one of the recorded hackathons, or paste a rules URL.
3. `src/web/app.js` posts the profile and the choice to `POST /api/check`.
4. `src/web/server.js` hands it to `src/engine.js`, which reads the saved page from
   `fixtures/` (or fetches the URL) and calls `src/rules-text.js` → sentences.
5. `src/checks.js` runs the six checks over those sentences; `src/verdict.js` reduces them
   to one word.
6. The page renders the verdict, then one row per check: the question, what was decided,
   why, and the sentence it came from — with the source link and the date that page was read.
7. `node src/cli.js --all` walks the same path with no browser involved.

## Stack

- **Node.js 20+** (built and tested on v24.16.0) — <https://nodejs.org/docs>. Chosen because
  the hackathon's own entry instructions require Git and Node.js anyway, so the judges'
  machine already has it. Tradeoff accepted: no npm packages at all, so anything we want we
  write ourselves.
- **Zero dependencies.** `package.json` has no `dependencies` block. The HTTP server is
  `node:http`, the tests are a thirty-line runner in `test/run.js`, the live fetch is the
  built-in `fetch`. Tradeoff accepted: no test framework niceties.
- **Plain HTML, CSS and JavaScript** in `src/web/` — no build step, no bundler, no framework.
  The page is served by our own server so that it and the command line call exactly the same
  module.

Unverified and flagged: the live-fetch path works against any URL that returns HTML, but the
four recorded pages are the only ones it has been checked against. Devpost rules pages share
one template; other platforms will produce more `the rules do not say` answers, which is the
correct failure direction.

## Where It Runs and How Someone Tries It

Local process, two surfaces, no API keys and no accounts.

```
git clone <repo> && cd build_with_ai_basics
node --version        # needs 20 or newer
node test/run.js      # 12 of 12 checks passed
node src/web/server.js   # then open http://localhost:5173
node src/cli.js --all --today 2026-09-23
```

Nothing to install: there are no dependencies, so there is no `npm install` step. The demo
video is recorded from the local page (`docs/demo_script.md`). Deployment is deliberately not
part of this proof of concept — the submission needs a public repository and a video, and a
local run satisfies both.

## Look and Feel

Carried from `prd.md > Look and Feel`: a pharmacy leaflet. System font stack, generous line
height, one column, no logo, no animation. Colour is only ever a verdict: green for a cleared
check, red for a blocker, amber for silence in the source (`src/web/style.css`, `:root`).
Every quote is set as a blockquote so a reader can see at a glance which words are ours and
which are the document's. Interface copy is flat: "the rules do not say", never "Hmm, we
couldn't find that!".

## Components

### `src/rules-text.js` — the page reader
HTML in, sentences out. Strips scripts, styles and tags, decodes entities, splits lines into
sentence-sized quotes without changing a character inside them.
PRD ref: `prd.md > Product Decisions` (quotes over summaries).

### `src/vocabulary.js` — the word lists
Every phrase the checks look for, in one auditable file: places, exclusion cues, inclusion
cues, student restrictions, equipment names, requirement cues, deliverable cues. This is the
tool's entire knowledge; it holds no logic.

### `src/checks.js` — the six checks
One function per question. Each returns `PASS`, `BLOCK` or `UNKNOWN` plus the sentence it
relied on. A check that finds nothing returns `UNKNOWN` with an empty quote — never `PASS`.
PRD ref: `prd.md > The six checks`.

### `src/verdict.js` — the one word
Reduces six findings to `ELIGIBLE` / `UNCLEAR` / `BLOCKED` and exports the rule as text so the
interface can print it.
PRD ref: `prd.md > The verdict`.

### `src/sources.js` — the recorded pages
Id, name, URL, saved filename and read date for each page in `fixtures/`. The read date
travels with every quote.

### `src/engine.js` — the one entry point
`checkRecorded(id, profile, today)`, `checkUrl(url, profile, today)`, and
`quotesAreLiteral(html, result)` — the last one is what the test suite uses to prove no quote
was invented. Both surfaces call this module and nothing below it, so they cannot drift apart.

### `src/cli.js` — the command line
`--all`, `--id`, `--url`, `--profile`, `--today`, `--json`.

### `src/web/server.js` — the local server
Serves `src/web/` and two endpoints: `GET /api/sources`, `POST /api/check`. No dependencies.

### `src/web/app.js` + `index.html` + `style.css` — the page
Profile form, the list of recorded pages, a URL field, and the verdict card.

### `test/run.js` — the proof
Twelve checks, including the two that matter: every quote is a literal substring of the page,
and a page that says nothing never produces a green verdict.

## Data Model

- **Profile** — `{ country, age, student, hardware[], hoursPerWeek }`. Lives in the browser's
  `localStorage` under `can-i-enter.profile`, and in `profiles/*.json` for the command line.
  Never sent anywhere but to our own local process.
- **Source** — `{ id, name, url, file, readDate }` in `src/sources.js`.
- **Finding** — `{ id, question, status, quote, note, extraQuotes? }`.
- **Result** — `{ source, checkedOn, profile, verdict, verdictRule, findings[] }`. This is
  both the JSON the command line prints and the JSON the page renders; there is no second shape.

Nothing is persisted between runs except the profile, and that only on the user's own machine.

## File Structure

```
build_with_ai_basics/
├── README.md              # rules as read, what we submit, how to run it
├── LICENSE                # MIT - the rules require a detectable open source licence
├── package.json           # no dependencies; scripts for test, cli, web
├── devpost/               # Devpost Learn planning documents
│   ├── scope.md           # 2-scope
│   ├── prd.md             # 3-prd
│   ├── spec.md            # 4-spec (this file)
│   ├── checklist.md       # 5-build slices
│   └── learner-profile.md # 1-start (gitignored: personal context)
├── src/
│   ├── rules-text.js      # HTML -> quotable sentences
│   ├── vocabulary.js      # every phrase the checks look for
│   ├── checks.js          # the six checks
│   ├── verdict.js         # six findings -> one word
│   ├── sources.js         # recorded pages and their read dates
│   ├── engine.js          # the single entry point both surfaces use
│   ├── cli.js             # command line
│   └── web/
│       ├── server.js      # static files + /api/sources + /api/check
│       ├── index.html
│       ├── app.js
│       └── style.css
├── profiles/
│   ├── oleksandr.json     # solo builder in Italy
│   └── brazil-builder.json# same builder, excluded country - for the demo
├── fixtures/              # rules pages saved 2026-09-23, with their read dates
├── test/run.js            # the test suite
├── docs/
│   ├── demo_script.md     # the under-three-minute video, shot by shot
│   └── devpost.md         # the submission text
└── agent/skills/          # the Devpost Learn Skill Pack, as installed
```

## Decisions and Open Issues

- **Resolved in this spec:** a passed deadline alone makes the verdict `BLOCKED`
  (`prd.md > Open Questions` 1). It ends the question regardless of the other five rows.
- **Resolved:** the live-fetch path does not cache to disk. Recorded pages live in `fixtures/`
  with an explicit read date instead, so a quote can never be attributed to the wrong day.
- **The one useful unknown, and how it was settled.** The genuine uncertainty was how a check
  should behave when a rules page *gestures* at a restriction without stating it — IEEE
  ClimateChain says "International participants (with country restrictions noted)" and then
  never notes them. First instinct was to treat it like silence. It is not the same thing: the
  page is telling you a restriction exists. The check now returns `UNKNOWN` with a different
  note — "the rules mention country restrictions but never list them" — which is a stronger
  warning than plain silence, and `test/run.js` holds that distinction in place.
- **Found by the tests, not by review:** the cue `residents of` was matching a sentence about
  W-9 tax forms on the Build With AI page and reading it as an exclusion list. The cue was
  removed on 2026-09-23. A weak cue produces a confident wrong answer, which is the one
  failure this product cannot have.
- **Still open, for Oleksandr:** the name (`scope.md > Open Questions for Oleksandr` 1), and
  whether the cut prize-money meter stays cut.
