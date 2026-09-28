// Boots the database, builds the sidebar, and routes between module / schema /
// playground views. Loaded as a module from index.html, so the DOM is ready.

import { initDb, resetDb, getDb } from './db.js';
import { COURSE } from './curriculum.js';
import { renderModule, renderSchema, renderPlayground } from './ui.js';
import { solved, onChange, resetProgress } from './progress.js';

let activeView = COURSE[0].id;

function moduleFrac(mod) {
  const probs = mod.lessons.filter(l => l.kind === 'practice');
  const done = probs.filter(l => solved.has(l.id)).length;
  return { done, total: probs.length };
}

function renderRail() {
  const nav = document.getElementById('modnav');
  nav.innerHTML = '';
  COURSE.forEach((mod, i) => {
    const { done, total } = moduleFrac(mod);
    const frac = total > 0
      ? `<span class="frac${done === total ? ' done' : ''}">${done}/${total}</span>`
      : '';
    const b = document.createElement('button');
    b.className = 'mod' + (activeView === mod.id ? ' active' : '');
    b.innerHTML = `<span class="num">${String(i).padStart(2, '0')}</span><span class="t">${mod.title}</span>${frac}`;
    b.addEventListener('click', () => selectView(mod.id));
    nav.append(b);
  });
  document.querySelectorAll('.util').forEach(u => {
    u.classList.toggle('active', activeView === u.dataset.view);
  });
}

function updateProgress() {
  const total = COURSE.reduce((a, m) => a + m.lessons.filter(l => l.kind === 'practice').length, 0);
  document.getElementById('pcount').textContent = solved.size;
  document.getElementById('ptotal').textContent = total;
}

function selectView(v) {
  activeView = v;
  document.body.classList.remove('rail-open');
  if (v === 'schema') renderSchema();
  else if (v === 'playground') renderPlayground();
  else {
    const idx = COURSE.findIndex(m => m.id === v);
    renderModule(COURSE[idx], idx);
  }
  renderRail();
}

// Re-render the sidebar and counter whenever progress changes.
onChange(() => { updateProgress(); renderRail(); });

// ---------- chrome wiring ----------

document.getElementById('hamburger')
  .addEventListener('click', () => document.body.classList.toggle('rail-open'));
document.getElementById('overlay')
  .addEventListener('click', () => document.body.classList.remove('rail-open'));
document.querySelectorAll('.util')
  .forEach(u => u.addEventListener('click', () => selectView(u.dataset.view)));

document.getElementById('resetdb').addEventListener('click', () => {
  resetDb();
  const btn = document.getElementById('resetdb');
  const label = btn.textContent;
  btn.textContent = 'restored \u2713';
  setTimeout(() => (btn.textContent = label), 1200);
  if (activeView === 'schema') renderSchema();
  else if (activeView === 'playground') renderPlayground();
});

document.getElementById('resetprogress').addEventListener('click', () => {
  if (confirm('Clear all solved-problem progress? This cannot be undone.')) {
    resetProgress();
    selectView(activeView);
  }
});

// ---------- boot ----------

initDb()
  .then(() => {
    document.getElementById('dbdot').classList.remove('off');
    document.getElementById('dbstat').textContent = 'sqlite \u00b7 connected';
    updateProgress();
    selectView(activeView);
    document.getElementById('loading').style.display = 'none';
  })
  .catch(e => {
    document.getElementById('loadmsg').innerHTML =
      'Could not load the SQLite engine.<br>Check your network connection to cdnjs.cloudflare.com and reload.';
    console.error(e);
  });
