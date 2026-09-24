// Screenshot tour of the UI states touched in 0.5: title (desktop + phone), results board,
// workshop costs, About page, day card. Writes tools/out/screen-*.png.
//   node tools/screens.mjs [file-or-url]
import {launch, sleep, until} from './cdp.mjs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const target = process.argv[2] || 'index.html';
const url = /^https?:/.test(target) ? target : pathToFileURL(resolve(target)).href;
const H = 'window.__fellswoop';
async function boot(w, h, port) {
  const page = await launch({port, width: w, height: h});
  await page.goto(url);
  await until(() => page.eval(`!!(${H}&&${H}.ready)`), {timeout: 60000, label: 'ready'});
  await page.eval('localStorage.clear()');
  await sleep(1500);
  return page;
}
const click = async (page, id) => { const r = (await page.eval(`${H}.ui()`)).find(r => r.id === id); if (!r) throw new Error('no region ' + id); await page.mouse('mousePressed', r.x, r.y); await page.mouse('mouseReleased', r.x, r.y); await sleep(400); };
let page = await boot(1280, 800, 9393);
try {
  await page.shot('tools/out/screen-title.png');
  const c = await page.eval(`${H}.screen(0,0)`);
  await page.mouse('mouseMoved', c.x, c.y);
  await page.eval(`${H}.advance(62)`);
  await sleep(600);
  await page.shot('tools/out/screen-results.png');
  console.log('regions', (await page.eval(`${H}.ui()`)).map(r => r.id).join(' '));
  await click(page, 'about');
  await page.shot('tools/out/screen-about.png');
  await click(page, 'about');
  await page.shot('tools/out/screen-workshop.png');
  await click(page, 'next-day');
  await sleep(900);
  await page.shot('tools/out/screen-day2.png');
  console.log('audit', JSON.stringify(await page.eval(`${H}.auditSwing()`)), 'check', JSON.stringify(await page.eval(`${H}.check()`)));
  console.log('errors', page.logs.filter(l => /error|EXC/i.test(l)));
} finally { page.kill(); }
page = await boot(390, 844, 9394);
try { await page.shot('tools/out/screen-phone.png'); } finally { page.kill(); }
