// The grading engine. A problem is correct when the learner's query returns the
// same VALUES as a stored reference query — column names, aliasing, and query
// style are ignored, so any correct SQL passes. Only row order is checked, and
// only when the problem says order is part of the answer.

import { lastResult } from './db.js';

export const KNOWN_TABLES = ['customers', 'products', 'orders', 'order_items', 'employees'];

// Reduce a result set to comparable values. NULL gets a sentinel so it can't be
// confused with the string "NULL".
export function gridValues(res) {
  const { rows } = lastResult(res);
  return rows.map(r => r.map(v => (v === null ? '\u0000NULL' : String(v))));
}

// Compare two value grids. When order doesn't matter, sort both first.
export function rowsMatch(a, b, orderMatters) {
  if (a.length !== b.length) return false;
  let sa = a.map(r => JSON.stringify(r));
  let sb = b.map(r => JSON.stringify(r));
  if (!orderMatters) {
    sa = sa.slice().sort();
    sb = sb.slice().sort();
  }
  return sa.every((v, i) => v === sb[i]);
}

// Which seed tables a query references, found by whole-word match against the
// reference SQL. Used to show the "tables in play" panel on each problem.
export function tablesInSql(...sqls) {
  const joined = sqls.filter(Boolean).join(' ');
  return KNOWN_TABLES.filter(t => new RegExp('\\b' + t + '\\b', 'i').test(joined));
}

export const isNum = v =>
  typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !isNaN(v));

// ---------- friendlier error messages ----------
// Map common SQLite error text to a plain-language nudge, appended to the raw
// message so beginners get direction instead of just a terse engine error.
export function explainError(msg) {
  const m = msg.toLowerCase();
  if (m.includes('no such column'))
    return 'That column name isn\u2019t in the table. Check spelling and the Schema panel \u2014 and prefix it (e.g. c.name) when two tables share a column name.';
  if (m.includes('no such table'))
    return 'That table doesn\u2019t exist. The five tables are customers, products, orders, order_items, and employees.';
  if (m.includes('syntax error'))
    return 'SQLite couldn\u2019t parse the query. Look just before the spot it names \u2014 a missing comma, keyword, or quote is the usual cause. Text values need single quotes.';
  if (m.includes('ambiguous column'))
    return 'That column exists in more than one joined table. Prefix it with a table alias, e.g. o.customer_id.';
  if (m.includes('misuse of aggregate') || m.includes('group by'))
    return 'Aggregates like COUNT/SUM need a GROUP BY when you also select plain columns.';
  if (m.includes('unrecognized token'))
    return 'There\u2019s a stray character. Check your quotes \u2014 strings use single quotes in SQL.';
  return null;
}

// ---------- required-technique check ----------
// A problem can list techniques it must demonstrate (mustUse). Tokens map to a
// test against the learner's SQL text so "use a subquery" is actually enforced,
// not just requested in the prompt.
const TECHNIQUE = {
  SUBQUERY: sql => /\(\s*select/i.test(sql),
  DERIVED: sql => /from\s*\(\s*select/i.test(sql),
  CTE: sql => /\bwith\b/i.test(sql),
};
export function missingTechniques(sql, mustUse) {
  if (!mustUse) return [];
  return mustUse.filter(tok => {
    const t = TECHNIQUE[tok];
    if (t) return !t(sql);
    return !new RegExp('\\b' + tok.replace(/\s+/g, '\\s+') + '\\b', 'i').test(sql);
  });
}

// ---------- CSV export ----------
export function toCSV(columns, rows) {
  const esc = v => {
    if (v === null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [columns.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
}
