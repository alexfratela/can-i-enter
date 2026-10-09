// Word lists the checks match against. Kept in one file on purpose: this is the whole
// "knowledge" of the tool, and a reader should be able to audit it in one sitting.
// Nothing here decides anything by itself - a match only makes a sentence a candidate
// quote, and the sentence itself is what the user is shown.

// Countries and territories that appear in hackathon exclusion clauses.
// 2026-09-23: collected from the four rules pages in fixtures/ plus the standard
// OFAC-comprehensive list; extend as new pages are read.
const PLACES = [
  'Afghanistan', 'Belarus', 'Brazil', 'Canada', 'China', 'Crimea', 'Cuba', 'Donetsk',
  'France', 'Germany', 'India', 'Iran', 'Iraq', 'Italy', 'Japan', 'Luhansk', 'Myanmar',
  'Netherlands', 'Nicaragua', 'North Korea', 'Pakistan', 'Quebec', 'Russia', 'Sudan',
  'Syria', 'Ukraine', 'United Kingdom', 'United States', 'Venezuela', 'Zimbabwe',
];

// Cues that a sentence is about who may NOT enter. These have to be strong: 2026-09-23
// the weaker cue 'residents of' matched a sentence about W-9 tax forms on the Build With
// AI rules page and was read as an exclusion list. A cue that only says "residents" says
// nothing about being barred.
const EXCLUSION_CUES = [
  'is not open to', 'are not open to', 'not open to', 'not eligible', 'ineligible',
  'are excluded', 'is excluded', 'excluding', 'prohibit', 'may not participate',
  'are barred', 'restricted from', 'are disqualified', 'are not permitted',
];

// Cues that a sentence states who MAY enter.
// Ordered strongest first: the student check quotes the first cue it can find, so the
// most explicit statement of who may enter wins over a vague one.
const INCLUSION_CUES = [
  'is open to', 'are open to', 'open categories', 'independent developers',
  'independent engineers', 'participants must be', 'eligible individuals',
  'anyone may', 'anyone can', 'who can participate', 'entrants may enter',
  'open to', 'eligibility',
];

// Student-restriction phrasings. A match means entry may be limited to students.
const STUDENT_RESTRICTIONS = [
  'students only', 'only students', 'must be a student', 'must be students',
  'must be currently enrolled', 'currently enrolled', 'open only to students',
  'open to students of', 'high school students only', 'enrolled in an accredited',
];

// Concrete equipment a rules page can demand. The generic word "hardware" is NOT here:
// it is too common in boilerplate to mean anything on its own.
const HARDWARE_ITEMS = [
  'gpu', 'graphics card', 'drone', 'depth camera', 'oak-d', 'raspberry pi', 'fpga',
  'vr headset', 'ar headset', 'smart glasses', 'smartwatch', 'wearable device',
  'robot', 'fire tv', 'alexa device', 'echo device', 'ring doorbell', '3d printer',
];

// Sentences stating a requirement to have something.
const REQUIREMENT_CUES = [
  'must own', 'must have', 'must provide', 'must use', 'requires', 'require a',
  'require an', 'required to own', 'need', 'needs', 'entrants will need',
];

// Words that make a requirement sentence be about equipment or tooling at all.
const KIT_WORDS = ['hardware', 'device', 'equipment', 'installed', 'machine', 'computer',
  'laptop', 'phone', 'headset', 'camera', 'sensor', 'board', 'developer tools'];

// Sentences that are conditional or permissive rather than a flat requirement.
const SOFTENERS = ['reserve the right', 'at their sole discretion', 'may choose', 'if the project'];

// What a submission must contain.
const DELIVERABLE_CUES = [
  'repositor', 'demonstration video', 'demo video', 'video portion', 'text description',
  'submission requirements', 'must include', 'provide a url', 'open source license',
];

module.exports = {
  PLACES, EXCLUSION_CUES, INCLUSION_CUES, STUDENT_RESTRICTIONS,
  HARDWARE_ITEMS, KIT_WORDS, REQUIREMENT_CUES, SOFTENERS, DELIVERABLE_CUES,
};
