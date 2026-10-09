# Demo video — shot list and narration

**Length budget: under three minutes** (the rules say *"should be less than three (3) minutes.
Judges are not required to watch beyond three minutes"*). Narration below is written to be read
at a normal pace — every line beginning with `>` is spoken; the rest is what is on screen.

No face and no voice of the author are needed: a synthesised read of the narration is fine.
Screen recording only, local, at 1280×720 or larger, with the browser zoomed so the quotes are
readable.

**Before recording:** `node test/run.js` (green), then `node src/web/server.js`, and open
<http://localhost:5173>. Set the "Today" field to 2026-09-23 so the deadline row is stable.

---

## 0:00 – 0:18 · The problem, on the actual page

*Screen: the Build With AI rules page at learn-ai-basics.devpost.com/rules, scrolling fast
through section 3, Eligibility.*

> Before you spend three weekends on a hackathon, one question matters more than the prize:
> are you allowed to enter at all? The answer is in here — eight sections down, in a sentence
> that names seven countries. Most people never find it.

## 0:18 – 0:50 · One profile, one check, six answers

*Screen: our page. Profile already filled — Italy, 40, not a student, laptop. Press Check on
"Build With AI: Basics". The verdict card appears.*

> This is Can I Enter. I tell it once who I am. It reads the Official Rules and answers six
> questions: my country, my age, student status, equipment, the deadline, and what I have to
> hand in. ELIGIBLE. And under every green row, the sentence from the rules that decided it,
> with a link and the date the page was read. Nothing here is a summary. Every line is their
> words.

## 0:50 – 1:20 · Same page, different person

*Screen: change Country to Brazil. Press Check again. The card turns red.*

> Same rules page, different person. Brazil. BLOCKED — and there is the sentence, naming Brazil
> in the exclusion clause. That is fifteen minutes of scrolling, answered in a second, and I can
> check it myself because the quote is right there.

## 1:20 – 1:50 · The answer the product exists for

*Screen: press Check on "IEEE ClimateChain Hack". The card is amber.*

> Now a page that is not so tidy. It says international participants are welcome — with country
> restrictions noted. And then it never notes them. A summariser would call that eligible. This
> says UNCLEAR: the rules mention country restrictions but never list them. Amber is not a
> failure state here. It is the product.

## 1:50 – 2:25 · Cut the clause out and watch it degrade into honesty

*Screen: terminal. Run `node test/run.js`, let the twelve checks pass, then highlight the line
"cut the excluded-countries paragraph out and the verdict stops being green".*

> Here is the test I care about. Take the rules page, delete the excluded-countries paragraph,
> and ask again as the same eligible person. The verdict does not stay green. It goes amber and
> says the rules no longer answer the question. It cannot invent the sentence, because there is
> no model in the checking path — only their text, and six small questions asked of it.

## 2:25 – 2:50 · What is in the repository

*Screen: the repository tree — devpost/scope.md, prd.md, spec.md, then test/run.js output.*

> Built with the Devpost Learn Skill Pack: scope, PRD and spec are in the repository, and the
> spec records the two things the tests found that review missed. Twelve checks, no
> dependencies, one command to run. Can I Enter — it quotes the rules, and it never answers
> what they do not say.
