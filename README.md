# SQL Playground

A free, in-browser course for learning SQL by **running** it. No signup, no server, no setup for the learner — a real SQLite database runs entirely in the browser, and every lesson is a live editor you type queries into.

It starts from *"what is a database?"* and works up through joins, subqueries, window functions, and recursive CTEs. Practice problems are graded by running your query against a hidden reference and comparing the results, so **any correct query passes** — wording and column names don't matter.

> **Live demo:** _add your GitHub Pages URL here once deployed (see below)._

---

## Features

- **Real SQLite, client-side.** Powered by [sql.js](https://sql.js.org/) (SQLite compiled to WebAssembly). Nothing is sent anywhere; it works offline once the page has loaded.
- **17 modules, beginner to advanced.** A gentle on-ramp for people who've never seen a database, through to window functions, CTEs, indexes/query plans, and schema design.
- **Graded practice.** 51 problems checked by comparing result sets, not string-matching your SQL. Hints and reference solutions on every problem.
- **Checks technique, not just output.** Problems that ask you to use a specific tool (a subquery, `UNION`, a recursive CTE, a `LEFT JOIN`) actually verify you used it, and problems that specify column names require the right aliases — so you can't pass "the wrong way."
- **Friendlier errors.** Common SQLite errors (`no such column`, `ambiguous column`, syntax errors) come with a plain-language nudge toward the fix.
- **Query plans & indexes.** An `EXPLAIN QUERY PLAN` button in the Playground and a dedicated lesson show the difference between a full table `SCAN` and an indexed `SEARCH`.
- **Progress that sticks.** Solved problems are saved in your browser (`localStorage`) and restored on your next visit.
- **Query history & export.** Walk back through past queries with `Alt+↑/↓`, copy any query, and copy or download result sets as CSV.
- **A "tables in play" panel** on every problem showing exactly which tables and columns you're querying, with sample rows — so beginners aren't guessing at column names.
- **Schema reference + free-form playground** always one click away.
- **No build step.** Vanilla JavaScript ES modules. Clone and serve.

### What this is *not*

Being honest about the boundaries of a browser-only tool:

- **It teaches SQLite.** The engine is SQLite via WebAssembly, so dialect-specific syntax (e.g. date functions) differs from PostgreSQL/MySQL/SQL Server. Lessons flag the big divergences, but this isn't a multi-dialect trainer.
- **No accounts or cloud sync.** There's no server, so progress lives on one device/browser. That's a deliberate trade for zero-setup and free hosting, not a feature that's coming.
- **Small, curated data.** The dataset is intentionally tiny so answers are predictable and teachable. It's not a place to feel real query performance at scale — the indexes/`EXPLAIN` lesson teaches the *concepts* instead.

## Curriculum

| # | Module | Covers |
|---|--------|--------|
| 00 | What is a database? | Tables, rows, columns, keys, how to use the app |
| 01 | SELECT | Choosing columns, `AS`, `DISTINCT`, `LIMIT` |
| 02 | WHERE | Comparisons, `AND` / `OR` / `NOT` |
| 03 | IN, BETWEEN, LIKE, NULL | Sets, ranges, text patterns, missing values |
| 04 | Sorting & paging | `ORDER BY`, `LIMIT` / `OFFSET` |
| 05 | Functions | Math, `ROUND`, string functions, dates, `COALESCE` |
| 06 | Aggregates | `COUNT` / `SUM` / `AVG` / `MIN` / `MAX`, `COUNT(DISTINCT)` |
| 07 | GROUP BY & HAVING | Per-group aggregates, filtering groups |
| 08 | Joins I | `INNER JOIN`, multi-table joins |
| 09 | Joins II | `LEFT JOIN`, finding non-matches, self-joins |
| 10 | Subqueries | Scalar, `IN`, `EXISTS`, derived tables |
| 11 | Set operations | `UNION`, `INTERSECT`, `EXCEPT` |
| 12 | CASE | Conditional expressions, conditional aggregation |
| 13 | Window functions | `OVER`, `PARTITION BY`, ranking, running totals |
| 14 | CTEs | `WITH`, and recursive CTEs |
| 15 | Creating & changing data | `CREATE TABLE`, `INSERT` / `UPDATE` / `DELETE` |
| 16 | Design & integrity | Normalization, keys, transactions, indexes, views |

## Run it locally

The app uses ES modules, so it needs to be served over HTTP — opening `index.html` directly with `file://` won't work. Any static server does the job:

```bash
git clone https://github.com/<you>/sql-playground.git
cd sql-playground
python3 -m http.server 8000
# then open http://localhost:8000
```

Or with Node: `npx serve` (then open the printed URL).

> The SQLite WASM engine loads from a CDN (cdnjs), so the first load needs a network connection. To make it fully offline, download `sql-wasm.js` and `sql-wasm.wasm` from the sql.js release, host them in the repo, and point `SQLJS_CDN` in `src/db.js` (and the `<script>` in `index.html`) at the local copies.

## Deploy to GitHub Pages

1. Push the repo to GitHub.
2. **Settings → Pages → Build and deployment**, set **Source** to *Deploy from a branch*, branch `main`, folder `/ (root)`.
3. Save. Your course is live at `https://<you>.github.io/sql-playground/`. Put that URL in the demo link above.

No build, no Actions required — the repo is already static.

## Tech stack

- **[sql.js](https://sql.js.org/) 1.10.3** — SQLite via WebAssembly
- **Vanilla JavaScript** (ES modules) — no framework, no bundler
- **Plain CSS** — one stylesheet, custom properties for theming

## Project structure

```
sql-playground/
├── index.html          # shell markup; loads sql.js + the app module
├── styles/
│   └── main.css         # the full design system
└── src/
    ├── app.js           # boot, routing, sidebar, progress wiring
    ├── db.js            # sql.js lifecycle + query helpers
    ├── seed.js          # schema + seed data
    ├── engine.js        # grading, technique/column checks, errors, CSV
    ├── progress.js      # solved-set persistence (localStorage)
    ├── history.js       # query history (localStorage)
    ├── ui.js            # DOM: grid, editor, cards, schema/playground views
    └── curriculum.js    # the entire course, as data
```

## Adding lessons

The course is data-driven — the whole curriculum lives in `src/curriculum.js` and the engine renders whatever it finds. Adding a module or a problem is just editing that array. See [CONTRIBUTING.md](CONTRIBUTING.md) for the lesson format.

## License

[MIT](LICENSE) — free to use, fork, and adapt, including for teaching.

## Acknowledgements

Built on [sql.js](https://github.com/sql-js/sql.js) by the sql.js authors and the SQLite project.
