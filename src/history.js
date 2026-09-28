// A rolling history of queries the learner has run, saved to localStorage so it
// survives reloads. Editors let you walk back through it with Alt+ArrowUp/Down.

const KEY = 'sqlconsole.history.v1';
const CAP = 60;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

let entries = load(); // newest last

export function pushHistory(sql) {
  const q = (sql || '').trim();
  if (!q) return;
  if (entries[entries.length - 1] === q) return; // skip immediate repeats
  entries.push(q);
  if (entries.length > CAP) entries = entries.slice(-CAP);
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* storage blocked \u2014 keep in memory */
  }
}

// Newest-first snapshot, for editors walking backward through history.
export function getHistory() {
  return entries.slice().reverse();
}
