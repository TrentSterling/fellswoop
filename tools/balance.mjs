// Plays N consecutive days with a bot and reports the economy: wood per day, what it
// could buy, and how many days each purchase took. Real pointer input over the canvas,
// deterministic sim ticks via __fellswoop.advance.
//   DAYS=10 BOT=greedy|lazy node tools/balance.mjs [file-or-url]
import {launch, sleep, until} from './cdp.mjs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const target = process.argv[2] || 'index.html';
const url = /^https?:/.test(target) ? target : pathToFileURL(resolve(target)).href;
const DAYS = +(process.env.DAYS || 10), BOT = process.env.BOT || 'greedy', STEP = .25;
const page = await launch({port: 9392, width: 1280, height: 800});
const H = 'window.__fellswoop';
try {
  await page.goto(url);
  await until(() => page.eval(`!!(${H}&&${H}.ready)`), {timeout: 60000, label: 'ready'});
  await page.eval(`localStorage.clear()`);
  const rows = [];
  let angle = 0;
  for (let day = 1; day <= DAYS; day++) {
    const t0 = JSON.parse(await page.eval(`JSON.stringify(${H}.snapshot().run)`));
    let guard = 0;
    for (;;) {
      // pick an aim point
      const aim = await page.eval(`(()=>{const f=${H},s=f.snapshot(),r=s.perks.radius,ts=f.trees().filter(t=>t.state==='alive');
        if('${BOT}'==='lazy'){const a=${angle};return f.screen(Math.cos(a)*5.5,Math.sin(a)*3.6);}
        let best=null,bn=-1;for(const c of ts){let n=0;for(const t of ts)if(Math.hypot(t.x-c.x,t.z-c.z)<r)n+=t.maxHp>0?1/Math.max(1,t.hp):1;if(n>bn){bn=n;best=c;}}
        return best?f.screen(best.x,best.z):f.screen(0,0);})()`);
      angle += .09;
      await page.mouse('mouseMoved', aim.x, aim.y);
      const s = JSON.parse(await page.eval(`JSON.stringify((()=>{const x=${H}.advance(${STEP});return {phase:x.run.phase,earned:x.run.earned,rem:x.run.remaining,board:x.board.open,wood:x.progress.wood,cuts:x.run.cuts,chains:x.run.chains,helpers:x.run.helpers,summary:x.summary};})())`));
      if (s.phase === 'results' || s.board && s.phase !== 'harvest' && s.phase !== 'ready') { rows.push({day, earned: s.summary?.earned ?? s.earned, cuts: s.cuts, chains: s.chains, helpers: s.helpers, wood: s.wood}); break; }
      if (++guard > 2000) throw new Error('day never ended ' + JSON.stringify(s));
    }
    // greedy shop: cheapest affordable node whose requirement is owned, repeat
    const bought = await page.eval(`(()=>{const f=${H},b=f.balance().nodes;const out=[];for(;;){const p=f.snapshot().progress;const c=b.filter(n=>!p.nodes.includes(n.id)&&(!n.req||p.nodes.includes(n.req))&&n.cost<=p.wood).sort((a,b)=>a.cost-b.cost)[0];if(!c||!f.buy(c.id))break;out.push(c.id+':'+c.cost);}return out;})()`);
    const left = await page.eval(`${H}.snapshot().progress`);
    rows.at(-1).bought = bought.join(' '); rows.at(-1).bank = left.wood; rows.at(-1).owned = left.nodes.length;
    await page.eval(`${H}.nextDay()`);
  }
  console.table(rows);
  const check = await page.eval(`${H}.check()`);
  console.log('check', JSON.stringify(check), 'logs', page.logs.filter(l => /error|EXC/i.test(l)).slice(0, 5));
} catch (e) { console.log('ERR', e.message, page.logs.slice(0, 5)); await page.shot('tools/out/balance-fail.png'); }
finally { page.kill(); }
