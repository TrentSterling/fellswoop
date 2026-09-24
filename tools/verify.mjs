// Release gate. Boots the exact page (local file or live URL) on the real GPU and plays it
// with real pointer input: title card + About pill, chopping, power chop, helicopter mode,
// a full day to the results board, a purchase, save + reload, sandbox isolation, the game's
// own check(), page meta and console errors. Writes tools/out/qa-*.png.
//   node tools/verify.mjs [index.html | https://tront.xyz/fellswoop/]
import {launch, sleep, until} from './cdp.mjs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const target = process.argv[2] || 'index.html';
const url = /^https?:/.test(target) ? target : pathToFileURL(resolve(target)).href;
const H = 'window.__fellswoop';
const page = await launch({port: +(process.env.PORT || 9397), width: 1280, height: 800});
const results = [];
const check = (name, ok, info = '') => { results.push([name, !!ok]); console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (info !== '' ? '  ' + info : '')); };
const snap = expr => page.eval(`JSON.parse(JSON.stringify((()=>{const s=${H}.snapshot();return ${expr};})()))`);
const move = async (x, z) => { const p = await page.eval(`${H}.screen(${x},${z})`); await page.mouse('mouseMoved', p.x, p.y); return p; };
const clickAt = async p => { await page.mouse('mousePressed', p.x, p.y); await page.mouse('mouseReleased', p.x, p.y); };
const region = async id => (await page.eval(`${H}.ui()`)).find(r => r.id === id);
try {
  await page.goto(url);
  await until(() => page.eval(`!!(${H}&&${H}.ready)`), {timeout: 60000, label: 'boot'});
  await page.eval('localStorage.clear()');
  await page.goto(url);
  await until(() => page.eval(`!!(${H}&&${H}.ready)`), {timeout: 60000, label: 'reboot'});
  await sleep(1500);
  await page.front();

  // ---- boot, brand, page ----
  check('boots with version 0.5.0', (await snap('s.version')) === '0.5.0');
  const html = await page.eval('document.documentElement.outerHTML');
  const oldName = new RegExp(['tim' + 'ber', 'living ' + 'grove'].join('|'), 'i');
  check('no old working title anywhere in the page', !oldName.test(html));
  check('no em dashes in the page', !html.includes(String.fromCharCode(0x2014)));
  const texts = await page.eval(`${H}.snapshot&&window.__fellswoopUI.snapshot().texts.map(t=>t.text)`);
  check('title card shows FELLSWOOP', texts.includes('FELLSWOOP'), texts.slice(0, 8).join(' | '));
  check('About pill visible on the title', await page.eval(`getComputedStyle(document.getElementById('trontAbout')).display!=='none'`));
  const meta = await page.eval(`({t:document.title,c:document.querySelector('link[rel=canonical]')?.href,o:document.querySelector('meta[property="og:image"]')?.content,d:!!document.querySelector('meta[name=description]'),ld:[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent)['@type'])})`);
  check('page meta: title, canonical, og:image, description, JSON-LD', meta.t.startsWith('FELLSWOOP') && meta.c === 'https://tront.xyz/fellswoop/' && meta.o?.startsWith('https://tront.xyz/fellswoop/og-image.png') && meta.d && meta.ld.includes('VideoGame'), JSON.stringify(meta));
  check('hardware GL (not SwiftShader)', !/swiftshader/i.test(await page.eval(`(()=>{const g=document.querySelector('canvas').getContext('webgl2')||document.querySelector('canvas').getContext('webgl');const d=g.getExtension('WEBGL_debug_renderer_info');return d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):''})()`)));
  await page.shot('tools/out/qa-title.png');

  // ---- chop with the real pointer; the title yields to play ----
  const centre = await move(0, 0);
  await clickAt(centre); // unlocks audio; also a power chop
  // park on a live tree long enough for three hits (pines have 3 HP)
  const tree = await page.eval(`${H}.trees().find(t=>t.state==='alive'&&Math.hypot(t.x,t.z)<4)`);
  await move(tree.x, tree.z);
  for (let i = 0; i < 12; i++) await page.eval(`${H}.advance(.25)`);
  const play = await snap('({phase:s.run.phase,felled:s.stats.felled,swings:s.stats.swings,earned:s.run.earned,audio:s.audio})');
  check('pointer over the island chops trees', play.phase === 'harvest' && play.felled > 0 && play.earned > 0, JSON.stringify(play));
  check('audio unlocked by the first click', play.audio === 'running', play.audio);
  check('About pill hides once chopping starts', await page.eval(`getComputedStyle(document.getElementById('trontAbout')).display==='none'`));
  const prec = await page.eval(`${H}.precision().stats`);
  check('click lands a power chop', prec.powers >= 1, JSON.stringify(prec));
  await page.shot('tools/out/qa-chop.png');

  // ---- helicopter off the island ----
  await page.mouse('mouseMoved', 1230, 120);
  await page.eval(`${H}.advance(1.2)`);
  const heli = await page.eval(`${H}.debugMotion()`);
  check('off the island the axe switches mode (helicopter)', heli.mode !== 'contact', 'mode=' + heli.mode);
  await page.shot('tools/out/qa-heli.png');

  // ---- finish the day by sweeping; countdown + bell; results board ----
  let guard = 0, phase;
  do {
    const a = guard * .21; await move(Math.cos(a) * 5.4, Math.sin(a) * 3.5);
    phase = await page.eval(`${H}.advance(.5).run.phase`);
  } while (phase !== 'results' && ++guard < 200);
  const day = await snap('({phase:s.run.phase,board:s.board.open,summary:s.summary,wood:s.progress.wood,day:s.progress.day,voices:s.voices})');
  check('day ends on the results board', day.phase === 'results' && day.board && day.summary?.earned > 0, JSON.stringify(day.summary));
  check('countdown ticks and end bell played', day.voices.includes('tick') && day.voices.includes('bell'), day.voices.join(','));
  const labels = await page.eval(`window.__fellswoopUI.snapshot().texts.map(t=>t.text)`);
  check('next-day button reads Axe me again', labels.includes('Axe me again'));
  await page.shot('tools/out/qa-results.png');

  // ---- buy through the real button ----
  const woodBefore = day.wood;
  const buyable = await page.eval(`(()=>{const f=${H},p=f.snapshot().progress;return f.balance().nodes.filter(n=>!n.req&&n.cost<=p.wood).sort((a,b)=>a.cost-b.cost)[0]?.id||null})()`);
  if (buyable) {
    const node = await region('node-' + buyable) || null;
    if (node) { await clickAt(node); await sleep(300); }
    const act = await region('detail-action'); if (act) { await clickAt(act); await sleep(300); }
  }
  const after = await snap('({nodes:s.progress.nodes,wood:s.progress.wood})');
  check('workshop purchase through the UI', buyable && after.nodes.includes(buyable) && after.wood < woodBefore, `bought=${buyable} wood ${woodBefore}->${after.wood}`);

  // ---- next day, save, reload ----
  const next = await region('next-day'); await clickAt(next); await sleep(500);
  const d2 = await snap('({phase:s.run.phase,board:s.board.open,day:s.progress.day})');
  check('Axe me again starts the next day', d2.phase === 'ready' && !d2.board && d2.day === 2, JSON.stringify(d2));
  await page.eval(`${H}.save()`);
  await page.goto(url);
  await until(() => page.eval(`!!(${H}&&${H}.ready)`), {timeout: 60000, label: 'reload'});
  await sleep(800);
  const saved = await snap('({day:s.progress.day,nodes:s.progress.nodes,wood:s.progress.wood})');
  check('progress survives a reload', saved.day === 2 && saved.nodes.includes(buyable) && saved.wood === after.wood, JSON.stringify(saved));
  const texts2 = await page.eval(`window.__fellswoopUI.snapshot().texts.map(t=>t.text)`);
  check('every fresh visit opens on the FELLSWOOP title', texts2.includes('FELLSWOOP'));

  // ---- sandbox is isolated from the save ----
  await page.eval(`dispatchEvent(new KeyboardEvent('keydown',{code:'KeyB'}))`);
  const sb = await snap('({sandbox:s.sandbox,nodes:s.progress.nodes.length})');
  await page.eval(`dispatchEvent(new KeyboardEvent('keydown',{code:'KeyB'}))`);
  const back = await snap('({sandbox:s.sandbox,day:s.progress.day,wood:s.progress.wood,nodes:s.progress.nodes})');
  check('sandbox unlocks everything and leaves the save alone', sb.sandbox && sb.nodes === 28 && !back.sandbox && back.day === 2 && back.wood === saved.wood && back.nodes.length === saved.nodes.length, JSON.stringify({sb, back}));

  // ---- the game's own invariants, perf, console ----
  const inv = await page.eval(`${H}.check()`);
  check('game check() passes', inv.pass, inv.failures.join(','));
  const perf = await snap('s.frameMs');
  check('frame p95 under 34 ms', perf.p95 < 34, JSON.stringify(perf));
  const bad = page.logs.filter(l => /^(error|EXCEPTION)/.test(l));
  check('no console errors', bad.length === 0, bad.slice(0, 3).join(' | '));
} catch (e) {
  check('harness completed', false, e.message + ' ' + page.logs.slice(0, 5).join(' | '));
  await page.shot('tools/out/qa-fail.png').catch(() => {});
} finally { page.kill(); }
const pass = results.filter(r => r[1]).length;
console.log(`\n${pass}/${results.length} checks passed  (${target})`);
process.exit(pass === results.length ? 0 : 1);
