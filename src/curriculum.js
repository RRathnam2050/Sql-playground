// The entire course, as data. The UI renders whatever it finds here, so adding
// a module or a problem is just editing this array — see CONTRIBUTING.md.
//
// Lesson shapes:
//   concept  { kind:'concept', title, body(html), example?(sql) }
//   practice { kind:'practice', id, prompt(html), want?, solution(sql),
//              hint(html), orderMatters?, kindMod?, verify? }
//
// Grading runs the learner's query and the `solution` and compares the VALUES
// they return. `orderMatters:true` also requires the same row order. A module
// with `scratch:true` runs every query on a throwaway copy of the database;
// `kindMod:true` problems are graded by running `verify` after the change.

export const COURSE = [

/* ============================ 00 — ORIENTATION ============================ */
{
  id: 'm0', title: 'What is a database?',
  summary: 'Before any SQL: what a database actually is, how tables are laid out, and how to use this app. Nothing here is graded — read, run the examples, and get your bearings.',
  lessons: [
    { kind: 'concept', title: 'Tables, rows, and columns',
      body: `<p>A <b>database</b> is a set of <b>tables</b>. A table is a grid, like one sheet in a spreadsheet. Each <b>row</b> is one record \u2014 one customer, one order \u2014 and each <b>column</b> is one field every row has, like <code>name</code> or <code>price</code>.</p>
<p>This course has five tables: <code>customers</code>, <code>products</code>, <code>orders</code>, <code>order_items</code>, and <code>employees</code>. Run the example to see one of them. The grid that appears is the whole table.</p>
<div class="note">You never edit tables by hand here. You ask questions with <b>SQL</b> (Structured Query Language) and the database answers with a grid of rows.</div>`,
      example: `SELECT * FROM customers;` },

    { kind: 'concept', title: 'Keys: how rows are identified and linked',
      body: `<p>Most tables have a column that uniquely identifies each row \u2014 a <b>primary key</b>. In <code>customers</code> it's <code>customer_id</code>. No two customers share one.</p>
<p>Tables connect through keys. The <code>orders</code> table has a <code>customer_id</code> column too \u2014 a <b>foreign key</b> pointing at which customer placed the order. That link is what lets you later ask \u201cshow each order <i>with the customer's name</i>.\u201d Run this and notice <code>customer_id</code> repeats: one customer can have many orders.</p>`,
      example: `SELECT * FROM orders;` },

    { kind: 'concept', title: 'How to use this app',
      body: `<p>Every lesson has an editor. Two kinds of lesson:</p>
<ul>
<li><b>Concept</b> cards (like this one) have a <b>Run</b> button. Nothing is graded \u2014 run the example, then change it and run again. Experimenting is the point.</li>
<li><b>Practice</b> cards have <b>Run</b> and <b>Check answer</b>. Run previews your output; Check grades it by comparing your result to a hidden reference. Any query that returns the right rows passes \u2014 wording and column names don't matter.</li>
</ul>
<p>Stuck on a problem? <b>Hint</b> nudges you; <b>Show solution</b> reveals one correct query. Each solved problem is remembered \u2014 the sidebar shows your progress, and it's kept between visits.</p>
<p>Two tools live in the sidebar: <b>Schema reference</b> (all five tables and their columns) and <b>Playground</b> (a blank editor for anything). Press <b>\u2318/Ctrl + Enter</b> in any editor to run it. If you ever mangle the data, <b>reset db</b> at the top restores everything.</p>
<div class="note">SQL keywords (<code>SELECT</code>, <code>FROM</code>, \u2026) aren't case-sensitive and the whitespace is up to you. <code>select name from products</code> works. Ending each statement with a semicolon is good habit.</div>` }
  ]
},

/* ============================ 01 — SELECT ============================ */
{
  id: 'm1', title: 'SELECT: reading data',
  summary: 'The read half of SQL. Choose columns, rename them, drop duplicates, and cap how many rows come back. You learn SQL by running things and watching the grid change.',
  lessons: [
    { kind: 'concept', title: 'Choosing columns',
      body: `<p><b>SELECT</b> reads data. You name the columns you want, then the table to read them <b>FROM</b>:</p>
<p><code>SELECT name, price FROM products;</code></p>
<p><code>*</code> means \u201cevery column\u201d \u2014 handy for a quick look, but real queries name columns so the output stays predictable. Run the example, then try changing <code>name, price</code> to <code>*</code>.</p>`,
      example: `SELECT name, price FROM products;` },

    { kind: 'concept', title: 'Renaming, de-duplicating, limiting',
      body: `<p>Three small tools you'll use constantly:</p>
<ul>
<li><code>AS</code> renames a column in the output (an <b>alias</b>): <code>SELECT price AS cost FROM products</code>.</li>
<li><code>DISTINCT</code> removes duplicate rows: <code>SELECT DISTINCT category FROM products</code>.</li>
<li><code>LIMIT n</code> returns at most <code>n</code> rows \u2014 useful when a table is large.</li>
</ul>`,
      example: `SELECT DISTINCT category FROM products;` },

    { kind: 'practice', id: 'm1-1', prompt: 'Select the <b>name</b> and <b>category</b> of every product.',
      want: 'two columns, 13 rows',
      solution: `SELECT name, category FROM products;`,
      hint: `Name the two columns after SELECT, separated by a comma, then <code>FROM products</code>.` },

    { kind: 'practice', id: 'm1-2', prompt: 'List the <b>distinct countries</b> that customers come from (one column, no repeats).',
      want: 'one column, 9 rows',
      solution: `SELECT DISTINCT country FROM customers;`,
      hint: `<code>SELECT DISTINCT country FROM customers;</code> \u2014 DISTINCT collapses the duplicates.` },

    { kind: 'practice', id: 'm1-3', prompt: 'Show the <b>name</b> and <b>price</b> of just the <b>first 5</b> products.',
      want: 'two columns, 5 rows',
      solution: `SELECT name, price FROM products LIMIT 5;`,
      hint: `Add <code>LIMIT 5</code> to the end.` }
  ]
},

/* ============================ 02 — WHERE ============================ */
{
  id: 'm2', title: 'WHERE: filtering rows',
  summary: 'Return only the rows you care about. WHERE tests each row against a condition and keeps the ones that pass.',
  lessons: [
    { kind: 'concept', title: 'Conditions',
      body: `<p><b>WHERE</b> filters rows. It comes after the table and holds a condition tested against every row:</p>
<p><code>SELECT name, price FROM products WHERE price > 50;</code></p>
<p>Comparisons: <code>=</code> equals, <code>&lt;&gt;</code> or <code>!=</code> not equal, <code>&lt; &gt; &lt;= &gt;=</code>. Text goes in <b>single quotes</b>: <code>WHERE country = 'USA'</code>.</p>
<div class="note">One equals sign for comparison in SQL, not two. <code>WHERE country = 'USA'</code>.</div>`,
      example: `SELECT name, price FROM products WHERE price > 50;` },

    { kind: 'concept', title: 'Combining with AND / OR / NOT',
      body: `<p>Join conditions with <b>AND</b> (both must hold), <b>OR</b> (either), and <b>NOT</b> (negate). Use parentheses when you mix them, so the intent is clear:</p>
<p><code>WHERE category = 'Electronics' AND price &lt; 100</code></p>`,
      example: `SELECT name, category, price FROM products WHERE category = 'Electronics' AND price < 100;` },

    { kind: 'practice', id: 'm2-1', prompt: 'Return the <b>name</b> and <b>price</b> of products that cost <b>more than 50</b>.',
      solution: `SELECT name, price FROM products WHERE price > 50;`,
      hint: `<code>WHERE price > 50</code>.` },

    { kind: 'practice', id: 'm2-2', prompt: 'Return the <b>name</b> of every customer from the <b>USA</b>.',
      solution: `SELECT name FROM customers WHERE country = 'USA';`,
      hint: `Text values need single quotes: <code>WHERE country = 'USA'</code>.` },

    { kind: 'practice', id: 'm2-3', prompt: 'Return the <b>name</b> and <b>price</b> of <b>Electronics</b> products that cost <b>under 100</b>.',
      solution: `SELECT name, price FROM products WHERE category = 'Electronics' AND price < 100;`,
      hint: `Two conditions joined by <code>AND</code>.` }
  ]
},

/* ============================ 03 — MORE FILTERING ============================ */
{
  id: 'm3', title: 'IN, BETWEEN, LIKE, NULL',
  summary: 'Filters beyond plain comparison: membership in a set, ranges, pattern matching on text, and the special handling that missing values need.',
  lessons: [
    { kind: 'concept', title: 'IN and BETWEEN',
      body: `<p><b>IN</b> checks membership in a list \u2014 shorter than a chain of ORs:</p>
<p><code>WHERE category IN ('Electronics','Home Office')</code></p>
<p><b>BETWEEN a AND b</b> is a range test, and it's <b>inclusive</b> of both ends:</p>
<p><code>WHERE price BETWEEN 10 AND 50</code></p>`,
      example: `SELECT name, category FROM products WHERE category IN ('Electronics','Home Office');` },

    { kind: 'concept', title: 'LIKE for text patterns',
      body: `<p><b>LIKE</b> matches text patterns with two wildcards: <code>%</code> stands for any run of characters, <code>_</code> for exactly one.</p>
<ul>
<li><code>LIKE 'New%'</code> \u2014 starts with \u201cNew\u201d</li>
<li><code>LIKE '%cable%'</code> \u2014 contains \u201ccable\u201d</li>
<li><code>LIKE '_o%'</code> \u2014 second letter is \u201co\u201d</li>
</ul>`,
      example: `SELECT name, city FROM customers WHERE city LIKE 'M%';` },

    { kind: 'concept', title: 'NULL means unknown',
      body: `<p>A <b>NULL</b> is a missing value \u2014 not zero, not an empty string. Because it's \u201cunknown,\u201d normal comparisons don't work on it: <code>= NULL</code> is never true. Test it with <b>IS NULL</b> / <b>IS NOT NULL</b>:</p>
<p><code>WHERE manager_id IS NULL</code></p>`,
      example: `SELECT name, manager_id FROM employees WHERE manager_id IS NULL;` },

    { kind: 'practice', id: 'm3-1', prompt: 'Return the <b>name</b> and <b>category</b> of products in the <b>Electronics</b> or <b>Home Office</b> categories. Use <code>IN</code>.',
      solution: `SELECT name, category FROM products WHERE category IN ('Electronics','Home Office');`,
      hint: `<code>WHERE category IN ('Electronics','Home Office')</code>.` },

    { kind: 'practice', id: 'm3-2', prompt: 'Return the <b>name</b> and <b>price</b> of products priced <b>between 10 and 50</b> (inclusive).',
      solution: `SELECT name, price FROM products WHERE price BETWEEN 10 AND 50;`,
      hint: `<code>BETWEEN 10 AND 50</code> includes both 10 and 50.` },

    { kind: 'practice', id: 'm3-3', prompt: 'Return the <b>name</b> and <b>city</b> of customers whose city <b>starts with the letter M</b>.',
      solution: `SELECT name, city FROM customers WHERE city LIKE 'M%';`,
      hint: `<code>LIKE 'M%'</code> \u2014 the % matches whatever follows.` },

    { kind: 'practice', id: 'm3-4', prompt: 'Return the <b>name</b> of every employee who has <b>no manager</b>.',
      solution: `SELECT name FROM employees WHERE manager_id IS NULL;`,
      hint: `Missing values need <code>IS NULL</code>, not <code>= NULL</code>.` }
  ]
},

/* ============================ 04 — ORDER BY ============================ */
{
  id: 'm4', title: 'Sorting and paging',
  summary: 'Control the order rows come back in, and page through them. Order is not guaranteed unless you ask for it.',
  lessons: [
    { kind: 'concept', title: 'ORDER BY',
      body: `<p><b>ORDER BY</b> sorts the result. <b>ASC</b> is ascending (the default), <b>DESC</b> descending:</p>
<p><code>ORDER BY price DESC</code></p>
<p>Sort by several columns to break ties \u2014 the first column decides, the next settles equal values:</p>
<p><code>ORDER BY department ASC, salary DESC</code></p>
<div class="note">Without ORDER BY, the database may return rows in any order. If order matters to your answer, state it.</div>`,
      example: `SELECT name, price FROM products ORDER BY price DESC;` },

    { kind: 'concept', title: 'LIMIT and OFFSET',
      body: `<p><b>LIMIT</b> with <b>ORDER BY</b> gives you \u201ctop N\u201d answers \u2014 the 3 cheapest, the highest paid, and so on. <b>OFFSET</b> skips rows first, which is how paging works:</p>
<p><code>ORDER BY price LIMIT 5 OFFSET 5</code> \u2014 the second page of five.</p>`,
      example: `SELECT name, price FROM products ORDER BY price ASC LIMIT 3;` },

    { kind: 'practice', id: 'm4-1', prompt: 'Return the <b>name</b> and <b>price</b> of all products, sorted by <b>price from highest to lowest</b>.',
      orderMatters: true,
      solution: `SELECT name, price FROM products ORDER BY price DESC;`,
      hint: `<code>ORDER BY price DESC</code>.` },

    { kind: 'practice', id: 'm4-2', prompt: 'Return the <b>name</b> and <b>price</b> of the <b>3 cheapest</b> products, cheapest first.',
      orderMatters: true,
      solution: `SELECT name, price FROM products ORDER BY price ASC LIMIT 3;`,
      hint: `Sort ascending, then <code>LIMIT 3</code>.` },

    { kind: 'practice', id: 'm4-3', prompt: 'Return <b>name</b>, <b>department</b>, and <b>salary</b> of all employees, sorted by <b>department</b> (A\u2192Z), and within each department by <b>salary highest first</b>.',
      orderMatters: true,
      solution: `SELECT name, department, salary FROM employees ORDER BY department ASC, salary DESC;`,
      hint: `Two sort keys: <code>ORDER BY department ASC, salary DESC</code>.` }
  ]
},

/* ============================ 05 — FUNCTIONS ============================ */
{
  id: 'm5', title: 'Functions: math, text, dates',
  summary: 'Transform values as you read them \u2014 arithmetic, rounding, changing case, joining strings, pulling pieces out of dates, and filling in for NULLs.',
  lessons: [
    { kind: 'concept', title: 'Arithmetic and ROUND',
      body: `<p>You can compute in the SELECT list. Arithmetic works column-by-column, and <b>ROUND(value, places)</b> trims decimals:</p>
<p><code>SELECT name, ROUND(price * 1.08, 2) AS with_tax FROM products;</code></p>`,
      example: `SELECT name, price, ROUND(price * 1.08, 2) AS with_tax FROM products;` },

    { kind: 'concept', title: 'Text functions',
      body: `<p>Common string tools: <code>UPPER(x)</code>, <code>LOWER(x)</code>, <code>LENGTH(x)</code>, <code>SUBSTR(x, start, len)</code>, and <code>||</code> to glue strings together:</p>
<p><code>SELECT name || ' (' || country || ')' AS label FROM customers;</code></p>`,
      example: `SELECT UPPER(name) AS shout, LENGTH(name) AS letters FROM products;` },

    { kind: 'concept', title: 'Dates and COALESCE',
      body: `<p>Dates here are text like <code>'2022-01-15'</code>. Pull parts out with <b>strftime</b>: <code>strftime('%Y', signup_date)</code> gives the year as text, <code>'%m'</code> the month.</p>
<p><b>COALESCE(a, b)</b> returns the first non-NULL argument \u2014 the standard way to substitute a fallback for missing data.</p>
<div class="note">Date handling is where SQL dialects differ most. <code>strftime</code> is SQLite\u2019s way; PostgreSQL and others use <code>EXTRACT</code> / <code>DATE_PART</code>. The <i>ideas</i> carry over even when the function names don\u2019t.</div>`,
      example: `SELECT name, strftime('%Y', signup_date) AS year FROM customers;` },

    { kind: 'practice', id: 'm5-1', columns: ['name'], prompt: 'Return every product name in <b>UPPERCASE</b>, in a single column aliased <code>name</code>.',
      solution: `SELECT UPPER(name) AS name FROM products;`,
      hint: `<code>SELECT UPPER(name) AS name FROM products;</code>.` },

    { kind: 'practice', id: 'm5-2', columns: ['name','price_with_tax'], prompt: 'Return each product\u2019s <b>name</b> and its price <b>with 8% tax added</b>, rounded to 2 decimals, aliased <code>price_with_tax</code>.',
      solution: `SELECT name, ROUND(price * 1.08, 2) AS price_with_tax FROM products;`,
      hint: `Multiply by 1.08, then <code>ROUND(\u2026, 2)</code>.` },

    { kind: 'practice', id: 'm5-3', prompt: 'Return the <b>name</b> and <b>signup_date</b> of customers who signed up <b>in 2022</b>.',
      solution: `SELECT name, signup_date FROM customers WHERE strftime('%Y', signup_date) = '2022';`,
      hint: `<code>WHERE strftime('%Y', signup_date) = '2022'</code> \u2014 the year comes back as text.` },

    { kind: 'practice', id: 'm5-4', columns: ['name','manager_id'], prompt: 'Return every employee\u2019s <b>name</b> and <b>manager_id</b>, but show <b>0</b> instead of NULL when they have no manager. Alias the second column <code>manager_id</code>.',
      solution: `SELECT name, COALESCE(manager_id, 0) AS manager_id FROM employees;`,
      hint: `<code>COALESCE(manager_id, 0)</code> swaps NULL for 0.` }
  ]
},

/* ============================ 06 — AGGREGATES ============================ */
{
  id: 'm6', title: 'Aggregates: summarizing',
  summary: 'Collapse many rows into a single answer: how many, the total, the average, the largest and smallest.',
  lessons: [
    { kind: 'concept', title: 'The five aggregates',
      body: `<p>Aggregate functions read a whole column and return one value: <b>COUNT</b>, <b>SUM</b>, <b>AVG</b>, <b>MIN</b>, <b>MAX</b>.</p>
<ul>
<li><code>COUNT(*)</code> counts rows; <code>COUNT(col)</code> counts non-NULL values in a column.</li>
<li><code>SUM</code> / <code>AVG</code> need a numeric column.</li>
</ul>
<p><code>SELECT COUNT(*), AVG(price) FROM products;</code></p>`,
      example: `SELECT COUNT(*) AS n, AVG(price) AS avg_price FROM products;` },

    { kind: 'concept', title: 'Counting distinct values',
      body: `<p><b>COUNT(DISTINCT col)</b> counts how many <i>different</i> values appear \u2014 not how many rows. \u201cHow many countries do we sell to?\u201d is a COUNT DISTINCT, because countries repeat across customers.</p>`,
      example: `SELECT COUNT(DISTINCT country) AS countries FROM customers;` },

    { kind: 'practice', id: 'm6-1', prompt: 'How many products are there? Return a single number.',
      solution: `SELECT COUNT(*) FROM products;`,
      hint: `<code>SELECT COUNT(*) FROM products;</code>.` },

    { kind: 'practice', id: 'm6-2', prompt: 'What is the <b>average product price</b>, rounded to 2 decimals?',
      solution: `SELECT ROUND(AVG(price), 2) FROM products;`,
      hint: `Wrap the average: <code>ROUND(AVG(price), 2)</code>.` },

    { kind: 'practice', id: 'm6-3', prompt: 'Return the <b>highest</b> and the <b>lowest</b> salary among employees, in that order (two columns, one row).',
      solution: `SELECT MAX(salary), MIN(salary) FROM employees;`,
      hint: `Two aggregates in one SELECT: <code>MAX(salary), MIN(salary)</code>.` },

    { kind: 'practice', id: 'm6-4', prompt: 'How many <b>distinct cities</b> do customers live in? Return a single number.',
      solution: `SELECT COUNT(DISTINCT city) FROM customers;`,
      hint: `<code>COUNT(DISTINCT city)</code> \u2014 some cities repeat.` }
  ]
},

/* ============================ 07 — GROUP BY ============================ */
{
  id: 'm7', title: 'GROUP BY and HAVING',
  summary: 'Aggregate per group instead of over the whole table: sales per category, headcount per department. Then filter the groups themselves with HAVING.',
  lessons: [
    { kind: 'concept', title: 'One result row per group',
      body: `<p><b>GROUP BY</b> splits rows into groups that share a value, then computes an aggregate for each group. The columns you group by can appear alongside the aggregates:</p>
<p><code>SELECT category, COUNT(*) FROM products GROUP BY category;</code></p>
<p>Read it as: for each category, count the products.</p>`,
      example: `SELECT category, COUNT(*) AS n FROM products GROUP BY category;` },

    { kind: 'concept', title: 'HAVING vs WHERE',
      body: `<p><b>WHERE</b> filters individual rows <i>before</i> grouping. <b>HAVING</b> filters <i>groups</i> after aggregation \u2014 it's where a condition on an aggregate goes:</p>
<p><code>GROUP BY country HAVING COUNT(*) > 1</code></p>
<div class="note">Rule of thumb: a condition on a raw column \u2192 WHERE. A condition on a COUNT/SUM/AVG \u2192 HAVING.</div>`,
      example: `SELECT country, COUNT(*) AS n FROM customers GROUP BY country HAVING COUNT(*) > 1;` },

    { kind: 'practice', id: 'm7-1', prompt: 'Return each <b>category</b> and the <b>number of products</b> in it (two columns).',
      solution: `SELECT category, COUNT(*) FROM products GROUP BY category;`,
      hint: `<code>GROUP BY category</code> with <code>COUNT(*)</code>.` },

    { kind: 'practice', id: 'm7-2', prompt: 'Return each <b>department</b> and its <b>average salary</b>, rounded to 2 decimals.',
      solution: `SELECT department, ROUND(AVG(salary), 2) FROM employees GROUP BY department;`,
      hint: `<code>GROUP BY department</code>, and round the average.` },

    { kind: 'practice', id: 'm7-3', prompt: 'Return each <b>country</b> and its <b>customer count</b>, but only countries with <b>more than one</b> customer.',
      solution: `SELECT country, COUNT(*) FROM customers GROUP BY country HAVING COUNT(*) > 1;`,
      hint: `Filter the groups with <code>HAVING COUNT(*) > 1</code>.` },

    { kind: 'practice', id: 'm7-4', prompt: 'Return each <b>customer_id</b> and their <b>number of orders</b>, for customers with <b>at least 2 orders</b>.',
      solution: `SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id HAVING COUNT(*) >= 2;`,
      hint: `Group the orders by customer, then <code>HAVING COUNT(*) >= 2</code>.` }
  ]
},

/* ============================ 08 — JOINS I ============================ */
{
  id: 'm8', title: 'Joins I: combining tables',
  summary: 'The heart of relational SQL. Pull columns from two or more tables in one query by matching their keys.',
  lessons: [
    { kind: 'concept', title: 'INNER JOIN',
      body: `<p>Data is split across tables to avoid repetition \u2014 orders store a <code>customer_id</code>, not the whole customer. A <b>JOIN</b> reunites them by matching keys. The <b>ON</b> clause says which columns must line up:</p>
<p><code>FROM orders o JOIN customers c ON o.customer_id = c.customer_id</code></p>
<p>A plain <b>INNER JOIN</b> keeps only rows that match on both sides. Short <b>table aliases</b> (<code>o</code>, <code>c</code>) keep it readable, and you prefix columns as <code>o.order_date</code> when a name exists in both tables.</p>`,
      example: `SELECT o.order_id, c.name, o.order_date
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id;` },

    { kind: 'concept', title: 'Joining more than two tables',
      body: `<p>Chain joins to cross several tables. To go from an order line to the product name and the customer name, you hop through <code>orders</code>:</p>
<p><code>order_items \u2192 orders \u2192 customers</code>, plus <code>order_items \u2192 products</code>. Each JOIN adds one ON condition.</p>`,
      example: `SELECT c.name AS customer, p.name AS product, oi.quantity
FROM order_items oi
JOIN orders o     ON oi.order_id   = o.order_id
JOIN customers c  ON o.customer_id = c.customer_id
JOIN products p   ON oi.product_id = p.product_id;` },

    { kind: 'practice', id: 'm8-1', prompt: 'For every order, return its <b>order_id</b> and the <b>customer\u2019s name</b>.',
      solution: `SELECT o.order_id, c.name FROM orders o JOIN customers c ON o.customer_id = c.customer_id;`,
      hint: `Join <code>orders</code> to <code>customers</code> on <code>customer_id</code>.` },

    { kind: 'practice', id: 'm8-2', prompt: 'For every order item, return the <b>product name</b> and the <b>quantity</b> ordered.',
      solution: `SELECT p.name, oi.quantity FROM order_items oi JOIN products p ON oi.product_id = p.product_id;`,
      hint: `Join <code>order_items</code> to <code>products</code> on <code>product_id</code>.` },

    { kind: 'practice', id: 'm8-3', prompt: 'For every order item, return the <b>customer\u2019s name</b> and the <b>product\u2019s name</b> (two columns). This needs three joins.',
      solution: `SELECT c.name, p.name FROM order_items oi JOIN orders o ON oi.order_id = o.order_id JOIN customers c ON o.customer_id = c.customer_id JOIN products p ON oi.product_id = p.product_id;`,
      hint: `Go <code>order_items \u2192 orders \u2192 customers</code>, and also <code>order_items \u2192 products</code>.` }
  ]
},

/* ============================ 09 — JOINS II ============================ */
{
  id: 'm9', title: 'Joins II: outer and self',
  summary: 'Keep rows that have no match, find the gaps, and join a table to itself to walk a hierarchy.',
  lessons: [
    { kind: 'concept', title: 'LEFT JOIN keeps unmatched rows',
      body: `<p>An INNER JOIN drops rows with no match \u2014 a customer with no orders vanishes. A <b>LEFT JOIN</b> keeps every row from the left table and fills the right side with <b>NULL</b> where there's no match:</p>
<p><code>FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id</code></p>
<p>Fatima Khan has no orders, so she appears with NULLs. That's what lets you count \u201c0 orders\u201d instead of losing her.</p>
<div class="note">SQLite also supports RIGHT and FULL OUTER JOIN in recent versions, but any RIGHT JOIN can be rewritten as a LEFT JOIN by swapping the tables \u2014 so LEFT is what you'll reach for.</div>`,
      example: `SELECT c.name, o.order_id
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id;` },

    { kind: 'concept', title: 'Finding non-matches, and self-joins',
      body: `<p>A LEFT JOIN plus <code>WHERE right_key IS NULL</code> is the classic \u201cfind the rows with no match\u201d pattern \u2014 customers who never ordered, products never sold.</p>
<p>A <b>self-join</b> joins a table to itself, using two aliases. The employees table points at itself through <code>manager_id</code>, so you can pair each employee with their manager:</p>
<p><code>FROM employees e JOIN employees m ON e.manager_id = m.employee_id</code></p>`,
      example: `SELECT e.name AS employee, m.name AS manager
FROM employees e
JOIN employees m ON e.manager_id = m.employee_id;` },

    { kind: 'practice', id: 'm9-1', prompt: 'Return <b>every</b> customer\u2019s <b>name</b> and their <b>number of orders</b> \u2014 including customers with <b>zero</b>. Two columns.',
      solution: `SELECT c.name, COUNT(o.order_id) FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;`,
      hint: `LEFT JOIN keeps the zero-order customer; count <code>o.order_id</code> (not <code>*</code>) so her count is 0.` },

    { kind: 'practice', id: 'm9-2', mustUse: ['left join'], prompt: 'Return the <b>name</b> of customers who have <b>never placed an order</b>. Use a LEFT JOIN.',
      solution: `SELECT c.name FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL;`,
      hint: `After the LEFT JOIN, keep rows where <code>o.order_id IS NULL</code>.` },

    { kind: 'practice', id: 'm9-3', prompt: 'Pair each employee with their manager: return the <b>employee\u2019s name</b> and their <b>manager\u2019s name</b>. Employees with no manager can be left out.',
      solution: `SELECT e.name, m.name FROM employees e JOIN employees m ON e.manager_id = m.employee_id;`,
      hint: `Self-join: <code>employees e JOIN employees m ON e.manager_id = m.employee_id</code>.` }
  ]
},

/* ============================ 10 — SUBQUERIES ============================ */
{
  id: 'm10', title: 'Subqueries',
  summary: 'A query inside a query. Use one query\u2019s result to drive another \u2014 as a single value, a list to match against, an existence test, or a temporary table.',
  lessons: [
    { kind: 'concept', title: 'Scalar and IN subqueries',
      body: `<p>A <b>subquery</b> is a SELECT wrapped in parentheses. If it returns one value, compare against it directly (a <b>scalar</b> subquery):</p>
<p><code>WHERE price > (SELECT AVG(price) FROM products)</code></p>
<p>If it returns a column of values, test membership with <b>IN</b>:</p>
<p><code>WHERE customer_id IN (SELECT customer_id FROM orders)</code></p>`,
      example: `SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);` },

    { kind: 'concept', title: 'EXISTS and derived tables',
      body: `<p><b>EXISTS</b> tests whether a related subquery returns any row \u2014 great for \u201chas at least one\u201d and, negated, \u201chas none.\u201d It references the outer row (a <b>correlated</b> subquery):</p>
<p><code>WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)</code></p>
<p>A subquery in the <b>FROM</b> clause acts as a temporary table (a <b>derived table</b>) you can aggregate over \u2014 useful for \u201can average of counts.\u201d</p>`,
      example: `SELECT ROUND(AVG(cnt), 2) AS avg_orders
FROM (SELECT COUNT(*) AS cnt FROM orders GROUP BY customer_id);` },

    { kind: 'practice', id: 'm10-1', prompt: 'Return the <b>name</b> and <b>price</b> of products that cost <b>more than the average</b> product price.',
      solution: `SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);`,
      hint: `Compare against a scalar subquery: <code>> (SELECT AVG(price) FROM products)</code>.` },

    { kind: 'practice', id: 'm10-2', mustUse: ['in','SUBQUERY'], prompt: 'Return the <b>name</b> of customers who <b>have placed at least one order</b>. Use a subquery with IN.',
      solution: `SELECT name FROM customers WHERE customer_id IN (SELECT customer_id FROM orders);`,
      hint: `<code>WHERE customer_id IN (SELECT customer_id FROM orders)</code>.` },

    { kind: 'practice', id: 'm10-3', mustUse: ['not exists'], prompt: 'Return the <b>name</b> of customers who have <b>no orders</b>, using <code>NOT EXISTS</code>.',
      solution: `SELECT name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);`,
      hint: `<code>NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)</code>.` },

    { kind: 'practice', id: 'm10-4', mustUse: ['DERIVED'], prompt: 'Among customers who have ordered, what is the <b>average number of orders per customer</b>, rounded to 2 decimals? Use a derived table.',
      solution: `SELECT ROUND(AVG(cnt), 2) FROM (SELECT COUNT(*) AS cnt FROM orders GROUP BY customer_id);`,
      hint: `Count per customer in a FROM-subquery, then average those counts.` }
  ]
},

/* ============================ 11 — SET OPERATIONS ============================ */
{
  id: 'm11', title: 'Set operations',
  summary: 'Stack or compare the results of two queries: combine them, keep only what\u2019s in both, or subtract one from the other.',
  lessons: [
    { kind: 'concept', title: 'UNION, INTERSECT, EXCEPT',
      body: `<p>These combine two result sets that have the <b>same columns</b>:</p>
<ul>
<li><b>UNION</b> \u2014 all rows from both, duplicates removed. <b>UNION ALL</b> keeps duplicates (and is faster).</li>
<li><b>INTERSECT</b> \u2014 only rows present in both.</li>
<li><b>EXCEPT</b> \u2014 rows in the first query that aren't in the second.</li>
</ul>
<p><code>SELECT product_id FROM products EXCEPT SELECT product_id FROM order_items</code> \u2014 products never ordered.</p>`,
      example: `SELECT product_id FROM products
EXCEPT
SELECT product_id FROM order_items;` },

    { kind: 'practice', id: 'm11-1', mustUse: ['union'], prompt: 'Return a single de-duplicated column of product <b>name</b>s that are either in the <b>Electronics</b> category <b>or</b> priced <b>under 10</b>. Use <code>UNION</code>.',
      solution: `SELECT name FROM products WHERE category = 'Electronics' UNION SELECT name FROM products WHERE price < 10;`,
      hint: `Two SELECTs joined by <code>UNION</code>, each with its own WHERE.` },

    { kind: 'practice', id: 'm11-2', mustUse: ['intersect'], prompt: 'Return the <b>product_id</b>s that are <b>both</b> in Electronics <b>and</b> priced over 100. Use <code>INTERSECT</code>.',
      solution: `SELECT product_id FROM products WHERE category = 'Electronics' INTERSECT SELECT product_id FROM products WHERE price > 100;`,
      hint: `<code>\u2026 Electronics INTERSECT \u2026 price > 100</code>.` },

    { kind: 'practice', id: 'm11-3', mustUse: ['except'], prompt: 'Return the <b>product_id</b>s of products that have <b>never been ordered</b>. Use <code>EXCEPT</code>.',
      solution: `SELECT product_id FROM products EXCEPT SELECT product_id FROM order_items;`,
      hint: `All product ids, minus the ids that appear in order_items.` }
  ]
},

/* ============================ 12 — CASE ============================ */
{
  id: 'm12', title: 'CASE: conditional logic',
  summary: 'The if/else of SQL. Label rows into buckets, and count things conditionally within a single pass.',
  lessons: [
    { kind: 'concept', title: 'CASE expressions',
      body: `<p><b>CASE</b> returns different values per row based on conditions \u2014 the first matching <b>WHEN</b> wins, and <b>ELSE</b> catches the rest:</p>
<p><code>CASE WHEN price &lt; 50 THEN 'cheap' ELSE 'pricey' END</code></p>
<p>Stack WHENs for more buckets. Order matters \u2014 put the tightest condition first.</p>`,
      example: `SELECT name, price,
  CASE WHEN price < 20 THEN 'budget'
       WHEN price < 100 THEN 'mid'
       ELSE 'premium' END AS tier
FROM products;` },

    { kind: 'concept', title: 'Conditional aggregation',
      body: `<p>Put CASE <i>inside</i> an aggregate to count or sum only rows that match \u2014 several conditional totals in one row, no separate queries:</p>
<p><code>SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)</code></p>`,
      example: `SELECT
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
  SUM(CASE WHEN status = 'shipped'   THEN 1 ELSE 0 END) AS shipped
FROM orders;` },

    { kind: 'practice', id: 'm12-1', columns: ['name','label'], prompt: 'Return each product\u2019s <b>name</b> and a label: <code>cheap</code> if the price is <b>under 50</b>, otherwise <code>pricey</code>. Alias the label <code>label</code>.',
      solution: `SELECT name, CASE WHEN price < 50 THEN 'cheap' ELSE 'pricey' END AS label FROM products;`,
      hint: `<code>CASE WHEN price < 50 THEN 'cheap' ELSE 'pricey' END</code>.` },

    { kind: 'practice', id: 'm12-2', columns: ['name','tier'], prompt: 'Return each product\u2019s <b>name</b> and a <code>tier</code>: <code>budget</code> under 20, <code>mid</code> under 100, else <code>premium</code>.',
      solution: `SELECT name, CASE WHEN price < 20 THEN 'budget' WHEN price < 100 THEN 'mid' ELSE 'premium' END AS tier FROM products;`,
      hint: `Two WHENs then ELSE; the first matching one wins, so order them low to high.` },

    { kind: 'practice', id: 'm12-3', columns: ['completed','cancelled'], prompt: 'In a <b>single row</b>, count how many orders are <b>completed</b> and how many are <b>cancelled</b> (two columns: completed, then cancelled).',
      solution: `SELECT SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed, SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled FROM orders;`,
      hint: `Two conditional sums: <code>SUM(CASE WHEN status = '\u2026' THEN 1 ELSE 0 END)</code>.` }
  ]
},

/* ============================ 13 — WINDOW FUNCTIONS ============================ */
{
  id: 'm13', title: 'Window functions',
  summary: 'Compute across a set of rows while keeping every row \u2014 rankings, running totals, and comparisons to the previous row. Where GROUP BY collapses, windows preserve.',
  lessons: [
    { kind: 'concept', title: 'OVER and ranking',
      body: `<p>A <b>window function</b> runs an aggregate-like calculation <b>OVER</b> a set of rows without collapsing them. Every input row stays in the output, with the computed value attached:</p>
<p><code>RANK() OVER (ORDER BY price DESC)</code></p>
<p>Ranking family: <b>ROW_NUMBER()</b> (1,2,3\u2026 always distinct), <b>RANK()</b> (ties share a rank, then it skips), <b>DENSE_RANK()</b> (ties share, no skip).</p>`,
      example: `SELECT name, price, RANK() OVER (ORDER BY price DESC) AS price_rank
FROM products
ORDER BY price DESC;` },

    { kind: 'concept', title: 'PARTITION BY, running totals, LAG',
      body: `<p><b>PARTITION BY</b> restarts the window per group \u2014 rank within each category, number within each department:</p>
<p><code>ROW_NUMBER() OVER (PARTITION BY category ORDER BY price)</code></p>
<p>With an ORDER BY inside OVER, aggregates become <b>running</b>: <code>SUM(salary) OVER (ORDER BY hire_date)</code> is a cumulative total. <b>LAG(col)</b> / <b>LEAD(col)</b> reach into the previous / next row.</p>`,
      example: `SELECT name, hire_date, salary,
  SUM(salary) OVER (ORDER BY hire_date) AS running_total
FROM employees
ORDER BY hire_date;` },

    { kind: 'practice', id: 'm13-1', mustUse: ['over'], columns: ['name','price','price_rank'], prompt: 'Return <b>name</b>, <b>price</b>, and a <b>rank</b> by price (most expensive = 1), ordered from most to least expensive. Alias the rank <code>price_rank</code>.',
      orderMatters: true,
      solution: `SELECT name, price, RANK() OVER (ORDER BY price DESC) AS price_rank FROM products ORDER BY price DESC;`,
      hint: `<code>RANK() OVER (ORDER BY price DESC)</code>, and also sort the output by price DESC.` },

    { kind: 'practice', id: 'm13-2', mustUse: ['over'], columns: ['category','name','price','n'], prompt: 'Within each <b>category</b>, number the products from <b>cheapest to most expensive</b>. Return category, name, price, and the number \u2014 ordered by category, then price ascending. Alias the number <code>n</code>.',
      orderMatters: true,
      solution: `SELECT category, name, price, ROW_NUMBER() OVER (PARTITION BY category ORDER BY price) AS n FROM products ORDER BY category, price;`,
      hint: `<code>ROW_NUMBER() OVER (PARTITION BY category ORDER BY price)</code>.` },

    { kind: 'practice', id: 'm13-3', mustUse: ['over'], columns: ['name','hire_date','salary','running_total'], prompt: 'Return <b>name</b>, <b>hire_date</b>, <b>salary</b>, and a <b>running total</b> of salary ordered by hire_date (earliest first). Alias it <code>running_total</code>.',
      orderMatters: true,
      solution: `SELECT name, hire_date, salary, SUM(salary) OVER (ORDER BY hire_date) AS running_total FROM employees ORDER BY hire_date;`,
      hint: `<code>SUM(salary) OVER (ORDER BY hire_date)</code>, and sort the output by hire_date too.` }
  ]
},

/* ============================ 14 — CTEs ============================ */
{
  id: 'm14', title: 'Common Table Expressions (CTEs)',
  summary: 'Name a subquery up front with WITH so your query reads top to bottom. Then the payoff: recursive CTEs, which can generate sequences and walk hierarchies.',
  lessons: [
    { kind: 'concept', title: 'WITH: naming a subquery',
      body: `<p>A <b>CTE</b> defines a named temporary result before the main query, so complex logic reads in order instead of nesting inward:</p>
<p><code>WITH order_counts AS (SELECT customer_id, COUNT(*) AS cnt FROM orders GROUP BY customer_id) SELECT * FROM order_counts WHERE cnt > 2;</code></p>
<p>It's the same as a derived table, but named and reusable \u2014 much easier to read and to build up in steps.</p>`,
      example: `WITH order_counts AS (
  SELECT customer_id, COUNT(*) AS cnt
  FROM orders GROUP BY customer_id
)
SELECT c.name, oc.cnt
FROM order_counts oc
JOIN customers c ON c.customer_id = oc.customer_id
ORDER BY oc.cnt DESC;` },

    { kind: 'concept', title: 'Recursive CTEs',
      body: `<p>A <b>recursive</b> CTE refers to itself. It has two parts joined by UNION ALL: a starting row (the <i>anchor</i>), and a step that builds the next rows from the previous ones, until nothing new is produced. It's how SQL generates sequences and walks tree structures like an org chart.</p>
<p><code>WITH RECURSIVE nums(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM nums WHERE n &lt; 10) SELECT n FROM nums;</code></p>`,
      example: `WITH RECURSIVE nums(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM nums WHERE n < 10
)
SELECT n FROM nums;` },

    { kind: 'practice', id: 'm14-1', mustUse: ['CTE'], prompt: 'Using a CTE, return the <b>name</b> and <b>order count</b> of customers with <b>more than 2 orders</b> (two columns).',
      solution: `WITH oc AS (SELECT customer_id, COUNT(*) AS cnt FROM orders GROUP BY customer_id) SELECT c.name, oc.cnt FROM oc JOIN customers c ON c.customer_id = oc.customer_id WHERE oc.cnt > 2;`,
      hint: `Define <code>oc</code> as counts per customer, then join to customers and filter <code>cnt > 2</code>.` },

    { kind: 'practice', id: 'm14-2', mustUse: ['recursive'], columns: ['n'], prompt: 'Use a <b>recursive CTE</b> to return the numbers <b>1 through 10</b> in a single column called <code>n</code> (1 first).',
      orderMatters: true,
      solution: `WITH RECURSIVE nums(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM nums WHERE n < 10) SELECT n FROM nums;`,
      hint: `Anchor <code>SELECT 1</code>, then <code>UNION ALL SELECT n + 1 FROM nums WHERE n < 10</code>.` },

    { kind: 'practice', id: 'm14-3', mustUse: ['recursive'], prompt: 'Using a recursive CTE, return the <b>name</b> of every employee who reports to <b>Alice Chen</b>, directly or indirectly (that\u2019s everyone except Alice).',
      solution: `WITH RECURSIVE reports(id) AS (SELECT employee_id FROM employees WHERE manager_id = (SELECT employee_id FROM employees WHERE name = 'Alice Chen') UNION ALL SELECT e.employee_id FROM employees e JOIN reports r ON e.manager_id = r.id) SELECT name FROM employees WHERE employee_id IN (SELECT id FROM reports);`,
      hint: `Anchor: direct reports of Alice. Step: people whose manager is already in <code>reports</code>.` }
  ]
},

/* ============================ 15 — WRITING DATA ============================ */
{
  id: 'm15', title: 'Creating and changing data', scratch: true,
  summary: 'Everything so far only read data. Now you\u2019ll make tables and change rows. Every query in this module runs on a private, throwaway copy \u2014 experiment freely; nothing here touches the shared database.',
  lessons: [
    { kind: 'concept', title: 'CREATE TABLE, types, constraints',
      body: `<p><b>CREATE TABLE</b> defines a new table: each column gets a name and a <b>type</b> (<code>INTEGER</code>, <code>REAL</code>, <code>TEXT</code>). <b>Constraints</b> enforce rules \u2014 <code>PRIMARY KEY</code> (unique identifier), <code>NOT NULL</code> (required), <code>UNIQUE</code>, and <code>DEFAULT</code>:</p>
<p><code>CREATE TABLE tags (id INTEGER PRIMARY KEY, label TEXT NOT NULL);</code></p>`,
      example: `CREATE TABLE tags (id INTEGER PRIMARY KEY, label TEXT NOT NULL);
INSERT INTO tags (id, label) VALUES (1, 'sql'), (2, 'database');
SELECT * FROM tags;` },

    { kind: 'concept', title: 'INSERT, UPDATE, DELETE',
      body: `<p>Three ways to change rows:</p>
<ul>
<li><b>INSERT</b> adds rows: <code>INSERT INTO products (name, category, price) VALUES ('X','Y',9.99);</code></li>
<li><b>UPDATE</b> changes existing rows \u2014 the <b>WHERE decides which</b>. Omit WHERE and you change <i>every</i> row.</li>
<li><b>DELETE</b> removes rows, again gated by WHERE.</li>
</ul>
<div class="note">The missing WHERE on an UPDATE or DELETE is the classic costly mistake. In real systems these run inside a <b>transaction</b> so you can <code>ROLLBACK</code>; here, the reset button is your undo.</div>`,
      example: `UPDATE employees SET salary = salary * 1.1 WHERE department = 'Support';
SELECT name, salary FROM employees WHERE department = 'Support';` },

    { kind: 'practice', id: 'm15-1', kindMod: true, prompt: 'Insert a new product: name <b>"Laptop Sleeve"</b>, category <b>"Accessories"</b>, price <b>24.99</b>.',
      want: 'products gains one row',
      solution: `INSERT INTO products (name, category, price) VALUES ('Laptop Sleeve','Accessories',24.99);`,
      verify: `SELECT name, category, price FROM products WHERE name = 'Laptop Sleeve';`,
      hint: `<code>INSERT INTO products (name, category, price) VALUES (\u2026);</code> \u2014 product_id auto-assigns.` },

    { kind: 'practice', id: 'm15-2', kindMod: true, prompt: 'Give every employee in the <b>Support</b> department a <b>10% raise</b> (multiply salary by 1.1).',
      want: 'Support salaries \u00d7 1.1',
      solution: `UPDATE employees SET salary = salary * 1.1 WHERE department = 'Support';`,
      verify: `SELECT name, salary FROM employees WHERE department = 'Support' ORDER BY employee_id;`,
      hint: `<code>UPDATE employees SET salary = salary * 1.1 WHERE department = 'Support';</code> \u2014 don\u2019t forget WHERE.` },

    { kind: 'practice', id: 'm15-3', kindMod: true, prompt: 'Delete all orders whose status is <b>"cancelled"</b>.',
      want: 'cancelled orders removed',
      solution: `DELETE FROM orders WHERE status = 'cancelled';`,
      verify: `SELECT COUNT(*) FROM orders;`,
      hint: `<code>DELETE FROM orders WHERE status = 'cancelled';</code>.` },

    { kind: 'practice', id: 'm15-4', kindMod: true, prompt: 'Create a table <code>tags</code> with columns <code>id INTEGER PRIMARY KEY</code> and <code>label TEXT NOT NULL</code>, then insert one row: id <b>1</b>, label <b>"sql"</b>.',
      want: 'tags has one row (1, sql)',
      solution: `CREATE TABLE tags (id INTEGER PRIMARY KEY, label TEXT NOT NULL); INSERT INTO tags (id, label) VALUES (1, 'sql');`,
      verify: `SELECT id, label FROM tags;`,
      hint: `Run the CREATE TABLE and the INSERT together \u2014 two statements, each ending in a semicolon.` }
  ]
},

/* ============================ 16 — DESIGN ============================ */
{
  id: 'm16', title: 'Design and integrity', scratch: true,
  summary: 'The ideas behind well-built databases: why data is split across tables, how keys keep it consistent, and what transactions, indexes, and views are for. Concept-only \u2014 examples run on a private copy.',
  lessons: [
    { kind: 'concept', title: 'Normalization: why so many tables?',
      body: `<p>Notice the data isn\u2019t one giant table. Customer details live in <code>customers</code>; each order just stores a <code>customer_id</code>. That\u2019s <b>normalization</b> \u2014 storing each fact once.</p>
<p>If a customer\u2019s city were copied onto every order, changing it would mean updating many rows, and they could disagree. Splitting tables and linking by key means one fact, one place. The trade-off is that you JOIN to reassemble \u2014 which is exactly what earlier modules practiced.</p>` },

    { kind: 'concept', title: 'Primary and foreign keys',
      body: `<p>A <b>primary key</b> uniquely identifies each row (<code>customer_id</code> in <code>customers</code>). A <b>foreign key</b> is a column that references another table\u2019s primary key (<code>orders.customer_id</code> \u2192 <code>customers.customer_id</code>).</p>
<p>Foreign keys express and protect relationships: a database with them enforced won\u2019t let you attach an order to a customer who doesn\u2019t exist. Keys are also what JOINs match on.</p>` },

    { kind: 'concept', title: 'Transactions',
      body: `<p>A <b>transaction</b> groups several statements so they succeed or fail together \u2014 all or nothing. You wrap them in <code>BEGIN</code> \u2026 <code>COMMIT</code>, and <code>ROLLBACK</code> undoes everything since BEGIN.</p>
<p>The classic case is a transfer: subtract from one account, add to another. If the second step fails, you never want the first to stick.</p>
<p>The example makes a deliberate \u201cmistake\u201d inside a transaction and then <code>ROLLBACK</code>s it \u2014 the final SELECT shows the prices came back untouched. Swap <code>ROLLBACK</code> for <code>COMMIT</code> and the change would stick instead. Practice this yourself in the <b>Playground</b>, where changes persist across runs.</p>
<div class="note">SQLite runs each statement in its own automatic transaction unless you open one with BEGIN. Once you do, nothing is permanent until COMMIT \u2014 and ROLLBACK is your undo.</div>`,
      example: `BEGIN;
UPDATE products SET price = 0;   -- oops, wipe every price
ROLLBACK;                        -- undo the whole transaction
SELECT name, price FROM products LIMIT 3;   -- prices are back` },

    { kind: 'concept', title: 'Indexes and query plans',
      body: `<p>An <b>index</b> is a lookup structure the database keeps so it can find matching rows without scanning the whole table \u2014 like a book\u2019s index. It speeds up WHERE and JOIN on the indexed columns, at the cost of extra space and slightly slower writes. Primary keys are indexed automatically.</p>
<p><b>EXPLAIN QUERY PLAN</b> shows how SQLite intends to run a query. <code>SCAN</code> means it reads the whole table; <code>SEARCH \u2026 USING INDEX</code> means it jumps straight to matching rows. Run the example: the first plan SCANs, then after <code>CREATE INDEX</code> the same query SEARCHes. That difference is everything on a large table.</p>
<div class="note">Try it in the Playground too: type a query and click <b>Explain plan</b> to see how it would run \u2014 no index needed to start.</div>`,
      example: `EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 1;
-- now create an index and ask again:
CREATE INDEX idx_orders_customer ON orders(customer_id);
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 1;` },

    { kind: 'concept', title: 'Views',
      body: `<p>A <b>view</b> is a saved query you can select from as if it were a table \u2014 it stores the SQL, not the data, so it\u2019s always current. Views hide complexity behind a friendly name. Run the example to create one and query it.</p>`,
      example: `CREATE VIEW customer_orders AS
SELECT c.name, COUNT(o.order_id) AS orders
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name;

SELECT * FROM customer_orders ORDER BY orders DESC;` }
  ]
}

];
