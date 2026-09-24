// OG image: sandbox chain reaction in-engine, HUD hidden, tight camera, wordmark plate in the
// game's own style overlaid for the shot only. Writes candidates to tools/out/og-NN.png; copy
// the keeper to og-image.png and bump ?v= on the og/twitter meta.
//   SPAN=15 X=-4.5 Z=-1 FOCUS=1,1 WARM=10 SHOTS=12 node tools/og-shot.mjs [file-or-url]
// FOCUS parks the axe near a world point for the candidate frames (else it keeps sweeping).
import {launch, sleep, until} from './cdp.mjs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const target = process.argv[2] || 'index.html';
const url = /^https?:/.test(target) ? target : pathToFileURL(resolve(target)).href;
const H = 'window.__fellswoop';
const SPAN = +(process.env.SPAN || 10.5), X = +(process.env.X || 1), Z = +(process.env.Z || .5);
const WARM = +(process.env.WARM || 14), SHOTS = +(process.env.SHOTS || 10), TITLE = process.env.TITLE !== '0';
const page = await launch({port: 9398, width: 1200, height: 630});
try {
  await page.goto(url);
  await until(() => page.eval(`!!(${H}&&${H}.ready)`), {timeout: 60000, label: 'boot'});
  await page.eval('localStorage.clear()');
  await page.front();
  await page.eval(`dispatchEvent(new KeyboardEvent('keydown',{code:'KeyB'}))`);
  await page.eval(`${H}.hud(false);document.getElementById('trontAbout').style.display='none';${H}.shotCamera(${SPAN},${X},${Z})`);
  const at = async (x, z) => { const p = await page.eval(`${H}.screen(${x},${z})`); await page.mouse('mouseMoved', p.x, p.y); return p; };
  let a = 0;
  const sweep = async secs => { for (let t = 0; t < secs; t += .2) { a += .19; await at(X + Math.cos(a) * 3.6, Z + Math.sin(a) * 2.3); await page.eval(`${H}.advance(.2)`); } };
  await sweep(WARM);
  if (TITLE) await page.eval(`(()=>{const d=document.createElement('div');d.id='ogTitle';d.innerHTML='<b>FELLSWOOP</b><i></i><span>A little forest. A very busy axe.</span>';
    const css=document.createElement('style');css.textContent="#ogTitle{position:fixed;left:${process.env.TX||40}px;top:${process.env.TY||34}px;padding:18px 34px 20px;background:#355640;color:#f2e7ce;clip-path:polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 14px),0 14px);box-shadow:none;z-index:9;text-align:center}#ogTitle b{display:block;font:700 76px/1 Georgia,serif;letter-spacing:1px;text-shadow:3px 4px 0 #1f382c}#ogTitle i{display:block;height:3px;background:#cfb574;margin:12px 40px 10px}#ogTitle span{font:500 21px Trebuchet MS,Arial,sans-serif;color:#bfcda9}";
    document.head.appendChild(css);document.body.appendChild(d);})()`);
  const [FX, FZ] = (process.env.FOCUS || '').split(',').map(Number);
  for (let i = 0; i < SHOTS; i++) {
    if (Number.isFinite(FX)) { await at(FX + Math.sin(i * 1.7) * .35, FZ + Math.cos(i * 1.3) * .25); await page.eval(`${H}.advance(${.11 + (i % 4) * .07})`); }
    else await sweep(.6);
    await page.eval(`${H}.advance(0)`);
    await sleep(120);
    await page.shot(`tools/out/og-${String(i).padStart(2, '0')}.png`);
  }
  console.log('shots', SHOTS, 'errors', page.logs.filter(l => /error|EXC/i.test(l)));
} finally { page.kill(); }
