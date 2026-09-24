// Boot a build, dump hook shapes and take a few screenshots into tools/out/.
//   node tools/probe.mjs [file-or-url]
import {launch, sleep, until} from './cdp.mjs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const target = process.argv[2] || 'index.html';
const url = /^https?:/.test(target) ? target : pathToFileURL(resolve(target)).href;
const page = await launch({port: 9391, width: 1280, height: 800});
try {
  await page.goto(url);
  await until(() => page.eval('!!(window.__fellswoop&&window.__fellswoop.ready)'), {timeout: 60000, label: 'ready'});
  await sleep(2000);
  const hooks = await page.eval(`(()=>{const h=window.__fellswoop;const u=window.__fellswoopUI;return {hooks:Object.keys(h),ui:u?Object.keys(u):null,snap:JSON.stringify(h.snapshot?h.snapshot():null).slice(0,3000),uisnap:JSON.stringify(u&&u.snapshot?u.snapshot():null).slice(0,3000),gl:(()=>{const c=document.querySelector('canvas');const g=c&&(c.getContext('webgl2')||c.getContext('webgl'));const d=g&&g.getExtension('WEBGL_debug_renderer_info');return d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):'?'})()}})()`);
  console.log(JSON.stringify(hooks, null, 1));
  await page.shot('tools/out/probe-0.png');
  for (const [i, [x, y]] of [[640, 420], [900, 380], [1200, 150]].entries()) {
    for (let k = 0; k < 20; k++) { await page.mouse('mouseMoved', x + k * 3, y); await sleep(50); }
    await sleep(800);
    await page.shot(`tools/out/probe-${i + 1}.png`);
  }
  console.log('logs', page.logs.slice(0, 20));
} catch (e) { console.log('ERR', e.message, page.logs.slice(0, 10)); await page.shot('tools/out/probe-fail.png'); }
finally { page.kill(); }
