// Parse the extracted PDF text into a structured question bank.
// Usage: node tools/build-bank.js <textDir> <outFile>
// Produces a JS file that assigns window.BANK (so index.html works from file:// and GitHub Pages).
const fs = require('fs');
const path = require('path');

const [textDir, outFile] = process.argv.slice(2);
if (!textDir || !outFile) { console.error('usage: node build-bank.js <textDir> <outFile>'); process.exit(1); }

const OWNER = 'Evelin-Manoj', REPO = 'Placement_preparation', BRANCH = 'main';

// One entry per PDF in the repository. `heading` matches a question line and captures (number, text).
const SOURCES = [
  { id: 'cpp', file: 'C++ interview questions.pdf', title: 'C++ Interview Questions',
    heading: /^\s*(\d{1,3})\.\s+(.+)$/,
    sections: [[/^C\+\+ Interview Questions – Intermediate Level/, 'Intermediate'], [/^C\+\+ Interview Questions – Expert Level/, 'Expert']],
    defaultSection: 'Basic' },
  { id: 'db', file: 'Databse interview questions.pdf', title: 'Database Interview Questions',
    heading: /^\s*Q\s*#(\d{1,3})\)\s*(.+)$/, answerPrefix: /^Answer:\s*/, defaultSection: 'Database', strictPrefix: true },
  { id: 'html', file: 'HTML Interview questions.pdf', title: 'HTML Interview Questions',
    heading: /^\s*Q?(\d{1,3})\.\s+(.+)$/, defaultSection: 'HTML' },
  { id: 'node', file: 'nodejs interview questions.pdf', title: 'Node.js Interview Questions',
    heading: /^\s*(\d{1,3})\.\s+(.+)$/, defaultSection: 'Node.js' },
  { id: 'php', file: 'PHP interview questions.pdf', title: 'PHP Interview Questions',
    heading: /^\s*Q(\d{1,3})\.\s+(.+)$/, strictPrefix: true,
    sections: [[/^Advanced level PHP Interview Questions?/, 'Advanced']], defaultSection: 'Basic' },
  { id: 'python', file: 'Python Interview questions.pdf', title: 'Python Interview Questions',
    heading: /^\s*(\d{1,3})\.\s+(.+)$/,
    sections: [[/^Intermediate Python Interview Question/, 'Intermediate'], [/^Python 3\.10 above Feature/, 'Python 3.10+']],
    defaultSection: 'Basic' },
  { id: 'js', file: 'javascript-interview-questions.pdf', title: 'JavaScript Interview Questions',
    heading: /^\s*(\d{1,3})\.\s+(.+)$/, defaultSection: 'Core JavaScript', codingSectionOnReset: 'Coding Exercise' },
  { id: 'react', file: 'reactjs-interview-questions.pdf', title: 'React Interview Questions',
    heading: /^\s*(\d{1,3})\.\s+(.+)$/,
    sections: [[/^Core React$/, 'Core React'], [/^React Router$/, 'React Router'], [/^React Internationalization$/, 'React Internationalization'],
      [/^React Testing$/, 'React Testing'], [/^React Redux$/, 'React Redux'], [/^React Native$/, 'React Native'],
      [/^React supported libraries/, 'React supported libraries & Integration'], [/^Miscellaneous$/, 'Miscellaneous'], [/^Old Q&A$/, 'Old Q&A']],
    defaultSection: 'Core React' },
];

const CONTINUATION_WORDS = new Set(['and', 'of', 'or', 'in', 'to', 'the', 'with', 'a', 'an', 'between', 'for', 'from', 'on', 'as', 'when', 'while',
  'using', 'prior', 'by', 'is', 'are', 'into', 'at', 'vs', 'non-', 'o', 'every', 'inside', 'non', 'should', 'you', 'does', 'be', 'your']);

const QUESTION_WORDS = /^(What|How|Why|When|Which|Where|Who|Is|Are|Can|Could|Do|Does|Did|Give|Explain|Define|Write|Differentiate|Describe|Name|List|Should|Compare|Enlist|Discuss|Must|Briefly|Based|In which|Whats|Enumerate|State|Mention|Tell|Difference|Differences)\b/i;
function questionLike(text) {
  const t = text.trim();
  return QUESTION_WORDS.test(t) || /\?\s*$/.test(t);
}

function clean(line) {
  return line
    .replace(/\s?Ɵ\s?/g, 'ti').replace(/\s?Ʃ\s?/g, 'tt').replace(/\s?ƞ\s?/g, 'ff')
    .replace(/[⬆↑]\s*Back to Top\s*/g, '')
    .replace(/�/g, '')
    .replace(/[ \t]+$/g, '');
}

function parseSource(src, text) {
  const lines = text.split(/\r?\n/);
  const questions = [];
  let page = 1, section = src.defaultSection, cur = null, prevN = 0, inCoding = false;
  const pushCur = () => { if (cur) { cur.a = finishAnswer(cur.lines, src); delete cur.lines; questions.push(cur); cur = null; } };

  for (let i = 0; i < lines.length; i++) {
    let raw = lines[i];
    const pm = raw.match(/^===== PAGE (\d+) =====$/);
    if (pm) { page = +pm[1]; continue; }
    const line = clean(raw);
    if (!line.trim()) continue;
    if (/^Back to Top$/.test(line.trim())) continue;

    // Section headers
    let matchedSection = false;
    for (const [re, name] of (src.sections || [])) {
      if (re.test(line.trim())) { pushCur(); section = name; matchedSection = true; break; }
    }
    if (matchedSection) continue;

    const hm = line.match(src.heading);
    if (hm && (src.strictPrefix || questionLike(hm[2]))) {
      const n = +hm[1];
      let accept = false;
      if (!cur && questions.length === 0) accept = n === 1 || n === 0;
      else if (n >= prevN && n <= prevN + 3) accept = true; // sequential (allowing duplicated/skipped numbers)
      else if (src.codingSectionOnReset && n === 1 && prevN > 100) { accept = true; inCoding = true; section = src.codingSectionOnReset; }
      if (accept) {
        pushCur();
        let q = hm[2].trim();
        // Join a wrapped heading continuation line.
        const next = (lines[i + 1] || '');
        const nextClean = clean(next).trim();
        const lastWord = q.split(/\s+/).pop().toLowerCase().replace(/[^a-z-]/g, '');
        const looksWrapped = !inCoding && !/[?.:]$/.test(q) && nextClean && !src.heading.test(nextClean) && !/^===== PAGE/.test(next)
          && nextClean.length < 60 && (CONTINUATION_WORDS.has(lastWord) || q.length > 55 || /^[a-z(]/.test(nextClean)) && !/^(Answer:|The |A |An |In |It |This |There |If |We |You |When |Yes|No)/.test(nextClean);
        if (looksWrapped) { q += ' ' + nextClean; i++; }
        prevN = n;
        cur = { id: `${src.id}-${inCoding ? 'c' : ''}${n}${dupSuffix(questions, src.id, n, inCoding)}`, n, section, page, q: q.replace(/\s+/g, ' ').trim(), lines: [] };
        continue;
      }
    }
    if (cur) cur.lines.push(line);
  }
  pushCur();
  return questions;
}

function dupSuffix(questions, sid, n, coding) {
  const base = `${sid}-${coding ? 'c' : ''}${n}`;
  let k = 0; for (const q of questions) if (q.id === base || q.id.startsWith(base + '_')) k++;
  return k ? `_${k + 1}` : '';
}

function finishAnswer(lines, src) {
  // Drop line-number gutters printed by the source site (lone "1", "2", ... lines) and template noise.
  const out = [];
  for (let l of lines) {
    if (/^\s*\d{1,2}\s*$/.test(l)) continue;
    if (/^(Next|To learn|If you are looking|These were some|Next up on|Next among|Next in)/.test(l.trim()) && /(questions|Course|blog|compilation)/i.test(l)) continue;
    if (src.answerPrefix) l = l.replace(src.answerPrefix, '');
    out.push(l);
  }
  // Collapse runs of blank lines
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const bank = { generatedAt: new Date().toISOString(), repo: { owner: OWNER, name: REPO, branch: BRANCH,
  url: `https://github.com/${OWNER}/${REPO}` }, sources: [] };

for (const src of SOURCES) {
  const txtPath = path.join(textDir, src.file.replace(/\.pdf$/i, '.txt'));
  if (!fs.existsSync(txtPath)) { console.warn(`missing ${txtPath}`); continue; }
  const text = fs.readFileSync(txtPath, 'utf8');
  const pages = (text.match(/^===== PAGE \d+ =====$/gm) || []).length;
  const questions = parseSource(src, text);
  const enc = encodeURIComponent(src.file).replace(/%20/g, '%20');
  bank.sources.push({
    id: src.id, title: src.title, file: src.file, pages,
    url: `https://github.com/${OWNER}/${REPO}/blob/${BRANCH}/${enc}`,
    rawUrl: `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${enc}`,
    sections: [...new Set(questions.map(q => q.section))],
    questions,
  });
  console.log(`${src.id.padEnd(7)} ${String(questions.length).padStart(4)} questions  ${pages} pages  sections: ${[...new Set(questions.map(q => q.section))].join(', ')}`);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, '// Generated by tools/build-bank.js — do not edit by hand.\nwindow.BANK = ' + JSON.stringify(bank, null, 1) + ';\n', 'utf8');
console.log(`\nwrote ${outFile} (${(fs.statSync(outFile).size / 1024).toFixed(0)} KB)`);
