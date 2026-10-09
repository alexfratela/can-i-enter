# Submission text — Can I Enter?

Written against the four equally weighted criteria in the Official Rules
(<https://learn-ai-basics.devpost.com/rules>, read 2026-09-23): **Design, Potential Impact,
Innovation/Idea, Presentation.** Nothing here has been posted anywhere.

---

## Tagline

Paste a hackathon's Official Rules and find out whether **you** may enter — quoting the rules,
sentence by sentence, and saying so plainly when they do not answer.

## Inspiration

We spent a working day reading the Official Rules of forty-odd open hackathons, by hand. The
most common reason to walk away was not a weak prize. It was a single sentence, eight sections
down, saying that someone like us could not enter: a country in an exclusion list, a
students-only clause that contradicted the marketing page, a piece of hardware we do not own.

The second thing we noticed was worse. When a rules page simply *doesn't say* — no country
clause at all, or "international participants, with country restrictions noted" and then no
list — it reads exactly like permission. It is not permission. It is the most expensive kind
of silence there is, and every summarising tool we could have reached for turns it into a
confident green sentence.

## What it does

You tell it once who you are: country of residence, age, student or not, hardware you own.
Then, for any hackathon, you press Check. Within a second you get one word — `ELIGIBLE`,
`BLOCKED`, or `UNCLEAR` — and under it six rows:

- **Is your country excluded?**
- **Are you old enough?**
- **Do you have to be a student?**
- **Do you need equipment you do not own?**
- **When does it close?**
- **What do you have to hand in?**

Every row carries the sentence from the Official Rules that decided it, the link to the page,
and the date that page was read. Rows the rules never addressed say, in those words, *"the
rules do not say"* — and one amber row outranks four green ones, by a rule printed on the page.

## The one idea

**It never decides what the rules do not say.**

Delete that and you have a generic summariser: confident, fast, and occasionally the reason
somebody spends three weekends building an entry they were never allowed to submit.

Two consequences follow, and both are visible in the product. There is no language model
anywhere in the checking path — a model is exactly the component that would produce a fluent
sentence that is not in the document. And `UNCLEAR` is rendered in the same size type as
`ELIGIBLE`, because a tool that whispers its uncertainty has not reported it.

## How to see that it is real

Three checks in the demo, all against Official Rules pages saved on 2026-09-23:

1. **Build With AI: Basics**, as a solo builder in Italy → `ELIGIBLE`, six green rows, each
   with its sentence.
2. **The same page**, as a builder resident in Brazil → `BLOCKED`, quoting
   *"…including, but not limited to, Brazil, Quebec, Russia, Crimea, Cuba, Iran, and North
   Korea…"*. One page, two people, two answers: the tool is reading the document, not
   remembering the hackathon.
3. **IEEE ClimateChain Hack**, same person → `UNCLEAR`, because the page says
   *"International participants (with country restrictions noted)"* and then never notes them.

And the beat that shows the kernel working: cut the excluded-countries paragraph out of the
first page and ask again as the eligible person. The verdict does not stay green. It turns
amber and says the rules no longer answer the question. The tool degrades into honesty rather
than into confidence — and that is a test in the suite, not a claim in a README.

## How we built it

Node.js, zero dependencies, no build step, no API key, runs offline. A page reader that strips
HTML down to sentences without altering a character inside them; one auditable file holding
every phrase the checks look for; six small checks; a verdict rule that is three lines long and
printed in the interface. A local web page and a command line call the same module, so they
cannot drift apart.

The planning came first, with the Devpost Learn Skill Pack: `devpost/scope.md`,
`devpost/prd.md` and `devpost/spec.md` are in the repository, and the build checklist records
what changed and why.

## Challenges we ran into

The honest ones, both caught by the test suite rather than by reading the code:

- A cue as innocent as `residents of` matched a sentence about **W-9 tax forms** and was read as
  a country exclusion list. The test that cuts the real exclusion paragraph out is what exposed
  it: the verdict stayed green with a quote about tax paperwork underneath. A weak cue does not
  produce a weak answer — it produces a confident wrong one.
- The checks were answering with headings. "3. Eligibility" is a true thing to quote and tells a
  user nothing. Quotes now have to carry their own meaning, and the hardware check has to be
  looking at a sentence that is about equipment at all.

## Accomplishments we're proud of

A tool whose central claim is falsifiable in one command: `node test/run.js` proves that every
quote it has ever shown is a literal substring of the page it came from, across four rules pages
and two profiles, and that a page of pure boilerplate never produces a green verdict.

## What we learned

That the useful failure direction has to be chosen deliberately. Everything in this build — no
model, quotes instead of summaries, amber as loud as green — is the same decision made five
times: when in doubt, be less helpful and more checkable.

## What's next

Watch a saved list and say when a newly opened hackathon is one you qualify for. Cover rules
pages that are not Devpost-shaped, which today produce more amber rows than they should. A
shareable verdict for a team deciding together.

## Built with

`node.js` · `html` · `css` · `javascript` · `devpost-learn-skill-pack` · `claude-code` ·
no dependencies · no api keys
