// The rules pages this tool ships with: what they are, where they came from, and the day
// the copy in fixtures/ was taken. The read date travels with every quote - a rules page
// can change, and a quote without a date is a claim about today that was true in September.

const RECORDED = [
  {
    id: 'build-with-ai-basics',
    name: 'Build With AI: Basics',
    url: 'https://learn-ai-basics.devpost.com/rules',
    file: 'learn-ai-basics.rules.html',
    readDate: '2026-09-23',
  },
  {
    id: 'ieee-climatechain',
    name: 'IEEE ClimateChain Hack',
    url: 'https://ieee-climatechain-hack.devpost.com/rules',
    file: 'ieee-climatechain-hack.rules.html',
    readDate: '2026-09-23',
  },
  {
    id: 'galuxium-nexus-v2',
    name: 'Galuxium Nexus V2',
    url: 'https://galuxium-nexus-v2-29411.devpost.com/rules',
    file: 'galuxium-nexus-v2-29411.rules.html',
    readDate: '2026-09-23',
  },
  {
    id: 'opencv-ai-2026',
    name: 'OpenCV AI Competition 2026',
    url: 'https://opencv-ai-competition-2026.devpost.com/rules',
    file: 'opencv26.rules.html',
    readDate: '2026-09-23',
  },
];

const byId = (id) => RECORDED.find((s) => s.id === id);

module.exports = { RECORDED, byId };
