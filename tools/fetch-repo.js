// Download every file in the Placement_preparation repository using the GitHub CLI
// (no Git needed). Usage: node tools/fetch-repo.js [outDir]
// Requires `gh` on PATH (or GH_PATH env var) and an authenticated session.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OWNER = 'Evelin-Manoj';
const REPO = 'Placement_preparation';
const outDir = process.argv[2] || path.join(__dirname, '..', 'build', 'repo');
const gh = process.env.GH_PATH || 'gh';

function api(endpoint, extra = []) {
  return execFileSync(gh, ['api', endpoint, ...extra], { encoding: 'utf8', maxBuffer: 1024 * 1024 * 200 });
}

fs.mkdirSync(outDir, { recursive: true });
const repo = JSON.parse(api(`repos/${OWNER}/${REPO}`));
const branch = repo.default_branch;
const tree = JSON.parse(api(`repos/${OWNER}/${REPO}/git/trees/${branch}?recursive=1`));
if (tree.truncated) console.warn('Warning: tree was truncated by the API');

const manifest = { owner: OWNER, repo: REPO, branch, fetchedAt: new Date().toISOString(), files: [] };
for (const item of tree.tree.filter(t => t.type === 'blob')) {
  const b64 = api(`repos/${OWNER}/${REPO}/git/blobs/${item.sha}`, ['--jq', '.content']);
  const bytes = Buffer.from(b64.replace(/\s/g, ''), 'base64');
  const dest = path.join(outDir, item.path);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, bytes);
  manifest.files.push({ path: item.path, sha: item.sha, size: bytes.length });
  console.log(`${String(bytes.length).padStart(9)}  ${item.path}`);
}
fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`\n${manifest.files.length} files written to ${outDir}`);
