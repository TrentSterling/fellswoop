# CLAUDE.md, FELLSWOOP

Idle chopping game on a floating island (Three.js, one HTML file). Live at https://tront.xyz/fellswoop/ (public repo `TrentSterling/fellswoop`, GitHub Pages from `main` root, https enforced). ChatGPT wrote the game up to 0.4.1; 0.5.0 (rebrand, juice, balance, hosting) was done here. Read `NOTES.md` first: it has the design rules.

## Source of truth

`index.html` IS the source; edit it in place. `versions/` holds a frozen copy of every shipped version. The original ChatGPT drop and design handoff live in `ref/` (git-ignored, local only, they carry the old working title). New ChatGPT drops: ask which build they were made from; if it is not the shipped `index.html`, re-layer our changes (see CHANGELOG) instead of hosting it raw.

## Rules

- No em dashes anywhere. Discord links are `tront.xyz/discord/`.
- No DOM game UI; see NOTES.md. The tront.xyz About block is injected by `python C:/trontstack/seo/about.py fellswoop` (idempotent; entry in `C:/trontstack/seo/pages.json`) and only shows on the title card (`body.fs-idle`).
- Version lives in `VERSION` (game code) plus the CHANGELOG. Bump `?v=` on og:image and twitter:image when `og-image.png` changes, and on the games-page card.

## Workflow

1. Edit `index.html`. Re-run `about.py fellswoop` if the About block needs refreshing.
2. `node tools/verify.mjs` (24 checks, real GPU, real pointer + touch aim). Look at `tools/out/qa-*.png`.
3. UI changes: `node tools/screens.mjs` (title, results, About, workshop, day card, phone). Economy changes: `DAYS=14 BOT=lazy node tools/balance.mjs` and `BOT=greedy`.
4. OG only if the look changed: `TX=74 TY=38 SPAN=13 X=-3.6 Z=-.6 FOCUS=1,3 WARM=10 SHOTS=12 node tools/og-shot.mjs`, pick a frame with the axe mid-frame, copy to `og-image.png`, bump `?v=`.
5. Freeze `versions/fellswoop-vX.Y.Z.html`, CHANGELOG, commit, push, then `node tools/verify.mjs https://tront.xyz/fellswoop/`.

Run harnesses one at a time. `tools/cdp.mjs` is the zero-dependency Chrome driver (real GPU, `--mute-audio`).

## Hooks

`window.__fellswoop`: `snapshot()` (version, run, progress, stats, voices, shake, frameMs, ...), `advance(seconds)` (deterministic sim ticks), `screen(x,z)`, `trees()`, `ui()` (clickable regions in CSS px), `precision()`, `sky()`, `debugMotion()`, `check()`, `auditSwing()`, `balance()`, `buy(id)`, `nextDay()`, `closeBoard()`, `save()`, `hud(v)`, `shotCamera(span,x,z)`, `inspect`, `isolate`, `release`. `window.__fellswoopUI.snapshot()` lists drawn texts and regions. Sandbox toggles with the `KeyB` keydown.
