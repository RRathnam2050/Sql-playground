# Contributing

The whole course is data. To add or change lessons you edit one file, `src/curriculum.js` — no engine changes needed. This guide documents the shape of that data.

## The big picture

`src/curriculum.js` exports `COURSE`, an array of **module** objects. Each module has a list of **lessons**. A lesson is either a **concept** (explanation with an optional runnable example, never graded) or a **practice** problem (graded by running your query against a stored reference).

## Module object

```js
{
  id: 'm8',                 // unique, stable id (used internally)
  title: 'Joins I: combining tables',
  summary: 'One or two sentences shown under the module title.',
  scratch: false,           // optional; if true, every query in the module runs
                            // on a throwaway copy of the database (used by the
                            // data-modification and design modules)
  lessons: [ /* concept and practice objects */ ]
}
```

Modules render in array order and are numbered `00`, `01`, … automatically.

## Concept lesson

```js
{
  kind: 'concept',
  title: 'INNER JOIN',
  body: `<p>HTML string. Use <code>&lt;p&gt;</code>, <code>&lt;b&gt;</code>,
         <code>&lt;code&gt;</code>, <code>&lt;ul&gt;/&lt;li&gt;</code>, and
         <code>&lt;div class="note"&gt;</code> for callouts.</p>`,
  example: `SELECT * FROM customers;`   // optional; renders a "Run" editor
}
```

The `example` is never graded — it's there to run and tinker with. In a `scratch` module it runs on a private copy.

## Practice lesson

```js
{
  kind: 'practice',
  id: 'm8-1',               // unique across the whole course
  prompt: 'For every order, return its <b>order_id</b> and the <b>customer name</b>.',
  want: 'two columns, 18 rows',   // optional hint about the expected shape
  solution: `SELECT o.order_id, c.name FROM orders o JOIN customers c ON o.customer_id = c.customer_id;`,
  hint: 'HTML string shown when the learner clicks Hint.',
  orderMatters: false,      // optional; if true, row order must match too
  starter: ''               // optional; pre-fills the editor
}
```

### How grading works

The engine runs the learner's query **and** the `solution`, then compares the **values** of the two result sets. Consequences to keep in mind:

- **Column names and aliases are ignored.** Only values and column *count* matter. If your prompt asks for a specific alias, it's for the learner's benefit — grading won't enforce it.
- **Row order is ignored unless `orderMatters: true`.** Set it for any problem about sorting, ranking, or `LIMIT`-of-a-sorted-set.
- The `solution` must return exactly the rows you intend. Write it, run it in the Playground, and confirm before committing.

### Data-modification problems

For `INSERT` / `UPDATE` / `DELETE` / `CREATE`, put the module in `scratch: true` and mark the problem `kindMod: true` with a `verify` query:

```js
{
  kind: 'practice', id: 'm15-2', kindMod: true,
  prompt: 'Give every Support employee a 10% raise.',
  solution: `UPDATE employees SET salary = salary * 1.1 WHERE department = 'Support';`,
  verify:   `SELECT name, salary FROM employees WHERE department = 'Support' ORDER BY employee_id;`,
  hint: '…'
}
```

Grading runs the learner's statement on a fresh copy, then runs `verify` on that copy, and compares the result to the same steps applied to `solution`. Both learner and reference start from identical seed data, so the comparison is fair.

## Style conventions

- Keep every `solution` and `verify` on a **single line**. It keeps them easy to scan and to extract for validation.
- Write prompts and prose from the learner's perspective — plain language, say what the answer should contain.
- Prefer problems that have a clear, single result set. Avoid anything that depends on database-specific ordering unless `orderMatters` is set and the query has an explicit `ORDER BY`.

## The practice database

Five tables — `customers`, `products`, `orders`, `order_items`, `employees` — defined in `src/seed.js`. The data is intentionally shaped for teaching (a customer with no orders, a product never ordered, a manager hierarchy). If you add problems, lean on these edge cases; if you need new ones, extend the seed carefully and re-validate every existing solution against the change.

## Before you open a PR

- Serve the app locally and click through your new lessons.
- For every new practice problem, confirm the `solution` runs and returns the rows you expect.
- Run through the module once as a learner would, using only the prompts and hints, to make sure a beginner could actually get there.

## Stronger grading (optional fields)

Two optional fields on a practice lesson tighten grading beyond value-matching:

- **`mustUse: [...]`** — require the learner's SQL to demonstrate a technique. Tokens are either a literal keyword (`'union'`, `'left join'`, `'not exists'`, `'over'`, `'recursive'`, `'intersect'`, `'except'`, `'in'`) matched case-insensitively as a whole word, or one of the named testers: `'SUBQUERY'` (a parenthesised SELECT), `'DERIVED'` (a subquery in FROM), `'CTE'` (a `WITH` clause). If any required technique is absent, the check fails with a clear message even when the output is correct. Use this on problems whose prompt names a technique.

- **`columns: [...]`** — require the result's column names (case-insensitive, in order) to match. Grading is value-based by default and ignores names; set this only on problems whose prompt explicitly asks for specific aliases, and make sure your `solution` produces exactly those names. Not applied to `kindMod` problems.

Keep both honest: only require what the prompt actually asks for, and verify your own `solution` satisfies them (the repo's validation harness checks this).
