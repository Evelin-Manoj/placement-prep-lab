window.registerTopic('js-tooling', {
  why: `Tooling questions are short and reveal how much production work you have done. Interviewers ask what Babel actually does, why bundles shrink with tree shaking, how a polyfill differs from a shim, and what TypeScript buys you. They also sprinkle in landscape questions (V8, Node vs Deno, jQuery, the MEAN stack) to see whether you follow the ecosystem.

Keep each answer to a definition plus the problem it solves.`,
  notes: [
    { h: 'Compatibility: polyfills, shims and Babel', md: `A **polyfill** is JavaScript that implements a newer feature in an older browser (e.g. \`Array.prototype.includes\` for IE). A **shim** is the broader term: a library that brings a new API to an older environment using only what that environment has, not necessarily in a browser (es5-shim). **Babel** is a transpiler that converts ES2015+ *syntax* (arrow functions, classes, JSX, TypeScript types) into older JavaScript; it does not add missing runtime APIs, which is why Babel is paired with core-js polyfills. Together they let you write modern code and still ship to old targets.` },
    { h: 'Shipping less: tree shaking, minification, obfuscation', md: `**Tree shaking** is dead-code elimination performed by bundlers (Webpack, Rollup) that relies on the static structure of ES module \`import\`/\`export\` to drop unused exports, shrinking bundles. **Minification** removes whitespace and comments and renames identifiers without changing behaviour, reducing file size and load time (tools: Closure Compiler, UglifyJS/Terser, jsmin). **Obfuscation** deliberately makes code hard for humans to read to protect logic; it is reversible with effort, unlike **encryption**, which needs a key and must be decrypted before it can run. Minification is a mild form of obfuscation. **Module loaders** add dynamic loading, state and namespace isolation and compilation hooks.` },
    { h: 'TypeScript', md: `**TypeScript** is Microsoft's typed superset of JavaScript: optional static types, interfaces, enums, generics, decorators, compiled to plain JavaScript. Advantages: compile-time error detection, better IDE support and refactoring, self-documenting APIs, safer large code bases. Differences: TS is object-oriented with static typing and needs compilation; JS is dynamically typed and runs directly. Using an untyped JS library from TS requires a declaration file (\`.d.ts\`) or \`declare\` statements. Enums exist in TypeScript, not in JavaScript (where frozen objects emulate them).` },
    { h: 'Runtimes and engines', md: `**V8** is Google's open-source C++ JavaScript engine used by Chrome and Node.js; it JIT-compiles JavaScript (and runs WebAssembly). **Node.js** is a server-side runtime on V8 with an event-driven, non-blocking I/O model; the **MEAN stack** is MongoDB + Express + Angular + Node. **Deno** is a newer runtime for JavaScript and TypeScript on V8 written in Rust, secure by default (explicit permissions), with TypeScript built in. Node is single-threaded for JavaScript but its standard library offloads fs and other work to a thread pool.` },
    { h: 'Libraries and legacy', md: `**jQuery** is the cross-browser DOM, event, animation and AJAX library that smoothed over browser differences in the 2000s; modern DOM APIs and frameworks have replaced most of its uses, but legacy code still relies on it. Use \`import.meta\` to read module metadata such as the current module URL.` },
  ],
  pitfalls: [
    'Saying Babel "adds Promise support". Babel transforms syntax; polyfills add APIs.',
    'Claiming tree shaking works with CommonJS `require`. It depends on static ES module imports.',
    'Confusing obfuscation with encryption. Obfuscated code still runs as-is; encrypted code must be decrypted first.',
    'Describing TypeScript as "a different language". It compiles to JavaScript and every JS file is valid TS.',
  ],
  model: [
    { q: 'What is the difference between a polyfill and a transpiler?', a: 'A transpiler such as Babel rewrites newer syntax into older syntax at build time: arrow functions become function expressions, classes become constructor functions. A polyfill is code that runs in the browser to provide a missing API, such as `fetch` or `Array.prototype.flat`, by checking whether the feature exists and implementing it if not. Modern projects need both: Babel for syntax, core-js polyfills for APIs.', ref: 'js-142' },
    { q: 'What is tree shaking and what does it require?', a: 'Tree shaking is dead-code elimination at bundle time: the bundler analyses the import/export graph and leaves out exports nothing uses. It only works because ES module imports are static and resolvable without running the code; dynamic `require` calls defeat it. The payoff is a smaller bundle and faster load.', ref: 'js-151' },
  ],
  quiz: [
    { type: 'mcq', q: 'What does Babel do?', options: ['Adds missing browser APIs at run time', 'Converts modern JavaScript syntax into older, widely supported syntax', 'Minifies code', 'Runs JavaScript on the server'], answer: 1, explain: 'Babel is a transpiler; polyfills handle missing APIs.', ref: 'js-398' },
    { type: 'mcq', q: 'Tree shaking relies on…', options: ['CommonJS require()', 'Static ES module import/export', 'eval()', 'Dynamic script tags'], answer: 1, explain: 'Only statically analysable imports let the bundler prove code is unused.', ref: 'js-151' },
    { type: 'mcq', q: 'Which statement about minification is true?', options: ['It changes program behaviour', 'It removes whitespace and renames identifiers without changing behaviour', 'It encrypts the source', 'It only works on CSS'], answer: 1, explain: 'Minification is a size optimisation and a mild form of obfuscation.', ref: 'js-268' },
    { type: 'mcq', q: 'What is V8?', options: ['A CSS preprocessor', 'Google\'s JavaScript engine used by Chrome and Node.js', 'A bundler', 'A testing framework'], answer: 1, explain: 'Written in C++, it JIT-compiles JavaScript and WebAssembly.', ref: 'js-297' },
    { type: 'mcq', q: 'How is Deno different from Node?', options: ['It uses a different engine than V8', 'It is written in Rust, secure by default with explicit permissions, and runs TypeScript natively', 'It cannot run JavaScript', 'It is only for browsers'], answer: 1, explain: 'Both use V8; Deno adds permissions and first-class TypeScript.', ref: 'js-409' },
    { type: 'mcq', q: 'Shim vs polyfill: which is the broader term?', options: ['Polyfill', 'Shim', 'They are unrelated', 'Neither'], answer: 1, explain: 'A polyfill is a shim for a browser API; shims can target any environment.', ref: 'js-396' },
    { type: 'short', q: 'List three advantages of TypeScript over JavaScript.', a: 'Compile-time type errors instead of run-time surprises; richer IDE support (autocomplete, safe refactoring); explicit interfaces that document and enforce contracts across a large codebase. It also lets you use the latest syntax while compiling down to any target.', ref: 'js-253' },
    { type: 'short', q: 'What is obfuscation and how does it differ from encryption?', a: 'Obfuscation rewrites source into a form that machines run but humans struggle to read, to hide business logic and shrink size; no key is involved and it can be reversed with effort. Encryption transforms data with a key so it cannot be read or executed until decrypted.', ref: 'js-270' },
  ],
  cards: [
    { f: 'Polyfill', b: 'Runtime code that implements a missing API in older browsers.', ref: 'js-142' },
    { f: 'Shim vs polyfill', b: 'Shim: any library bringing a new API to an old environment. Polyfill: a shim for a browser web API.', ref: 'js-396' },
    { f: 'Babel', b: 'Transpiler turning ES2015+/JSX/TS syntax into backward-compatible JavaScript.', ref: 'js-398' },
    { f: 'Tree shaking', b: 'Bundler dead-code elimination using static ES module imports/exports.', ref: 'js-151' },
    { f: 'Minification', b: 'Strip whitespace/comments, rename identifiers; same behaviour, smaller file.', ref: 'js-268' },
    { f: 'Obfuscation vs encryption', b: 'Obfuscation: hard to read, still runs, no key. Encryption: unreadable until decrypted with a key.', ref: 'js-270' },
    { f: 'TypeScript', b: 'Typed superset of JS by Microsoft; compiles to JS; interfaces, enums, generics.', ref: 'js-251' },
    { f: 'V8', b: 'Google\'s C++ JIT engine for JS and WebAssembly; powers Chrome and Node.', ref: 'js-297' },
    { f: 'Deno', b: 'Rust-based secure runtime for JS/TS on V8 with explicit permissions.', ref: 'js-409' },
    { f: 'MEAN', b: 'MongoDB, Express, Angular, Node.js.', ref: 'js-265' },
  ],
});
