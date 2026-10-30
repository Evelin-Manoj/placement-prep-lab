/* Placement Prep Lab — single-page learning app. No build step, no dependencies. */
(function () {
  'use strict';

  // ------------------------------------------------------------------ data access
  const BANK = window.BANK;
  const CUR = window.CURRICULUM;
  const $ = (sel, root = document) => root.querySelector(sel);
  const app = $('#app');

  const bankById = new Map();
  const sourceById = new Map();
  for (const src of BANK.sources) {
    sourceById.set(src.id, src);
    for (const q of src.questions) { q.sourceId = src.id; bankById.set(q.id, q); }
  }

  // Assign bank questions to topics. Explicit number lists first, then leftovers of a source go to the
  // first topic of that source that is not a coding topic.
  const topicById = new Map(CUR.topics.map(t => [t.id, t]));
  const topicQuestions = new Map();
  (function assign() {
    const claimed = new Set();
    for (const t of CUR.topics) {
      const src = sourceById.get(t.source);
      if (!src) { topicQuestions.set(t.id, []); continue; }
      let qs;
      if (t.coding) qs = src.questions.filter(q => /-c\d/.test(q.id));
      else if (t.all) qs = src.questions.filter(q => !/-c\d/.test(q.id));
      else { const set = new Set(t.numbers); qs = src.questions.filter(q => !/-c\d/.test(q.id) && set.has(q.n)); }
      qs.forEach(q => claimed.add(q.id));
      topicQuestions.set(t.id, qs);
    }
    for (const src of BANK.sources) {
      const leftovers = src.questions.filter(q => !claimed.has(q.id) && !/-c\d/.test(q.id));
      if (!leftovers.length) continue;
      const home = CUR.topics.find(t => t.source === src.id && !t.coding);
      if (home) topicQuestions.get(home.id).push(...leftovers);
    }
    for (const [id, qs] of topicQuestions) qs.sort((a, b) => a.n - b.n);
  })();

  const contentFor = id => CUR.content[id] || {};
  const topicOfQuestion = new Map();
  for (const [tid, qs] of topicQuestions) qs.forEach(q => topicOfQuestion.set(q.id, tid));

  // ------------------------------------------------------------------ persistence
  const KEY = 'ppl:v1';
  const defaults = () => ({ visited: {}, notesRead: {}, known: {}, attempts: [], qstats: {}, cards: {}, coding: {}, activity: {}, settings: { theme: 'dark', bankCards: false } });
  let store = load();
  function load() { try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { return defaults(); } }
  function save() { localStorage.setItem(KEY, JSON.stringify(store)); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function bump(n = 1) { store.activity[today()] = (store.activity[today()] || 0) + n; save(); }
  function recordAnswer(qid, correct, weight = 1) {
    const s = store.qstats[qid] || (store.qstats[qid] = { right: 0, wrong: 0, last: 0 });
    if (correct) s.right += weight; else s.wrong += weight;
    s.last = Date.now(); bump();
  }

  // ------------------------------------------------------------------ helpers
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200); }

  // Minimal markdown: fenced code, paragraphs, "- " lists, **bold**, *italic*, `code`, [text](url)
  function md(text) {
    if (!text) return '';
    const blocks = String(text).split(/```/);
    let out = '';
    blocks.forEach((b, i) => {
      if (i % 2 === 1) { const nl = b.indexOf('\n'); const body = nl >= 0 ? b.slice(nl + 1) : b; out += `<pre><code>${esc(body.replace(/\s+$/, ''))}</code></pre>`; return; }
      const paras = b.trim().split(/\n\s*\n/);
      for (const p of paras) {
        if (!p.trim()) continue;
        const lines = p.split('\n');
        if (lines.every(l => /^\s*[-•]\s+/.test(l))) { out += '<ul>' + lines.map(l => `<li>${inline(l.replace(/^\s*[-•]\s+/, ''))}</li>`).join('') + '</ul>'; }
        else if (lines.every(l => /^\s*\d+\.\s+/.test(l))) { out += '<ol>' + lines.map(l => `<li>${inline(l.replace(/^\s*\d+\.\s+/, ''))}</li>`).join('') + '</ol>'; }
        else if (/^###\s/.test(p)) out += `<h4>${inline(p.replace(/^###\s*/, ''))}</h4>`;
        else out += `<p>${inline(lines.join('<br>'))}</p>`;
      }
    });
    return out;
  }
  function inline(s) {
    // protect code spans first
    const codes = [];
    s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
    s = esc(s).replace(/&lt;br&gt;/g, '<br>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<i>$2</i>');
    s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a class="source-link" target="_blank" rel="noopener" href="$2">$1</a>');
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
  }
  // Render a question-bank answer: group code-looking lines into <pre>, the rest into paragraphs.
  function renderAnswer(text) {
    if (!text) return '<p class="muted">The PDF holds this answer as an image or table that did not survive text extraction. Open the source page.</p>';
    const lines = text.split('\n');
    const isCode = l => {
      const t = l.trim();
      const punct = (t.match(/[{}();=<>\[\]]/g) || []).length;
      const words = t.split(/\s+/).length;
      // Long sentences with little punctuation are prose even if they mention Object() or similar.
      if (words >= 7 && punct < 2 && !/[{};]\s*$/.test(t)) return false;
      if (/[{};]\s*$/.test(t) || /^\s{2,}\S/.test(l)) return true;
      if (/^(const|let|var|function|import|export|return|class|if|for|while|switch|case|try|catch|console\.|document\.|window\.|\$|#include|<\/?[a-zA-Z!]|@|def |print|SELECT|INSERT|UPDATE|DELETE|CREATE|echo|\?>|<\?php|async |await |new |\.then|\.catch|}|\)|\/\/)/.test(t)) return true;
      return /(=>|===|!==|\);|\.prototype\.|\.push\(|\.map\(|\.log\()/.test(t);
    };
    let out = '', buf = [], mode = null;
    const flush = () => { if (!buf.length) return; out += mode === 'code' ? `<pre><code>${esc(buf.join('\n'))}</code></pre>` : `<p>${esc(buf.join(' ')).replace(/\n/g, '<br>')}</p>`; buf = []; };
    for (const l of lines) {
      if (!l.trim()) { flush(); mode = null; continue; }
      const m = isCode(l) ? 'code' : 'text';
      if (m !== mode) { flush(); mode = m; }
      buf.push(m === 'code' ? l : l.trim());
    }
    flush();
    return out;
  }
  function sourceLink(q) {
    const src = sourceById.get(q.sourceId);
    return `<a class="source-link" target="_blank" rel="noopener" href="${src.rawUrl}#page=${q.page}" title="Open the PDF at page ${q.page}">📄 ${esc(src.file)} · p.${q.page}</a>`;
  }

  // ------------------------------------------------------------------ progress maths
  function topicStats(tid) {
    const qs = topicQuestions.get(tid) || [];
    const c = contentFor(tid);
    const quizIds = (c.quiz || []).map((_, i) => `${tid}:q${i}`);
    const exIds = (c.coding || []).map((e, i) => `${tid}:c${e.id || i}`);
    const attempts = store.attempts.filter(a => a.topicId === tid);
    const best = attempts.length ? Math.max(...attempts.map(a => pct(a.score, a.total))) : null;
    const last = attempts.length ? attempts[attempts.length - 1] : null;
    const known = qs.filter(q => store.known[q.id] === 1).length;
    const weak = qs.filter(q => store.known[q.id] === -1).length;
    const cardIds = cardsFor(tid, false).map(cd => cd.id);
    const reviewed = cardIds.filter(id => store.cards[id] && store.cards[id].reps > 0).length;
    const due = cardIds.filter(id => store.cards[id] && store.cards[id].due <= Date.now()).length;
    const solved = exIds.filter(id => store.coding[id] && store.coding[id].solved).length;
    let right = 0, wrong = 0;
    for (const id of [...quizIds, ...exIds, ...qs.map(q => q.id)]) { const s = store.qstats[id]; if (s) { right += s.right; wrong += s.wrong; } }
    const accuracy = right + wrong ? right / (right + wrong) : null;
    const visited = !!store.visited[tid];
    const notesRead = !!store.notesRead[tid];
    // mastery: notes 20, quiz best 35, cards reviewed 20, bank known 15, coding 10
    const parts = [
      notesRead ? 20 : (visited ? 8 : 0),
      best === null ? 0 : best * 0.35,
      cardIds.length ? 20 * reviewed / cardIds.length : (notesRead ? 20 : 0),
      qs.length ? 15 * known / qs.length : 15,
      exIds.length ? 10 * solved / exIds.length : (best === null ? 0 : 10),
    ];
    const mastery = Math.round(Math.min(100, parts.reduce((a, b) => a + b, 0)));
    return { count: qs.length, best, last, known, weak, reviewed, due, cards: cardIds.length, solved, exercises: exIds.length, accuracy, visited, notesRead, mastery, attempts: attempts.length, right, wrong };
  }
  function overall() {
    const stats = CUR.topics.map(t => ({ t, s: topicStats(t.id) }));
    const mastery = Math.round(stats.reduce((a, x) => a + x.s.mastery, 0) / stats.length);
    const covered = stats.filter(x => x.s.visited).length;
    const due = stats.reduce((a, x) => a + x.s.due, 0);
    const weak = stats.filter(x => x.s.accuracy !== null && x.s.accuracy < 0.6).map(x => x.t);
    const streak = computeStreak();
    return { stats, mastery, covered, due, weak, streak };
  }
  function computeStreak() {
    let n = 0; const d = new Date();
    for (;;) { const k = d.toISOString().slice(0, 10); if (store.activity[k]) { n++; d.setDate(d.getDate() - 1); } else break; }
    return n;
  }

  // ------------------------------------------------------------------ flashcards
  function cardsFor(tid, includeBank) {
    const c = contentFor(tid);
    const list = (c.cards || []).map((cd, i) => ({ id: `${tid}:f${i}`, f: cd.f, b: cd.b, ref: cd.ref, topicId: tid }));
    if (includeBank) for (const q of topicQuestions.get(tid) || []) list.push({ id: `bank:${q.id}`, f: q.q, b: q.a, ref: q.id, topicId: tid, fromBank: true });
    return list;
  }
  function schedule(cardId, rating) {
    const now = Date.now(), day = 86400000;
    const s = store.cards[cardId] || { ease: 2.5, interval: 0, due: 0, reps: 0, lapses: 0 };
    if (rating === 'again') { s.interval = 0; s.due = now + 10 * 60000; s.ease = Math.max(1.3, s.ease - 0.2); s.lapses++; }
    else if (rating === 'good') { s.interval = s.reps === 0 || s.interval === 0 ? 1 : Math.round(s.interval * s.ease); s.due = now + s.interval * day; }
    else { s.interval = s.reps === 0 || s.interval === 0 ? 3 : Math.round(s.interval * s.ease * 1.3); s.ease += 0.15; s.due = now + s.interval * day; }
    s.reps++; s.last = now;
    store.cards[cardId] = s; bump(); save();
    return s;
  }

  // ------------------------------------------------------------------ routing
  function route() {
    const hash = location.hash.replace(/^#\/?/, '');
    const [path, qs] = hash.split('?');
    const parts = path.split('/').filter(Boolean);
    const params = Object.fromEntries(new URLSearchParams(qs || ''));
    const page = parts[0] || 'home';
    document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('active', a.dataset.route === (['topic', 'quiz', 'cards', 'code'].includes(page) ? (page === 'topic' ? 'home' : 'practice') : page)));
    window.scrollTo({ top: 0 });
    try {
      switch (page) {
        case 'home': return viewHome();
        case 'topic': return viewTopic(parts[1], parts[2] || 'learn');
        case 'practice': return viewPractice();
        case 'quiz': return viewQuiz(parts[1], params);
        case 'cards': return viewCards(parts[1], params);
        case 'code': return viewCode(parts[1], parts[2]);
        case 'mock': return viewMock(params);
        case 'progress': return viewProgress();
        case 'bank': return viewBank(params);
        default: return viewHome();
      }
    } catch (e) { console.error(e); app.innerHTML = `<div class="empty">Something went wrong rendering this page.<br><code>${esc(e.message)}</code></div>`; }
  }
  window.addEventListener('hashchange', route);

  // ------------------------------------------------------------------ views: home
  function viewHome() {
    const o = overall();
    const totalQ = BANK.sources.reduce((a, s) => a + s.questions.length, 0);
    app.innerHTML = `
      <section class="hero reveal">
        <div>
          <div class="eyebrow">Interview course · ${BANK.sources.length} source files · ${totalQ} questions</div>
          <h1>Learn the repo the way <span class="grad-text">interviews are run</span>.</h1>
          <p class="lead">${esc(CUR.tagline)} Pick a round, read the study notes, then drill it with quizzes, flashcards and coding prompts. A timed mock interview samples across everything.</p>
          <div class="row">
            <a class="btn primary" href="#/mock">Start a mock interview</a>
            <a class="btn" href="#/practice">Practice hub</a>
            ${o.due ? `<a class="btn ghost" href="#/practice">${plural(o.due, 'card')} due</a>` : ''}
          </div>
          <div class="hero-stats">
            <div class="stat"><b>${o.covered}/${CUR.topics.length}</b><span>topics started</span></div>
            <div class="stat"><b>${store.attempts.length}</b><span>quiz sessions</span></div>
            <div class="stat"><b>${o.streak}</b><span>day streak</span></div>
          </div>
        </div>
        <div class="ring-wrap">${ring(o.mastery, 'overall mastery')}</div>
      </section>
      ${CUR.rounds.map(r => `
        <section class="section reveal">
          <div class="round-head"><div><div class="eyebrow">${esc(r.id)}</div><h2>${esc(r.title)}</h2><p>${esc(r.blurb)}</p></div></div>
          <div class="grid cols-3">${r.topics.map(tid => topicCard(topicById.get(tid))).join('')}</div>
        </section>`).join('')}
      <section class="section reveal">
        <div class="round-head"><div><div class="eyebrow">Not in the repository yet</div><h2>Rounds the repo does not cover</h2></div></div>
        <div class="grid cols-2">${CUR.notCovered.map(n => `<div class="card"><h3>${esc(n.title)}</h3><p class="muted" style="margin:0">${esc(n.note)}</p></div>`).join('')}</div>
      </section>`;
  }
  function ring(value, label) {
    const r = 80, c = 2 * Math.PI * r, off = c * (1 - value / 100);
    return `<div class="ring"><svg width="190" height="190" viewBox="0 0 190 190"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>
      <circle cx="95" cy="95" r="${r}" fill="none" stroke="var(--bg-elev-2)" stroke-width="14"/>
      <circle cx="95" cy="95" r="${r}" fill="none" stroke="url(#g)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" style="transition:stroke-dashoffset 1s var(--ease)"/></svg>
      <div class="ring-label"><div><b>${value}%</b><span>${esc(label)}</span></div></div></div>`;
  }
  function topicCard(t) {
    const s = topicStats(t.id);
    const c = contentFor(t.id);
    return `<a class="card hover topic-card" href="#/topic/${t.id}">
      <div class="row between"><span class="icon">${t.icon}</span>${s.weak ? `<span class="chip bad">${s.weak} weak</span>` : s.best !== null ? `<span class="chip ${s.best >= 80 ? 'ok' : s.best >= 60 ? 'warn' : 'bad'}">best ${s.best}%</span>` : ''}</div>
      <h3>${esc(t.title)}</h3>
      <p>${esc(t.summary)}</p>
      <div class="progress"><i style="width:${s.mastery}%"></i></div>
      <div class="topic-meta"><span>${s.mastery}% mastery</span><span>·</span><span>${plural(s.count, t.coding ? 'drill' : 'question')}</span>${(c.quiz || []).length ? `<span>·</span><span>${(c.quiz || []).length} quiz items</span>` : ''}${s.due ? `<span>·</span><span>${s.due} due</span>` : ''}</div>
    </a>`;
  }

  // ------------------------------------------------------------------ views: topic
  function viewTopic(tid, tab) {
    const t = topicById.get(tid);
    if (!t) return (app.innerHTML = '<div class="empty">Unknown topic.</div>');
    if (!store.visited[tid]) { store.visited[tid] = Date.now(); bump(); }
    const c = contentFor(tid), s = topicStats(tid), qs = topicQuestions.get(tid), src = sourceById.get(t.source);
    const round = CUR.rounds.find(r => r.topics.includes(tid));
    const tabs = [
      ['learn', 'Learn'], ['bank', `Question bank <span class="count">${qs.length}</span>`],
      ...(c.quiz && c.quiz.length ? [['quiz', `Quiz <span class="count">${c.quiz.length}</span>`]] : []),
      ...(cardsFor(tid, false).length ? [['cards', `Flashcards <span class="count">${cardsFor(tid, false).length}</span>`]] : []),
      ...((c.coding && c.coding.length) || t.coding ? [['code', `Coding <span class="count">${t.coding ? qs.length : c.coding.length}</span>`]] : []),
    ];
    app.innerHTML = `
      <div class="tiny" style="margin-bottom:.6rem"><a href="#/">Curriculum</a> › ${esc(round ? round.title : '')}</div>
      <section class="topic-hero reveal">
        <div>
          <div class="eyebrow">${t.icon} ${esc(t.short)}</div>
          <h1>${esc(t.title)}</h1>
          <p class="muted" style="max-width:68ch">${esc(t.summary)}</p>
          <div class="row">
            <span class="chip accent">${s.mastery}% mastery</span>
            ${s.best !== null ? `<span class="chip ${s.best >= 80 ? 'ok' : s.best >= 60 ? 'warn' : 'bad'}">best quiz ${s.best}%</span>` : ''}
            ${s.due ? `<span class="chip warn">${s.due} cards due</span>` : ''}
            <a class="source-link" target="_blank" rel="noopener" href="${src.url}">Source: ${esc(src.file)} (${src.pages} pages) ↗</a>
          </div>
        </div>
        <div class="actions">
          ${c.quiz && c.quiz.length ? `<a class="btn primary" href="#/quiz/${tid}">Take the quiz</a>` : ''}
          ${cardsFor(tid, false).length ? `<a class="btn" href="#/cards/${tid}">Review flashcards</a>` : ''}
          ${(c.coding && c.coding.length) || t.coding ? `<a class="btn" href="#/code/${tid}">Coding drills</a>` : ''}
        </div>
      </section>
      <div class="tabs" role="tablist">${tabs.map(([k, label]) => `<button role="tab" data-tab="${k}" class="${k === tab ? 'active' : ''}">${label}</button>`).join('')}</div>
      <section id="tabBody"></section>`;
    app.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => { location.hash = `#/topic/${tid}/${b.dataset.tab}`; }));
    const body = $('#tabBody');
    if (tab === 'learn') renderLearn(body, t, c, qs);
    else if (tab === 'bank') renderBank(body, qs, { topicId: tid });
    else if (tab === 'quiz') body.innerHTML = `<div class="card"><h3>Quiz: ${esc(t.title)}</h3><p class="muted">${c.quiz.filter(q => q.type === 'mcq').length} multiple-choice and ${c.quiz.filter(q => q.type !== 'mcq').length} short-answer items, plus optional questions drawn from the bank. ${s.attempts ? `You have taken it ${plural(s.attempts, 'time')}; best ${s.best}%.` : ''}</p><div class="row"><a class="btn primary" href="#/quiz/${tid}">Start 10 questions</a><a class="btn" href="#/quiz/${tid}?n=all">All curated items</a><a class="btn ghost" href="#/quiz/${tid}?n=15&bank=1">15 incl. bank questions</a></div></div>`;
    else if (tab === 'cards') body.innerHTML = `<div class="card"><h3>Flashcards: ${esc(t.title)}</h3><p class="muted">${cardsFor(tid, false).length} curated cards. Rate each card <b>Again</b>, <b>Good</b> or <b>Easy</b>; the schedule spaces reviews out automatically. ${s.due ? `<b>${s.due} due now.</b>` : ''}</p><div class="row"><a class="btn primary" href="#/cards/${tid}">Review due + new</a><a class="btn" href="#/cards/${tid}?bank=1">Include question-bank cards (${qs.length})</a></div></div>`;
    else if (tab === 'code') renderCodeIndex(body, t, c, qs);
  }

  function renderLearn(body, t, c, qs) {
    if (!c.why) { body.innerHTML = `<div class="empty">Study notes for this topic have not been written yet. The question bank tab has all ${qs.length} questions from the source file.</div>`; return; }
    body.innerHTML = `
      <div class="grid" style="grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 1.4rem" id="learnGrid">
        <div>
          <div class="card" style="margin-bottom:1.2rem"><div class="eyebrow">What interviewers ask and why</div>${md(c.why)}</div>
          <div class="eyebrow">Study notes</div>
          ${(c.notes || []).map(n => `<article class="note"><h3>${inline(n.h)}</h3>${md(n.md)}</article>`).join('')}
          ${(c.model || []).length ? `<div class="eyebrow" style="margin-top:1.6rem">Model answers (say it like this)</div>${c.model.map(m => `<details class="card model-answer"><summary>${inline(m.q)}</summary><div class="body">${md(m.a)}${m.ref && bankById.get(m.ref) ? `<div class="tiny">Source: ${sourceLink(bankById.get(m.ref))}</div>` : ''}</div></details>`).join('')}` : ''}
          <div class="row" style="margin-top:1.4rem">
            <button class="btn primary" id="markRead">${store.notesRead[t.id] ? '✓ Notes marked as read' : 'Mark notes as read'}</button>
            ${c.quiz && c.quiz.length ? `<a class="btn" href="#/quiz/${t.id}">Quiz me on this</a>` : ''}
          </div>
        </div>
        <aside>
          ${(c.pitfalls || []).length ? `<div class="card" style="margin-bottom:1rem"><div class="eyebrow">Common pitfalls</div>${c.pitfalls.map(p => `<div class="pitfall"><span class="mark">!</span><div>${inline(p)}</div></div>`).join('')}</div>` : ''}
          <div class="card"><div class="eyebrow">In the source file</div><p class="muted" style="font-size:.9rem">${qs.length} questions from <b>${esc(sourceById.get(t.source).file)}</b>${t.numbers ? ' are mapped to this topic' : ''}. Each one links back to its PDF page.</p><a class="btn sm" href="#/topic/${t.id}/bank">Browse them</a></div>
        </aside>
      </div>`;
    $('#markRead').addEventListener('click', () => { store.notesRead[t.id] = Date.now(); bump(); save(); toast('Marked as read'); route(); });
    if (window.innerWidth < 900) $('#learnGrid').style.gridTemplateColumns = '1fr';
  }

  // ------------------------------------------------------------------ question bank list
  function renderBank(body, qs, opts = {}) {
    const state = { q: opts.query || '', filter: 'all' };
    body.innerHTML = `
      <div class="bank-toolbar">
        <input type="search" id="bankSearch" placeholder="Search ${qs.length} questions…" value="${esc(state.q)}" aria-label="Search questions" />
        <div class="row" id="bankFilters">
          ${[['all', 'All'], ['weak', 'Marked weak'], ['known', 'Known'], ['new', 'Unmarked']].map(([k, l]) => `<button class="btn sm ${k === 'all' ? 'primary' : ''}" data-f="${k}">${l}</button>`).join('')}
        </div>
      </div>
      <div class="tiny" style="margin-bottom:.8rem">Click a question to reveal the answer. Mark it <b>known</b> or <b>weak</b> to shape your weak-area report. <kbd>Space</kbd> toggles the focused answer.</div>
      <div id="bankList"></div>`;
    const list = $('#bankList');
    const render = () => {
      const term = state.q.trim().toLowerCase();
      const items = qs.filter(q => {
        if (state.filter === 'weak' && store.known[q.id] !== -1) return false;
        if (state.filter === 'known' && store.known[q.id] !== 1) return false;
        if (state.filter === 'new' && store.known[q.id]) return false;
        return !term || q.q.toLowerCase().includes(term) || q.a.toLowerCase().includes(term);
      });
      list.innerHTML = items.length ? items.slice(0, 400).map(questionItem).join('') + (items.length > 400 ? `<div class="tiny">Showing 400 of ${items.length}. Narrow the search.</div>` : '') : '<div class="empty">No questions match.</div>';
      if (opts.topicId === undefined) list.querySelectorAll('.q-item').forEach(el => { const q = bankById.get(el.dataset.id); const tid = topicOfQuestion.get(q.id); if (tid) el.querySelector('.q-foot').insertAdjacentHTML('beforeend', `<a class="chip" href="#/topic/${tid}">${esc(topicById.get(tid).short)}</a>`); });
    };
    $('#bankSearch').addEventListener('input', e => { state.q = e.target.value; render(); });
    $('#bankFilters').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.filter = b.dataset.f; $('#bankFilters').querySelectorAll('button').forEach(x => x.classList.toggle('primary', x === b)); render(); });
    list.addEventListener('click', e => {
      const head = e.target.closest('.q-head'); const mark = e.target.closest('[data-mark]');
      if (mark) { const id = mark.closest('.q-item').dataset.id; const v = +mark.dataset.mark; store.known[id] = store.known[id] === v ? 0 : v; bump(); save(); mark.closest('.q-item').outerHTML = questionItem(bankById.get(id), true); return; }
      if (head) { const item = head.closest('.q-item'); const open = item.classList.toggle('open'); item.querySelector('.q-body').hidden = !open; head.setAttribute('aria-expanded', open); }
    });
    list.addEventListener('keydown', e => { if (e.key === ' ' && e.target.classList.contains('q-head')) { e.preventDefault(); e.target.click(); } });
    render();
  }
  function questionItem(q, open = false) {
    const k = store.known[q.id];
    return `<div class="q-item ${k === 1 ? 'known' : k === -1 ? 'weak' : ''} ${open ? 'open' : ''}" data-id="${q.id}">
      <button class="q-head" aria-expanded="${open}"><span class="q-num">${esc(q.id.split('-').pop())}</span><span class="q-text">${esc(q.q)}</span><span class="q-state">${k === 1 ? '<span class="chip ok">known</span>' : k === -1 ? '<span class="chip bad">weak</span>' : ''}</span></button>
      <div class="q-body" ${open ? '' : 'hidden'}>
        <div class="answer">${renderAnswer(q.a)}</div>
        <div class="q-foot">
          <button class="btn sm ${k === 1 ? 'primary' : ''}" data-mark="1">✓ Know it</button>
          <button class="btn sm ${k === -1 ? 'primary' : ''}" data-mark="-1">⚑ Weak</button>
          <span class="tiny">${esc(q.section)}</span>
          ${sourceLink(q)}
        </div>
      </div>
    </div>`;
  }

  // ------------------------------------------------------------------ quiz engine
  function buildQuizItems(tid, params) {
    const c = contentFor(tid), t = topicById.get(tid);
    let items = (c.quiz || []).map((q, i) => ({ ...q, id: `${tid}:q${i}`, topicId: tid }));
    if (t && t.coding) items = items.concat(exerciseItems(tid));
    const n = params.n === 'all' ? items.length : Math.max(1, parseInt(params.n, 10) || 10);
    let pool = shuffle(items);
    if (params.bank) {
      const bank = shuffle(topicQuestions.get(tid) || []).filter(q => q.a && q.a.length > 60).slice(0, n).map(q => ({ type: 'short', q: q.q, a: q.a, ref: q.id, id: q.id, topicId: tid, fromBank: true }));
      pool = shuffle(pool.concat(bank));
    }
    // Put weak items first when there is history
    pool.sort((a, b) => weakness(b.id) - weakness(a.id) + (Math.random() - 0.5) * 0.4);
    return pool.slice(0, n);
  }
  function weakness(id) { const s = store.qstats[id]; if (!s) return 0.5; return s.wrong / (s.right + s.wrong + 1); }
  function exerciseItems(tid) {
    const c = contentFor(tid);
    return (topicQuestions.get(tid) || []).map(q => {
      const ex = parseExercise(q, c.exercises && c.exercises[q.id]);
      if (!ex.options.length || ex.answer == null) return null;
      return { type: 'mcq', q: `What does this print? (${q.id.split('-').pop()})`, code: ex.code, options: ex.options, answer: ex.answer, explain: ex.explain, ref: q.id, id: `${tid}:c${q.id}`, topicId: tid };
    }).filter(Boolean);
  }
  function parseExercise(q, meta) {
    const lines = q.a.split('\n'); const code = [], options = [];
    let phase = 'code';
    for (const l of lines) {
      const om = l.match(/^\s*(\d):\s*(.*)$/);
      if (phase === 'code' && om) phase = 'options';
      if (phase === 'options') { if (om) { options.push(om[2].trim()); continue; } if (/^Answer\s*$/.test(l.trim())) { phase = 'after'; continue; } if (options.length && l.trim()) { options[options.length - 1] += ' ' + l.trim(); continue; } }
      if (phase === 'code') code.push(l);
    }
    const m = meta || {};
    return { code: (m.code || code.join('\n')).trim(), options: m.options || options, answer: m.answer != null ? m.answer - 1 : null, explain: m.explain || '', title: m.title || q.q, kind: m.kind || 'predict', solution: m.solution };
  }

  function viewQuiz(tid, params) {
    const t = topicById.get(tid);
    if (!t) return (app.innerHTML = '<div class="empty">Unknown topic.</div>');
    const items = buildQuizItems(tid, params);
    if (!items.length) return (app.innerHTML = `<div class="empty">No quiz items for this topic yet. <a href="#/topic/${tid}/bank">Browse the question bank</a>.</div>`);
    runSession({ title: `Quiz · ${t.title}`, items, topicId: tid, back: `#/topic/${tid}/quiz` });
  }

  // Shared session runner for quizzes and mock interviews.
  function runSession(opts) {
    const { items, topicId } = opts;
    let i = 0, score = 0; const results = [];
    let timerId = null, remaining = opts.seconds || 0;
    const finish = () => {
      clearInterval(timerId);
      const attempt = { ts: Date.now(), topicId, score, total: items.length, items: results.map(r => ({ id: r.id, topicId: r.topicId, correct: r.correct })) };
      store.attempts.push(attempt); bump(); save();
      renderResults(attempt, results, opts);
    };
    const render = () => {
      const it = items[i];
      app.innerHTML = `
        <div class="quiz-shell">
          <div class="quiz-top">
            <div><div class="eyebrow">${esc(opts.title)}</div><div class="tiny">Question ${i + 1} of ${items.length} · score ${score}</div></div>
            <div class="row">${opts.seconds ? `<span class="timer" id="timer">${fmtTime(remaining)}</span>` : ''}<a class="btn sm ghost" href="${opts.back}">Quit</a></div>
          </div>
          <div class="progress" style="margin-bottom:1rem"><i style="width:${pct(i, items.length)}%"></i></div>
          <div class="card question-card reveal" id="qcard">
            ${it.topicId && it.topicId !== topicId ? `<span class="chip">${esc(topicById.get(it.topicId)?.short || '')}</span>` : ''}
            <h3>${inline(it.q)}</h3>
            ${it.code ? `<pre><code>${esc(it.code)}</code></pre>` : ''}
            ${it.type === 'mcq' ? `<div class="options">${it.options.map((o, k) => `<button class="option" data-k="${k}"><span class="key">${k + 1}</span><span>${inline(o)}</span></button>`).join('')}</div><div class="kbd-hint" style="margin-top:.6rem">Press <kbd>1</kbd>–<kbd>${it.options.length}</kbd> to answer</div>`
              : `<textarea class="answer-box" id="shortAns" placeholder="Say it out loud or type the key points, then reveal the model answer…"></textarea><div class="row" style="margin-top:.8rem"><button class="btn primary" id="revealBtn">Reveal answer</button></div>`}
            <div id="feedback"></div>
          </div>
        </div>`;
      if (opts.seconds) startTimer();
      const card = $('#qcard');
      if (it.type === 'mcq') {
        const answer = k => {
          if (card.dataset.done) return;
          card.dataset.done = 1;
          const correct = k === it.answer;
          if (correct) score++;
          recordAnswer(it.id, correct);
          if (it.ref && it.ref.includes('-c') && store.coding) { store.coding[`${it.topicId}:c${it.ref}`] = store.coding[`${it.topicId}:c${it.ref}`] || {}; if (correct) store.coding[`${it.topicId}:c${it.ref}`].solved = true; }
          results.push({ ...it, picked: k, correct });
          card.querySelectorAll('.option').forEach((b, idx) => { b.disabled = true; if (idx === it.answer) b.classList.add('correct'); else if (idx === k) b.classList.add('wrong'); });
          $('#feedback').innerHTML = `<div class="explain"><b>${correct ? 'Correct.' : 'Not quite.'}</b> ${md(it.explain || '')}${refLine(it.ref)}</div><div class="row" style="margin-top:1rem"><button class="btn primary" id="nextBtn">${i + 1 < items.length ? 'Next →' : 'See results'}</button></div>`;
          $('#nextBtn').focus();
          $('#nextBtn').addEventListener('click', next);
        };
        card.querySelectorAll('.option').forEach(b => b.addEventListener('click', () => answer(+b.dataset.k)));
        keyHandler = e => { const n = parseInt(e.key, 10); if (n >= 1 && n <= it.options.length && !card.dataset.done) answer(n - 1); else if (e.key === 'Enter' && card.dataset.done) next(); };
      } else {
        $('#revealBtn').addEventListener('click', () => {
          $('#feedback').innerHTML = `<div class="explain"><b>Model answer</b>${it.fromBank ? renderAnswer(it.a) : md(it.a)}${refLine(it.ref)}</div>
            <div class="self-grade"><button class="btn" data-g="1">✓ Got it</button><button class="btn" data-g="0.5">~ Partly</button><button class="btn" data-g="0">✗ Missed it</button></div>`;
          $('#revealBtn').disabled = true;
          $('#feedback').querySelectorAll('[data-g]').forEach(b => b.addEventListener('click', () => {
            const g = parseFloat(b.dataset.g); score += g; recordAnswer(it.id, g >= 0.5, 1);
            if (it.fromBank) { store.known[it.id] = g === 1 ? 1 : g === 0 ? -1 : store.known[it.id] || 0; }
            results.push({ ...it, correct: g >= 0.5, grade: g, typed: $('#shortAns').value });
            next();
          }));
        });
        keyHandler = null;
      }
    };
    const next = () => { if (++i < items.length) render(); else finish(); };
    const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    const startTimer = () => { clearInterval(timerId); timerId = setInterval(() => { remaining--; const el = $('#timer'); if (el) { el.textContent = fmtTime(Math.max(0, remaining)); if (remaining <= 60) el.classList.add('low'); } if (remaining <= 0) { clearInterval(timerId); toast('Time is up'); finish(); } }, 1000); };
    render();
  }
  let keyHandler = null;
  document.addEventListener('keydown', e => { if (keyHandler && !/INPUT|TEXTAREA/.test(e.target.tagName)) keyHandler(e); });
  function refLine(ref) { const q = ref && bankById.get(ref); return q ? `<div class="tiny" style="margin-top:.6rem">Source: ${sourceLink(q)} — “${esc(q.q)}”</div>` : ''; }

  function renderResults(attempt, results, opts) {
    const p = pct(attempt.score, attempt.total);
    const byTopic = {};
    for (const r of results) { const k = r.topicId || attempt.topicId; byTopic[k] = byTopic[k] || { right: 0, total: 0 }; byTopic[k].total++; if (r.correct) byTopic[k].right++; }
    const missed = results.filter(r => !r.correct);
    app.innerHTML = `
      <div class="quiz-shell">
        <div class="card result-hero reveal">
          <div class="eyebrow">${esc(opts.title)}</div>
          <b class="grad-text">${p}%</b>
          <p class="muted">${attempt.score % 1 ? attempt.score.toFixed(1) : attempt.score} of ${attempt.total} · ${p >= 80 ? 'Interview-ready on this set.' : p >= 60 ? 'Solid, but revisit the misses below.' : 'Spend time on the study notes before retrying.'}</p>
          <div class="row" style="justify-content:center">
            <a class="btn primary" href="${opts.back}">Back</a>
            <button class="btn" id="retry">Retry</button>
            <a class="btn ghost" href="#/progress">Progress</a>
          </div>
        </div>
        ${Object.keys(byTopic).length > 1 ? `<div class="card section"><h3>By topic</h3><div class="bars">${Object.entries(byTopic).map(([k, v]) => `<div class="bar-row"><span>${esc(topicById.get(k)?.short || k)}</span><div class="progress"><i style="width:${pct(v.right, v.total)}%"></i></div><span class="pct">${v.right}/${v.total}</span></div>`).join('')}</div></div>` : ''}
        <div class="section review-list">
          <h3>${missed.length ? `Review the ${plural(missed.length, 'miss')}` : 'Nothing missed — review anyway'}</h3>
          ${(missed.length ? missed : results).map(r => `<div class="q-item ${r.correct ? 'known' : 'weak'}"><button class="q-head" aria-expanded="true"><span class="q-text">${inline(r.q)}</span><span class="q-state"><span class="chip ${r.correct ? 'ok' : 'bad'}">${r.correct ? 'correct' : 'missed'}</span></span></button><div class="q-body">${r.code ? `<pre><code>${esc(r.code)}</code></pre>` : ''}<div class="answer">${r.type === 'mcq' ? `<p><b>Answer:</b> ${inline(r.options[r.answer])}${r.picked != null && r.picked !== r.answer ? ` &nbsp;<span class="muted">(you chose: ${inline(r.options[r.picked])})</span>` : ''}</p>${md(r.explain || '')}` : (r.fromBank ? renderAnswer(r.a) : md(r.a))}</div><div class="q-foot">${refLine(r.ref)}</div></div></div>`).join('')}
        </div>
      </div>`;
    $('#retry').addEventListener('click', () => { if (opts.retry) opts.retry(); else route(); });
  }

  // ------------------------------------------------------------------ flashcards view
  function viewCards(tid, params) {
    const t = topicById.get(tid);
    if (!t) return (app.innerHTML = '<div class="empty">Unknown topic.</div>');
    const includeBank = !!params.bank;
    const all = cardsFor(tid, includeBank);
    if (!all.length) return (app.innerHTML = `<div class="empty">No flashcards for this topic yet.</div>`);
    const now = Date.now();
    const due = all.filter(cd => store.cards[cd.id] && store.cards[cd.id].due <= now);
    const fresh = all.filter(cd => !store.cards[cd.id]);
    const limit = parseInt(params.n, 10) || 20;
    let queue = shuffle(due).concat(shuffle(fresh)).slice(0, limit);
    if (!queue.length) queue = shuffle(all).slice(0, Math.min(limit, all.length)); // nothing due: free review
    let idx = 0, reviewed = 0; const again = [];
    const render = () => {
      if (idx >= queue.length) {
        if (again.length) { queue = again.splice(0); idx = 0; toast('Repeating the cards you marked Again'); }
        else {
          const s = topicStats(tid);
          app.innerHTML = `<div class="flash-shell"><div class="card result-hero reveal"><div class="eyebrow">Flashcards · ${esc(t.title)}</div><b class="grad-text">${reviewed}</b><p class="muted">cards reviewed. ${s.due ? `${s.due} still due.` : 'Nothing else is due right now — come back tomorrow.'}</p><div class="row" style="justify-content:center"><a class="btn primary" href="#/topic/${tid}/cards">Back</a><a class="btn" href="#/cards/${tid}${includeBank ? '?bank=1' : ''}">Review more</a></div></div></div>`;
          return;
        }
      }
      const cd = queue[idx];
      const st = store.cards[cd.id];
      app.innerHTML = `
        <div class="flash-shell">
          <div class="quiz-top"><div><div class="eyebrow">Flashcards · ${esc(t.title)}</div><div class="tiny">${idx + 1} of ${queue.length} · ${due.length} due · ${fresh.length} new${includeBank ? ' · bank cards included' : ''}</div></div><a class="btn sm ghost" href="#/topic/${tid}/cards">Done</a></div>
          <div class="progress" style="margin-bottom:1rem"><i style="width:${pct(idx, queue.length)}%"></i></div>
          <div class="flashcard" id="fc" tabindex="0" role="button" aria-label="Flip card">
            <div class="inner">
              <div class="face front"><span class="label">${cd.fromBank ? 'Question bank' : 'Prompt'}${st ? ` · seen ${st.reps}×` : ' · new'}</span><div class="text">${esc(cd.f)}</div><span class="tiny">Tap or press <kbd>Space</kbd> to flip</span></div>
              <div class="face back"><span class="label">Answer</span><div class="text">${cd.fromBank ? renderAnswer(cd.b) : md(cd.b)}</div>${cd.ref && bankById.get(cd.ref) ? `<span class="tiny">${sourceLink(bankById.get(cd.ref))}</span>` : ''}</div>
            </div>
          </div>
          <div class="rating" id="rating" hidden>
            <button class="again" data-r="again">Again<small>repeat soon · <kbd>1</kbd></small></button>
            <button class="good" data-r="good">Good<small>${st && st.interval ? `~${Math.round(st.interval * st.ease)}d` : '1 day'} · <kbd>2</kbd></small></button>
            <button class="easy" data-r="easy">Easy<small>${st && st.interval ? `~${Math.round(st.interval * st.ease * 1.3)}d` : '3 days'} · <kbd>3</kbd></small></button>
          </div>
        </div>`;
      const fc = $('#fc');
      const flip = () => { fc.classList.toggle('flipped'); $('#rating').hidden = !fc.classList.contains('flipped'); };
      fc.addEventListener('click', flip);
      const rate = r => { schedule(cd.id, r); reviewed++; if (r === 'again') again.push(cd); idx++; render(); };
      $('#rating').querySelectorAll('button').forEach(b => b.addEventListener('click', () => rate(b.dataset.r)));
      keyHandler = e => { if (e.key === ' ') { e.preventDefault(); flip(); } else if (fc.classList.contains('flipped') && ['1', '2', '3'].includes(e.key)) rate(['again', 'good', 'easy'][+e.key - 1]); };
    };
    render();
  }

  // ------------------------------------------------------------------ coding
  function renderCodeIndex(body, t, c, qs) {
    const exs = codingList(t.id);
    body.innerHTML = `<div class="card"><h3>Coding drills: ${esc(t.title)}</h3><p class="muted">${exs.length} ${t.coding ? 'predict-the-output snippets with options, explanations and a run button' : 'hands-on prompts with a starter, an in-page runner and a reference solution'}.</p><a class="btn primary" href="#/code/${t.id}">Open the drills</a></div>
      <div class="exercise-list section">${exs.map((e, i) => `<a class="btn sm ghost" style="justify-content:flex-start" href="#/code/${t.id}/${i}"><span class="dot ${store.coding[e.id]?.solved ? 'ok' : ''}"></span>${esc(e.title)}</a>`).join('')}</div>`;
  }
  function codingList(tid) {
    const t = topicById.get(tid), c = contentFor(tid);
    if (t.coding) return (topicQuestions.get(tid) || []).map(q => { const ex = parseExercise(q, c.exercises && c.exercises[q.id]); return { id: `${tid}:c${q.id}`, ref: q.id, title: `${ex.kind === 'write' ? '✍️ ' : ''}${q.id.split('-').pop().replace('c', '#')} · ${ex.title}`, ...ex }; });
    return (c.coding || []).map((e, i) => ({ ...e, id: `${tid}:c${e.id || i}`, kind: 'write' }));
  }
  function viewCode(tid, idxStr) {
    const t = topicById.get(tid);
    if (!t) return (app.innerHTML = '<div class="empty">Unknown topic.</div>');
    const exs = codingList(tid);
    if (!exs.length) return (app.innerHTML = '<div class="empty">No coding drills here.</div>');
    const idx = Math.min(exs.length - 1, Math.max(0, parseInt(idxStr, 10) || 0));
    const ex = exs[idx];
    app.innerHTML = `
      <div class="quiz-top"><div><div class="eyebrow">Coding · ${esc(t.title)}</div><div class="tiny">${exs.filter(e => store.coding[e.id]?.solved).length} of ${exs.length} solved</div></div><a class="btn sm ghost" href="#/topic/${tid}/code">Back to topic</a></div>
      <div class="coding-layout">
        <aside class="exercise-list" style="align-content:start; max-height:70vh; overflow:auto">${exs.map((e, i) => `<button data-i="${i}" class="${i === idx ? 'active' : ''}"><span class="dot ${store.coding[e.id]?.solved ? 'ok' : store.coding[e.id]?.tried ? 'bad' : ''}"></span><span style="font-size:.85rem">${esc(e.title)}</span></button>`).join('')}</aside>
        <section class="card" id="exBody"></section>
      </div>`;
    app.querySelectorAll('.exercise-list button').forEach(b => b.addEventListener('click', () => { location.hash = `#/code/${tid}/${b.dataset.i}`; }));
    const body = $('#exBody');
    const nav = `<div class="row" style="margin-top:1.2rem">${idx > 0 ? `<a class="btn sm" href="#/code/${tid}/${idx - 1}">← Previous</a>` : ''}${idx + 1 < exs.length ? `<a class="btn sm" href="#/code/${tid}/${idx + 1}">Next →</a>` : ''}</div>`;
    const q = ex.ref && bankById.get(ex.ref);
    if (ex.kind === 'predict') {
      body.innerHTML = `<h3>${esc(ex.title)}</h3><pre><code>${esc(ex.code)}</code></pre>
        <div class="options">${ex.options.map((o, k) => `<button class="option" data-k="${k}"><span class="key">${k + 1}</span><span>${inline(o)}</span></button>`).join('')}</div>
        <div class="row" style="margin-top:.8rem"><button class="btn sm" id="runSnippet">▶ Run it in your browser</button><span class="tiny">Runs the snippet with <code>new Function</code>; browser-only objects behave like the real thing.</span></div>
        <div class="console-out" id="out" hidden></div>
        <div id="feedback"></div>${q ? `<div class="tiny" style="margin-top:1rem">${sourceLink(q)}</div>` : ''}${nav}`;
      body.querySelectorAll('.option').forEach(b => b.addEventListener('click', () => {
        if (body.dataset.done) return; body.dataset.done = 1;
        const k = +b.dataset.k, correct = k === ex.answer;
        recordAnswer(ex.id, correct);
        store.coding[ex.id] = { ...(store.coding[ex.id] || {}), tried: true, solved: correct || !!store.coding[ex.id]?.solved, ts: Date.now() }; save();
        body.querySelectorAll('.option').forEach((o, i) => { o.disabled = true; if (i === ex.answer) o.classList.add('correct'); else if (i === k) o.classList.add('wrong'); });
        $('#feedback').innerHTML = `<div class="explain"><b>${correct ? 'Correct.' : 'Not quite.'}</b> ${md(ex.explain)}</div>`;
      }));
      $('#runSnippet').addEventListener('click', () => { const out = $('#out'); out.hidden = false; out.textContent = runCode(ex.code).join('\n') || '(no output)'; });
      keyHandler = e => { const n = parseInt(e.key, 10); if (n >= 1 && n <= ex.options.length) body.querySelector(`.option[data-k="${n - 1}"]`)?.click(); };
    } else {
      const saved = store.coding[ex.id]?.draft;
      body.innerHTML = `<h3>${esc(ex.title)}</h3>${md(ex.prompt || '')}
        <textarea class="code-editor" id="editor" spellcheck="false">${esc(saved ?? ex.starter ?? '')}</textarea>
        <div class="row" style="margin-top:.7rem"><button class="btn primary sm" id="run">▶ Run</button>${ex.tests ? `<button class="btn sm" id="test">✔ Check against tests</button>` : ''}<button class="btn sm" id="reveal">Reveal solution</button><button class="btn sm ghost" id="reset">Reset</button><button class="btn sm ghost" id="markSolved">${store.coding[ex.id]?.solved ? '✓ Solved' : 'Mark solved'}</button></div>
        <div class="console-out" id="out" style="margin-top:.7rem">Output appears here.</div>
        <div id="solution" hidden style="margin-top:1rem"><div class="eyebrow">Reference solution</div><pre><code>${esc(ex.solution || '')}</code></pre>${ex.notes ? md(ex.notes) : ''}</div>
        ${q ? `<div class="tiny" style="margin-top:1rem">${sourceLink(q)}</div>` : ''}${nav}`;
      const editor = $('#editor');
      editor.addEventListener('input', () => { store.coding[ex.id] = { ...(store.coding[ex.id] || {}), draft: editor.value }; save(); });
      editor.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); const s = editor.selectionStart; editor.setRangeText('  ', s, editor.selectionEnd, 'end'); } });
      $('#run').addEventListener('click', () => { $('#out').textContent = runCode(editor.value).join('\n') || '(no output)'; store.coding[ex.id] = { ...(store.coding[ex.id] || {}), tried: true }; save(); });
      $('#reveal').addEventListener('click', () => { $('#solution').hidden = false; });
      $('#reset').addEventListener('click', () => { editor.value = ex.starter || ''; delete (store.coding[ex.id] || {}).draft; save(); });
      $('#markSolved').addEventListener('click', () => { store.coding[ex.id] = { ...(store.coding[ex.id] || {}), solved: true, ts: Date.now() }; bump(); save(); toast('Marked solved'); route(); });
      if (ex.tests) $('#test').addEventListener('click', () => {
        const lines = []; let pass = 0;
        for (const tcase of ex.tests) {
          const res = runCode(`${editor.value}\n;console.log(JSON.stringify(${tcase.expr}));`, true);
          const got = res.logs.length ? res.logs[res.logs.length - 1] : (res.error || 'undefined');
          const ok = got === JSON.stringify(tcase.expect) || got === String(tcase.expect);
          if (ok) pass++;
          lines.push(`${ok ? '✓' : '✗'} ${tcase.expr}  →  ${got}${ok ? '' : `   (expected ${JSON.stringify(tcase.expect)})`}`);
        }
        $('#out').textContent = `${pass}/${ex.tests.length} tests passed\n` + lines.join('\n');
        recordAnswer(ex.id, pass === ex.tests.length);
        if (pass === ex.tests.length) { store.coding[ex.id] = { ...(store.coding[ex.id] || {}), solved: true, ts: Date.now() }; save(); toast('All tests passed'); const dot = app.querySelector('.exercise-list button.active .dot'); if (dot) dot.classList.add('ok'); $('#markSolved').textContent = '✓ Solved'; }
        else { const dot = app.querySelector('.exercise-list button.active .dot'); if (dot && !dot.classList.contains('ok')) dot.classList.add('bad'); }
      });
      keyHandler = null;
    }
  }
  function runCode(code, structured) {
    const logs = []; let error = null;
    const fmt = v => { if (typeof v === 'string') return v; if (typeof v === 'function') return `ƒ ${v.name || '(anonymous)'}()`; if (v instanceof Promise) return 'Promise { <pending or settled> }'; try { return JSON.stringify(v, (k, x) => typeof x === 'function' ? `ƒ ${x.name}()` : typeof x === 'symbol' ? x.toString() : x === undefined ? 'undefined' : x, 0) ?? String(v); } catch { return String(v); } };
    const fake = { log: (...a) => logs.push(a.map(fmt).join(' ')), error: (...a) => logs.push('⚠ ' + a.map(fmt).join(' ')), warn: (...a) => logs.push('⚠ ' + a.map(fmt).join(' ')), info: (...a) => logs.push(a.map(fmt).join(' ')), table: v => logs.push(fmt(v)), dir: v => logs.push(fmt(v)), group() {}, groupEnd() {} };
    const realLog = console.log;
    try { new Function('console', code)(fake); } catch (e) { error = `${e.name}: ${e.message}`; logs.push('✖ ' + error); }
    console.log = realLog;
    return structured ? { logs, error } : logs;
  }

  // ------------------------------------------------------------------ practice hub
  function viewPractice() {
    const o = overall();
    app.innerHTML = `
      <div class="eyebrow">Practice</div><h1>Pick a drill</h1>
      <p class="muted" style="max-width:70ch">Quizzes score you, flashcards schedule themselves, coding prompts let you run code right here. Weak topics float to the top.</p>
      <div class="grid cols-3 section">
        <a class="card hover" href="#/mock"><h3>🎙️ Mock interview</h3><p class="muted" style="margin:0">Timed, mixed across topics. Behaves like a 15–30 minute technical screen.</p></a>
        <a class="card hover" href="#/bank"><h3>🔎 Search the bank</h3><p class="muted" style="margin:0">All ${BANK.sources.reduce((a, s) => a + s.questions.length, 0)} questions with reveal, across every source file.</p></a>
        <a class="card hover" href="#/progress"><h3>📊 Weak areas</h3><p class="muted" style="margin:0">${o.weak.length ? `${o.weak.length} topics under 60% accuracy.` : 'No weak topics flagged yet.'} ${o.due ? `${o.due} flashcards due.` : ''}</p></a>
      </div>
      <h2 class="section">By topic</h2>
      <table class="plain">
        <thead><tr><th>Topic</th><th>Quiz</th><th>Flashcards</th><th>Coding</th><th>Accuracy</th></tr></thead>
        <tbody>${o.stats.sort((a, b) => (a.s.accuracy ?? 1) - (b.s.accuracy ?? 1)).map(({ t, s }) => { const c = contentFor(t.id); return `<tr>
          <td><a href="#/topic/${t.id}"><b>${t.icon} ${esc(t.short)}</b></a><div class="tiny">${s.mastery}% mastery</div></td>
          <td>${(c.quiz || []).length || t.coding ? `<a class="btn sm" href="#/quiz/${t.id}">Quiz${s.best !== null ? ` · ${s.best}%` : ''}</a>` : '<span class="tiny">—</span>'}</td>
          <td>${cardsFor(t.id, false).length ? `<a class="btn sm" href="#/cards/${t.id}">Cards${s.due ? ` · ${s.due} due` : ''}</a>` : '<span class="tiny">—</span>'}</td>
          <td>${codingList(t.id).length ? `<a class="btn sm" href="#/code/${t.id}">Code · ${s.solved}/${s.exercises || codingList(t.id).length}</a>` : '<span class="tiny">—</span>'}</td>
          <td>${s.accuracy === null ? '<span class="tiny">no data</span>' : `<span class="chip ${s.accuracy >= .8 ? 'ok' : s.accuracy >= .6 ? 'warn' : 'bad'}">${Math.round(s.accuracy * 100)}%</span>`}</td></tr>`; }).join('')}</tbody>
      </table>`;
  }

  // ------------------------------------------------------------------ mock interview
  function viewMock(params) {
    if (params.start) return startMock(params);
    const history = store.attempts.filter(a => a.topicId === 'mock').slice(-5).reverse();
    app.innerHTML = `
      <div class="eyebrow">Mock interview</div><h1>Timed, mixed-topic screen</h1>
      <p class="muted" style="max-width:70ch">Questions are sampled across the topics you tick: concept MCQs, short answers you grade yourself, and predict-the-output snippets. The timer submits automatically when it runs out.</p>
      <form id="mockForm" class="card section">
        <div class="row between" style="margin-bottom:1rem">
          <label>Duration <select name="mins" class="btn sm"><option value="10">10 min · 8 questions</option><option value="15" selected>15 min · 12 questions</option><option value="30">30 min · 24 questions</option></select></label>
          <div class="row"><button type="button" class="btn sm ghost" id="allT">All</button><button type="button" class="btn sm ghost" id="noneT">None</button><button type="button" class="btn sm ghost" id="weakT">Weak only</button></div>
        </div>
        <div class="topic-picker">${CUR.topics.map(t => `<label><input type="checkbox" name="t" value="${t.id}" checked /> ${t.icon} ${esc(t.short)}</label>`).join('')}</div>
        <div class="row" style="margin-top:1.2rem"><button class="btn primary" type="submit">Begin interview</button></div>
      </form>
      ${history.length ? `<h2 class="section">Recent mocks</h2><table class="plain"><thead><tr><th>When</th><th>Score</th><th>Questions</th></tr></thead><tbody>${history.map(a => `<tr><td>${new Date(a.ts).toLocaleString()}</td><td><span class="chip ${pct(a.score, a.total) >= 80 ? 'ok' : pct(a.score, a.total) >= 60 ? 'warn' : 'bad'}">${pct(a.score, a.total)}%</span></td><td>${a.total}</td></tr>`).join('')}</tbody></table>` : ''}`;
    const form = $('#mockForm');
    $('#allT').addEventListener('click', () => form.querySelectorAll('input[name=t]').forEach(i => i.checked = true));
    $('#noneT').addEventListener('click', () => form.querySelectorAll('input[name=t]').forEach(i => i.checked = false));
    $('#weakT').addEventListener('click', () => { const weak = new Set(overall().weak.map(t => t.id)); if (!weak.size) return toast('No weak topics flagged yet'); form.querySelectorAll('input[name=t]').forEach(i => i.checked = weak.has(i.value)); });
    form.addEventListener('submit', e => { e.preventDefault(); const fd = new FormData(form); const ts = fd.getAll('t'); if (!ts.length) return toast('Pick at least one topic'); location.hash = `#/mock?start=1&mins=${fd.get('mins')}&t=${ts.join(',')}`; });
  }
  function startMock(params) {
    const mins = parseInt(params.mins, 10) || 15;
    const n = { 10: 8, 15: 12, 30: 24 }[mins] || Math.round(mins * 0.8);
    const tids = (params.t || '').split(',').filter(id => topicById.has(id));
    let pool = [];
    for (const tid of tids) {
      const c = contentFor(tid);
      pool.push(...(c.quiz || []).map((q, i) => ({ ...q, id: `${tid}:q${i}`, topicId: tid })));
      if (topicById.get(tid).coding) pool.push(...exerciseItems(tid));
    }
    if (!pool.length) return (app.innerHTML = '<div class="empty">No quiz items in the selected topics.</div>');
    // Round-robin across topics so a 12-question mock really mixes.
    const byTopic = {}; shuffle(pool).forEach(q => (byTopic[q.topicId] = byTopic[q.topicId] || []).push(q));
    const keys = shuffle(Object.keys(byTopic)); const items = [];
    while (items.length < n && keys.some(k => byTopic[k].length)) for (const k of keys) { if (items.length >= n) break; const q = byTopic[k].shift(); if (q) items.push(q); }
    runSession({ title: `Mock interview · ${mins} min`, items: shuffle(items), topicId: 'mock', seconds: mins * 60, back: '#/mock', retry: () => { location.hash = `#/mock?start=1&mins=${mins}&t=${tids.join(',')}&r=${Date.now()}`; } });
  }

  // ------------------------------------------------------------------ progress dashboard
  function viewProgress() {
    const o = overall();
    const weakQs = Object.entries(store.qstats).filter(([, s]) => s.wrong > s.right).sort((a, b) => (b[1].wrong - b[1].right) - (a[1].wrong - a[1].right)).slice(0, 12);
    const days = []; const d = new Date(); d.setDate(d.getDate() - 83);
    for (let i = 0; i < 84; i++) { const k = d.toISOString().slice(0, 10); days.push([k, store.activity[k] || 0]); d.setDate(d.getDate() + 1); }
    const level = n => n === 0 ? '' : n < 5 ? 'l1' : n < 15 ? 'l2' : n < 40 ? 'l3' : 'l4';
    const recent = store.attempts.slice(-8).reverse();
    app.innerHTML = `
      <div class="eyebrow">Progress</div><h1>Where you stand</h1>
      <section class="hero">
        <div>
          <div class="hero-stats" style="grid-template-columns:repeat(4,1fr)">
            <div class="stat"><b>${o.covered}/${CUR.topics.length}</b><span>topics started</span></div>
            <div class="stat"><b>${o.stats.filter(x => x.s.notesRead).length}</b><span>notes read</span></div>
            <div class="stat"><b>${store.attempts.length}</b><span>quiz sessions</span></div>
            <div class="stat"><b>${Object.values(store.cards).filter(c => c.reps).length}</b><span>cards reviewed</span></div>
          </div>
          <div class="card" style="margin-top:1rem"><div class="eyebrow">Activity · last 12 weeks · ${o.streak}-day streak</div><div class="heat">${days.map(([k, n]) => `<i class="${level(n)}" title="${k}: ${n} actions"></i>`).join('')}</div></div>
        </div>
        <div class="ring-wrap">${ring(o.mastery, 'overall mastery')}</div>
      </section>
      <div class="grid cols-2 section">
        <div class="card"><h3>Mastery by topic</h3><div class="bars">${o.stats.sort((a, b) => b.s.mastery - a.s.mastery).map(({ t, s }) => `<div class="bar-row"><a href="#/topic/${t.id}">${t.icon} ${esc(t.short)}</a><div class="progress"><i style="width:${s.mastery}%"></i></div><span class="pct">${s.mastery}%</span></div>`).join('')}</div></div>
        <div class="card"><h3>Quiz accuracy by topic</h3>${o.stats.some(x => x.s.accuracy !== null) ? `<div class="bars">${o.stats.filter(x => x.s.accuracy !== null).sort((a, b) => a.s.accuracy - b.s.accuracy).map(({ t, s }) => `<div class="bar-row"><a href="#/topic/${t.id}">${t.icon} ${esc(t.short)}</a><div class="progress"><i style="width:${Math.round(s.accuracy * 100)}%; background:${s.accuracy < .6 ? 'var(--bad)' : s.accuracy < .8 ? 'var(--warn)' : 'var(--ok)'}"></i></div><span class="pct">${Math.round(s.accuracy * 100)}%</span></div>`).join('')}</div>` : '<p class="muted">Take a quiz to see accuracy here.</p>'}</div>
      </div>
      <div class="grid cols-2 section">
        <div class="card"><h3>Weak areas</h3>
          ${o.weak.length ? `<p class="muted">Topics under 60% accuracy:</p><div class="row">${o.weak.map(t => `<a class="chip bad" href="#/topic/${t.id}">${t.icon} ${esc(t.short)}</a>`).join('')}</div>` : '<p class="muted">No topic is under 60% accuracy.</p>'}
          ${weakQs.length ? `<p class="muted" style="margin-top:1rem">Questions you keep missing:</p>${weakQs.map(([id, s]) => weakRow(id, s)).join('')}` : ''}
          ${Object.values(store.known).filter(v => v === -1).length ? `<p class="muted" style="margin-top:1rem">${Object.values(store.known).filter(v => v === -1).length} bank questions marked weak. <a class="source-link" href="#/bank?f=weak">Review them</a></p>` : ''}
          ${o.weak.length ? `<a class="btn primary sm" style="margin-top:1rem" href="#/mock">Mock the weak topics</a>` : ''}
        </div>
        <div class="card"><h3>Recent sessions</h3>${recent.length ? `<table class="plain"><thead><tr><th>When</th><th>Set</th><th>Score</th></tr></thead><tbody>${recent.map(a => `<tr><td>${new Date(a.ts).toLocaleDateString()}</td><td>${a.topicId === 'mock' ? '🎙️ Mock' : esc(topicById.get(a.topicId)?.short || a.topicId)}</td><td><span class="chip ${pct(a.score, a.total) >= 80 ? 'ok' : pct(a.score, a.total) >= 60 ? 'warn' : 'bad'}">${pct(a.score, a.total)}%</span></td></tr>`).join('')}</tbody></table>` : '<p class="muted">No sessions yet.</p>'}
          <div class="row" style="margin-top:1.2rem"><button class="btn sm" id="export">Export JSON</button><label class="btn sm">Import <input type="file" id="import" accept="application/json" hidden /></label><button class="btn sm danger" id="reset">Reset all progress</button></div>
        </div>
      </div>`;
    $('#export').addEventListener('click', () => { const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `placement-prep-progress-${today()}.json`; a.click(); });
    $('#import').addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { store = Object.assign(defaults(), JSON.parse(t)); save(); toast('Progress imported'); route(); } catch { toast('That file is not valid progress JSON'); } }); });
    $('#reset').addEventListener('click', () => { if (confirm('Delete all progress stored in this browser?')) { store = defaults(); save(); applyTheme(); route(); } });
  }
  function weakRow(id, s) {
    const q = bankById.get(id);
    let title = id, link = '#/progress';
    if (q) { title = q.q; link = `#/topic/${topicOfQuestion.get(q.id)}/bank`; }
    else { const [tid, key] = id.split(':'); const c = contentFor(tid); if (key?.startsWith('q')) { const item = (c.quiz || [])[+key.slice(1)]; if (item) title = item.q; link = `#/quiz/${tid}`; } else if (key?.startsWith('c')) { const ref = key.slice(1); const bq = bankById.get(ref); title = bq ? `Output drill ${ref.split('-').pop()}` : `Coding: ${ref}`; link = `#/code/${tid}`; } }
    return `<div class="pitfall"><span class="mark">${s.wrong}✗</span><a href="${link}">${esc(title)}</a></div>`;
  }

  // ------------------------------------------------------------------ bank search page
  function viewBank(params) {
    const all = [];
    for (const src of BANK.sources) all.push(...src.questions);
    app.innerHTML = `<div class="eyebrow">Question bank</div><h1>Every question in the repository</h1><p class="muted">${all.length} questions across ${BANK.sources.length} PDF files, regenerated with <code>npm run build:content</code>. Each entry links to its page in the source PDF.</p><div id="bankHost"></div>`;
    renderBank($('#bankHost'), all, { query: params.q || '' });
    if (params.f) { const b = $(`#bankFilters [data-f="${params.f}"]`); if (b) b.click(); }
  }

  // ------------------------------------------------------------------ theme & boot
  function applyTheme() { document.documentElement.dataset.theme = store.settings.theme || 'dark'; $('#themeToggle').textContent = store.settings.theme === 'light' ? '☀' : '☾'; }
  $('#themeToggle').addEventListener('click', () => { store.settings.theme = store.settings.theme === 'light' ? 'dark' : 'light'; save(); applyTheme(); });
  applyTheme();
  $('#footerMeta').textContent = `Content built ${new Date(BANK.generatedAt).toLocaleDateString()} · ${CUR.topics.length} topics`;
  route();
})();
