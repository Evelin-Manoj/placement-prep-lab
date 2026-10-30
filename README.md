# Placement Prep Lab

A static learning site that teaches the contents of
[Evelin-Manoj/Placement_preparation](https://github.com/Evelin-Manoj/Placement_preparation)
from an interview-preparation angle, with practice sessions. No build step, no framework,
deployable on GitHub Pages as-is.

## What is inside

| Path | Purpose |
| --- | --- |
| `index.html` | The app shell; loads the data files and `assets/app.js` |
| `assets/app.js` | Routing, topic pages, question bank, quiz engine, spaced-repetition flashcards, coding runner, mock interview, progress dashboard (localStorage) |
| `assets/styles.css` | Theme (shares the portfolio's fonts, colours and glass cards), dark/light, responsive layout |
| `data/bank.js` | **Generated.** Every question and answer extracted from the repository's PDFs, with page numbers and links back to the source file |
| `data/curriculum.js` | Hand-written: interview rounds, topics, and which bank questions belong to each topic |
| `data/topics/*.js` | Hand-written study content per topic: what interviewers ask and why, study notes, pitfalls, model answers, quiz items, flashcards, coding prompts (and answers/explanations for the predict-the-output drills) |
| `tools/` | Node scripts that regenerate `data/bank.js` from the repository |
| `serve.js` | Tiny static server for local preview |

The repository currently contains eight PDF question banks (C++, Database, HTML, PHP, Python,
JavaScript, Node.js, React). The site organises them into three interview rounds and sixteen
topics; JavaScript and React are split into sub-topics by question number. Rounds the repository
does not cover yet (DSA, projects/HR) are shown as "not covered" cards.

## Run locally

```bash
node serve.js 4173
```

Then open <http://localhost:4173>. Opening `index.html` directly also works, because all data is
loaded as plain `<script>` files.

## Regenerate the content from the repository

Requires Node 18+ and the GitHub CLI (`gh`) signed in (no Git needed). Python is not required.

```bash
npm install
npm run build:content
```

That runs three steps, which you can also run one at a time:

1. `npm run fetch` — downloads every file in the repository through the GitHub API into `build/repo/`
   (`tools/fetch-repo.js`; set `GH_PATH` if `gh` is not on your PATH).
2. `npm run extract` — extracts text from each PDF into `build/text/` with `pdf-parse`, sorting text
   runs into visual order so code blocks stay with their questions (`tools/extract.js`).
3. `npm run bank` — parses the numbered questions and answers into `data/bank.js`
   (`tools/build-bank.js`). The `SOURCES` table at the top of that script lists each PDF, its
   question-heading pattern and its section headings; add an entry when a new file is added to the
   repository.

Afterwards run `node tools/validate-content.js` to check that every topic reference points at a
real bank question, every quiz answer index is valid, every drill has an answer, and every bank
question is assigned to a topic.

If a new file is a different kind (markdown, code), add a parser branch in `tools/build-bank.js`
and a topic in `data/curriculum.js`; the question bank, flashcards (bank cards) and search work
without any hand-written content, and a `data/topics/<id>.js` file adds notes, quizzes and drills.

### Predict-the-output drills

The JavaScript PDF prints its 80 coding exercises with the answer sections collapsed, so the
correct option and explanation for each live in `data/topics/js-output.js`. They were verified by
running every snippet in a Node sandbox (`node tools/run-exercises.js data/bank.js build/exercise-results.json`)
and by hand for browser-only and error cases.

## Practice features

- **Topic page**: Learn (why / notes / pitfalls / model answers), Question bank with reveal and
  known/weak marking, Quiz, Flashcards, Coding.
- **Quiz**: multiple choice with explanations and short answers you grade yourself; weak items are
  sampled first; optional extra questions pulled from the bank.
- **Flashcards**: Again / Good / Easy scheduling (SM-2 style intervals), due counts, optional
  bank-derived cards.
- **Coding**: implement-style prompts with an in-page runner and tests, and predict-the-output
  drills with a run button.
- **Mock interview**: 10/15/30 minutes, mixed topics, timer with auto-submit, per-topic breakdown.
- **Progress**: mastery and accuracy per topic, weak areas, activity heat-map, streak, export/import.

All progress is stored in `localStorage` under the key `ppl:v1`.

## Publish on GitHub Pages

1. Create a public repository (for example `placement-prep-lab`).
2. Upload everything except `node_modules/` and `build/` (both are ignored by `.gitignore`).
   Without Git on the machine, the GitHub CLI can upload files through the Contents API:
   `gh api --method PUT repos/<owner>/<repo>/contents/<path> --input body.json`
   where `body.json` holds `{"message": "...", "content": "<base64 of the file>"}`.
3. Settings → Pages → Source: *Deploy from a branch* → `main` / root.

Because the site uses hash routing and relative paths, it works from a project page URL such as
`https://<owner>.github.io/<repo>/` without configuration.
