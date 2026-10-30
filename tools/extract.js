// Extract text from every PDF in a directory into sibling .txt files.
// Usage: node extract.js <pdfDir> <outDir>
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const [pdfDir, outDir] = process.argv.slice(2);
if (!pdfDir || !outDir) { console.error('usage: node extract.js <pdfDir> <outDir>'); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  for (const f of fs.readdirSync(pdfDir).filter(f => f.toLowerCase().endsWith('.pdf'))) {
    const buf = fs.readFileSync(path.join(pdfDir, f));
    const pages = [];
    const data = await pdf(buf, {
      pagerender: (pageData) => pageData.getTextContent({ normalizeWhitespace: true, disableCombineTextItems: false })
        .then(tc => {
          // Sort runs into visual order (top-to-bottom, then left-to-right). PDFs printed from web
          // pages often emit code boxes after the prose on the same page, so stream order is wrong.
          const items = tc.items.filter(i => i.str !== undefined).map((it, idx) => ({ it, idx }));
          items.sort((a, b) => {
            const dy = b.it.transform[5] - a.it.transform[5];
            if (Math.abs(dy) > 2) return dy > 0 ? 1 : -1;
            const dx = a.it.transform[4] - b.it.transform[4];
            if (Math.abs(dx) > 0.5) return dx;
            return a.idx - b.idx;
          });
          let last = null, out = '';
          for (const { it: item } of items) {
            if (!item.str) { last = item; continue; }
            if (last) {
              const sameLine = Math.abs(last.transform[5] - item.transform[5]) <= 2;
              if (!sameLine) {
                out += '\n';
              } else {
                // Horizontal gap between the end of the previous run and the start of this one.
                const lastEnd = last.transform[4] + (last.width || 0);
                const gap = item.transform[4] - lastEnd;
                const fontSize = Math.abs(item.transform[0]) || 10;
                const needsSpace = !out.endsWith(' ') && !out.endsWith('\n') && !item.str.startsWith(' ');
                // Only insert a space when there is a visible gap (> ~15% of font size).
                if (needsSpace && gap > fontSize * 0.15) out += ' ';
              }
            }
            out += item.str;
            last = item;
          }
          pages.push(out);
          return out;
        })
    });
    const text = pages.map((p, i) => `\n\n===== PAGE ${i + 1} =====\n` + p).join('');
    const out = path.join(outDir, f.replace(/\.pdf$/i, '.txt'));
    fs.writeFileSync(out, text, 'utf8');
    console.log(`${f}\tpages=${data.numpages}\tchars=${text.length}`);
  }
})().catch(e => { console.error(e); process.exit(1); });
