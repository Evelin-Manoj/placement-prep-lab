// Sanity-check the hand-written topic files against the generated bank.
// Usage: node tools/validate-content.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = { window: {}, console };
vm.createContext(sandbox);
const run = f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });

run('data/bank.js');
run('data/curriculum.js');
const topicFiles = fs.readdirSync(path.join(root, 'data/topics')).filter(f => f.endsWith('.js')).sort();
for (const f of topicFiles) run('data/topics/' + f);

const BANK = sandbox.window.BANK, CUR = sandbox.window.CURRICULUM;
const ids = new Set();
for (const s of BANK.sources) for (const q of s.questions) ids.add(q.id);

let problems = 0;
const warn = (...a) => { problems++; console.log('  !', ...a); };

for (const t of CUR.topics) {
  const c = CUR.content[t.id];
  if (!c) { warn(t.id, 'has no content file'); continue; }
  const counts = { notes: (c.notes || []).length, quiz: (c.quiz || []).length, mcq: (c.quiz || []).filter(q => q.type === 'mcq').length, cards: (c.cards || []).length, coding: (c.coding || []).length, pitfalls: (c.pitfalls || []).length, model: (c.model || []).length };
  console.log(`${t.id.padEnd(12)} notes=${counts.notes} quiz=${counts.quiz} (mcq ${counts.mcq}) cards=${counts.cards} coding=${counts.coding} pitfalls=${counts.pitfalls} model=${counts.model}${c.exercises ? ' exercises=' + Object.keys(c.exercises).length : ''}`);
  const checkRef = (ref, where) => { if (ref && !ids.has(ref)) warn(t.id, where, 'bad ref', ref); };
  (c.model || []).forEach((m, i) => checkRef(m.ref, `model[${i}]`));
  (c.cards || []).forEach((m, i) => checkRef(m.ref, `cards[${i}]`));
  (c.coding || []).forEach((m, i) => checkRef(m.ref, `coding[${i}]`));
  (c.quiz || []).forEach((q, i) => {
    checkRef(q.ref, `quiz[${i}]`);
    if (q.type === 'mcq') {
      if (!Array.isArray(q.options) || q.options.length < 2) warn(t.id, `quiz[${i}]`, 'needs options');
      else if (!(q.answer >= 0 && q.answer < q.options.length)) warn(t.id, `quiz[${i}]`, 'answer out of range', q.answer);
    } else if (!q.a) warn(t.id, `quiz[${i}]`, 'short answer missing a');
  });
  if (c.exercises) {
    const src = BANK.sources.find(s => s.id === t.source);
    const exIds = src.questions.filter(q => /-c\d/.test(q.id)).map(q => q.id);
    for (const id of exIds) if (!c.exercises[id]) warn(t.id, 'no answer for exercise', id);
    for (const [id, ex] of Object.entries(c.exercises)) {
      if (!ids.has(id)) warn(t.id, 'exercise for unknown bank id', id);
      if (ex.kind !== 'write' && !(ex.answer >= 1 && ex.answer <= 4)) warn(t.id, id, 'answer not 1-4', ex.answer);
      if (ex.kind !== 'write' && !ex.explain) warn(t.id, id, 'missing explanation');
    }
  }
  // Coverage: which bank questions of this source are unassigned to any topic?
}
// Topic assignment coverage per source
for (const s of BANK.sources) {
  const assigned = new Set();
  for (const t of CUR.topics.filter(t => t.source === s.id)) {
    if (t.coding) s.questions.filter(q => /-c\d/.test(q.id)).forEach(q => assigned.add(q.id));
    else if (t.all) s.questions.filter(q => !/-c\d/.test(q.id)).forEach(q => assigned.add(q.id));
    else s.questions.filter(q => !/-c\d/.test(q.id) && t.numbers.includes(q.n)).forEach(q => assigned.add(q.id));
  }
  const missing = s.questions.filter(q => !assigned.has(q.id)).map(q => q.id);
  console.log(`${s.id.padEnd(8)} ${s.questions.length} questions, ${missing.length} unassigned${missing.length ? ': ' + missing.join(', ') : ''}`);
}
// Duplicate numbers across topics of the same source
for (const s of BANK.sources) {
  const seen = new Map();
  for (const t of CUR.topics.filter(t => t.source === s.id && t.numbers)) for (const n of t.numbers) { if (seen.has(n)) warn(s.id, 'number', n, 'in both', seen.get(n), 'and', t.id); seen.set(n, t.id); }
}
console.log(problems ? `\n${problems} problem(s)` : '\nAll content checks passed');
process.exit(problems ? 1 : 0);
