window.registerTopic('js-async', {
  why: `Asynchrony is where JavaScript interviews separate levels. Juniors are asked to define callbacks and promises; mid-level candidates must explain the **event loop**, order the output of mixed timers and promises, and convert callback code to async/await; seniors discuss cancellation, error propagation and the difference between browser and Node loops.

The question that decides the round is almost always "in what order do these lines print, and why?" Nail the model: call stack → microtask queue → macrotask queue → render.`,
  notes: [
    { h: 'The event loop model', md: `JavaScript runs on **one thread** with a **call stack** (push a frame when a function is called, pop when it returns). Long-running work is handed to the host (browser Web APIs or Node's libuv), which later queues a callback. The **event loop** continuously checks: if the stack is empty, drain **all microtasks** (promise reactions, \`queueMicrotask\`, MutationObserver), then take **one macrotask** (a timer, I/O, UI event, \`setImmediate\` in Node) from the task queue, then let the browser render, and repeat.

\`\`\`js
setTimeout(() => console.log("1"), 0);
Promise.resolve().then(() => console.log("2"));
console.log("3");            // prints 3, 2, 1
\`\`\`

The **event table** records which callback belongs to which pending event; the **heap** is where objects live; the **callback (macrotask) queue** holds timer and I/O callbacks; the **microtask queue** is drained before rendering and can starve the page if it keeps refilling. Node's loop has phases (timers → pending callbacks → poll → check/\`setImmediate\` → close), and \`process.nextTick\` runs before other microtasks. Node itself is single-threaded for JavaScript but uses a thread pool for file system and crypto work.` },
    { h: 'Timers', md: `\`setTimeout(fn, ms)\` schedules one call; \`setInterval(fn, ms)\` repeats; both return ids for \`clearTimeout\`/\`clearInterval\`. A delay of 0 still waits for the current script and all microtasks, and browsers clamp nested timers to a **minimum of about 4 ms** (Node about 1 ms), so "zero timeout" is not immediate; \`postMessage\` or \`queueMicrotask\` are the real alternatives. In Node, \`setImmediate\` runs after the poll phase of the current loop turn, \`setTimeout(fn, 0)\` on the next timers phase, and \`process.nextTick\` before any of them.

The classic loop trap: \`for (var i = 0; i < 4; i++) setTimeout(() => console.log(i))\` prints 4 four times because all callbacks share one \`var\`; \`let\` gives each iteration its own binding and prints 0 1 2 3.` },
    { h: 'Callbacks and callback hell', md: `A **callback** is a function passed to another function to be invoked later; JavaScript needs them because it is event-driven and does not block waiting for results. Nesting callbacks for sequential async steps produces **callback hell** (the pyramid of doom): hard to read, hard to handle errors, and vulnerable to callbacks called too early, too late, more than once, or never. Promises address exactly those problems; the remaining downside is that you still have to learn a new mental model and cannot cancel them natively.` },
    { h: 'Promises', md: `A **promise** is an object representing a value that may arrive later, in one of three states: **pending**, **fulfilled**, **rejected**. Once settled it never changes. Rules: a pending promise may become fulfilled or rejected; a settled promise is immutable; a \`then\` handler must be called at most once with the value or reason.

\`\`\`js
new Promise((resolve, reject) => setTimeout(() => resolve(1), 1000))
  .then(v => v * 2)          // chaining: each then returns a new promise
  .then(v => { throw new Error("boom"); })
  .catch(err => console.error(err.message))
  .finally(() => console.log("done"));
\`\`\`

Combinators: \`Promise.all\` (all fulfil, or reject on the first rejection), \`Promise.allSettled\` (every outcome), \`Promise.race\` (first to settle), \`Promise.any\` (first to fulfil). Promises **swallow errors** when no \`catch\` is attached; always end a chain with one (or use \`void promise.catch(...)\` to ignore deliberately). \`Promise.resolve(value)\` normalises a maybe-promise; checking \`typeof value.then === "function"\` detects a thenable. Promises vs callbacks: no callback hell, composable, guaranteed single settlement and better error flow. Promises vs **observables** (RxJS): a promise emits one value, is eager and not cancellable; an observable can emit many values over time, is lazy until subscribed, is cancellable and has operators.` },
    { h: 'async / await', md: `An **async function** always returns a promise; \`await\` pauses the function (not the thread) until a promise settles and unwraps its value or throws its rejection, so you can use \`try/catch\`. It reads like synchronous code and avoids promise chains:

\`\`\`js
async function load() {
  try { const res = await fetch("/api"); return await res.json(); }
  catch (e) { console.error(e); }
}
\`\`\`

Gotchas: \`await\` inside a non-async callback (\`array.forEach(async…)\` or a plain arrow) is a SyntaxError or runs the iterations in parallel instead of sequence; use \`for…of\` for sequential awaits and \`Promise.all\` for parallel ones. Top-level \`await\` works only in ES modules (ES2022); before that an async IIFE was the workaround. An **asynchronous thunk** is a function that performs the request later and calls back with the data: the idea behind redux-thunk.` },
    { h: 'HTTP and browser background APIs', md: `**AJAX** (Asynchronous JavaScript and XML) is the technique of fetching data without a page reload, originally via \`XMLHttpRequest\` (synchronous when the third \`open\` argument is false, asynchronous when true) and today via \`fetch\`, which returns a promise and can be cancelled with an **AbortController** signal. Ways to handle async code: callbacks, promises, async/await, libraries such as async.js or RxJS.

**Server-Sent Events** (\`EventSource\`) push a one-way stream from server to browser over HTTP with \`onopen\`, \`onmessage\` and \`onerror\` events; check \`"EventSource" in window\`. **Web Workers** run scripts on a background thread (\`new Worker("counter.js")\`, \`postMessage\`/\`onmessage\`) and cannot touch \`window\`, \`document\` or \`parent\`. **Service workers** are event-driven scripts between the page and the network that enable offline caching and push; they cannot access the DOM (they message the page instead) and lose global state between restarts, so they persist data in IndexedDB or the Cache API. **Progressive Web Apps** build on service workers and the app-shell model.` },
  ],
  pitfalls: [
    'Saying `setTimeout(fn, 0)` runs "immediately". It runs after the current script and after all pending microtasks, with a minimum clamp.',
    'Forgetting that `Promise.all` fails fast: a single rejection rejects the whole thing. Use `allSettled` when you need every result.',
    'Using `forEach` with `await` and expecting sequential execution.',
    'Attaching no `.catch` and letting rejections disappear as "Uncaught (in promise)".',
    'Describing async/await as "making code synchronous". It suspends only the async function; the loop keeps running.',
    'Claiming Node is fully single-threaded. The JS thread is, but libuv uses a thread pool for fs, DNS and crypto.',
  ],
  model: [
    { q: 'Explain the event loop.', a: 'JavaScript executes on a single call stack. When code starts an asynchronous operation, the host environment (browser APIs or Node\'s libuv) does the work and later places a callback in a queue. The event loop repeatedly checks whether the stack is empty; when it is, it first runs every pending microtask (promise reactions, queueMicrotask), then one macrotask from the task queue (timers, I/O, events), then allows rendering, and loops again. That is why a resolved promise\'s `.then` always runs before a `setTimeout(fn, 0)` callback.', ref: 'js-236' },
    { q: 'What is a promise and what are its states?', a: 'A promise is an object standing in for a value that will be available later. It starts pending and settles exactly once, either fulfilled with a value or rejected with a reason, and then never changes. You consume it with `then`, `catch` and `finally`, and each `then` returns a new promise so operations chain. Promises replace nested callbacks with a flat, composable pipeline that propagates errors to the nearest catch.', ref: 'js-51' },
    { q: 'How does async/await relate to promises?', a: 'It is syntax over promises. Declaring a function `async` makes it return a promise; inside it, `await expr` suspends the function until the promise settles, resuming with the value or throwing the rejection so ordinary try/catch works. Nothing blocks the thread, and the rest of the program keeps running while the function waits.', ref: 'js-407' },
  ],
  quiz: [
    { type: 'mcq', q: 'In what order do these print?', code: 'console.log("a");\nsetTimeout(() => console.log("b"), 0);\nPromise.resolve().then(() => console.log("c"));\nconsole.log("d");', options: ['a d c b', 'a b c d', 'a d b c', 'a c d b'], answer: 0, explain: 'Sync code first (a, d), then microtasks (c), then the timer macrotask (b).', ref: 'js-236' },
    { type: 'mcq', q: 'Which of these is a microtask?', options: ['setTimeout callback', 'click event handler', 'Promise.then callback', 'setImmediate callback'], answer: 2, explain: 'Promise reactions and queueMicrotask run in the microtask queue, drained before the next macrotask.', ref: 'js-388' },
    { type: 'mcq', q: 'What happens if one promise in `Promise.all([...])` rejects?', options: ['The others are cancelled', 'The result array contains the error', 'The combined promise rejects immediately with that reason', 'It waits for all to settle then resolves'], answer: 2, explain: 'all fails fast; allSettled waits for every outcome.', ref: 'js-64' },
    { type: 'mcq', q: 'What does an async function return?', options: ['The awaited value', 'Always a promise', 'undefined', 'A generator'], answer: 1, explain: 'Even `return 10` becomes a promise fulfilled with 10.', ref: 'js-407' },
    { type: 'mcq', q: 'What is the minimum delay browsers enforce for nested `setTimeout(fn, 0)`?', options: ['0 ms, it is immediate', 'About 4 ms', 'About 100 ms', '1 second'], answer: 1, explain: 'Timers are throttled to a minimum delay; Node uses about 1 ms.', ref: 'js-385' },
    { type: 'mcq', q: 'In Node, which runs first after the current operation completes?', options: ['setTimeout(fn, 0)', 'setImmediate(fn)', 'process.nextTick(fn)', 'They run in random order'], answer: 2, explain: 'nextTick callbacks run before promise microtasks and long before timers or setImmediate.', ref: 'js-429' },
    { type: 'mcq', q: 'What is callback hell?', options: ['Calling a callback twice', 'Deeply nested callbacks that make sequencing and error handling hard to read', 'A callback that throws', 'A missing callback'], answer: 1, explain: 'Promises and async/await flatten the pyramid.', ref: 'js-56' },
    { type: 'mcq', q: 'Which API cancels a fetch request?', options: ['fetch.cancel()', 'Promise.cancel()', 'AbortController with a signal', 'clearTimeout'], answer: 2, explain: 'Pass `controller.signal` in the options and call `controller.abort()`.', ref: 'js-383' },
    { type: 'mcq', q: 'Which objects can a Web Worker NOT access?', options: ['Only `window`', '`window`, `document` and `parent`', 'Only `document`', 'It can access everything'], answer: 1, explain: 'Workers run off the main thread with no DOM; communicate with postMessage.', ref: 'js-50' },
    { type: 'short', q: 'Compare promises and observables.', a: 'A promise is eager, delivers exactly one value or error, and cannot be cancelled. An observable (RxJS) is lazy until subscribed, can emit many values over time, supports cancellation via unsubscribe and has a rich operator library. Promises fit single requests; observables fit streams such as user input, sockets and intervals.', ref: 'js-392' },
    { type: 'short', q: 'Why should a service worker not rely on global variables?', a: 'The browser terminates a service worker when idle and restarts it on the next event, so in-memory state is lost between `fetch` or `message` handlers. Persist anything you need in IndexedDB or the Cache API, and remember it cannot touch the DOM, only message the page.', ref: 'js-33' },
    { type: 'short', q: 'How do you run several async operations in parallel and wait for all?', a: 'Start them without awaiting, collect the promises, then `await Promise.all(promises)` (or `allSettled` if partial failure is acceptable). Awaiting inside a for loop runs them sequentially instead.', ref: 'js-64' },
  ],
  cards: [
    { f: 'Event loop order', b: 'Call stack empties → all microtasks (promises, queueMicrotask) → one macrotask (timer, I/O, event) → render → repeat.', ref: 'js-236' },
    { f: 'Microtask vs macrotask examples', b: 'Micro: Promise.then, queueMicrotask, MutationObserver, process.nextTick. Macro: setTimeout, setInterval, setImmediate, I/O, UI events.', ref: 'js-388' },
    { f: 'Three promise states', b: 'pending → fulfilled (value) or rejected (reason); settles once, immutable after.', ref: 'js-53' },
    { f: 'Promise.all vs allSettled vs race vs any', b: 'all: all fulfil or first rejection. allSettled: every outcome. race: first settled. any: first fulfilled.', ref: 'js-64' },
    { f: 'Why promises over callbacks?', b: 'No callback hell, composable chaining, single guaranteed settlement, errors propagate to catch.', ref: 'js-93' },
    { f: 'async function returns…', b: 'Always a promise; `await` unwraps a promise or throws its rejection.', ref: 'js-407' },
    { f: 'setTimeout(fn, 0) reality', b: 'Runs after the current script and all microtasks; browsers clamp nested timers to ~4 ms.', ref: 'js-385' },
    { f: 'Node: nextTick vs setImmediate vs setTimeout', b: 'nextTick first (before microtasks), then timers phase (setTimeout 0), then check phase (setImmediate).', ref: 'js-429' },
    { f: 'Callback hell fix', b: 'Flatten with named functions, promises, async/await.', ref: 'js-56' },
    { f: 'Cancel a fetch', b: '`const c = new AbortController(); fetch(url, { signal: c.signal }); c.abort();`', ref: 'js-383' },
    { f: 'Web worker limits', b: 'No window, document or parent; communicate via postMessage; good for CPU-heavy work.', ref: 'js-50' },
    { f: 'Service worker', b: 'Background script between page and network; offline cache, push; no DOM; restarted on demand so persist state.', ref: 'js-31' },
    { f: 'Server-Sent Events', b: 'One-way server → browser stream via EventSource; events onopen, onmessage, onerror.', ref: 'js-57' },
    { f: 'Thunk', b: 'A zero-argument function that defers a computation; async thunks wrap a request and call back with data.', ref: 'js-351' },
  ],
  coding: [
    { id: 'delay', title: 'Promisify a timer and sequence awaits', prompt: 'Write `delay(ms, value)` returning a promise, then an async function that logs 1, 2, 3 one second apart **in order** (use for…of, not forEach).', starter: 'const delay = (ms, value) => /* your code */ null;\n\nasync function run() {\n  for (const n of [1, 2, 3]) {\n    // await delay(...)\n  }\n  console.log("done");\n}\nrun();', solution: 'const delay = (ms, value) => new Promise(res => setTimeout(() => res(value), ms));\n\nasync function run() {\n  for (const n of [1, 2, 3]) {\n    console.log(await delay(300, n));\n  }\n  console.log("done");\n}\nrun();', notes: 'Output appears asynchronously; the runner shows only synchronous logs, so run it in the browser console to watch the timing.', ref: 'js-106' },
    { id: 'promise-all', title: 'Implement Promise.all', prompt: 'Write `promiseAll(iterable)` that resolves with an array of results in input order, or rejects on the first rejection. Do not use Promise.all.', starter: 'function promiseAll(promises) {\n  // your code\n}\n\npromiseAll([Promise.resolve(1), 2, new Promise(r => setTimeout(() => r(3), 10))])\n  .then(v => console.log(v));', solution: 'function promiseAll(promises) {\n  return new Promise((resolve, reject) => {\n    const results = []; let remaining = promises.length;\n    if (!remaining) return resolve(results);\n    promises.forEach((p, i) => {\n      Promise.resolve(p).then(v => {\n        results[i] = v;\n        if (--remaining === 0) resolve(results);\n      }, reject);\n    });\n  });\n}', ref: 'js-64' },
    { id: 'retry', title: 'Retry an async operation', prompt: 'Write `retry(fn, times)` that calls the async `fn`, retrying up to `times` more attempts on rejection, and rethrows the last error.', starter: 'async function retry(fn, times) {\n  // your code\n}\n\nlet n = 0;\nretry(() => (++n < 3 ? Promise.reject(new Error("fail " + n)) : Promise.resolve("ok after " + n)), 5)\n  .then(console.log).catch(e => console.log("gave up:", e.message));', solution: 'async function retry(fn, times) {\n  let lastErr;\n  for (let attempt = 0; attempt <= times; attempt++) {\n    try { return await fn(); }\n    catch (e) { lastErr = e; }\n  }\n  throw lastErr;\n}', ref: 'js-408' },
    { id: 'order', title: 'Predict then verify: timers vs promises', prompt: 'Before running, write down the output order. Then run and explain each position using stack / microtask / macrotask.', starter: 'console.log("script start");\nsetTimeout(() => console.log("timeout"), 0);\nPromise.resolve().then(() => console.log("promise 1")).then(() => console.log("promise 2"));\nqueueMicrotask(() => console.log("microtask"));\nconsole.log("script end");', solution: '// script start\n// script end\n// promise 1\n// microtask\n// promise 2\n// timeout\n//\n// Sync logs first. Microtasks run FIFO: "promise 1" was queued before "microtask";\n// "promise 2" is queued only when "promise 1" finishes, so it runs after "microtask".\n// The timer is a macrotask and runs last.', ref: 'js-390' },
  ],
});
