/* Local preview server for site/ — dev only, never deployed.
   Also exposes POST /_save?name=<file> so images can be re-encoded in the
   browser (canvas) and written to assets/img without an image dependency. */
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('./site/', import.meta.url)));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  const [pathnameRaw, query] = req.url.split('?');
  let pathname = decodeURIComponent(pathnameRaw);

  if (req.method === 'POST' && pathname === '/_save') {
    const name = basename(new URLSearchParams(query || '').get('name') || '');
    if (!name) { res.writeHead(400).end('name required'); return; }
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buf = Buffer.concat(chunks);
    await writeFile(join(ROOT, 'assets', 'img', name), buf);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('saved ' + name + ' ' + buf.length + ' bytes');
    return;
  }

  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(ROOT, pathname));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('403'); return; }

  try {
    const buf = await readFile(file);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
      /* dev only — without this the browser serves stale CSS and JS, which
         makes every visual check untrustworthy */
      'Cache-Control': 'no-store, must-revalidate'
    });
    res.end(buf);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 ' + pathname);
  }
}).listen(8765, () => console.log('serving site/ on http://localhost:8765'));
