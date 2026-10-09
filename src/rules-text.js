// Turns a saved or fetched rules page into plain sentences we can quote verbatim.
// Everything downstream quotes these strings, so this file must never rewrite words:
// it only strips markup and whitespace.

const BLOCK_TAGS = /<\/?(p|div|li|tr|br|h[1-6]|section|article|td|th|ul|ol|table)\b[^>]*>/gi;

const ENTITIES = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#39;': "'", '&apos;': "'", '&#8217;': '’', '&rsquo;': '’',
  '&lsquo;': '‘', '&ldquo;': '“', '&rdquo;': '”',
  '&mdash;': '—', '&ndash;': '–', '&#169;': '©', '&hellip;': '…',
};

function decode(s) {
  return s
    .replace(/&[a-zA-Z#0-9]+;/g, (m) => (m in ENTITIES ? ENTITIES[m] : m))
    .replace(/ /g, ' ');
}

/** HTML -> array of text lines, in document order, markup removed. */
function toLines(html) {
  const stripped = String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(BLOCK_TAGS, '\n')
    .replace(/<[^>]+>/g, ' ');
  return decode(stripped)
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter((l) => l.length > 0);
}

/** HTML -> one flat text blob (lines joined by newline). */
function toText(html) {
  return toLines(html).join('\n');
}

// Abbreviations whose full stop does not end a sentence. 2026-09-23: taken from the
// four rules pages in fixtures/ - these are the ones that actually appear there.
const ABBREV = /(?:\b(?:Inc|Ltd|LLC|Corp|Co|St|No|Mr|Mrs|Ms|Dr|U\.S|e\.g|i\.e|a\.m|p\.m|Sec|Art|approx|vs)\.)$/i;

/**
 * Split a rules page into quotable sentences.
 * A "sentence" here is a line, or a sentence-sized piece of a long line: the quotes we
 * show a user have to be short enough to read and long enough to carry their own meaning.
 */
function toSentences(html) {
  const out = [];
  for (const line of toLines(html)) {
    let buf = '';
    const parts = line.split(/(?<=[.!?;:])\s+/);
    for (const part of parts) {
      buf = buf ? `${buf} ${part}` : part;
      const ends = /[.!?]$/.test(buf) && !ABBREV.test(buf);
      if (ends && buf.length > 25) {
        out.push(buf.trim());
        buf = '';
      }
    }
    if (buf.trim()) out.push(buf.trim());
  }
  return out.filter((s) => s.length >= 3);
}

module.exports = { toLines, toText, toSentences, decode };
