/* Copies the <header> and <footer> from index.html into every other page, then
   re-points aria-current at whichever nav link matches that page.
   Run after changing navigation: node tools/sync-chrome.mjs */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = resolve(fileURLToPath(new URL('../site/', import.meta.url)));

const block = (html, tag) => {
  const open = html.indexOf('<' + tag);
  const close = html.indexOf('</' + tag + '>');
  if (open === -1 || close === -1) return null;
  return html.slice(open, close + tag.length + 3);
};

/* which nav href should be marked current on which page */
const CURRENT = {
  'association.html': 'association.html',
  'documents.html': 'documents.html',
  'fire-safety.html': 'fire-safety.html',
  'calendar.html': 'calendar.html',
  'caldera-ranch.html': 'caldera-ranch.html',
  'contact.html': 'contact.html',
  'pay-dues.html': 'pay-dues.html',
};

const src = await readFile(join(SITE, 'index.html'), 'utf8');
const header = block(src, 'header');
const footer = block(src, 'footer');
if (!header || !footer) throw new Error('could not read chrome from index.html');

const files = (await readdir(SITE)).filter(f => f.endsWith('.html') && f !== 'index.html' && !f.startsWith('_'));

for (const f of files) {
  const p = join(SITE, f);
  let html = await readFile(p, 'utf8');

  let h = header;
  /* index is the only page whose header rides over a photographic hero */
  if (!/class="hero"[^>]*>\s*<div class="hero__media"/.test(html)) {
    h = h.replace('class="header header--over"', 'class="header"');
  }
  const current = CURRENT[f];
  if (current) {
    h = h.replace(new RegExp('(<a[^>]*href="' + current.replace('.', '\\.') + '")'), '$1 aria-current="page"');
  }

  const oldHeader = block(html, 'header');
  const oldFooter = block(html, 'footer');
  if (oldHeader) html = html.replace(oldHeader, h);
  if (oldFooter) html = html.replace(oldFooter, footer);

  await writeFile(p, html);
  console.log('synced ' + f + (current ? '  (current: ' + current + ')' : ''));
}
