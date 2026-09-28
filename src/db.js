// Owns the single in-browser SQLite database. sql.js is loaded as a global
// script in index.html (window.initSqlJs); everything else talks to the DB
// through the small surface exported here.

import { SEED } from './seed.js';

const SQLJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';

let SQL = null;
let db = null;

function build() {
  const d = new SQL.Database();
  d.run(SEED);
  return d;
}

// Load the WASM engine and open the seeded database. Call once at boot.
export async function initDb() {
  SQL = await window.initSqlJs({ locateFile: f => SQLJS_CDN + f });
  db = build();
  return db;
}

// Always read the current handle through this — resetDb() swaps it out.
export function getDb() {
  return db;
}

// Throw away all edits and rebuild from the seed.
export function resetDb() {
  if (db) db.close();
  db = build();
  return db;
}

// A private, seed-fresh copy. Data-modification exercises run here so the
// learner can INSERT/UPDATE/DELETE without touching the shared database.
export function freshClone() {
  return build();
}

// Run SQL and never throw — callers branch on ok.
export function execOn(database, sql) {
  try {
    return { ok: true, res: database.exec(sql) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// exec() returns one entry per statement; grading and display want the last.
export function lastResult(res) {
  if (!res || res.length === 0) return { columns: [], rows: [] };
  const r = res[res.length - 1];
  return { columns: r.columns, rows: r.values };
}
