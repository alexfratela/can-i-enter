// Ties the pieces together: get a rules page (from disk or from the network), turn it into
// sentences, run the six checks, add the verdict. The command line and the web page both
// call this and nothing else, so they cannot drift apart.

const fs = require('fs');
const path = require('path');
const { toSentences, toText } = require('./rules-text.js');
const { runChecks } = require('./checks.js');
const { verdictOf, RULE } = require('./verdict.js');
const { byId } = require('./sources.js');

const FIXTURES = path.join(__dirname, '..', 'fixtures');

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Check an already-fetched page. `source` carries name/url/readDate for the citation. */
function checkHtml(html, profile, source, today = todayISO()) {
  const sentences = toSentences(html);
  const findings = runChecks(sentences, profile, today);
  return {
    source,
    checkedOn: today,
    profile: { country: profile.country, age: profile.age, student: profile.student, hardware: profile.hardware },
    verdict: verdictOf(findings),
    verdictRule: RULE,
    findings,
  };
}

/** Check one of the recorded pages in fixtures/. */
function checkRecorded(id, profile, today = todayISO()) {
  const source = byId(id);
  if (!source) throw new Error(`No recorded rules page with id "${id}"`);
  const html = fs.readFileSync(path.join(FIXTURES, source.file), 'utf8');
  return checkHtml(html, profile, { ...source, origin: 'recorded copy' }, today);
}

/** Check a live URL. No cache, no silent fallback: a failed fetch is reported as a failure. */
async function checkUrl(url, profile, today = todayISO()) {
  let res;
  try {
    res = await fetch(url, { headers: { 'user-agent': 'Can-I-Enter/0.1 (hackathon eligibility checker)' } });
  } catch (e) {
    throw new Error(`Could not fetch ${url}: ${e.message}. Nothing was checked.`);
  }
  if (!res.ok) throw new Error(`Could not fetch ${url}: HTTP ${res.status}. Nothing was checked.`);
  const html = await res.text();
  const source = { id: 'live', name: url, url, readDate: today, origin: 'live fetch' };
  return checkHtml(html, profile, source, today);
}

/** Every quote must be a literal substring of the page text. This is what makes it checkable. */
function quotesAreLiteral(html, result) {
  const text = toText(html);
  const quotes = result.findings.flatMap((f) => [f.quote, ...(f.extraQuotes || [])]).filter(Boolean);
  return quotes.every((q) => text.includes(q));
}

module.exports = { checkHtml, checkRecorded, checkUrl, quotesAreLiteral, todayISO, FIXTURES };
