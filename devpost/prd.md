---
doc: prd
status: draft
---

# Can I Enter? - Product Requirements

A checker that reads a hackathon's Official Rules and tells one specific person whether
they are allowed to enter, quoting the rules. For a solo builder deciding where to spend
a weekend. Source: `scope.md > Who It's For`.

## The Core Journey

1. They open the page. A profile form is already filled with the last profile they used
   (country, age, student or not, hardware they own). Source: `scope.md > The Core Loop`.
2. They pick one of the hackathons already on the page, or paste a rules URL.
3. They press **Check**.
4. Within a second they see one verdict word - `ELIGIBLE`, `BLOCKED`, or `UNCLEAR` - and
   under it one row per check: country, age, student status, hardware, deadline, what to
   hand in.
5. Each row carries the sentence from the rules that decided it, the link to the page, and
   the date that page was read. Rows the rules never addressed say so in those words.
6. Success is them closing the tab knowing either "I can enter, deadline is X" or "I
   cannot, here is the sentence that says so" - and being able to check that sentence.

## Screens and Layout

One page. Top: the profile form, six short fields on one line. Middle: the list of
hackathons with a Check button each, and a field to paste any other rules URL. Bottom, on
demand: the verdict card for the last check - verdict word, then the findings table.

A command-line surface mirrors it exactly: `node src/cli.js --all` prints the same
findings for every recorded hackathon, `--json` prints them machine-readably.

## Look and Feel

Plain, unexcited, close to a pharmacy leaflet (`scope.md > Inspiration & Identity`).
System font stack, generous line height, one accent colour per verdict state and nothing
else coloured. No logos, no animation, no hero image. Interface copy is flat and literal:
"The rules do not say", not "Hmm, we couldn't find that!".

## Features and Behavior

### The profile

Country of residence, age, student status, hardware owned, and how many hours a week they
have. Held in the browser's local storage and in `profiles/*.json` for the command line.
No account, no server-side storage.

### The six checks

- **Country** - is the user's country named in an exclusion list in the rules?
- **Age** - does the rules text set a minimum age, and does the user meet it?
- **Student status** - do the rules restrict entry to students or to a named school?
- **Hardware** - do the rules require hardware the user does not have?
- **Deadline** - when does the submission period end, and has it passed?
- **Deliverables** - what must be handed in (repository, video, description), so the user
  can price the work before starting.

Each check returns one of `PASS`, `BLOCK`, or `UNKNOWN`, plus the sentence it relied on.
A check that found nothing in the text returns `UNKNOWN` with an empty quote - never
`PASS`.

### The verdict

`BLOCKED` if any check blocks. Otherwise `UNCLEAR` if any check that can block is
`UNKNOWN`. Otherwise `ELIGIBLE`. The rule is stated on the page itself, so the user can
see why one amber row outranks four green ones.

- As a solo builder outside the United States, I want to know within seconds whether my
  country is excluded, so that I don't build for a weekend and then read the fine print.
  - [ ] Pasting a rules URL whose text names my country in an exclusion list returns
        `BLOCKED` and shows that sentence.
  - [ ] A rules page that never mentions countries returns `UNCLEAR` on that row, with the
        words "the rules do not say", and the overall verdict is not `ELIGIBLE`.
  - [ ] Every quote shown is a literal substring of the fetched page text.

## States and Boundaries

- **First use** - empty profile, the recorded hackathons already listed; checking without
  a profile still works and marks the person-dependent rows `UNKNOWN`.
- **Normal use** - verdict in under a second from a recorded page.
- **Network refused or a page that is not a rules page** - the tool says which fetch failed
  and checks nothing; it does not fall back to a stale copy silently.
- **Persistence** - only the profile, only locally. Nothing about the user leaves the machine.

## Product Decisions

- **Quotes over summaries** - a summary of a legal sentence is a new sentence; the user
  cannot check it. Tradeoff accepted: the output is longer and less pretty.
- **No language model anywhere in the checking path** - so the tool runs offline, free, and
  cannot invent a rule. Tradeoff accepted: it understands only the phrasings it was taught,
  and says `UNKNOWN` on the rest. That is the correct failure direction for this product.
- **`UNCLEAR` is a first-class answer** - it is the product, not a fallback.
- Assumption, not yet confirmed by Oleksandr: the six checks above are the right six. They
  come from the 2026-09-23 survey, where those were the questions that actually disqualified
  events.

## What We're Building

The one page, the command line, the six checks, three recorded rules pages plus live fetch,
and a test suite that proves a quote is never invented and silence is never read as
permission.

## Deferred From the POC

- Saved history of past checks - implies storage and identity.
- Team profiles - implies accounts.
- Listing-wide sweeps of a whole platform - implies rate limits and a crawl policy.

## Possible Later Enhancements

Watching a saved list for new eligible events. A second source of truth for platforms that
publish rules as a PDF. An export of the verdict as a one-page note for a teammate.

## Non-Goals

- **Not a hackathon discovery engine.** Devpost already lists them; this answers a question
  about one listing at a time.
- **Not legal advice.** It quotes a document; it does not interpret law, and it says so on
  the page.
- **Not a prize-money auditor.** Cut in scope, with a reason.

## Open Questions

1. Should a passed deadline alone make the verdict `BLOCKED`? Currently yes, since it ends
   the question - must be settled before `4-spec`. Resolved in spec: yes.
2. Should the live-fetch path cache pages on disk? Can wait; the POC keeps recorded pages
   in `fixtures/` with their read date instead.
