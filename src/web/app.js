// The page. It holds no opinions: it collects the profile, asks the server to run the
// checks, and renders the findings as they come back.

const $ = (sel) => document.querySelector(sel);
const PROFILE_KEY = 'can-i-enter.profile';

function readProfile() {
  const f = $('#profile');
  return {
    country: f.country.value.trim(),
    age: f.age.value === '' ? null : Number(f.age.value),
    student: f.student.value === 'yes',
    hardware: f.hardware.value.split(',').map((s) => s.trim()).filter(Boolean),
    hoursPerWeek: f.hours.value === '' ? null : Number(f.hours.value),
  };
}

function restoreProfile() {
  const f = $('#profile');
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    if (saved) {
      f.country.value = saved.country ?? '';
      f.age.value = saved.age ?? '';
      f.student.value = saved.student ? 'yes' : 'no';
      f.hardware.value = (saved.hardware || []).join(', ');
      f.hours.value = saved.hoursPerWeek ?? '';
    }
  } catch { /* a corrupt saved profile is not worth an error message; the defaults stand */ }
  if (!f.today.value) f.today.value = new Date().toISOString().slice(0, 10);
  f.addEventListener('input', () => localStorage.setItem(PROFILE_KEY, JSON.stringify(readProfile())));
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function renderFinding(f) {
  const quotes = [f.quote, ...(f.extraQuotes || [])].filter(Boolean);
  return `<div class="finding ${f.status}">
    <div><span class="q">${esc(f.question)}</span><span class="status">${f.status === 'PASS' ? 'clear' : f.status === 'BLOCK' ? 'blocker' : 'the rules do not say'}</span></div>
    ${f.note ? `<p class="note">${esc(f.note)}</p>` : ''}
    ${quotes.map((q) => `<blockquote>${esc(q)}</blockquote>`).join('')}
  </div>`;
}

function render(result) {
  const s = result.source;
  $('#out').innerHTML = `<div class="verdict">
    <div class="verdict-head">
      <div class="word ${result.verdict}">${result.verdict}</div>
      <div class="cite"><strong>${esc(s.name)}</strong> &mdash;
        <a href="${esc(s.url)}" target="_blank" rel="noreferrer">${esc(s.url)}</a><br>
        ${esc(s.origin || 'recorded copy')}, read ${esc(s.readDate)} &middot; checked ${esc(result.checkedOn)}
      </div>
    </div>
    ${result.findings.map(renderFinding).join('')}
    <p class="rule">${esc(result.verdictRule)}</p>
  </div>`;
}

async function check(payload) {
  $('#out').innerHTML = '<p class="sub">Checking…</p>';
  const f = $('#profile');
  const res = await fetch('/api/check', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...payload, profile: readProfile(), today: f.today.value || undefined }),
  });
  const data = await res.json();
  if (data.error) { $('#out').innerHTML = `<p class="error">${esc(data.error)}</p>`; return; }
  render(data);
}

async function loadSources() {
  const sources = await (await fetch('/api/sources')).json();
  $('#sources').innerHTML = sources.map((s) => `<li>
      <span><span class="src-name">${esc(s.name)}</span>
        <span class="src-meta">${esc(s.url)} &middot; read ${esc(s.readDate)}</span></span>
      <button type="button" data-id="${esc(s.id)}">Check</button>
    </li>`).join('');
  $('#sources').addEventListener('click', (e) => {
    const id = e.target.dataset && e.target.dataset.id;
    if (id) check({ id });
  });
}

$('#check-url').addEventListener('click', () => {
  const url = $('#url').value.trim();
  if (url) check({ url });
});

restoreProfile();
loadSources();
