// One word out of the six findings, by a rule the page itself states, so a user can see
// why one amber row outranks four green ones. (prd.md > The verdict)

const { BLOCKING } = require('./checks.js');

const RULE = 'BLOCKED if any check blocks. Otherwise UNCLEAR if a check that can block is unknown. Otherwise ELIGIBLE.';

function verdictOf(findings) {
  const canBlock = findings.filter((f) => BLOCKING.includes(f.id));
  if (canBlock.some((f) => f.status === 'BLOCK')) return 'BLOCKED';
  if (canBlock.some((f) => f.status === 'UNKNOWN')) return 'UNCLEAR';
  return 'ELIGIBLE';
}

module.exports = { verdictOf, RULE };
