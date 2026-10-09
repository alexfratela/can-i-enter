---
doc: scope
status: draft
---

# Can I Enter?

One line: paste a hackathon's Official Rules link, and it tells you whether *you* are
allowed to enter - quoting the rules back at you, sentence by sentence.

## The Unique Kernel

It never decides what the rules do not say.

Every line of its answer is a literal sentence lifted from the Official Rules page, with
the link and the date the page was read. When the rules are silent on something that
matters to you - your country, your age, whether you have to be a student - the answer is
not a guess dressed as a fact. It is `UNCLEAR`, in the same size type as `ELIGIBLE`, with
the note "the rules do not say" and the place to go ask.

Delete that and you have a generic summariser: confident, fast, and occasionally the
reason someone spends three weekends building an entry they were never allowed to submit.

## Who It's For

A solo builder in Italy with a full-time job and two free evenings a week. They open a
hackathon listing, see a prize, and want to know one thing before they spend a single
evening: am I allowed in?

Today they do it by hand. They open the Official Rules tab, scroll past eight sections of
sweepstakes boilerplate, hunt for the excluded-countries sentence, hunt again for a
student-only clause that contradicts the marketing page, and give up somewhere in the
middle. On 2026-09-23 we did exactly this for forty-odd open hackathons; it took a working
day, and the single most common finding was not "bad prize" but "you personally cannot
enter this".

## The Core Loop

They set their profile once - country, age, student or not, hardware they own. Then, for
each hackathon they are curious about: paste the rules URL, press check, read a verdict
with its quotes. Three seconds instead of fifteen minutes.

They come back because there is always another listing, and because the answer is
checkable: the quote is right there, and the link goes to the page it came from.

## Inspiration & Identity

- The tone of a good pharmacy leaflet: plain, specific, unexcited.
- Colour used only to carry meaning - green for a cleared check, red for a blocker, amber
  for silence in the source. Never for decoration.
- Reference: the Devpost rules page itself (https://learn-ai-basics.devpost.com/rules) -
  the product's job is to make that page answerable, not to replace reading it.

## Why This Matters to the Learner

Oleksandr's rule for the whole workshop is "first-hand sources, quoted, with the date they
were read; anything else is retelling". This project is that rule made into a product for
somebody else. It is also a tool the workshop needs for its own hackathon queue.

## What "Working" Looks Like

Three hackathons, checked against their real rules pages, giving three different verdicts:
one clean `ELIGIBLE`, one `BLOCKED` with the exact excluded-country sentence quoted, and
one `UNCLEAR` where the rules genuinely never mention countries at all.

The "oh, that's cool" beat: cut the excluded-countries paragraph out of a rules page and
run it again. The verdict does not stay green. It turns amber and says the rules no longer
answer the question. The tool degrades into honesty rather than into confidence.

## The POC Boundary

In: a saved profile, a set of rules pages read from disk (recorded on 2026-09-23) plus a
live fetch by URL, six checks (country, age, student status, hardware, deadline, what you
must hand in), a web page, and a command-line run.

Out of the POC: accounts, notifications, a database, scraping a whole listing site,
anything that needs an API key.

## Later

- Watch a saved list of hackathons and tell the user when a new one they qualify for opens.
- Cover the other three platforms the workshop tracks, not only Devpost-shaped rules pages.
- A shareable verdict link for teams deciding together.

## Explicitly Cut

- **A language model in the checking path** - it is exactly what would invent the quote
  this product exists to prevent. Also: no key, no cost, runs offline.
- **A prize-money truth meter** (advertised versus real cash). It is real - the same day's
  survey found $233k advertised against roughly $13k in actual cash - but it is a second
  product, and aiming it at the listings of the people judging this one is a choice to make
  deliberately, not by accident.
- **Automatic profile detection from an IP address.** Residency is a legal question, not a
  geolocation guess.

## Open Questions for Oleksandr

1. Is "Can I Enter?" the name he wants on it publicly?
2. The cut above (no prize-money meter) is his call, not the agent's - it was decided here
   on the reasoning that the judges are Devpost staff and the product should help their
   users rather than audit their listings.
