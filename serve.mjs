/* Local preview server for site/ — dev only, not deployed. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
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
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  let pathname = decodeURIComponent(req.url.split('?')[0]);
  if (pathname.endsWith('/')) pathname += 'index.html';

  const file = resolve(join(ROOT, pathname));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end('403');
    return;
  }

  try {
    const buf = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 ' + pathname);
  }
}).listen(8765, () => console.log('serving site/ on http://localhost:8765'));
