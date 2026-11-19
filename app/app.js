// Leonida Trophy Atlas: checklist, tracker, roadmap and spoiler shield for the 55 GTA VI trophies.
// All data lives in data/trophies.json, fetched from this app's own folder. Progress lives in
// localStorage and can be exported to a file and imported back. No network request is ever made.
const EARNED_KEY = 'leonida-trophy-atlas-earned-v1';
const SPOILER_KEY = 'leonida-trophy-atlas-spoiler-v1';

const STAGES = [
  { n: 1, title: 'Stage 1 — Play the story', text: 'Chapters 1 to 4, the final mission, and every named mission trophy. They all pop on their own as the story advances.' },
  { n: 2, title: 'Stage 2 — Strangers and contacts', text: 'The eight strangers strands and the five contact mission lines (Andy, Kenton, Billy, Randy, Tyrone).' },
  { n: 3, title: 'Stage 3 — Activities sampler', text: 'Stunts, the shooting range, drone races, races, fishing, the arcade, meditation, hunting and the one-off event trophies.' },
  { n: 4, title: 'Stage 4 — Heists and heat', text: 'Bank vaults, the armored truck, the jewelry store, the illegal operations and the partner heat trophies.' },
  { n: 5, title: 'Stage 5 — Collectibles and exploration', text: 'Card sets, WAiNK photo spots, vehicle discovery, the whole map, garages and the Scooter Bros app.' },
  { n: 6, title: 'Stage 6 — Money and cleanup', text: 'Challenges, laundering, spending, the 100% completion gold, and the platinum itself.' },
];

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const detailEl = $('detailPanel');
const params = new URLSearchParams(location.search);

let earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]'));
let spoiler = (localStorage.getItem(SPOILER_KEY) ?? '0') === '1';
if (params.get('spoiler') === '1') spoiler = true;
let kind = params.get('kind') ?? 'all';
if (params.get('missable') === '1') kind = 'missable';
let grade = params.get('grade') ?? 'all';
let status = 'all';
let query = '';
let selectedId = Number(params.get('trophy') ?? 0) || null;
let showRoadmap = params.get('view') === 'roadmap';

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

function saveEarned() { localStorage.setItem(EARNED_KEY, JSON.stringify([...earned])); }
function saveSpoiler() { localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0'); }

function isHidden(t) { return t.hidden && spoiler && !earned.has(t.id); }
function displayName(t) { return isHidden(t) ? 'Hidden trophy' : t.name; }
function displayDesc(t) { return isHidden(t) ? 'Hidden on PlayStation until earned. Tick it off here once it pops to reveal it.' : t.description; }

function filtered() {
  const q = query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kind === 'missable' && !t.missable) return false;
    if (kind === 'online') return false; // No online trophies: all 55 are single-player.
    if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (status === 'earned' && !earned.has(t.id)) return false;
    if (status === 'unearned' && earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function gradeWord(g) { return g[0].toUpperCase() + g.slice(1); }

function renderProgress() {
  $('earnedCount').textContent = earned.size;
  $('progressFill').style.width = (earned.size / trophies.length * 100).toFixed(1) + '%';
  $('progressSub').textContent = earned.size === trophies.length
    ? 'Platinum earned — you are a Leonida Legend.'
    : (trophies.length - earned.size) + ' to go until the platinum';
  const counts = {};
  for (const t of trophies) counts[t.grade] = (counts[t.grade] ?? 0) + (earned.has(t.id) ? 1 : 0);
  const totals = {};
  for (const t of trophies) totals[t.grade] = (totals[t.grade] ?? 0) + 1;
  $('gradeChips').innerHTML = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `<span><b>${counts[g] ?? 0}/${totals[g]}</b> ${gradeWord(g)}</span>`).join('');
}

function renderList() {
  const rows = filtered();
  $('listMeta').textContent = `Showing ${rows.length} of ${trophies.length} trophies` +
    (kind === 'online' ? ' — there are no online trophies: all 55 are single-player.' : '');
  $('emptyNote').hidden = rows.length > 0;
  listEl.replaceChildren();
  for (const t of rows) {
    const li = document.createElement('li');
    li.className = `grade-${t.grade}` + (earned.has(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      saveEarned();
      renderProgress();
      renderList();
      renderDetail();
    });
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 't-name';
    name.textContent = displayName(t);
    const desc = document.createElement('div');
    desc.className = 't-desc';
    desc.textContent = displayDesc(t);
    const tags = document.createElement('div');
    tags.className = 't-tags';
    const tagBits = [`<span class="tag">${t.kind}</span>`, `<span class="tag">Stage ${t.roadmap}</span>`];
    if (t.hidden) tagBits.push('<span class="tag hidden-tag">Hidden</span>');
    if (t.missable) tagBits.push('<span class="tag missable">Missable</span>');
    tags.innerHTML = tagBits.join('');
    body.append(name, desc, tags);
    const gl = document.createElement('span');
    gl.className = 'grade-label';
    gl.innerHTML = `<span class="grade-dot"></span>${gradeWord(t.grade)}`;
    li.append(box, body, gl);
    li.addEventListener('click', (ev) => {
      if (ev.target === box) return;
      selectedId = t.id;
      renderList();
      renderDetail();
    });
    listEl.append(li);
  }
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId) ?? trophies[0];
  if (!t) { detailEl.innerHTML = '<p class="detail-empty">Pick a trophy to see its guide.</p>'; return; }
  selectedId = t.id;
  // Spoiler shield: an unearned hidden trophy shows nothing of its guide, steps or sources
  // until it is earned — otherwise the shield would leak the very story it hides.
  if (isHidden(t)) {
    detailEl.innerHTML = `
      <h2>Hidden trophy</h2>
      <p class="official">Hidden on PlayStation until earned. Tick it off here once it pops to reveal its name, description and guide.</p>
      <div class="meta-row">
        <span class="tag">${gradeWord(t.grade)}</span>
        <span class="tag">Stage ${t.roadmap}</span>
        <span class="tag hidden-tag">Hidden</span>
      </div>
      <p class="detail-empty">Turn the spoiler shield off, or earn this trophy, to see its guide.</p>`;
    return;
  }
  const stage = STAGES.find((s) => s.n === t.roadmap);
  const warn = t.missable
    ? `<div class="warn"><strong>Missable — read this first.</strong> ${t.missableReason ?? ''}</div>` : '';
  const steps = (t.steps ?? []).map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  const sources = (t.sources ?? []).map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  detailEl.innerHTML = `
    <h2>${escapeHtml(displayName(t))}</h2>
    <p class="official">${escapeHtml(displayDesc(t))}</p>
    <div class="meta-row">
      <span class="tag">${gradeWord(t.grade)}</span>
      <span class="tag">${t.kind}</span>
      <span class="tag">Stage ${t.roadmap}</span>
      ${t.hidden ? '<span class="tag hidden-tag">Hidden</span>' : ''}
      ${t.missable ? '<span class="tag missable">Missable</span>' : ''}
    </div>
    ${warn}
    <h3>The guide</h3>
    <p>${escapeHtml(t.guide ?? '')}</p>
    <h3>Steps</h3>
    <ol>${steps}</ol>
    <h3>Roadmap</h3>
    <p>${escapeHtml(stage ? stage.title + ' — ' + stage.text : '')}</p>
    <h3>Sources</h3>
    <ul class="sources">${sources}</ul>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderRoadmap() {
  $('roadmapPanel').hidden = !showRoadmap;
  $('roadmapBtn').textContent = showRoadmap ? 'Hide roadmap' : 'Roadmap';
  if (!showRoadmap) return;
  $('stageList').innerHTML = STAGES.map((s) => {
    const members = trophies.filter((t) => t.roadmap === s.n);
    const done = members.filter((t) => earned.has(t.id)).length;
    return `<li><h3>${escapeHtml(s.title)} — ${done}/${members.length}</h3>
      <p>${escapeHtml(s.text)}</p>
      <p class="stage-trophies">${members.map((t) => escapeHtml(t.name)).join(' · ')}</p></li>`;
  }).join('');
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
}

$('search').addEventListener('input', (ev) => { query = ev.target.value; renderList(); });
$('kindFilters').addEventListener('click', (ev) => {
  const btn = ev.target.closest('button[data-kind]');
  if (!btn) return;
  kind = btn.dataset.kind;
  document.querySelectorAll('#kindFilters button').forEach((b) => b.classList.toggle('active', b === btn));
  renderList();
});
$('gradeFilter').addEventListener('change', (ev) => { grade = ev.target.value; renderList(); });
$('statusFilter').addEventListener('change', (ev) => { status = ev.target.value; renderList(); });
$('spoilerToggle').checked = spoiler;
$('spoilerToggle').addEventListener('change', (ev) => { spoiler = ev.target.checked; saveSpoiler(); renderList(); renderDetail(); });
$('roadmapBtn').addEventListener('click', () => { showRoadmap = !showRoadmap; renderRoadmap(); });
$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'GTA VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-trophy-atlas-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('importFile').addEventListener('change', async (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('bad file');
    earned = new Set(ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= trophies.length));
    saveEarned();
    renderAll();
  } catch { alert('That file is not a Leonida Trophy Atlas export.'); }
  ev.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear every earned mark?')) return;
  earned = new Set();
  saveEarned();
  renderAll();
});

// Honour the filters a screenshot or a link asked for.
if (kind !== 'all') {
  document.querySelectorAll('#kindFilters button').forEach((b) => b.classList.toggle('active', b.dataset.kind === kind));
}
$('gradeFilter').value = grade;
if (!selectedId && trophies.length) selectedId = trophies[0].id;
renderAll();
