// All DOM construction lives here: a tiny element helper, the result grid, the
// query editor widget (with history + copy), and the concept / practice /
// schema / playground views.

import { getDb, freshClone, execOn, lastResult } from './db.js';
import { gridValues, rowsMatch, tablesInSql, isNum, explainError, missingTechniques, toCSV } from './engine.js';
import { solved, markSolved } from './progress.js';
import { pushHistory, getHistory } from './history.js';
import { TABLE_ORDER } from './seed.js';

export const el = (t, props = {}, ...kids) => {
  const n = document.createElement(t);
  for (const k in props) {
    if (k === 'class') n.className = props[k];
    else if (k === 'html') n.innerHTML = props[k];
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), props[k]);
    else n.setAttribute(k, props[k]);
  }
  for (const kid of kids) {
    if (kid == null) continue;
    n.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return n;
};

export function escapeHtml(s) {
  return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function copyText(txt, btn) {
  const done = () => { const t = btn.textContent; btn.textContent = 'copied \u2713'; setTimeout(() => (btn.textContent = t), 1100); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
  else { const ta = document.createElement('textarea'); ta.value = txt; document.body.append(ta); ta.select(); try { document.execCommand('copy'); } catch {} ta.remove(); done(); }
}

function download(name, txt) {
  const blob = new Blob([txt], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- result rendering ----------
// opts: { tools:false (copy/export toolbar), cap:200 (row display cap) }
export function renderGrid(res, opts = {}) {
  const cap = opts.cap ?? 200;
  const { columns, rows } = lastResult(res);
  if (!columns || columns.length === 0) return el('div', { class: 'zero' }, 'Statement ran. No rows returned.');
  if (rows.length === 0) return el('div', {}, el('div', { class: 'zero' }, '0 rows \u2014 the query is valid but nothing matched.'));

  const wrap = el('div');
  const shown = rows.slice(0, cap);
  const meta = el('div', { class: 'result-meta' },
    `${rows.length} row${rows.length !== 1 ? 's' : ''}${rows.length > cap ? ` (showing ${cap})` : ''} \u00b7 ${columns.length} column${columns.length !== 1 ? 's' : ''}`);

  if (opts.tools) {
    const bar = el('div', { class: 'grid-tools' });
    const copyBtn = el('button', { class: 'tool' }, 'Copy CSV');
    copyBtn.addEventListener('click', () => copyText(toCSV(columns, rows), copyBtn));
    const dlBtn = el('button', { class: 'tool', onclick: () => download('result.csv', toCSV(columns, rows)) }, 'Download CSV');
    bar.append(meta, el('span', { class: 'sp' }), copyBtn, dlBtn);
    wrap.append(bar);
  } else {
    wrap.append(meta);
  }

  const thead = el('tr', {}, ...columns.map(c => el('th', {}, c)));
  const trs = shown.map(r => el('tr', {}, ...r.map(v =>
    v === null ? el('td', { class: 'nullv' }, 'NULL') : el('td', { class: isNum(v) ? 'numv' : '' }, String(v)))));
  wrap.append(el('div', { class: 'tbl-scroll' }, el('table', { class: 'res' }, el('thead', {}, thead), el('tbody', {}, ...trs))));

  if (rows.length > cap) {
    const more = el('button', { class: 'tool showall' }, `Show all ${rows.length} rows`);
    more.addEventListener('click', () => { const full = renderGrid(res, { ...opts, cap: Infinity }); wrap.replaceWith(full); });
    wrap.append(more);
  }
  return wrap;
}

export function renderError(msg) {
  const box = el('div', { class: 'err' }, 'SQL error: ' + msg);
  const hint = explainError(msg);
  if (hint) box.append(el('div', { class: 'err-hint' }, hint));
  return box;
}

// ---------- editor widget ----------
export function makeEditor(initial, { onRun, onCheck, runLabel = 'Run', showCheck = false } = {}) {
  const ta = el('textarea', { class: 'sqlin', spellcheck: 'false', rows: '3' });
  ta.value = initial || '';

  let hist = [], hpos = -1, draft = null;
  ta.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      ta.value = ta.value.slice(0, s) + '  ' + ta.value.slice(en);
      ta.selectionStart = ta.selectionEnd = s + 2;
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); runBtn.click(); return; }
    // Alt + Up/Down walks query history
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      if (hpos === -1) { hist = getHistory(); draft = ta.value; }
      if (!hist.length) return;
      if (e.key === 'ArrowUp') hpos = Math.min(hpos + 1, hist.length - 1);
      else hpos = Math.max(hpos - 1, -1);
      ta.value = hpos === -1 ? draft : hist[hpos];
    }
  });

  const copyQ = el('button', { class: 'ed-copy' }, 'copy');
  copyQ.addEventListener('click', () => copyText(ta.value, copyQ));
  const top = el('div', { class: 'ed-top' },
    el('span', { class: 'lbl' }, 'QUERY'),
    el('span', { class: 'hintk' }, 'run: \u2318/Ctrl+\u21b5  \u00b7  history: Alt+\u2191\u2193'),
    copyQ);
  const area = el('div', { class: 'ed-area' }, el('div', { class: 'ed-gutter' }, '\u203a'), ta);
  const result = el('div', { class: 'result' });
  const note = el('span', { class: 'run-note' });

  const runBtn = el('button', {
    class: 'btn run',
    onclick: () => { result.innerHTML = ''; note.textContent = ''; hpos = -1; pushHistory(ta.value); onRun(ta.value, result, note); }
  }, runLabel);
  const actions = el('div', { class: 'ed-actions' }, runBtn);
  if (showCheck) {
    const checkBtn = el('button', { class: 'btn check', onclick: () => { hpos = -1; pushHistory(ta.value); onCheck(ta.value, result, note); } }, 'Check answer');
    actions.append(checkBtn);
  }
  const extra = el('span', { style: 'display:contents' });
  actions.append(extra, note);
  const box = el('div', { class: 'editor' }, top, area, actions, result);
  return { box, ta, result, actions: extra, getValue: () => ta.value, setValue: v => (ta.value = v) };
}

// ---------- "tables in play" panel ----------
function problemTables(lesson) {
  const names = tablesInSql(lesson.solution, lesson.verify);
  if (names.length === 0) return null;
  const db = getDb();
  const panel = el('div', { class: 'probschema' });
  panel.append(el('div', { class: 'ps-lbl' }, names.length > 1 ? 'Tables in play' : 'Table in play'));
  const grid = el('div', { class: 'ps-grid' + (names.length > 1 ? ' multi' : '') });
  for (const t of names) {
    const cols = lastResult(execOn(db, `PRAGMA table_info(${t});`).res).rows;
    const colWrap = el('div', { class: 'cols' });
    for (const c of cols) {
      const pk = c[5] == 1;
      colWrap.append(el('span', { class: 'col' + (pk ? ' pk' : '') }, c[1], el('span', { class: 'ty' }, c[2] || '')));
    }
    const sample = execOn(db, `SELECT * FROM ${t} LIMIT 2;`).res;
    grid.append(el('div', { class: 'stable ps-tbl' }, el('h4', {}, t), colWrap, el('div', { class: 'ps-sample' }, renderGrid(sample))));
  }
  panel.append(grid);
  return panel;
}

// ---------- concept card ----------
function conceptCard(mod, lesson) {
  const head = el('div', { class: 'card-head' }, el('span', { class: 'kicker concept' }, 'Concept'), el('h3', {}, lesson.title));
  const body = el('div', { class: 'card-body' });
  body.append(el('div', { class: 'prose', html: lesson.body }));
  if (lesson.example) {
    const scratch = !!mod.scratch;
    const ed = makeEditor(lesson.example, {
      runLabel: 'Run example',
      onRun: (sql, result, note) => {
        const target = scratch ? freshClone() : getDb();
        const out = execOn(target, sql);
        if (!out.ok) result.append(renderError(out.error));
        else { result.append(renderGrid(out.res, { tools: true })); note.textContent = scratch ? 'ran on a private copy' : ''; }
      }
    });
    body.append(ed.box);
  }
  return el('div', { class: 'card' }, head, body);
}

// ---------- practice card ----------
function colsMatch(userCols, want) {
  if (!want) return true;
  if (!userCols || userCols.length !== want.length) return false;
  return userCols.every((c, i) => String(c).toLowerCase() === String(want[i]).toLowerCase());
}

function practiceCard(mod, lesson) {
  const head = el('div', { class: 'card-head' },
    el('span', { class: 'kicker practice' }, 'Practice'),
    el('h3', { html: 'Problem' }),
    el('span', { class: 'solved-badge' + (solved.has(lesson.id) ? ' show' : ''), id: 'badge-' + lesson.id }, '\u2713 solved'));
  const body = el('div', { class: 'card-body' });
  const prompt = el('div', { class: 'prompt-box' }, el('div', { html: lesson.prompt }));
  if (lesson.want) prompt.append(el('div', { class: 'want' }, '\u2192 expected output: ' + lesson.want));
  body.append(prompt);

  const ptab = problemTables(lesson);
  if (ptab) body.append(ptab);

  const feedback = el('div', { class: 'feedback' });
  const hintTxt = el('div', { class: 'hint-txt', html: '<b>Hint:</b> ' + lesson.hint });
  const revealWrap = el('div', { class: 'reveal' });
  const mods = !!lesson.kindMod;

  function fail(html) { feedback.className = 'feedback no show'; feedback.innerHTML = html; }

  function runUser(sql, result, note) {
    result.innerHTML = ''; feedback.className = 'feedback';
    if (mods) {
      const clone = freshClone();
      const w = execOn(clone, sql);
      if (!w.ok) { result.append(renderError(w.error)); return; }
      const v = execOn(clone, lesson.verify);
      result.append(el('div', { class: 'result-meta' }, 'effect on a private copy:'));
      result.append(v.ok ? renderGrid(v.res, { tools: true }) : renderError(v.error));
      note.textContent = 'private copy';
    } else {
      const out = execOn(getDb(), sql);
      result.append(out.ok ? renderGrid(out.res, { tools: true }) : renderError(out.error));
    }
  }

  function check(sql, result, note) {
    result.innerHTML = ''; note.textContent = '';
    // technique requirement first \u2014 output can be right for the wrong reasons
    const missing = missingTechniques(sql, lesson.mustUse);
    if (missing.length) { fail(`<span class="fh">Right idea, wrong tool.</span>This problem asks you to use <b>${missing.join(', ')}</b>. Rework it that way.`); return; }

    let userVals, userCols = null, err = null;
    if (mods) {
      const cu = freshClone();
      const w = execOn(cu, sql);
      if (!w.ok) err = w.error;
      else { const v = execOn(cu, lesson.verify); if (v.ok) { userVals = gridValues(v.res); } else err = v.error; }
    } else {
      const out = execOn(getDb(), sql);
      if (!out.ok) err = out.error;
      else { userVals = gridValues(out.res); userCols = lastResult(out.res).columns; }
    }
    if (err) { fail('<span class="fh">Your query errored.</span>' + escapeHtml(err) + (explainError(err) ? '<br>' + explainError(err) : '')); return; }

    let refVals;
    if (mods) { const cs = freshClone(); execOn(cs, lesson.solution); refVals = gridValues(execOn(cs, lesson.verify).res); }
    else refVals = gridValues(execOn(getDb(), lesson.solution).res);

    if (!rowsMatch(userVals, refVals, !!lesson.orderMatters)) {
      let why;
      if (userVals.length !== refVals.length) why = `Row count is off \u2014 you returned ${userVals.length}, expected ${refVals.length}.`;
      else if (userVals[0] && refVals[0] && userVals[0].length !== refVals[0].length) why = `Column count is off \u2014 you returned ${userVals[0].length}, expected ${refVals[0].length}.`;
      else why = 'Right shape, but some values or their order don\u2019t match.';
      fail('<span class="fh">Not quite.</span>' + why + ' Use the hint or reveal the solution below.');
      return;
    }
    // values correct \u2014 enforce requested column names if the problem specified them
    if (!mods && lesson.columns && !colsMatch(userCols, lesson.columns)) {
      fail(`<span class="fh">Values are right \u2014 fix the column name.</span>This problem expects the column(s) named <b>${lesson.columns.join(', ')}</b>. Add an <code>AS</code> alias to match.`);
      return;
    }
    feedback.className = 'feedback ok show';
    feedback.innerHTML = '<span class="fh">Correct.</span>That matches the expected result. On to the next one.';
    markSolved(lesson.id);
    const b = document.getElementById('badge-' + lesson.id);
    if (b) b.classList.add('show');
  }

  const ed = makeEditor(lesson.starter || '', { showCheck: true, onRun: runUser, onCheck: check });
  body.append(ed.box);

  const hintBtn = el('button', { class: 'btn mini', onclick: () => hintTxt.classList.toggle('show') }, 'Hint');
  const solBtn = el('button', {
    class: 'btn mini',
    onclick: () => {
      if (revealWrap.childElementCount) { revealWrap.innerHTML = ''; solBtn.textContent = 'Show solution'; return; }
      revealWrap.append(el('pre', {}, lesson.solution)); solBtn.textContent = 'Hide solution';
    }
  }, 'Show solution');
  ed.actions.append(hintBtn, solBtn);

  body.append(hintTxt, feedback, revealWrap);
  return el('div', { class: 'card' }, head, body);
}

// ---------- views ----------
export function renderModule(mod, index) {
  const work = document.getElementById('work');
  const wrap = el('div', { class: 'wrap fade-in' });
  wrap.append(el('div', { class: 'eyebrow' }, 'Module ' + String(index).padStart(2, '0')));
  wrap.append(el('h1', { class: 'mtitle' }, mod.title));
  wrap.append(el('p', { class: 'msummary' }, mod.summary));
  for (const lesson of mod.lessons) wrap.append(lesson.kind === 'concept' ? conceptCard(mod, lesson) : practiceCard(mod, lesson));
  work.innerHTML = ''; work.append(wrap); work.scrollTop = 0;
}

export function renderSchema() {
  const db = getDb();
  const work = document.getElementById('work');
  const wrap = el('div', { class: 'wrap fade-in' });
  wrap.append(el('div', { class: 'eyebrow' }, 'Reference'));
  wrap.append(el('h1', { class: 'mtitle' }, 'Schema'));
  wrap.append(el('p', { class: 'msummary' }, 'Five tables. Primary keys are highlighted. Keep this open while you solve \u2014 every problem draws from these.'));
  const grid = el('div', { class: 'schema-grid' });
  for (const t of TABLE_ORDER) {
    const cols = lastResult(execOn(db, `PRAGMA table_info(${t});`).res).rows;
    const cnt = lastResult(execOn(db, `SELECT COUNT(*) FROM ${t};`).res).rows[0][0];
    const colWrap = el('div', { class: 'cols' });
    for (const c of cols) { const pk = c[5] == 1; colWrap.append(el('span', { class: 'col' + (pk ? ' pk' : '') }, c[1], el('span', { class: 'ty' }, c[2] || ''))); }
    const sample = execOn(db, `SELECT * FROM ${t} LIMIT 4;`).res;
    grid.append(el('div', { class: 'stable' }, el('h4', {}, t, el('span', { class: 'cnt' }, cnt + ' rows')), colWrap, el('div', { style: 'padding:4px 8px 8px;' }, renderGrid(sample))));
  }
  wrap.append(grid);
  work.innerHTML = ''; work.append(wrap); work.scrollTop = 0;
}

export function renderPlayground() {
  const work = document.getElementById('work');
  const wrap = el('div', { class: 'wrap fade-in' });
  wrap.append(el('div', { class: 'eyebrow' }, 'Free query'));
  wrap.append(el('h1', { class: 'mtitle' }, 'Playground'));
  wrap.append(el('p', { class: 'msummary' }, 'Run anything against the live database \u2014 SELECTs, joins, even INSERT/UPDATE/DELETE and transactions (BEGIN\u2026COMMIT/ROLLBACK). Changes persist here until you use "reset db". "Explain plan" shows how SQLite would run your query.'));
  const card = el('div', { class: 'card' });
  const body = el('div', { class: 'card-body' });
  const ed = makeEditor(
    `SELECT c.name, COUNT(o.order_id) AS orders, SUM(oi.quantity * p.price) AS spent
FROM customers c
LEFT JOIN orders o        ON o.customer_id = c.customer_id
LEFT JOIN order_items oi  ON oi.order_id   = o.order_id
LEFT JOIN products p      ON p.product_id  = oi.product_id
GROUP BY c.customer_id, c.name
ORDER BY spent DESC;`,
    {
      runLabel: 'Run',
      onRun: (sql, result, note) => {
        const db = getDb();
        const out = execOn(db, sql);
        if (!out.ok) { result.append(renderError(out.error)); return; }
        result.append(renderGrid(out.res, { tools: true }));
        const mod = db.getRowsModified();
        if (mod > 0) note.textContent = mod + ' row(s) changed';
      }
    }
  );
  const explainBtn = el('button', { class: 'btn mini' }, 'Explain plan');
  explainBtn.addEventListener('click', () => {
    ed.result.innerHTML = '';
    const q = ed.getValue().trim().replace(/;\s*$/, '');
    const out = execOn(getDb(), 'EXPLAIN QUERY PLAN ' + q);
    if (!out.ok) { ed.result.append(renderError(out.error)); return; }
    ed.result.append(el('div', { class: 'result-meta' }, 'query plan \u2014 "SCAN" reads a whole table, "SEARCH \u2026 USING INDEX" uses one:'));
    ed.result.append(renderGrid(out.res));
  });
  ed.actions.append(explainBtn);
  body.append(ed.box); card.append(body); wrap.append(card);
  work.innerHTML = ''; work.append(wrap); work.scrollTop = 0;
}
