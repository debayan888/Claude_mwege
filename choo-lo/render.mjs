// Renders index.html frame by frame with headless Chromium and joins the
// frames with the song into an MP4.
//   node render.mjs <song.mp3> [out.mp4] [--fps 30] [--workers 4] [--from 0] [--to 233.6]
//   node render.mjs --still 12,40,120 [--out-dir stills]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const positional = args.filter((a, i) => !a.startsWith('--') && !(i && args[i - 1].startsWith('--')));

const TYPES = { '.html': 'text/html', '.json': 'application/json', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.lrc': 'text/plain' };
const server = http.createServer((req, res) => {
  const f = path.join(here, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(here) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await chromium.launch();

async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(url);
  const n = await page.evaluate(() => window.ready);
  return { page, lyrics: n };
}
const grab = (page, t) => page.evaluate((t) => { drawFrame(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93).slice(23); }, t);

try {
  if (opt('still')) {
    const dir = path.resolve(opt('out-dir', path.join(here, 'out', 'stills')));
    fs.mkdirSync(dir, { recursive: true });
    const { page } = await openPage();
    for (const t of opt('still').split(',').map(Number)) {
      const f = path.join(dir, `t${String(t).padStart(6, '0')}.jpg`);
      fs.writeFileSync(f, Buffer.from(await grab(page, t), 'base64'));
      console.log(f);
    }
  } else {
    const song = path.resolve(positional[0]);
    const out = path.resolve(positional[1] || path.join(here, 'out', 'choo-lo.mp4'));
    const fps = +opt('fps', 30), workers = +opt('workers', 4);
    const from = +opt('from', 0), to = +opt('to', 233.6);
    const frames = Math.round((to - from) * fps);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const tmp = fs.mkdtempSync(path.join(path.dirname(out), '.parts-'));
    const per = Math.ceil(frames / workers);
    let done = 0; const t0 = Date.now();
    const parts = await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const a = w * per, b = Math.min(frames, a + per), file = path.join(tmp, `part${w}.mp4`);
      const { page, lyrics } = await openPage();
      if (w === 0) console.log(`${lyrics} lyric lines, ${frames} frames, ${workers} workers`);
      const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(fps), file], { stdio: ['pipe', 'inherit', 'inherit'] });
      for (let i = a; i < b; i++) {
        const buf = Buffer.from(await grab(page, from + i / fps), 'base64');
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
        if (++done % 300 === 0) console.log(`${done}/${frames} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
      ff.stdin.end();
      await new Promise((r, j) => ff.on('close', (c) => (c ? j(new Error(`ffmpeg ${c}`)) : r())));
      await page.close();
      return file;
    }));
    const list = path.join(tmp, 'list.txt');
    fs.writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
    await new Promise((r, j) => spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list,
      '-ss', String(from), '-t', String(to - from), '-i', song,
      '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out],
      { stdio: 'inherit' }).on('close', (c) => (c ? j(new Error(`ffmpeg ${c}`)) : r())));
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`wrote ${out} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
} finally {
  await browser.close();
  server.close();
}
