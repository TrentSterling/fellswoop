# NOTES: continuing FELLSWOOP

Read this before editing. It carries the rules from the original design handoff plus what 0.5.0 changed.

## Play it before you touch it

This is an iterative game, not a rewrite target. Boot `index.html`, chop, open the workshop, run a day, try sandbox (B). Then edit.

## Never break

- **Three.js, one offline HTML file**, code-authored low-poly art (faceted geometry, flat colors, soft shadows). No asset packs, no raster art, no npm, no build step.
- **No web UI.** The interface is drawn by Three.js (UI batches + glyph atlas). No DOM buttons, cards, React, Tailwind. The only DOM on the page is the tront.xyz About pill (site chrome, hidden during play) and the game's `check()` ignores it.
- **Axe feel.** Anticipation, acceleration, contact, bite, recovery. Mouse target, harvesting circle and the visible sharpened edge line up at contact; that took a long visual gauntlet. Do not rewrite the strike math.
- **Helicopter mode.** Off the island the whole axe spins flat with its own trail. Trent loves it. Do not remove or tone it down.
- **Clicking is optional.** Ground click = one heavier power chop at the clicked point (no restart, no queueing, no spam DPS). Air click = gust. It is an accent, not a clicker.
- **Sky toys** (seedpods, the cloud) respond to whatever visibly overlaps the active area, in either axe mode. No giant invisible hitboxes.
- **Shared damage.** Axe, blasts, bananas, lightning, vortex and beavers all go through `damageTree`, so chain reactions really chain.
- **Beavers are real helpers**: pick a tree, walk, gnaw via the shared damage path, carry logs home.
- **Sandbox is isolated** from the save.
- **Small island.** Spectacle comes from density, reactions and effects, not map size. Pools stay bounded.

## QA standard

Run the page in a real browser, use real pointer input, capture screenshots (and motion sequences for motion problems), look at them, fix, rerun, regression-test. Syntax checks are not QA. `node tools/verify.mjs` must pass before any push; `tools/balance.mjs` for economy changes; `tools/screens.mjs` for UI changes.

## What 0.5.0 changed

- Rebrand to FELLSWOOP: title, in-game About page, version `VERSION='0.5.0'`, save key `tront.fellswoop.grove.v3`, hooks `window.__fellswoop` / `window.__fellswoopUI`.
- Title card on first load (fades on the first chop), a small "Day N" card on later mornings, "Axe me again" on the next-day button.
- Sound: chop pitch climbs with the streak, countdown ticks in the last 5 s, an end-of-day bell, and distinct voices for power chops, sap, seeds, sky-pod pops, bark cracks and the oak jackpot.
- Screen shake on blasts, oak falls, power chops and bark breaks. Render-time camera offset only (aiming raycasts never see it), capped, off under `prefers-reduced-motion`.
- Balance: node costs now follow `22*(old/22)^2.3`. With flat costs a lazy bot owned all 28 nodes by day 4 and wood was worthless after; now it is 1-2 buys a day, the last near day 15 (greedy bot: day 7).
- Console hooks for tooling: `buy`, `nextDay`, `closeBoard`, `hud`, `shotCamera`; snapshot reports `voices` and `shake`.

## Open threads

- `auditSwing()` reports `pass:false` (minimum clearance about -0.04 to -0.06) on both 0.4.1 and 0.5.0, byte-identical numbers. Probably the 0.4.1 contact fix made the blade bite into the turf on purpose and the audit threshold was never updated. Not touched in 0.5.
- No sink for wood once the tree is complete. The next progression pass should add behavior-changing choices, not more +% nodes.
- Versioning: the next drop is **0.6**.
