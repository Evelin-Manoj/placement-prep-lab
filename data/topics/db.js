window.registerTopic('db', {
  why: `Every placement process has a database segment because every application has one. The interviewer wants three things: **vocabulary** (DBMS vs RDBMS, keys, normal forms, ACID words), **judgement** (when to normalise or denormalise, when an index helps, DELETE vs TRUNCATE vs DROP) and **SQL fluency** (write a SELECT with WHERE, LIKE, ORDER BY, GROUP BY and a JOIN on the spot).

The repository's set follows that order exactly, and ends with a query exercise on an Employee table, which is how the round usually finishes.`,
  notes: [
    { h: 'Databases, DBMS and RDBMS', md: `A **database** is an organised collection of related data stored for a purpose. A **DBMS** is the software that lets users create, store, retrieve and secure that data (MySQL, Oracle, Sybase). An **RDBMS** is a DBMS built on the relational model: data lives in tables related through common columns and queried with **SQL**, the ANSI-standard language for relational data.

Advantages of a DBMS: controlled redundancy, validation and access restriction, backup and recovery, multiple user interfaces. **Data redundancy** is duplication of the same data in several places, wasting space and threatening integrity. Data models: relational, network, hierarchical.

**Data independence** means changing a schema at one level without touching the level above: *physical* (storage changes do not affect the conceptual schema) and *logical* (conceptual changes do not affect views). **Views** are virtual tables defined by a query; they give logical data independence and restrict access, but become invalid when a base table is dropped.` },
    { h: 'Keys, relationships and the E-R model', md: `- **Primary key**: uniquely identifies each row, never NULL, never changes. **Composite key**: a candidate key made of several columns. **Unique key**: like a primary key but allows one NULL. **Foreign key**: a column referencing another table's primary key.
- Relationships: **one-to-one**, **one-to-many** (primary key side relates to many rows via a foreign key), **many-to-many** (needs a junction table).
- **E-R model**: entities (things with independent existence), entity types and entity sets, attributes (properties), relations (two-dimensional tables of tuples and attributes). A **weak entity set** needs its parent's primary key to be identified.
- **Functional dependency** X → Y: X uniquely determines Y. **Fully functional dependency**: removing any attribute from X breaks the dependency.` },
    { h: 'Normalisation', md: `**Normalisation** splits tables to remove redundancy and protect integrity. **Denormalisation** adds redundancy back deliberately to speed up heavy read queries.

- **1NF**: every column holds atomic values; no repeating groups.
- **2NF**: 1NF and every non-key attribute depends on the *whole* primary key (no partial dependency).
- **3NF**: 2NF and no non-key attribute depends transitively on the key.
- **BCNF**: a stricter 3NF for tables with overlapping candidate keys; every determinant is a candidate key.

Say it as a story: 1NF fixes the cells, 2NF fixes partial dependencies on composite keys, 3NF fixes attribute-on-attribute dependencies.` },
    { h: 'SQL command families', md: `| Family | Purpose | Examples | Auto-commit? |
| --- | --- | --- | --- |
| **DDL** | define structure | CREATE, ALTER, DROP, TRUNCATE, RENAME | yes |
| **DML** | manipulate rows | INSERT, UPDATE, DELETE, MERGE | no (can roll back) |
| **DCL / TCL** | control access and transactions | GRANT, REVOKE / COMMIT, ROLLBACK, SAVEPOINT | — |

**DELETE vs TRUNCATE vs DROP**: DELETE removes rows (optionally with WHERE) and can be rolled back; TRUNCATE removes all rows quickly as DDL and cannot be rolled back in most systems; DROP removes the table or key itself. A **cursor** is a work area that walks a result set one row at a time; implicit cursors are created for DML statements, explicit ones for multi-row SELECTs. **Stored procedures** are precompiled SQL programs; **triggers** run automatically on INSERT/UPDATE/DELETE events.` },
    { h: 'Joins, with the query shapes', md: `A **join** combines rows from tables on a common value; a table joined to itself is a **self join**.

\`\`\`sql
SELECT * FROM employee e JOIN employee_info i ON e.EmpID = i.EmpID;   -- inner: matches only
SELECT * FROM employee NATURAL JOIN employee_info;                      -- inner on same-named columns
SELECT * FROM employee CROSS JOIN employee_info;                        -- every row × every row
SELECT * FROM employee e LEFT  OUTER JOIN employee_info i ON e.EmpID = i.EmpID;  -- all left rows
SELECT * FROM employee e RIGHT OUTER JOIN employee_info i ON e.EmpID = i.EmpID;  -- all right rows
SELECT * FROM employee e FULL  OUTER JOIN employee_info i ON e.EmpID = i.EmpID;  -- union of both
\`\`\`

Describe each with "which side keeps unmatched rows": inner keeps none, left keeps the left table's, right the right table's, full keeps both, cross keeps everything paired.` },
    { h: 'Transactions, locks, indexes and the rest', md: `A **transaction** is a sequence of operations that moves the database from one consistent state to another; it either completes fully or leaves no trace. **Atomicity** is the all-or-nothing guarantee (the DBMS undoes incomplete work). **Locks**: shared (readers) and exclusive (writers). A **checkpoint** marks a point up to which logs are safely on disk, shortening crash recovery. **Phantom deadlock**: detection algorithms report a deadlock that no longer exists because information propagated late.

**Indexes**: a **clustered index** reorders the physical rows (one per table, fast range reads); a **non-clustered index** is a separate structure pointing at rows. **Index hunting** tunes the set of indexes using the query optimiser and workload observation. **B-trees** keep insert, delete and search logarithmic on disk-based storage. **Partitioning** splits tables and indexes into manageable pieces for performance and high availability; **fragmentation** distributes logical units across sites of a distributed database. The **data dictionary** stores metadata about every object. **Data warehousing** centralises transactional and other data for analysis.` },
  ],
  pitfalls: [
    'Saying "TRUNCATE is faster DELETE". Add the real difference: TRUNCATE is DDL, drops all rows without logging each one, and cannot be filtered or rolled back.',
    'Describing 2NF without saying "composite key". Partial dependency only exists when the key has several columns.',
    'Confusing a unique key with a primary key: unique allows one NULL and a table may have several.',
    'Writing an inner join when the question says "all employees, including those without a department"; that is a LEFT JOIN.',
    'Forgetting that DDL auto-commits, so a stray DROP inside a transaction is not undone by ROLLBACK in most engines.',
  ],
  model: [
    { q: 'Explain normalisation and the first three normal forms.', a: 'Normalisation organises tables to remove redundant data and avoid update anomalies by splitting them along functional dependencies. 1NF requires atomic values in every cell. 2NF requires 1NF plus that every non-key column depends on the whole primary key, which matters when the key is composite. 3NF requires 2NF plus no transitive dependency: non-key columns must depend on the key, not on another non-key column. BCNF tightens 3NF so that every determinant is a candidate key. Denormalisation deliberately reverses some of this for read performance.', ref: 'db-8' },
    { q: 'What is the difference between DELETE, TRUNCATE and DROP?', a: 'DELETE is DML: it removes rows, accepts a WHERE clause, fires triggers and can be rolled back. TRUNCATE is DDL: it removes every row by deallocating pages, is much faster, cannot be filtered and in most systems cannot be rolled back. DROP removes the table definition itself, including its data, indexes and constraints.', ref: 'db-50' },
    { q: 'Describe the join types.', a: 'INNER JOIN returns only rows with matches in both tables; NATURAL JOIN is an inner join on all same-named columns. LEFT (OUTER) JOIN keeps every row of the left table, filling NULLs where the right has no match; RIGHT JOIN mirrors that; FULL OUTER JOIN keeps unmatched rows from both sides. CROSS JOIN returns the Cartesian product. A self join joins a table to itself, for example employees to their managers.', ref: 'db-37' },
  ],
  quiz: [
    { type: 'mcq', q: 'Which normal form removes transitive dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF only'], answer: 2, explain: '3NF requires that non-key attributes depend only on the key, not on other non-key attributes.', ref: 'db-8' },
    { type: 'mcq', q: 'Which command can be rolled back after execution?', options: ['TRUNCATE', 'DROP', 'DELETE', 'ALTER'], answer: 2, explain: 'DELETE is DML and is not auto-committed; DDL statements (TRUNCATE, DROP, ALTER) are.', ref: 'db-50' },
    { type: 'mcq', q: 'A LEFT OUTER JOIN returns…', options: ['Only matching rows', 'All rows from the left table plus matches from the right', 'All rows from the right table', 'The Cartesian product'], answer: 1, explain: 'Unmatched left rows appear with NULLs in the right-table columns.', ref: 'db-37' },
    { type: 'mcq', q: 'Which key allows exactly one NULL value?', options: ['Primary key', 'Unique key', 'Composite key', 'Foreign key'], answer: 1, explain: 'A unique key behaves like a primary key except that one NULL is permitted.', ref: 'db-45' },
    { type: 'mcq', q: 'Which statements belong to DDL?', options: ['INSERT, UPDATE, DELETE', 'COMMIT, ROLLBACK, SAVEPOINT', 'CREATE, ALTER, DROP, TRUNCATE', 'SELECT, JOIN, GROUP BY'], answer: 2, explain: 'DDL defines structure and auto-commits.', ref: 'db-12' },
    { type: 'mcq', q: 'A clustered index…', options: ['Is stored separately from the table', 'Reorders the physical rows of the table, so a table can have only one', 'Can only be built on text columns', 'Is the same as a primary key'], answer: 1, explain: 'Because it dictates physical order there is at most one; non-clustered indexes are separate structures.', ref: 'db-34' },
    { type: 'mcq', q: 'Which query lists employees whose name starts with R?', options: ["SELECT * FROM Employee WHERE empName = 'R%';", "SELECT * FROM Employee WHERE empName LIKE 'R%';", "SELECT * FROM Employee WHERE empName LIKE '%R';", "SELECT * FROM Employee HAVING empName LIKE 'R%';"], answer: 1, explain: 'LIKE with a trailing % matches any string beginning with R; = would need an exact match.', ref: 'db-51' },
    { type: 'mcq', q: 'Atomicity means…', options: ['Data is stored in atomic columns', 'A transaction either completes fully or has no effect', 'Only one user can write at a time', 'Indexes are rebuilt automatically'], answer: 1, explain: 'The DBMS undoes partial work of an incomplete transaction.', ref: 'db-38' },
    { type: 'short', q: 'Define functional dependency and fully functional dependency.', a: 'X → Y means the value of X uniquely determines Y: two rows equal on X are equal on Y. The dependency is fully functional when removing any attribute from X makes it stop holding, i.e. Y depends on all of X, not a part of it.', ref: 'db-20' },
    { type: 'short', q: 'What is a view and what is it good for?', a: 'A view is a virtual table defined by a stored query; it holds no data of its own. It provides logical data independence (base tables can be restructured without changing the view), restricts what users can see, and simplifies complex queries. Drawbacks: it depends on its base tables and large views can be slow.', ref: 'db-18' },
    { type: 'short', q: 'Write a query giving total salary per employee from an Emp(empName, Salary) table.', a: '`SELECT empName, SUM(Salary) FROM Emp GROUP BY empName;` Every non-aggregated column in the SELECT list must appear in GROUP BY.', ref: 'db-51' },
  ],
  cards: [
    { f: 'DBMS vs RDBMS', b: 'DBMS: software to manage data. RDBMS: a DBMS on the relational model, tables related by common columns, queried with SQL.', ref: 'db-3' },
    { f: '1NF / 2NF / 3NF in one line each', b: '1NF atomic values; 2NF no partial dependency on a composite key; 3NF no transitive dependency.', ref: 'db-8' },
    { f: 'BCNF', b: 'Stricter 3NF: every determinant is a candidate key; removes anomalies from overlapping candidate keys.', ref: 'db-9' },
    { f: 'DDL / DML / DCL examples', b: 'DDL: CREATE ALTER DROP TRUNCATE RENAME. DML: INSERT UPDATE DELETE MERGE. DCL/TCL: GRANT REVOKE, COMMIT ROLLBACK SAVEPOINT.', ref: 'db-12' },
    { f: 'DELETE vs TRUNCATE vs DROP', b: 'DELETE rows, WHERE, rollback. TRUNCATE all rows, DDL, no rollback. DROP removes the table.', ref: 'db-50' },
    { f: 'Primary vs unique key', b: 'Primary: unique, NOT NULL, one per table. Unique: unique, one NULL allowed, many per table.', ref: 'db-45' },
    { f: 'Join cheat sheet', b: 'Inner: matches only. Left/Right: keep that side. Full: keep both. Cross: Cartesian product. Natural: inner on same-named columns.', ref: 'db-37' },
    { f: 'Clustered vs non-clustered index', b: 'Clustered reorders physical rows (one per table). Non-clustered is a separate structure pointing to rows.', ref: 'db-34' },
    { f: 'Normalisation vs denormalisation', b: 'Normalise to remove redundancy and protect integrity; denormalise to speed up complex reads.', ref: 'db-7' },
    { f: 'Transaction + atomicity', b: 'Sequence of operations moving DB between consistent states; atomicity = all or nothing.', ref: 'db-28' },
    { f: 'Trigger vs stored procedure', b: 'Trigger runs automatically on INSERT/UPDATE/DELETE events. Stored procedure is precompiled SQL invoked explicitly.', ref: 'db-46' },
    { f: 'Weak entity set', b: 'Entity whose key includes its parent\'s primary key because it lacks enough attributes for its own key.', ref: 'db-24' },
  ],
  coding: [
    { id: 'select-where', title: 'SELECT with WHERE', prompt: 'From `Employee(empId, empName, Age, Address)`, show the details of the employee with empId 1004, then all records of the table. Write the SQL in the box; the runner executes JavaScript, so use the reveal to compare.', starter: '-- 1) details of employee 1004\n\n-- 2) all records\n', solution: 'SELECT empId, empName, Age, Address FROM Employee WHERE empId = 1004;\nSELECT * FROM Employee;', ref: 'db-51' },
    { id: 'like-order', title: 'LIKE and ORDER BY', prompt: 'Return all employees whose name starts with "R", then list id, age and name ordered by age ascending and again descending.', starter: '-- names starting with R\n\n-- by age ascending\n\n-- by age descending\n', solution: "SELECT * FROM Employee WHERE empName LIKE 'R%';\nSELECT empId, empName, Age FROM Employee ORDER BY Age;\nSELECT empId, empName, Age FROM Employee ORDER BY Age DESC;", ref: 'db-51' },
    { id: 'group-by', title: 'GROUP BY with an aggregate', prompt: 'From `Emp(empName, Salary)` compute the total salary per employee. Then extend it to only show employees whose total exceeds 50000.', starter: '-- total per employee\n\n-- only totals above 50000\n', solution: 'SELECT empName, SUM(Salary) AS total FROM Emp GROUP BY empName;\nSELECT empName, SUM(Salary) AS total FROM Emp GROUP BY empName HAVING SUM(Salary) > 50000;', notes: 'Filter groups with HAVING, not WHERE; WHERE runs before grouping.', ref: 'db-51' },
    { id: 'joins', title: 'Write the joins', prompt: 'Tables `employee(EmpID, EmpName)` and `employee_info(EmpID, Dept)`. Write an inner join, a left join that keeps employees without info, and a full outer join.', starter: '-- inner\n\n-- left outer\n\n-- full outer\n', solution: 'SELECT * FROM employee e INNER JOIN employee_info i ON e.EmpID = i.EmpID;\nSELECT * FROM employee e LEFT OUTER JOIN employee_info i ON e.EmpID = i.EmpID;\nSELECT * FROM employee e FULL OUTER JOIN employee_info i ON e.EmpID = i.EmpID;', notes: 'MySQL has no FULL OUTER JOIN; emulate it with LEFT JOIN UNION RIGHT JOIN.', ref: 'db-37' },
  ],
});
