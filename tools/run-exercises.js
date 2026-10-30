// Evaluate the JavaScript "what is the output" coding exercises from the bank inside a Node vm
// sandbox, so the correct option can be recovered (the printed PDF omits the collapsed answers).
// Usage: node tools/run-exercises.js data/bank.js build/exercise-results.json
const fs = require('fs');
const vm = require('vm');

const [bankPath, outPath] = process.argv.slice(2);
const s = fs.readFileSync(bankPath, 'utf8');
const bank = JSON.parse(s.slice(s.indexOf('=') + 1).trim().replace(/;\s*$/, ''));
const js = bank.sources.find(x => x.id === 'js');
const exercises = js.questions.filter(q => q.id.startsWith('js-c'));

function splitExercise(a) {
  const lines = a.split('\n');
  const code = [], options = [];
  let after = [];
  let phase = 'code';
  for (const l of lines) {
    const om = l.match(/^\s*(\d):\s*(.*)$/);
    if (phase === 'code' && om) phase = 'options';
    if (phase === 'options') {
      if (om) { options.push(om[2].trim()); continue; }
      if (/^Answer\s*$/.test(l.trim())) { phase = 'after'; continue; }
      // option text wrapped onto next line
      if (options.length && l.trim()) { options[options.length - 1] += ' ' + l.trim(); continue; }
    }
    if (phase === 'after') { after.push(l); continue; }
    if (phase === 'code') code.push(l);
  }
  return { code: code.join('\n').trim(), options, after: after.join('\n').trim() };
}

function run(code) {
  const logs = [];
  const fmt = v => {
    if (typeof v === 'string') return v;
    if (typeof v === 'symbol') return v.toString();
    if (typeof v === 'function') return `[Function: ${v.name || '(anonymous)'}]`;
    try { return require('util').inspect(v, { depth: 3, breakLength: Infinity }); } catch { return String(v); }
  };
  const sandbox = {
    console: { log: (...a) => logs.push(a.map(fmt).join(' ')), error: (...a) => logs.push(a.map(fmt).join(' ')) },
    setTimeout, setInterval, clearTimeout, clearInterval, setImmediate, queueMicrotask, Promise, Symbol, Map, Set, WeakMap, WeakSet,
    JSON, Math, Date, Number, String, Boolean, Array, Object, Function, RegExp, Error, TypeError, RangeError, ReferenceError, SyntaxError,
    parseInt, parseFloat, isNaN, isFinite, NaN, Infinity, undefined, BigInt, Reflect, Proxy, Intl, structuredClone,
  };
  sandbox.globalThis = sandbox; sandbox.window = sandbox; sandbox.self = sandbox;
  const ctx = vm.createContext(sandbox);
  return new Promise(resolve => {
    let done = false;
    const finish = (err) => { if (done) return; done = true; resolve({ logs, error: err ? `${err.name}: ${err.message}` : null }); };
    try {
      vm.runInContext(code, ctx, { timeout: 1000, filename: 'exercise.js' });
    } catch (e) { return finish(e); }
    // Let microtasks and short timers flush.
    setTimeout(() => finish(null), 150);
  });
}

(async () => {
  const results = [];
  for (const q of exercises) {
    const { code, options, after } = splitExercise(q.a);
    const r = code ? await run(code) : { logs: [], error: 'no code' };
    results.push({ id: q.id, n: q.n, q: q.q, page: q.page, code, options, after, output: r.logs, error: r.error });
  }
  fs.writeFileSync(outPath, JSON.stringify(results, null, 1));
  for (const r of results) {
    console.log(`\n${r.id} (p${r.page}) ${r.q}`);
    r.options.forEach((o, i) => console.log(`   ${i + 1}: ${o}`));
    console.log(`   => output: ${JSON.stringify(r.output)}${r.error ? '  error: ' + r.error : ''}`);
  }
})();
