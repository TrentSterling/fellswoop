# Special-tree motion release qualification

Version `0.6.0` is prepared from the reviewed `0.6.0-candidate.1`.
Publication remains pending successful release gates. Base public commit:
`525089f4a9ef292013ccd4436bdbf80d5eb8cb03`.

Thunder braces and snaps into its lightning release. Vortex counter-winds and
corkscrews into the existing spiral. Sapwood bows under its crown and settles
at the log-drop beat. Seedpod compresses, springs upward and recoils. Workshop
specimens use the same pose and quaternion composition. Reduced-motion mode
attenuates spin, travel, lean and highlights.

The change is presentation only. The 0.09-second ability schedule, 0.28-second
log drop and 0.58-second stump transition remain unchanged, as do damage,
collision, axe motion, save/progression and existing debris. No geometry,
materials, particles, random draws or pool capacity were added.

Historical candidate validation completed:

- Four existing About contract checks passed with only the intentional,
  independently reviewed game hash updated. Other pins and assertions are
  unchanged.
- Independent CPU review proved 17 gameplay functions unchanged, 3,500
  unaffected rendering cases equal to baseline, 11,216 special rendering
  cases finite, 22,432 deterministic pose samples and 1,346 workshop/live
  matrix comparisons.
- Owner tests matched 14 complete baseline/candidate world-state snapshots
  at 30 Hz and 90 Hz presentation. Repeated bursts retained resource counts.
- Independent Chrome and Firefox each matched 40 baseline/candidate world
  snapshots at 45 Hz, checked ability timing, workshop resets and phone bursts.
- Matched normal, reduced-motion, phone, full-grove and silhouette captures
  use the production instance matrices and colors. Isolated views hide other
  existing trees; intact-grove views retain them. No alternate tree pose is used.

On the RTX 5070 Ti through ANGLE/D3D11, the matched active-fall CPU renderTrees
median measured 0.0253 ms before and 0.0277 ms after. Synchronized static-frame
median was 1.0 ms for both. The two cadence runs measured p95 1.1/1.3 ms before
and 1.2/1.3 ms after. Both use 238 draw calls, 141 geometries, 3 textures,
28 programs and 229 scene objects. These are bounded headless measurements,
not native-input frame-rate qualification.

The historical candidate browser work used isolated muted headless processes with direct scene
methods. Audio remained uninitialized. No pointer/keyboard injection, physical
input, focus, pointer lock or audio testing was performed.

## Release qualification

The user has now approved isolated muted headless Chrome interaction and WebAudio
initialization, without physical input, desktop focus changes or Firefox. The
original `node tools/verify.mjs` remains required before any push and against the
live URL after Pages deployment. Its gameplay assertions are retained, with the
exact expected version updated to `0.6.0`. The driver records fresh owned
profiles, stdout/stderr and exit receipts, rejects visible launches, and performs
no focus action. All callers await cleanup. No release gate has yet been run for
this final version; do not treat preparation as a passing result.

`node tools/screens.mjs` covers the workshop specimen UI. The unchanged About
contract and browser suites also remain required. Remote CI must pass on the
exact candidate commit, followed by the established Pages and live checks.

The frozen `versions/fellswoop-v0.6.0.html` is byte-identical to `index.html`.
Existing static geometry, palette and logo are unchanged, so the existing OG
image remains representative; this release changes motion rather than replacing
its static pictured assets.

The candidate evidence package contains the exact source, baseline-relative
patch, source hashes, independent review, detailed receipts and silent clips.
Clips show baseline on the left and candidate on the right, with 30 Hz fixed
simulation frames played at 12 fps (2.5x slow) to inspect the brief motion.
