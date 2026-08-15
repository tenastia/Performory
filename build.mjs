/*
 * build.mjs — inline src/ into a single self-contained dist/index.html.
 *
 * The prototype is plain HTML/CSS/JS with no dependencies, so "building" only
 * means folding the stylesheet, the scripts and the two webfonts into one file
 * that can be opened from disk, served anywhere, or published as an artifact
 * (whose CSP blocks every external host).
 *
 *   node build.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');
const out = join(root, 'dist');

const read = (p) => readFile(join(src, p), 'utf8');

async function dataUri(relPath, mime) {
  const buf = await readFile(join(src, relPath));
  return `data:${mime};base64,${buf.toString('base64')}`;
}

let html = await read('index.html');
let css = (await read('styles.css')) + '\n' + (await read('showcase.css'));

// Fonts → data URIs so the page has zero external requests.
for (const [file, family] of [
  ['assets/fonts/outfit-latin.woff2', 'Outfit'],
  ['assets/fonts/bodoni-moda-latin.woff2', 'Bodoni Moda']
]) {
  const uri = await dataUri(file, 'font/woff2');
  css = css.replace(`url('${file}') format('woff2')`, `url(${uri}) format('woff2')`);
  if (!css.includes(uri)) throw new Error(`font not inlined: ${family}`);
}

const scripts = ['score.js', 'icons.js', 'data.js', 'ui.js', 'screens.js', 'app.js'];
const js = [];
for (const s of scripts) js.push(await read(s));

html = html
  .replace('<link rel="stylesheet" href="styles.css">', `<style>\n${css}\n</style>`)
  .replace('<link rel="stylesheet" href="showcase.css">\n', '')
  .replace(
    scripts.map((s) => `<script src="${s}"></script>`).join('\n'),
    `<script>\n${js.join('\n')}\n</script>`
  );

if (html.includes('<script src=') || html.includes('href="styles.css"')) {
  throw new Error('inlining failed — an external reference survived');
}

await mkdir(out, { recursive: true });
await writeFile(join(out, 'index.html'), html);

// Second target: the same page without the document skeleton, for hosts that
// supply their own <!doctype>/<head>/<body> wrapper.
const body = html
  .slice(html.indexOf('<body>') + '<body>'.length, html.indexOf('</body>'))
  .trim();
const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>') + '</style>'.length);
const embed = `<title>Performory</title>\n${style}\n${body}\n`;
await writeFile(join(out, 'embed.html'), embed);

const kb = (n) => (Buffer.byteLength(n) / 1024).toFixed(0);
console.log(`dist/index.html — ${kb(html)} KB, no external requests`);
console.log(`dist/embed.html  — ${kb(embed)} KB, no document skeleton`);
