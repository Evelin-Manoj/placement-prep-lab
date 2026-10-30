// Curriculum skeleton: interview rounds, topics, and which question-bank entries belong to each topic.
// Topic study content (notes, quizzes, flashcards, coding prompts) lives in data/topics/*.js and is
// attached to these topic ids via window.registerTopic(...).
window.CURRICULUM = {
  siteTitle: 'Placement Prep Lab',
  tagline: 'Everything in the Placement_preparation repository, rebuilt as an interview course with practice sessions.',
  rounds: [
    {
      id: 'fundamentals',
      title: 'Round 1 · Programming & CS fundamentals',
      blurb: 'Campus and service-company screens open with language basics, OOP vocabulary and database theory. Interviewers probe definitions, then ask you to contrast two things (struct vs class, DELETE vs TRUNCATE, list vs tuple).',
      topics: ['cpp', 'python', 'db'],
    },
    {
      id: 'web',
      title: 'Round 2 · Web fundamentals',
      blurb: 'For front-end roles the technical round lives here: HTML semantics, then JavaScript in depth. Expect rapid-fire concept questions, "what does this print" snippets and a request to implement a small utility by hand.',
      topics: ['html', 'js-core', 'js-es6', 'js-async', 'js-browser', 'js-tooling', 'js-output'],
    },
    {
      id: 'frameworks',
      title: 'Round 3 · Frameworks & backend',
      blurb: 'The framework round checks whether you understand React beneath the API surface, how state is managed at scale, and how server-side JavaScript or PHP handles requests.',
      topics: ['react-fund', 'react-adv', 'react-redux', 'react-eco', 'node', 'php'],
    },
  ],
  // Rounds that a real placement process has but the repository does not cover yet.
  notCovered: [
    { title: 'DSA & problem solving', note: 'No algorithm or data-structure problem sets exist in the repository yet. Add a markdown or PDF file and re-run the content build to pick it up.' },
    { title: 'Projects, system design & HR', note: 'The repository has no project-discussion or behavioural material. The mock interview here samples only from what the repository contains.' },
  ],
  topics: [
    // ---- Round 1 ----
    { id: 'cpp', title: 'C++ & object-oriented programming', short: 'C++ / OOP', icon: '⚙️', source: 'cpp', all: true,
      summary: 'Fifty classic C++ questions: references vs pointers, polymorphism, constructors, virtual functions, STL and memory.' },
    { id: 'python', title: 'Python essentials', short: 'Python', icon: '🐍', source: 'python', all: true,
      summary: 'Data types, mutability, comprehensions, decorators, generators, GIL and the 3.10+ features interviewers like to probe.' },
    { id: 'db', title: 'Databases & SQL', short: 'DB / SQL', icon: '🗄️', source: 'db', all: true,
      summary: 'DBMS theory, normalisation, keys, joins, transactions and the query-writing exercise every DB round includes.' },
    // ---- Round 2 ----
    { id: 'html', title: 'HTML & the document', short: 'HTML', icon: '🧱', source: 'html', all: true,
      summary: 'Elements vs tags, block vs inline, semantic layout, forms, tables, storage, and how CSS and JS attach to a page.' },
    { id: 'js-core', title: 'JavaScript: language core', short: 'JS core', icon: '🧠', source: 'js',
      summary: 'Types and coercion, scope and hoisting, closures, this, prototypes, classes and function patterns: the heart of every JS interview.',
      numbers: [1,2,3,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,25,26,27,28,29,30,66,67,68,69,70,71,72,73,74,75,79,80,81,82,83,84,97,98,99,101,108,110,128,136,137,138,140,141,143,144,145,146,147,162,165,173,174,176,177,184,185,186,187,188,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,241,247,249,250,254,255,256,257,258,259,260,261,262,263,264,278,279,280,281,282,283,289,290,291,298,299,301,302,303,306,307,308,330,334,337,338,339,340,341,342,345,349,350,351,353,356,357,358,359,380,397,402,403,406,413,414,415,419,420,421,422,432,433,437,439,440,441,442,445,446,447,448,449] },
    { id: 'js-es6', title: 'JavaScript: ES6+, objects, arrays & data', short: 'JS ES6+ & data', icon: '🧩', source: 'js',
      summary: 'Destructuring, spread/rest, template literals, Map/Set/WeakMap, freeze/seal, iterators and generators, JSON, dates, regex and array utilities.',
      numbers: [4,5,6,7,8,111,112,113,114,115,120,125,126,127,129,130,131,132,133,134,135,148,149,150,154,155,156,157,158,159,160,171,178,179,180,182,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,213,232,233,234,235,239,240,242,243,244,245,246,248,285,286,288,293,304,305,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,335,336,343,344,346,347,348,354,360,361,362,363,364,365,366,367,373,375,376,377,404,410,411,416,417,418,425,427,428,430,436,438] },
    { id: 'js-async', title: 'JavaScript: async & the event loop', short: 'JS async', icon: '⏱️', source: 'js',
      summary: 'Callbacks, promises, async/await, the call stack, task and microtask queues, timers, workers and server-sent events.',
      numbers: [31,32,33,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,93,106,107,117,118,169,170,236,237,238,352,381,382,383,385,386,387,388,389,390,392,393,394,395,399,400,401,405,407,408,412,423,429,450] },
    { id: 'js-browser', title: 'JavaScript: browser, DOM & web APIs', short: 'JS browser', icon: '🌐', source: 'js',
      summary: 'Event flow and delegation, cookies vs web storage, BOM and location, postMessage security, form validation, performance (reflow, debounce, throttle) and dev tools.',
      numbers: [23,34,35,36,37,38,39,40,41,42,43,44,45,46,47,76,77,78,85,86,87,88,89,90,91,92,94,95,96,100,102,103,104,105,109,116,119,121,122,123,124,139,161,163,164,166,167,168,172,175,181,183,210,211,212,272,273,274,275,276,277,284,287,292,294,295,300,325,326,327,328,329,331,332,333,355,368,369,370,371,372,374,378,379,384,424,426,431,434,435] },
    { id: 'js-tooling', title: 'JavaScript: ecosystem & tooling', short: 'JS tooling', icon: '🛠️', source: 'js',
      summary: 'Polyfills vs shims, Babel, tree shaking, minification and obfuscation, TypeScript, Node, Deno, V8, jQuery and the MEAN stack.',
      numbers: [142,151,152,153,231,251,252,253,265,266,267,268,269,270,271,296,297,391,396,398,409] },
    { id: 'js-output', title: 'JavaScript: predict-the-output drills', short: 'JS output drills', icon: '🎯', source: 'js', coding: true,
      summary: 'Eighty "what does this print" snippets from the repository, each with options, the real answer, and the rule that explains it.' },
    // ---- Round 3 ----
    { id: 'react-fund', title: 'React fundamentals', short: 'React basics', icon: '⚛️', source: 'react',
      summary: 'JSX, elements vs components, props and state, events, keys, refs, controlled forms, lifecycle, Virtual DOM and reconciliation.',
      numbers: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,39,40,41,42,43,45,49,50,51,52,53,56,57,58,59,60,61,62,63,64,65,66,67,68,72,73,74,75,76,77,79,80,82,86,87,88,89,90,91,92,93,94,95,96,97,98,99,101,102,103,104,105,106,107,108,110,111,112,113,115,116,117,119,120,121,122,123,125,126,127,238,239,240,241,242,243,245,247,248,249,253,256,258,259,261,262,263,264,265,266,267,268,285,286,287,288,289,294,296,298,311,312,313,314,318,323,330,331,335] },
    { id: 'react-adv', title: 'React: hooks, patterns & performance', short: 'React advanced', icon: '🪝', source: 'react',
      summary: 'Hooks and their rules, context, HOCs and render props, portals, fragments, error boundaries, memo, lazy/Suspense, code splitting, concurrent rendering and strict mode.',
      numbers: [35,36,37,38,44,46,47,48,54,55,69,70,71,78,81,83,84,85,128,215,216,217,221,222,223,224,225,226,227,228,231,232,233,234,235,236,237,244,246,250,252,254,255,260,271,272,273,274,275,276,277,278,279,280,281,282,283,284,290,291,292,293,295,302,303,304,305,306,307,308,315,319,320,321,322,326,327,329,332,333,334,336,337] },
    { id: 'react-redux', title: 'Redux & state management', short: 'Redux', icon: '🔁', source: 'react',
      summary: 'Flux vs Redux, the three principles, reducers, actions, connect and mapStateToProps, thunk vs saga, selectors, DevTools, MobX and when not to put state in the store.',
      numbers: [152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,206,207,210,211,212,219,229,310,316,317,328] },
    { id: 'react-eco', title: 'React ecosystem: Router, testing, i18n, Native & tooling', short: 'React ecosystem', icon: '🧭', source: 'react',
      summary: 'React Router v4, Jest and test renderers, React Intl, React Native, create-react-app, TypeScript, Flow, styled-components, Formik, Next.js and dev tools.',
      numbers: [114,124,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,209,213,214,218,220,230,257,269,270,297,299,300,301,309,324,325] },
    { id: 'node', title: 'Node.js & server-side JavaScript', short: 'Node.js', icon: '🟢', source: 'node', all: true,
      summary: 'The event loop, non-blocking I/O, libuv, streams, buffers, modules, Express middleware, child processes and timers.' },
    { id: 'php', title: 'PHP & server-side scripting', short: 'PHP', icon: '🐘', source: 'php', all: true,
      summary: 'Variables and types, truthiness rules, include vs require, sessions and cookies, GET vs POST, magic methods, closures and type hinting.' },
  ],
  // Filled in by data/topics/*.js
  content: {},
};

window.registerTopic = function (id, content) {
  window.CURRICULUM.content[id] = content;
};
