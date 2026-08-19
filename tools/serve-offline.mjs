import { mkdirSync, copyFileSync, existsSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const SITE = join(ROOT, 'offline-site');
const KIT = join(ROOT, 'offline-kit');
const DIST = join(ROOT, 'dist');

mkdirSync(SITE, { recursive: true });
mkdirSync(join(SITE, 'dist'), { recursive: true });
for (const f of ['sw.js', 'offline.html', 'register.js']) {
  const src = join(KIT, f);
  if (existsSync(src)) copyFileSync(src, join(SITE, f));
}
copyFileSync(join(DIST, 'pixel-drift.mjs'), join(SITE, 'dist', 'pixel-drift.mjs'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const PORT = process.env.PORT ? Number(process.env.PORT) : 8090;
const server = createServer((req, res) => {
  let pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (pathname === '/') pathname = '/offline.html';
  const file = join(SITE, pathname);
  if (!file.startsWith(SITE) || !existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  res.writeHead(200, {
    'content-type': MIME[extname(file)] || 'application/octet-stream',
    'cache-control': 'no-store',
  });
  res.end(readFileSync(file));
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}/offline.html`;
  console.log(`Offline kit test: ${url}  (SW: http://localhost:${PORT}/sw.js)`);
  if (process.env.OPEN !== '0') spawn('open', [url]);
});