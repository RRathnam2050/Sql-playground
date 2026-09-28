// Tracks which problems are solved and remembers them across sessions via
// localStorage. (In a hosted or locally served build this persists; if storage
// is unavailable it degrades to in-memory for the session.)

const KEY = 'sqlconsole.progress.v1';
const listeners = [];

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...solved]));
  } catch {
    /* storage blocked — stay in memory for this session */
  }
}

export const solved = new Set(load());

function emit() {
  listeners.forEach(fn => fn());
}

// Register a callback fired whenever the solved set changes.
export function onChange(fn) {
  listeners.push(fn);
}

// Mark a problem solved. Returns true if this was the first time.
export function markSolved(id) {
  if (solved.has(id)) return false;
  solved.add(id);
  persist();
  emit();
  return true;
}

// Clear all progress.
export function resetProgress() {
  solved.clear();
  persist();
  emit();
}
