// The six checks. Each one reads the sentences of a rules page and returns a finding:
// PASS, BLOCK or UNKNOWN, plus the sentence it relied on, word for word.
//
// The one rule every check obeys: a check that found nothing in the text returns UNKNOWN
// with an empty quote - never PASS. Silence in the source is never read as permission.
// (prd.md > The six checks)

const V = require('./vocabulary.js');

// 2026-09-23: 21 is the highest age of majority used by any jurisdiction we could find
// (several US states, Egypt). Above it, "the age of majority where you reside" resolves
// to "yes" everywhere, so the deferral can be answered without knowing the country's law.
const MAX_AGE_OF_MAJORITY = 21;

// Cues that a sentence is cancelling a restriction rather than imposing one.
const OVERRIDE_CUES = ['overridden', 'legacy artifact', 'does not apply', 'no longer applies'];

const has = (s, list) => list.some((c) => s.toLowerCase().includes(c));
const findPlaces = (s) => V.PLACES.filter((p) => new RegExp(`\\b${p}\\b`, 'i').test(s));

function finding(id, question, status, quote, note) {
  return { id, question, status, quote: quote || '', note: note || '' };
}

const SILENT = 'the rules do not say';

// --- 1. country -------------------------------------------------------------
function checkCountry(sentences, profile) {
  const q = 'Is your country excluded?';
  const exclusions = sentences.filter((s) => has(s, V.EXCLUSION_CUES) && findPlaces(s).length > 0);
  if (profile.country) {
    const blocking = exclusions.find((s) => findPlaces(s).some((p) => p.toLowerCase() === profile.country.toLowerCase()));
    if (blocking) return finding('country', q, 'BLOCK', blocking, `${profile.country} is named in an exclusion clause.`);
  }
  if (exclusions.length > 0) {
    const note = profile.country
      ? `${profile.country} is not named in the exclusion clause.`
      : 'No country in the profile; the exclusion clause is shown as found.';
    return finding('country', q, profile.country ? 'PASS' : 'UNKNOWN', exclusions[0], note);
  }
  // The page gestures at country limits without naming any: the honest answer is neither.
  const gestures = sentences.find((s) => /\bcountry restrictions?\b|\bgeographic restrictions?\b/i.test(s));
  if (gestures) return finding('country', q, 'UNKNOWN', gestures, 'The rules mention country restrictions but never list them.');
  return finding('country', q, 'UNKNOWN', '', SILENT);
}

// --- 2. age -----------------------------------------------------------------
function ageFloor(sentence) {
  const m = sentence.match(/at least (\d{1,2})\s*(?:\(\d{1,2}\)\s*)?years?(?: of age| old)?|\bbe (\d{1,2}) years of age or older|\bages? (\d{1,2})\s*(?:\+|and (?:up|older))/i);
  if (!m) return null;
  const n = Number(m[1] || m[2] || m[3]);
  return Number.isFinite(n) && n > 0 && n < 100 ? n : null;
}

function checkAge(sentences, profile) {
  const q = 'Are you old enough?';
  const numeric = sentences.map((s) => [s, ageFloor(s)]).find(([, n]) => n !== null);
  if (numeric) {
    const [s, n] = numeric;
    if (profile.age === undefined || profile.age === null) return finding('age', q, 'UNKNOWN', s, 'No age in the profile.');
    return profile.age >= n
      ? finding('age', q, 'PASS', s, `You are ${profile.age}; the floor is ${n}.`)
      : finding('age', q, 'BLOCK', s, `You are ${profile.age}; the floor is ${n}.`);
  }
  const majority = sentences.find((s) => /age of majority/i.test(s));
  if (majority) {
    if (profile.age === undefined || profile.age === null) return finding('age', q, 'UNKNOWN', majority, 'No age in the profile.');
    if (profile.age >= MAX_AGE_OF_MAJORITY) {
      return finding('age', q, 'PASS', majority, `You are ${profile.age}, above the age of majority in every jurisdiction (highest is ${MAX_AGE_OF_MAJORITY}).`);
    }
    return finding('age', q, 'UNKNOWN', majority, `The rules defer to the law where you live; check the age of majority in ${profile.country || 'your country'}.`);
  }
  return finding('age', q, 'UNKNOWN', '', SILENT);
}

// A quote has to carry its own meaning: a bare heading ("3. Eligibility") tells the user
// nothing. We look for the sentence that actually states who may enter, strongest cue first.
// 2026-09-23: 25 characters is the shortest genuinely informative line in the four pages
// in fixtures/ ("The Hackathon IS open to:"); anything shorter there was a heading.
const MIN_QUOTE = 25;

function bestScopeSentence(sentences) {
  for (const cue of V.INCLUSION_CUES) {
    const hit = sentences.find((s) => s.toLowerCase().includes(cue) && s.length >= MIN_QUOTE);
    if (hit) return hit;
  }
  return null;
}

// --- 3. student status ------------------------------------------------------
function checkStudent(sentences, profile) {
  const q = 'Do you have to be a student?';
  const mentions = sentences.filter((s) => has(s, V.STUDENT_RESTRICTIONS));
  const overridden = mentions.find((s) => has(s, OVERRIDE_CUES));
  const restricting = mentions.find((s) => !has(s, OVERRIDE_CUES));
  if (restricting) {
    return profile.student
      ? finding('student', q, 'PASS', restricting, 'The rules restrict entry to students, and you are one.')
      : finding('student', q, 'BLOCK', restricting, 'The rules restrict entry to students.');
  }
  if (overridden) return finding('student', q, 'PASS', overridden, 'The rules cancel the students-only label.');
  const scope = bestScopeSentence(sentences);
  if (scope) return finding('student', q, 'PASS', scope, 'The rules state who may enter and do not limit entry to students.');
  return finding('student', q, 'UNKNOWN', '', SILENT);
}

// --- 4. hardware ------------------------------------------------------------
function checkHardware(sentences, profile) {
  const q = 'Do you need hardware you do not have?';
  const owned = (profile.hardware || []).map((h) => h.toLowerCase());
  const demands = sentences.filter((s) => has(s, V.REQUIREMENT_CUES) && !has(s, V.SOFTENERS));
  for (const s of demands) {
    const items = V.HARDWARE_ITEMS.filter((i) => s.toLowerCase().includes(i));
    const missing = items.filter((i) => !owned.some((o) => o.includes(i) || i.includes(o)));
    if (missing.length > 0) return finding('hardware', q, 'BLOCK', s, `Required and not in your profile: ${missing.join(', ')}.`);
  }
  // A requirement sentence only answers this question if it is about equipment or tools at
  // all. "Marketing requires an opt-in" is a requirement, and it is not an answer about a GPU.
  const aboutKit = demands.find((s) => V.KIT_WORDS.some((w) => s.toLowerCase().includes(w)));
  if (aboutKit) return finding('hardware', q, 'PASS', aboutKit, 'The stated requirements name no equipment you lack.');
  return finding('hardware', q, 'UNKNOWN', '', 'the rules name no equipment you must own');
}

// --- 5. deadline ------------------------------------------------------------
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july',
  'august', 'september', 'october', 'november', 'december'];

function datesIn(sentence) {
  const re = /\b([A-Z][a-z]{2,8})\.?\s+(\d{1,2}),?\s+(\d{4})\b/g;
  const out = [];
  let m;
  while ((m = re.exec(sentence)) !== null) {
    const idx = MONTHS.findIndex((x) => x.startsWith(m[1].toLowerCase()));
    if (idx >= 0) out.push({ iso: `${m[3]}-${String(idx + 1).padStart(2, '0')}-${String(Number(m[2])).padStart(2, '0')}` });
  }
  return out;
}

function checkDeadline(sentences, profile, today) {
  const q = 'When does it close?';
  const candidates = sentences.filter((s) => /submission period|^deadline\b|\bdeadline:/i.test(s));
  for (const s of candidates) {
    const dates = datesIn(s);
    if (dates.length > 0) {
      const last = dates[dates.length - 1].iso;
      const days = Math.round((Date.parse(`${last}T23:59:59Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
      return days >= 0
        ? finding('deadline', q, 'PASS', s, `Closes ${last} - ${days} day(s) from ${today}.`)
        : finding('deadline', q, 'BLOCK', s, `Closed ${last}, ${-days} day(s) before ${today}.`);
    }
  }
  const mentioned = sentences.find((s) => /deadline/i.test(s));
  if (mentioned) return finding('deadline', q, 'UNKNOWN', mentioned, 'A deadline is mentioned but no date is given on this page.');
  return finding('deadline', q, 'UNKNOWN', '', SILENT);
}

// --- 6. deliverables (informational: never blocks) ---------------------------
function checkDeliverables(sentences) {
  const q = 'What do you have to hand in?';
  const found = sentences.filter((s) => has(s, V.DELIVERABLE_CUES) && s.length >= MIN_QUOTE).slice(0, 4);
  if (found.length === 0) return finding('deliverables', q, 'UNKNOWN', '', SILENT);
  const f = finding('deliverables', q, 'PASS', found[0], `${found.length} sentence(s) describe what a submission must contain.`);
  f.extraQuotes = found.slice(1);
  return f;
}

// Which checks are allowed to stop you. "deliverables" is not one of them.
const BLOCKING = ['country', 'age', 'student', 'hardware', 'deadline'];

function runChecks(sentences, profile, today) {
  return [
    checkCountry(sentences, profile),
    checkAge(sentences, profile),
    checkStudent(sentences, profile),
    checkHardware(sentences, profile),
    checkDeadline(sentences, profile, today),
    checkDeliverables(sentences),
  ];
}

module.exports = { runChecks, BLOCKING, MAX_AGE_OF_MAJORITY, SILENT, datesIn, ageFloor };
