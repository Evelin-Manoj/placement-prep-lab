window.registerTopic('html', {
  why: `HTML questions are the warm-up of a front-end round, but they are graded. The interviewer checks whether you know the **structure** of a document (elements, tags, attributes, doctype), the **two layout categories** (block vs inline), **semantic markup**, forms and tables, and how **CSS and JavaScript attach** to a page. A few legacy questions still appear in question banks (marquee, font color, frames, body background); answer them accurately and add that modern practice uses CSS instead.

Keep answers concrete: name the tag, say what it means, give the one-line snippet.`,
  notes: [
    { h: 'Document anatomy', md: `**HTML** (Hyper Text Markup Language) is the markup language of the web; files end in \`.html\`. An **element** is a component with meaning (the title element represents the document title); a **tag** is the syntax that marks it (\`<title>…</title>\`). **Attributes** sit in the opening tag and change behaviour or appearance: \`<input type="checkbox">\`. They never appear in closing tags.

\`<!DOCTYPE html>\` is **not a tag**: it is an instruction telling the browser which HTML flavour to expect (HTML5 today; HTML 4.01 Strict/Transitional/Frameset and XHTML 1.0/1.1 historically). **Comments** are \`<!-- like this -->\` and are ignored by the browser even if they contain valid HTML. **Entities** such as \`&lt;\` \`&amp;\` \`&copy;\` represent reserved or unavailable characters. Browsers **collapse whitespace** to a single space, which is why you can indent freely.` },
    { h: 'Block vs inline, div vs span', md: `**Block-level** elements start on a new line and stretch to the container width: \`<div>\`, \`<p>\`, \`<section>\`, \`<form>\`, \`<nav>\`, headings. **Inline** elements flow with text and take only the space they need: \`<span>\`, \`<a>\`, \`<strong>\`, \`<b>\`, \`<input>\`, \`<img>\`.

\`<div>\` groups larger chunks as a block; \`<span>\` wraps a small piece inside a line, typically to colour, highlight or style part of a sentence. Text separators: \`<br>\` breaks a line, \`<p>\` starts a paragraph, \`<blockquote>\` marks a long quotation.` },
    { h: 'Semantic HTML and page layout', md: `**Semantic HTML** uses elements for their meaning: \`<strong>\` and \`<em>\` instead of \`<b>\` and \`<i>\`; those are **logical** tags (meaning) versus **physical** tags (appearance such as \`<b>\`, \`<big>\`, \`<i>\`).

Layout landmarks: \`<header>\`, \`<nav>\`, \`<section>\`, \`<article>\` (independent, self-contained), \`<aside>\`, \`<footer>\`. Lists: \`<ol>\` ordered, \`<ul>\` unordered, \`<dl>/<dt>/<dd>\` description lists. **SVG** describes 2-D vector graphics in XML, editable in a text editor:

\`\`\`html
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" stroke="yellow" stroke-width="4" fill="red" />
</svg>
\`\`\`` },
    { h: 'Links, images, media and frames', md: `\`<a href="url">text</a>\` creates a hyperlink; links can wrap images too. Link states: unvisited (blue), visited (purple), active (red). \`mailto:\` in \`href\` opens an email. \`alt\` text describes an image for screen readers and when the image fails; in an **image map** (\`<map>\` with \`<area>\` hotspots) it clarifies each link. \`<iframe src>\` embeds a nested page; \`width\`/\`height\` size it and \`name\` lets links target it.

URLs are **encoded** because they travel as ASCII: non-ASCII characters become \`%\` plus hex digits. Media formats HTML can play: images png/jpg/gif/svg/apng/bmp/ico; audio MP3, WAV, Ogg, AAC, MIDI; video MP4, WebM, Ogg, AVI and others. \`<marquee>\`, \`<font color>\`, \`<body background>\` and framesets are legacy; mention CSS equivalents (\`animation\`, \`color\`, \`background-image\`).` },
    { h: 'Tables and forms', md: `Table tags: \`<table>\`, \`<tr>\` row, \`<th>\` header cell, \`<td>\` cell, \`<caption>\`, \`<thead>\`/\`<tbody>\`/\`<tfoot>\` groups, \`<colgroup>\`/\`<col>\` column formatting. **Cell spacing** is the gap between cells; **cell padding** is the gap between content and the cell border. A non-zero \`border\` adds 1-pixel cell borders; the \`rules\` attribute does too.

\`\`\`html
<table>
  <tr><td>50 pcs</td><td>100</td><td>500</td></tr>
  <tr><td>10 pcs</td><td>5</td><td>50</td></tr>
</table>
\`\`\`

Forms: \`<button type="submit|reset|button">\` creates a clickable button; the default text field shows about 13 characters and \`size\` changes it; grouping checkboxes by name organises them but each checkbox is independent. Text wraps inside the viewport unless a table cell has a fixed width that forces overflow.` },
    { h: 'Attaching CSS and JavaScript', md: `Three ways to add CSS: **inline** (\`style\` attribute), **internal** (\`<style>\` in \`<head>\`), **external** (\`<link rel="stylesheet" href="x.css">\`). Precedence when the same selector is defined three times: inline beats internal beats external, and the closest definition wins. Opening a \`.css\` file directly shows text; it must be referenced from HTML. A **style sheet** is a reusable, consistent styling template.

Three ways to add JavaScript: inline event attributes (\`onclick="alert('hi')"\`), a \`<script>\` block anywhere in head or body (runs when the parser reaches it), or an external file \`<script src="my-code.js"></script>\`. New elements can be created with \`document.createElement\` and even custom tag names are rendered.` },
    { h: 'localStorage vs sessionStorage', md: `Both store key/value strings in the browser. **localStorage** has no expiry, survives closing the browser and is shared between tabs of the same origin. **sessionStorage** lasts for one tab's session and is cleared when the tab or window closes. Neither is sent to the server (unlike cookies).` },
  ],
  pitfalls: [
    'Calling `<!DOCTYPE html>` a tag. It is a declaration that tells the browser which HTML version to parse.',
    'Describing `<div>` and `<span>` only as "containers". The difference is block vs inline display.',
    'Mixing up cellpadding (inside the cell) and cellspacing (between cells).',
    'Saying HTML and XHTML differ by being "static vs dynamic" without noting the real point: XHTML is XML-strict (lower-case tags, every tag closed, attributes quoted).',
    'Forgetting `alt` on images when asked about accessibility or image maps.',
  ],
  model: [
    { q: 'What is the difference between block-level and inline elements?', a: 'A block-level element always starts on a new line and expands to fill the width of its container, so it forms a visual block (div, p, section, form, nav, headings). An inline element is rendered where it occurs in the text flow and only takes the space its content needs (span, a, strong, b, input, img). CSS `display` can switch either behaviour.', ref: 'html-4' },
    { q: 'What is semantic HTML and why does it matter?', a: 'Semantic HTML chooses elements for their meaning rather than their default look: `<strong>` and `<em>` instead of `<b>` and `<i>`, `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>` instead of anonymous divs. Browsers, screen readers and search engines use that meaning, and it keeps styling in CSS where it belongs.', ref: 'html-9' },
    { q: 'How many ways can CSS be included, and which wins?', a: 'Inline via the style attribute, internal via a `<style>` block in the head, and external via `<link rel="stylesheet">`. If the same selector is defined in all three, the inline style wins, then the embedded style sheet, then the external one; the rule closest to the element takes precedence.', ref: 'html-48' },
  ],
  quiz: [
    { type: 'mcq', q: 'Which of these is NOT an HTML tag?', options: ['<!DOCTYPE html>', '<article>', '<caption>', '<colgroup>'], answer: 0, explain: 'The doctype is a declaration instructing the browser; the other three are elements.', ref: 'html-20' },
    { type: 'mcq', q: 'Which element is inline by default?', options: ['<div>', '<section>', '<span>', '<form>'], answer: 2, explain: 'Spans flow with text; the others are block-level.', ref: 'html-4' },
    { type: 'mcq', q: 'Cell padding is…', options: ['The gap between two cells', 'The gap between cell content and the cell border', 'The table border width', 'The row height'], answer: 1, explain: 'Cell spacing is the gap between cells; padding is inside each cell.', ref: 'html-46' },
    { type: 'mcq', q: 'Which pair is the semantic replacement for <b> and <i>?', options: ['<big> and <small>', '<strong> and <em>', '<mark> and <u>', '<h1> and <p>'], answer: 1, explain: 'strong and em express importance and emphasis rather than appearance.', ref: 'html-9' },
    { type: 'mcq', q: 'Which storage survives closing the browser?', options: ['sessionStorage', 'localStorage', 'Neither', 'Both'], answer: 1, explain: 'localStorage has no expiry; sessionStorage dies with the tab.', ref: 'html-29' },
    { type: 'mcq', q: 'Where should an external stylesheet link go?', options: ['Inside <body> at the end', 'Inside <head> as <link rel="stylesheet" href="…">', 'Inside a <style> tag', 'In the doctype'], answer: 1, explain: 'The link element belongs in the head so styles load before rendering.', ref: 'html-48' },
    { type: 'mcq', q: 'Why are URLs encoded?', options: ['To compress them', 'Because URLs travel as ASCII, so other characters become % plus hex', 'To hide query parameters', 'To make them case-insensitive'], answer: 1, explain: 'Non-ASCII and reserved characters are percent-encoded.', ref: 'html-21' },
    { type: 'mcq', q: 'Which tag embeds another web page inside the current one?', options: ['<embed>', '<iframe>', '<object>', '<frame>'], answer: 1, explain: 'An inline frame; width/height size it and name lets links target it.', ref: 'html-22' },
    { type: 'short', q: 'List the tags used to build a data table.', a: '`<table>` wrapper, `<tr>` rows, `<th>` header cells, `<td>` data cells, `<caption>` title, `<thead>`/`<tbody>`/`<tfoot>` for grouping, `<colgroup>`/`<col>` for column formatting.', ref: 'html-6' },
    { type: 'short', q: 'Name three ways to add JavaScript to a page and when each runs.', a: 'Inline event attributes such as onclick run when the event fires; a `<script>` block runs as soon as the parser reaches it (head or body); an external `<script src>` file runs when it loads, letting one script serve many pages. Modern practice uses `defer` or places scripts at the end of body.', ref: 'html-50' },
    { type: 'short', q: 'What is the purpose of alt text on images?', a: 'It describes the image for users who cannot see it (screen readers, failed loads) and, in image maps, clarifies what each hotspot links to. It is also used by search engines.', ref: 'html-18' },
  ],
  cards: [
    { f: 'Element vs tag', b: 'Element: a meaningful component of the document. Tag: the markup that delimits it, e.g. <p> … </p>.', ref: 'html-2' },
    { f: 'Block vs inline', b: 'Block starts on a new line and fills the width (div, p, section). Inline flows with text and sizes to content (span, a, strong, img).', ref: 'html-4' },
    { f: 'Semantic layout tags', b: 'header, nav, section, article, aside, footer (plus main).', ref: 'html-14' },
    { f: 'Logical vs physical tags', b: 'Logical give meaning (strong, em). Physical give appearance (b, i, big).', ref: 'html-49' },
    { f: 'Three ways to include CSS and precedence', b: 'Inline > internal <style> > external <link>; the closest rule wins.', ref: 'html-33' },
    { f: 'localStorage vs sessionStorage', b: 'local: no expiry, shared across tabs. session: per tab, cleared on close.', ref: 'html-29' },
    { f: 'Cell spacing vs cell padding', b: 'Spacing: between cells. Padding: between content and cell border.', ref: 'html-46' },
    { f: 'List types', b: 'ol ordered, ul unordered, dl/dt/dd description list.', ref: 'html-8' },
    { f: 'Is <!DOCTYPE html> a tag?', b: 'No, a declaration telling the browser which HTML version/mode to use.', ref: 'html-20' },
    { f: 'Why URL-encode?', b: 'URLs are ASCII-only; other characters become % followed by hex digits.', ref: 'html-21' },
    { f: 'iframe', b: 'Embeds another document inline; attributes src, width, height, name.', ref: 'html-22' },
    { f: 'SVG', b: 'XML-based 2-D vector graphics, scalable, editable as text; good for icons and charts.', ref: 'html-43' },
  ],
  coding: [
    { id: 'table', title: 'Write the table markup', prompt: 'Produce the HTML for a two-row, three-column table with the cells `50 pcs | 100 | 500` and `10 pcs | 5 | 50`. Run to see the markup echoed; compare with the solution.', starter: 'const html = `\n<table>\n  <!-- rows here -->\n</table>`;\nconsole.log(html);', solution: '<table>\n  <tr><td>50 pcs</td><td>100</td><td>500</td></tr>\n  <tr><td>10 pcs</td><td>5</td><td>50</td></tr>\n</table>', ref: 'html-38' },
    { id: 'semantic', title: 'Convert a div soup into semantic layout', prompt: 'Rewrite `<div class="header">`, `<div class="nav">`, `<div class="content"><div class="post">…</div></div>`, `<div class="sidebar">`, `<div class="footer">` using semantic elements.', starter: 'const html = `\n<!-- semantic version here -->\n`;\nconsole.log(html);', solution: '<header>…</header>\n<nav>…</nav>\n<main>\n  <article>…</article>\n</main>\n<aside>…</aside>\n<footer>…</footer>', ref: 'html-14' },
    { id: 'storage', title: 'Use localStorage and sessionStorage', prompt: 'Save a theme preference that survives restarts and a draft that lives only for this tab; then read both back. (Runs in this page.)', starter: "localStorage.setItem('demo-theme', 'dark');\nsessionStorage.setItem('demo-draft', 'hello');\nconsole.log(localStorage.getItem('demo-theme'), sessionStorage.getItem('demo-draft'));\nlocalStorage.removeItem('demo-theme'); sessionStorage.removeItem('demo-draft');", solution: "localStorage.setItem('theme', 'dark');      // persists across browser restarts\nsessionStorage.setItem('draft', 'hello');   // cleared when the tab closes\nlocalStorage.getItem('theme');\nsessionStorage.getItem('draft');", ref: 'html-29' },
  ],
});
