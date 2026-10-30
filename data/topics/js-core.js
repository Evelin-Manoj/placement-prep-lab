window.registerTopic('js-core', {
  why: `This is the heart of a front-end interview. Interviewers probe the **execution model** (scope, hoisting, closures, \`this\`), the **type system** (primitives, coercion, \`==\` vs \`===\`, null vs undefined) and the **object model** (prototypes, classes, property descriptors). They are not testing trivia; they are testing whether you can predict what a line of code does and explain why in one sentence.

The classic chain: "what is hoisting?" → "then what is the temporal dead zone?" → "so what does this snippet print?" → "how would you fix it with a closure or \`let\`?" Prepare each concept with a definition, a two-line example and the trap it creates.`,
  notes: [
    { h: 'Types, equality and coercion', md: `Seven **primitive** types: string, number, boolean, null, undefined, bigint, symbol; everything else is an object. Primitives are immutable and compared by value; objects are mutable and compared by reference. Primitives temporarily get **wrapper objects** (\`"abc".length\` works because a String wrapper is created and discarded).

- \`undefined\`: declared but not assigned (also the type of a missing property); \`null\`: an intentional empty value whose \`typeof\` is the historic "object". \`null == undefined\` is true; \`null === undefined\` is false.
- **Undeclared** variables do not exist at all and throw ReferenceError when read (but \`typeof\` is safe).
- \`===\` compares type and value with no conversion; \`==\` converts first. \`NaN\` equals nothing, including itself; use \`Number.isNaN\` (no coercion, unlike global \`isNaN\`) or \`Object.is\`, which also distinguishes +0 and −0.
- \`+\` concatenates when either side is a string (\`1 + 2 + '3'\` → "33"); other arithmetic converts to numbers; unary \`+\` converts to a number, \`!!\` to a boolean, \`~~\` truncates to an integer, \`void 0\` yields undefined.
- **Pass by value vs reference**: primitives are copied; objects pass a copy of the reference, so mutations are shared but reassignment is not.` },
    { h: 'Scope, hoisting and the temporal dead zone', md: `**Scope** is where a name is visible. \`var\` is function-scoped and hoisted with the value undefined; \`let\` and \`const\` are block-scoped and hoisted *without* initialisation, so reading them before the declaration throws a ReferenceError: that window is the **temporal dead zone (TDZ)**. Function declarations are hoisted with their bodies; class declarations are not usable before their line.

\`\`\`js
function userDetails(username) {
  if (username) {
    console.log(salary); // undefined (hoisted var)
    console.log(age);    // ReferenceError (TDZ)
    let age = 30; var salary = 10000;
  }
}
\`\`\`

\`const\` prevents re-assignment, not mutation of the object it points to. Neither \`let\` nor \`const\` may be redeclared in the same scope (switch cases share one block; wrap a case body in braces to get a fresh scope). Local names shadow globals; omitting a declaration keyword in sloppy mode creates an accidental global. **Strict mode** (\`"use strict"\`) turns such mistakes into errors, forbids \`with\`, octal literals and duplicate parameter names, and makes \`this\` undefined in plain calls.

**Execution contexts**: the global execution context is created once; each call creates a function execution context with its own variable environment, kept on the **call stack**. An **environment record** is the spec's name for the mapping of identifiers to values in a scope.` },
    { h: 'Functions: expressions, IIFEs, closures, pure functions', md: `A **first-class** function can be stored, passed and returned. A **higher-order** function takes or returns functions; a **first-order** one does neither; a **unary** function takes one argument. **Anonymous** functions have no name; **arrow functions** are shorter, have no own \`this\`, \`arguments\`, \`super\` or \`new.target\`, and cannot be constructors. \`fn.length\` gives the declared parameter count; the **arguments** object is array-like, while **rest parameters** (\`...args\`) give a real array and must be last.

An **IIFE** runs as soon as it is defined and gives data privacy: \`(function () { ... })();\` (or \`void function(){}()\`). Before ES2022 it was also the way to use \`await\` outside a module.

A **closure** is a function plus the lexical environment it was created in: an inner function keeps access to the outer function's variables after the outer has returned. Closures power the **module pattern**, memoisation, currying, debouncing and private state:

\`\`\`js
function Welcome(name) {
  return function (message) { console.log(message + " " + name); };
}
const greet = Welcome("John"); greet("Hello Mr."); // Hello Mr. John
\`\`\`

**Pure functions** return the same output for the same input and have no side effects (no mutation, I/O, network, DOM, Math.random); they are referentially transparent and trivially testable. **Currying** turns f(a, b, c) into f(a)(b)(c); **compose** applies functions right-to-left, **pipe** left-to-right; **memoisation** caches results by argument. A **thunk** is a zero-argument function that delays a computation. A **Proper Tail Call** reuses the stack frame when a call is the last action (specified in ES6, implemented only by Safari).` },
    { h: '`this`, call, apply and bind', md: `\`this\` is decided at **call time**: a method call binds it to the object before the dot; a plain function call binds it to the global object (undefined in strict mode); \`new\` binds it to the freshly created object; arrow functions inherit it lexically. Detaching a method (\`const walk = user.walk\`) loses the binding.

- \`fn.call(ctx, a, b)\` invokes immediately with arguments listed one by one ("call is for comma").
- \`fn.apply(ctx, [a, b])\` invokes immediately with an array ("apply is for array").
- \`fn.bind(ctx, a)\` returns a **new function** permanently bound, to be called later.

\`\`\`js
Function.prototype.myBind = function (ctx, ...pre) {
  const fn = this;
  return function (...args) { return fn.apply(ctx, [...pre, ...args]); };
};
\`\`\`

\`new.target\` tells a function whether it was invoked with \`new\`.` },
    { h: 'Objects, prototypes and classes', md: `Ways to create objects: \`Object()\` constructor, \`Object.create(proto)\`, object literal (the usual choice), function constructor with \`new\`, constructor plus \`prototype\` methods, ES6 \`class\`, and the singleton pattern. The **prototype chain** is how inheritance works: a property lookup walks \`obj.__proto__\` (\`Object.getPrototypeOf(obj)\`) up to \`Object.prototype\` and then null. \`Constructor.prototype\` is the object that becomes \`__proto__\` of instances created with \`new\`. All objects have a prototype except \`Object.create(null)\` results.

ES6 **classes** are syntactic sugar over prototypes: \`constructor\` (only one allowed), methods on the prototype, \`static\` members on the class, \`extends\` for subclassing, \`super()\` to call the parent constructor (required before using \`this\`). Class declarations are not hoisted like functions. Instance properties go in the constructor; static and prototype data properties are defined outside the class body. Getters and setters (\`get\`/\`set\`, or \`Object.defineProperty\`) create computed **accessor properties**; JavaScript has no built-in mixins or enums, but \`Object.assign\` emulates mixins and frozen objects emulate enums.

Property plumbing: \`Object.keys/values/entries\`, \`Object.getOwnPropertyNames\`, \`Object.getOwnPropertyDescriptors\`, descriptors with \`value\`, \`writable\`, \`enumerable\`, \`configurable\` (or \`get\`/\`set\`). \`Object.preventExtensions\` blocks new properties, \`Object.seal\` also makes existing ones non-configurable, \`Object.freeze\` additionally makes them read-only (shallow). Check with \`isExtensible\`, \`isSealed\`, \`isFrozen\`. **Shallow copy** (\`{...obj}\`, \`Object.assign\`) copies one level; **deep copy** (\`structuredClone\`, JSON round-trip with caveats) copies nested objects too.` },
    { h: 'Control flow, operators and errors', md: `Loops are **entry-controlled** (for, while) or **exit-controlled** (do…while). \`break\` leaves a loop, \`continue\` skips an iteration, **labels** let you break out of an outer loop. The **comma operator** evaluates left to right and returns the last value (handy in \`for\` headers); the **conditional operator** \`a ? b : c\` can be chained; **short-circuit** \`&&\`/\`||\` return an operand, not a boolean; the **nullish coalescing** operator \`??\` falls back only for null/undefined; **optional chaining** \`?.\` stops at the first nullish link. Switch cases compare with \`===\`, may use expressions when switching on \`true\`, and fall through without \`break\`. Avoid \`with\` (ambiguous scope, forbidden in strict mode) and \`eval\` (runs arbitrary code, slow, insecure).

Errors: the **Error** object has \`name\` and \`message\`; built-in names are RangeError, ReferenceError, SyntaxError, TypeError, EvalError and URIError. \`try/catch/finally/throw\` handle them; promises need \`.catch\` or try/await. Reserved words cannot be identifiers. Semicolons matter when a line starts with \`(\` or \`[\` (automatic semicolon insertion will join the lines). JavaScript is **single-threaded**, **dynamically typed**, **multi-paradigm**, case-sensitive, created by Brendan Eich in 1995 at Netscape (Mocha → LiveScript → JavaScript), standardised as **ECMAScript** (ECMA-262); it is interpreted but JIT-compiled by modern engines such as V8, and it has nothing to do with Java beyond syntax.` },
  ],
  pitfalls: [
    'Saying "`let` is not hoisted". It is hoisted but uninitialised; that is exactly why the TDZ throws.',
    'Explaining closures as "a function inside a function". The point is that the inner function *retains the outer scope after the outer returns*.',
    'Describing `this` by where the function was written. It depends on how it is called (except for arrows).',
    'Treating `Object.freeze` as deep. Nested objects stay mutable.',
    'Confusing `typeof null === "object"` with null being an object; it is a primitive and a historic bug.',
    'Claiming `const` makes values immutable; it only blocks reassignment of the binding.',
  ],
  model: [
    { q: 'What is a closure? Give an example of where it is useful.', a: 'A closure is a function bundled with the lexical environment in which it was declared, so it can keep reading and writing variables of its outer function even after that function has returned. Every function in JavaScript is technically a closure. They are useful for data privacy (module pattern), for factories such as `makeCounter()`, for memoisation caches, and for callbacks such as a debounced handler that remembers its timer id between calls.', ref: 'js-27' },
    { q: 'Explain the difference between var, let and const.', a: '`var` is function-scoped, hoisted and initialised to undefined, and can be redeclared. `let` and `const` are block-scoped, hoisted but left uninitialised until their line (the temporal dead zone), and cannot be redeclared in the same scope. `const` additionally forbids reassignment, though the object it references can still be mutated. Prefer `const`, then `let`; avoid `var`.', ref: 'js-18' },
    { q: 'What is the difference between call, apply and bind?', a: 'All three set `this` explicitly. `call` invokes the function immediately with arguments passed individually; `apply` invokes immediately with arguments in an array; `bind` does not invoke at all but returns a new function with `this` (and optionally leading arguments) fixed, which you call later. Remember: call for comma, apply for array, bind for later.', ref: 'js-3' },
    { q: 'What is the prototype chain?', a: 'Every object has an internal link to another object, its prototype. When you read a property that the object lacks, the engine follows that link upward, through each prototype, until it finds the property or reaches null. Constructors set this link to their `prototype` object when called with `new`, which is how methods are shared between instances; ES6 classes are sugar over the same mechanism.', ref: 'js-2' },
  ],
  quiz: [
    { type: 'mcq', q: 'What does this print?', code: 'console.log(a);\nvar a = 5;\nconsole.log(b);\nlet b = 6;', options: ['undefined, 6', 'undefined, then ReferenceError', '5, 6', 'ReferenceError immediately'], answer: 1, explain: '`var a` is hoisted as undefined; `let b` is in the temporal dead zone so reading it throws.', ref: 'js-21' },
    { type: 'mcq', q: 'Which is true about `===`?', options: ['It converts both operands to strings', 'It compares type and value without conversion', 'It treats null and undefined as equal', 'It compares objects by content'], answer: 1, explain: 'Strict equality never coerces; `null === undefined` is false and objects are compared by reference.', ref: 'js-9' },
    { type: 'mcq', q: 'What is `typeof null`?', options: ['"null"', '"undefined"', '"object"', '"primitive"'], answer: 2, explain: 'A historic quirk kept for compatibility; null is still a primitive.', ref: 'js-73' },
    { type: 'mcq', q: 'Arrow functions differ from regular functions because they…', options: ['are hoisted with their body', 'have their own `this` and `arguments`', 'inherit `this` lexically and cannot be used with `new`', 'always return undefined'], answer: 2, explain: 'No own `this`, `arguments`, `super` or `new.target`; not constructible.', ref: 'js-10' },
    { type: 'mcq', q: 'What does `fn.bind(obj)` return?', options: ['The result of calling fn with this = obj', 'A new function with this permanently set to obj', 'undefined', 'A promise'], answer: 1, explain: 'Unlike call and apply, bind does not invoke; it returns a bound copy for later.', ref: 'js-3' },
    { type: 'mcq', q: 'After `Object.freeze(user)`, which operation still works?', options: ['user.name = "x" (changing an existing property)', 'user.extra = 1 (adding a property)', 'user.address.city = "Y" (mutating a nested object)', 'delete user.name'], answer: 2, explain: 'Freeze is shallow: nested objects remain mutable.', ref: 'js-178' },
    { type: 'mcq', q: 'Which statement about `let` in a `switch` is correct?', options: ['Each case has its own block scope by default', 'Declaring the same `let` name in two cases throws a SyntaxError unless the case bodies are wrapped in braces', '`let` is not allowed inside switch', 'Cases ignore block scoping entirely'], answer: 1, explain: 'A switch body is one block; add `{ }` around a case body to create a nested scope.', ref: 'js-20' },
    { type: 'mcq', q: 'What is the output of `1 + 2 + "3"`?', options: ['6', '"33"', '"123"', 'NaN'], answer: 1, explain: 'Left to right: 1 + 2 is 3, then 3 + "3" concatenates to "33".', ref: 'js-162' },
    { type: 'mcq', q: 'Which function is pure?', options: ['`n => numberArray.push(n)`', '`n => arr => arr.concat([n])`', '`() => Math.random()`', '`n => { console.log(n); return n; }`'], answer: 1, explain: 'It neither mutates its input nor performs I/O, and the same inputs always give the same output.', ref: 'js-16' },
    { type: 'mcq', q: 'How is `__proto__` different from `prototype`?', options: ['They are the same object with two names', '`__proto__` is the actual link used for lookup on an instance; `prototype` is the property on a constructor used to build that link', '`prototype` exists on every object', '`__proto__` exists only on functions'], answer: 1, explain: '`new F()` sets the instance\'s `__proto__` to `F.prototype`.', ref: 'js-176' },
    { type: 'short', q: 'What is hoisting?', a: 'Before executing a scope, the engine registers declarations: `var` bindings (set to undefined), function declarations (with their bodies), and `let`/`const`/class bindings (uninitialised, in the temporal dead zone). Only declarations move, never initialisations, which is why `var` reads give undefined and `let` reads throw.', ref: 'js-25' },
    { type: 'short', q: 'What is an IIFE and why use one?', a: 'An Immediately Invoked Function Expression is a function wrapped in parentheses and called at once: `(function(){ ... })()`. It creates a private scope so variables do not leak to the global object, which is why pre-module code used it for encapsulation and the module pattern; it also provided an async wrapper before top-level await.', ref: 'js-22' },
    { type: 'short', q: 'Explain currying with an example.', a: 'Currying converts a function of n arguments into a chain of n unary functions: `const add = a => b => c => a + b + c; add(1)(2)(3) // 6`. It enables partial application and composition because you can fix the first arguments and pass the remaining function around.', ref: 'js-15' },
    { type: 'short', q: 'What is strict mode and what changes?', a: '`"use strict"` (file- or function-level) switches to a stricter variant of the language: assignments to undeclared variables throw instead of creating globals, `this` in plain calls is undefined, duplicate parameter names, octal literals and `with` are errors, and writing to read-only properties throws. It catches silent bugs and enables optimisations.', ref: 'js-66' },
  ],
  cards: [
    { f: 'Seven primitive types', b: 'string, number, boolean, null, undefined, bigint, symbol. Everything else is an object.', ref: 'js-223' },
    { f: 'null vs undefined', b: 'undefined: declared/not assigned or missing; type "undefined". null: intentional absence; type "object". `null == undefined` true, `===` false.', ref: 'js-74' },
    { f: 'var vs let vs const', b: 'var: function scope, hoisted as undefined, redeclarable. let/const: block scope, TDZ, no redeclare. const: no reassignment (object still mutable).', ref: 'js-18' },
    { f: 'Temporal dead zone', b: 'Time between entering a scope and executing a let/const/class declaration; reading the binding throws ReferenceError.', ref: 'js-21' },
    { f: 'Closure', b: 'A function plus its lexical environment; keeps access to outer variables after the outer function returns.', ref: 'js-27' },
    { f: 'IIFE', b: '`(function(){ ... })();` runs immediately, creating a private scope.', ref: 'js-22' },
    { f: 'call / apply / bind', b: 'call(ctx, a, b) now; apply(ctx, [a, b]) now; bind(ctx) returns a new function for later.', ref: 'js-3' },
    { f: 'Four rules for `this`', b: 'new → new object; method call → object before the dot; plain call → global/undefined (strict); arrow → lexical.', ref: 'js-10' },
    { f: '__proto__ vs prototype', b: '__proto__: the instance\'s link used in lookup. prototype: property of a constructor that becomes instances\' __proto__.', ref: 'js-176' },
    { f: 'Pure function', b: 'Same input → same output, no side effects (no mutation, I/O, randomness). Referentially transparent.', ref: 'js-16' },
    { f: 'Currying', b: 'f(a, b, c) → f(a)(b)(c); each call takes one argument and returns the next function.', ref: 'js-15' },
    { f: 'Higher-order function', b: 'Takes a function as argument and/or returns a function (map, filter, debounce).', ref: 'js-13' },
    { f: 'freeze vs seal vs preventExtensions', b: 'preventExtensions: no new props. seal: also non-configurable (no delete). freeze: also read-only. All shallow.', ref: 'js-197' },
    { f: 'Memoisation', b: 'Cache a function\'s results keyed by its arguments; return the cached value on repeat calls.', ref: 'js-24' },
    { f: 'Strict mode effects', b: 'No implicit globals, `this` undefined in plain calls, no duplicate params, no `with`, assignments to read-only throw.', ref: 'js-67' },
    { f: 'ES6 class is…', b: 'Sugar over prototype inheritance: constructor, prototype methods, static members, extends/super. Not hoisted like functions.', ref: 'js-26' },
  ],
  coding: [
    { id: 'bind', title: 'Implement Function.prototype.myBind', prompt: 'Write `myBind(ctx, ...preset)` on `Function.prototype` so that it returns a new function with `this` fixed to `ctx` and any preset arguments prepended. Use `call` or `apply`.', starter: 'Function.prototype.myBind = function (ctx, ...preset) {\n  // your code\n};\n\nfunction greet(greeting, punct) { return greeting + ", " + this.name + punct; }\nconst bound = greet.myBind({ name: "Evelin" }, "Hello");\nconsole.log(bound("!"));', solution: 'Function.prototype.myBind = function (ctx, ...preset) {\n  const fn = this;\n  return function (...args) {\n    return fn.apply(ctx, [...preset, ...args]);\n  };\n};', tests: [{ expr: '(function(){ return this.x; }).myBind({ x: 7 })()', expect: 7 }, { expr: '(function(a, b){ return a + b; }).myBind(null, 2)(3)', expect: 5 }], ref: 'js-441' },
    { id: 'curry', title: 'Write a generic curry()', prompt: 'Write `curry(fn)` that lets a 3-argument function be called as `f(1)(2)(3)`, `f(1, 2)(3)` or `f(1)(2, 3)`. Hint: compare collected arguments to `fn.length`.', starter: 'function curry(fn) {\n  // your code\n}\n\nconst sum3 = curry((a, b, c) => a + b + c);\nconsole.log(sum3(1)(2)(3), sum3(1, 2)(3), sum3(1)(2, 3));', solution: 'function curry(fn) {\n  return function curried(...args) {\n    if (args.length >= fn.length) return fn.apply(this, args);\n    return (...more) => curried.apply(this, [...args, ...more]);\n  };\n}', tests: [{ expr: 'curry((a,b,c)=>a+b+c)(1)(2)(3)', expect: 6 }, { expr: 'curry((a,b,c)=>a*b*c)(2,3)(4)', expect: 24 }], ref: 'js-15' },
    { id: 'memoize', title: 'Write memoize()', prompt: 'Write `memoize(fn)` that caches results by the JSON of the arguments and returns cached results on repeat calls. Count calls to prove it works.', starter: 'function memoize(fn) {\n  // your code\n}\n\nlet calls = 0;\nconst slowSquare = memoize(n => { calls++; return n * n; });\nslowSquare(4); slowSquare(4); slowSquare(5);\nconsole.log("calls:", calls, "result:", slowSquare(4));', solution: 'function memoize(fn) {\n  const cache = new Map();\n  return function (...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn.apply(this, args);\n    cache.set(key, result);\n    return result;\n  };\n}', tests: [{ expr: '(() => { let c = 0; const m = memoize(n => { c++; return n * 2; }); m(1); m(1); m(2); return c; })()', expect: 2 }], ref: 'js-24' },
    { id: 'compose', title: 'Write compose() and pipe()', prompt: 'Write `compose(...fns)` (right-to-left) and `pipe(...fns)` (left-to-right) using `reduce`.', starter: 'const compose = (...fns) => /* your code */ null;\nconst pipe = (...fns) => /* your code */ null;\n\nconst inc = x => x + 1, dbl = x => x * 2;\nconsole.log(compose(inc, dbl)(5), pipe(inc, dbl)(5)); // 11 12', solution: 'const compose = (...fns) => x => fns.reduceRight((acc, f) => f(acc), x);\nconst pipe = (...fns) => x => fns.reduce((acc, f) => f(acc), x);', tests: [{ expr: 'compose(x => x + 1, x => x * 2)(5)', expect: 11 }, { expr: 'pipe(x => x + 1, x => x * 2)(5)', expect: 12 }], ref: 'js-447' },
    { id: 'counter', title: 'Private state with a closure (module pattern)', prompt: 'Write `makeCounter()` returning `{ increment, decrement, value }` where the count cannot be reached from outside.', starter: 'function makeCounter() {\n  // your code\n}\n\nconst c = makeCounter();\nc.increment(); c.increment(); c.decrement();\nconsole.log(c.value(), c.count); // 1 undefined', solution: 'function makeCounter() {\n  let count = 0;\n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    value: () => count,\n  };\n}', tests: [{ expr: '(() => { const c = makeCounter(); c.increment(); c.increment(); return c.value(); })()', expect: 2 }, { expr: 'makeCounter().count', expect: undefined }], ref: 'js-448' },
  ],
});
