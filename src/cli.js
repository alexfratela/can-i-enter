#!/usr/bin/env node
// Command line surface. Mirrors the web page exactly - both call src/engine.js.
//
//   node src/cli.js --all
//   node src/cli.js --id build-with-ai-basics --profile profiles/oleksandr.json
//   node src/cli.js --url https://example.devpost.com/rules
//   add --json for machine-readable output, --today YYYY-MM-DD to pin the date

const fs = require('fs');
const path = require('path');
const { checkRecorded, checkUrl, todayISO } = require('./engine.js');
const { RECORDED } = require('./sources.js');

function parseArgs(argv) {
  const out = { profile: 'profiles/oleksandr.json', today: todayISO() };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--all') out.all = true;
    else if (a === '--json') out.json = true;
    else if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--id') out.id = argv[++i];
    else if (a === '--url') out.url = argv[++i];
    else if (a === '--profile') out.profile = argv[++i];
    else if (a === '--today') out.today = argv[++i];
    else throw new Error(`Unknown argument: ${a}`);
  }
  return out;
}

const HELP = `Can I Enter? - read a hackathon's Official Rules and say whether you may enter.

  --all                 check every recorded rules page
  --id <id>             check one recorded page (${RECORDED.map((s) => s.id).join(', ')})
  --url <url>           fetch and check a live rules page
  --profile <file>      profile JSON (default profiles/oleksandr.json)
  --today YYYY-MM-DD    pin the date used for the deadline check
  --json                print the findings as JSON
`;

const MARK = { PASS: '[ok]  ', BLOCK: '[stop]', UNKNOWN: '[?]   ' };

function print(result) {
  const p = result.profile;
  console.log(`\n${result.source.name}`);
  console.log(`  ${result.source.url}`);
  console.log(`  ${result.source.origin || 'recorded copy'}, read ${result.source.readDate} - checked ${result.checkedOn}`);
  console.log(`  profile: ${p.country || 'no country'}, age ${p.age ?? '?'}, ${p.student ? 'student' : 'not a student'}`);
  console.log(`\n  VERDICT: ${result.verdict}`);
  for (const f of result.findings) {
    console.log(`\n  ${MARK[f.status]} ${f.question}`);
    if (f.note) console.log(`         ${f.note}`);
    if (f.quote) console.log(`         "${f.quote}"`);
    for (const q of f.extraQuotes || []) console.log(`         "${q}"`);
  }
  console.log(`\n  Rule: ${result.verdictRule}`);
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
  if (args.help || (!args.all && !args.id && !args.url)) {
    console.log(HELP);
    return;
  }
  const profile = JSON.parse(fs.readFileSync(path.resolve(args.profile), 'utf8'));
  const results = [];
  try {
    if (args.url) results.push(await checkUrl(args.url, profile, args.today));
    else if (args.id) results.push(checkRecorded(args.id, profile, args.today));
    else for (const s of RECORDED) results.push(checkRecorded(s.id, profile, args.today));
  } catch (e) {
    console.error(`\n  ${e.message}\n`);
    process.exit(1);
  }
  if (args.json) console.log(JSON.stringify(results, null, 2));
  else results.forEach(print);
}

main();
