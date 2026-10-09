#!/usr/bin/env node
// The test suite. Two things it exists to prove, above all:
//   1. a quote is never invented - every quote shown is a literal substring of the page;
//   2. silence in the rules is never read as permission.
// Run: node test/run.js

const fs = require('fs');
const path = require('path');
const { checkHtml, checkRecorded, checkUrl, quotesAreLiteral, FIXTURES } = require('../src/engine.js');

const ITALY = require('../profiles/oleksandr.json');
const BRAZIL = require('../profiles/brazil-builder.json');
const TODAY = '2026-09-23'; // 2026-09-23: the day the pages in fixtures/ were read; pinned so the deadline check is reproducible.

const read = (f) => fs.readFileSync(path.join(FIXTURES, f), 'utf8');
const find = (r, id) => r.findings.find((f) => f.id === id);

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed += 1; } catch (e) { failures.push(`${name}: ${e.message}`); }
}
function eq(actual, expected, what) {
  if (actual !== expected) throw new Error(`${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function ok(cond, what) { if (!cond) throw new Error(what); }

// --- the three verdicts, on real recorded pages ------------------------------
test('a clean page for an eligible person reads ELIGIBLE', () => {
  eq(checkRecorded('build-with-ai-basics', ITALY, TODAY).verdict, 'ELIGIBLE', 'verdict');
});

test('the same page BLOCKS a resident of an excluded country, and quotes the sentence', () => {
  const r = checkRecorded('build-with-ai-basics', BRAZIL, TODAY);
  eq(r.verdict, 'BLOCKED', 'verdict');
  const c = find(r, 'country');
  eq(c.status, 'BLOCK', 'country status');
  ok(/\bBrazil\b/.test(c.quote), 'the quote must name Brazil');
});

test('rules that mention country limits without listing them read UNCLEAR, not ELIGIBLE', () => {
  const r = checkRecorded('ieee-climatechain', ITALY, TODAY);
  eq(r.verdict, 'UNCLEAR', 'verdict');
  eq(find(r, 'country').status, 'UNKNOWN', 'country status');
  ok(/never list/i.test(find(r, 'country').note), 'the note must say the list is missing');
});

test('a page that never mentions countries says so in those words', () => {
  const c = find(checkRecorded('galuxium-nexus-v2', ITALY, TODAY), 'country');
  eq(c.status, 'UNKNOWN', 'country status');
  eq(c.quote, '', 'there is nothing to quote');
  eq(c.note, 'the rules do not say', 'note');
});

// --- the kernel: quotes are real, silence is not permission ------------------
test('every quote shown is a literal substring of the page it came from', () => {
  for (const id of ['build-with-ai-basics', 'ieee-climatechain', 'galuxium-nexus-v2', 'opencv-ai-2026']) {
    for (const profile of [ITALY, BRAZIL]) {
      const r = checkRecorded(id, profile, TODAY);
      const html = read(r.source.file);
      ok(quotesAreLiteral(html, r), `invented quote in ${id} for ${profile.country}`);
    }
  }
});

test('cut the excluded-countries paragraph out and the verdict stops being green', () => {
  const html = read('learn-ai-basics.rules.html');
  const before = checkHtml(html, ITALY, { name: 'x', url: 'x', readDate: TODAY }, TODAY);
  eq(before.verdict, 'ELIGIBLE', 'verdict before the cut');
  const cut = html.replace(/Individuals who are residents of[\s\S]*?Office of Foreign Assets Control\)/, '');
  const after = checkHtml(cut, ITALY, { name: 'x', url: 'x', readDate: TODAY }, TODAY);
  ok(after.verdict !== 'ELIGIBLE', 'the tool must not stay green once the clause is gone');
  eq(find(after, 'country').status, 'UNKNOWN', 'country status after the cut');
});

test('a page of pure boilerplate leaves every blocking check unknown', () => {
  const html = '<p>This is a hackathon. Have fun. Be excellent to each other.</p>';
  const r = checkHtml(html, ITALY, { name: 'x', url: 'x', readDate: TODAY }, TODAY);
  eq(r.verdict, 'UNCLEAR', 'verdict');
  for (const id of ['country', 'age', 'student', 'hardware', 'deadline']) {
    ok(find(r, id).status !== 'PASS', `${id} must not pass on silence`);
  }
});

// --- the individual checks ---------------------------------------------------
test('a deadline that has already passed blocks', () => {
  const r = checkRecorded('build-with-ai-basics', ITALY, '2026-11-01');
  eq(r.verdict, 'BLOCKED', 'verdict');
  const d = find(r, 'deadline');
  eq(d.status, 'BLOCK', 'deadline status');
  ok(/Closed 2026-10-26/.test(d.note), 'the note must give the date it closed');
});

test('"age of majority where you reside" is unknown for someone who might be under it', () => {
  const young = { ...ITALY, age: 19 };
  const a = find(checkRecorded('build-with-ai-basics', young, TODAY), 'age');
  eq(a.status, 'UNKNOWN', 'age status');
  ok(/age of majority/i.test(a.quote), 'the quote must be the deferral sentence');
});

test('a students-only rule blocks a non-student and clears a student', () => {
  const html = '<p>This hackathon is open only to students currently enrolled at an accredited university.</p>';
  const site = { name: 'x', url: 'x', readDate: TODAY };
  eq(find(checkHtml(html, ITALY, site, TODAY), 'student').status, 'BLOCK', 'non-student');
  eq(find(checkHtml(html, { ...ITALY, student: true }, site, TODAY), 'student').status, 'PASS', 'student');
});

test('hardware you do not own blocks; hardware you own does not', () => {
  const html = '<p>Participants must have a depth camera to take part in the vision track.</p>';
  const site = { name: 'x', url: 'x', readDate: TODAY };
  const blocked = find(checkHtml(html, ITALY, site, TODAY), 'hardware');
  eq(blocked.status, 'BLOCK', 'without the camera');
  ok(/depth camera/.test(blocked.note), 'the note must name the missing item');
  const owner = { ...ITALY, hardware: ['laptop', 'depth camera'] };
  eq(find(checkHtml(html, owner, site, TODAY), 'hardware').status, 'PASS', 'with the camera');
});

test('a failed fetch is reported, not papered over with a stale copy', async () => {
  let message = '';
  try {
    await checkUrl('http://127.0.0.1:9/nothing-here', ITALY, TODAY);
  } catch (e) { message = e.message; }
  ok(/Could not fetch/.test(message) && /Nothing was checked/.test(message), `expected a fetch failure, got "${message}"`);
});

// --- run ---------------------------------------------------------------------
(async () => {
  // the fetch test is the only asynchronous one; run it last and count it the same way.
  const asyncTests = [];
  for (const t of asyncTests) await t();

  let message = '';
  try { await checkUrl('http://127.0.0.1:9/nothing-here', ITALY, TODAY); } catch (e) { message = e.message; }
  if (!/Could not fetch/.test(message)) failures.push('failed fetch: expected an error, got none');

  console.log(`\n${passed} of ${passed + failures.length} checks passed`);
  if (failures.length) {
    console.log('\nFAILED:');
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log('all green\n');
})();
