# Changelog

## 0.5.0 (2026-09-23) FELLSWOOP

First public version, at https://tront.xyz/fellswoop/. Built on ChatGPT's 0.4.1 (the axe-contact release).

- **Name.** FELLSWOOP everywhere: page title, in-game About page, version, save key, console hooks. Social meta, canonical, favicon, OG image, and the tront.xyz About block with JSON-LD.
- **Title card.** The FELLSWOOP wordmark greets you on load and fades on the first chop; later mornings get a small Day N card. Game-rendered, pointer-transparent.
- **Axe me again.** The start-next-day button says it.
- **Sound.** Chops rise in pitch as the streak builds. The last five seconds tick and the day ends on a bell. Power chops thump, sap blips, seeds chime, sky pods pop, oak bark cracks, and a felled oak plays a jackpot instead of the upgrade chime.
- **Screen shake.** Small kicks on pumpkin blasts, oak falls, power chops and bark breaks. Render-only (aiming is untouched), capped, and off with reduced motion.
- **Balance.** Upgrade costs climb much faster (20 to 7,000 wood instead of 22 to 270). Chain reactions multiply income, so the old flat prices let a relaxed player finish all 28 upgrades on day 4 and then had nothing to spend on. Now it is one or two buys a day and the last one lands around day 15.
- **Tooling.** `tools/verify.mjs` (23-check release gate), `tools/balance.mjs` (multi-day economy bot), `tools/screens.mjs` (UI tour), `tools/og-shot.mjs`, `tools/probe.mjs`.
