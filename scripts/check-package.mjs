import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Static release inventory guard, not a runtime test or comprehensive secret scan.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run with npm run check:package.');
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const output = execFileSync(process.execPath, [
  npm, 'pack', '--dry-run', '--ignore-scripts', '--json',
], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
const [bundle] = JSON.parse(output);
const docs = ['README.md', 'README.en.md', 'LICENSE', 'NOTICE.md',
  'THIRD_PARTY_NOTICES.md', 'SECURITY.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'package.json'];
const required = [...docs, 'dist/index.js', 'dist/index.d.ts', 'dist/styles.css',
  'dist/ResponseExperience.js', 'dist/ResponseExperience.d.ts',
  'dist/responsePresets.js', 'dist/responsePresets.d.ts', 'dist/useMotionActivity.js',
  'dist/sculpturalOrb.js',
  'examples/SseReply.tsx'];
const names = new Set(bundle.files.map(file => file.path));
const allowed = path => docs.includes(path) || path === 'examples/SseReply.tsx'
  || /^dist\/[\w.-]+\.(?:js|d\.ts|css|map)$/.test(path);
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{40,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/,
  /AccountKey=[A-Za-z0-9+/]{40,}={0,2}/i,
];
for (const file of bundle.files) {
  if (!allowed(file.path)) throw new Error('Unexpected publish path: ' + file.path);
  const local = resolve(root, file.path);
  if (!lstatSync(local).isFile()) throw new Error('Only regular files allowed: ' + file.path);
  if (file.size > 1024 * 1024) throw new Error('Unexpectedly large file: ' + file.path);
  const body = readFileSync(local, 'utf8');
  if (patterns.some(pattern => pattern.test(body))) {
    // Do not print the matching value.
    throw new Error('Possible credential in publish file: ' + file.path);
  }
}
for (const file of required) {
  if (!names.has(file)) throw new Error('Missing required publish file: ' + file);
}
if (Object.keys(manifest.dependencies ?? {}).length) {
  throw new Error('Review runtime dependencies before updating this release guard.');
}
const notices = readFileSync(resolve(root, 'THIRD_PARTY_NOTICES.md'), 'utf8');
if (!notices.includes('Copyright (c) 2026 Jakub Antalik')) {
  throw new Error('Upstream MIT copyright must be retained.');
}
console.log('Publish inventory OK: ' + bundle.files.length + ' files, ' +
  bundle.unpackedSize + ' unpacked bytes. No common credential pattern found.');
