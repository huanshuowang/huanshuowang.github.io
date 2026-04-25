# Calculator Integration Notes

## Files produced
| File | Purpose |
|---|---|
| `pages/calculator.js` | Business logic IIFE — exposes `window.Calculator` |
| `pages/parks-data.js` | Seed data (copied from Downloads) |
| `pages/themeparks.html` | Updated page — navbar, entry ticket, modal, scripts integrated |

---

## Manual test checklist

- [ ] Click nav **IS IT WORTH IT?** → modal opens
- [ ] Click entry ticket → modal opens
- [ ] Click logo / nav-home → scrolls to top
- [ ] Press **Esc** → modal closes, state preserved; reopening continues from same step
- [ ] Select Disney → locations appear grouped (Orlando, Anaheim, Paris, Tokyo, Shanghai, Hong Kong)
- [ ] Select Tokyo (single-park location) → auto-selects TDL and expands; clicking again removes it
- [ ] Select multi-park location header → expand/collapse without auto-selecting
- [ ] Check individual park → chip appears in bar; × on chip removes it
- [ ] 0 parks selected → "Next" button disabled
- [ ] Advance to Step 3 → park grid renders, visited parks show ✓ VISITED stamp (dimmed, unclickable)
- [ ] Click target park → stamp animation plays; other parks dim
- [ ] Click same park again → deselects
- [ ] **Calculate** → loading spinner → result page
- [ ] Number animates 0 → result % with easeOutExpo over 2 s
- [ ] Score ≤ 30 → green; 31–60 → amber; > 60 → red
- [ ] Confetti elements appear when score < 35
- [ ] Switch **Weighted ↔ Strict** → number re-animates, ride lists update, no loading flash
- [ ] Switch **FRESH ↔ REPEAT** → list updates instantly
- [ ] FRESH list: isOneOfAKind rides show **ONE OF A KIND** badge (red), others show **NEW** (yellow)
- [ ] FRESH list sorted: OneOfAKind first → isSignature → thrillLevel desc
- [ ] REPEAT list: exact matches show **EXACT MATCH**, similar (weight 0.5) show **SIMILAR VIBE**
- [ ] Recommendations sorted lowest-overlap-first; clicking any row switches target + re-runs calc
- [ ] **↺ Start over** → resets to Step 1 (brand selection)
- [ ] Deep link: navigate to `themeparks.html#/compare?v=mk,dl&t=tdl&brand=disney&mode=weighted` → opens directly to result
- [ ] URL hash updates on result page; cleared on close/reset
- [ ] Mobile: drag modal down > 80 px from handle → closes
- [ ] `prefers-reduced-motion` → number jumps to final value instantly, no animation
- [ ] Screen reader: `[aria-live="polite"]` on result number reads updated value

### Algorithm-specific cases
- [ ] **pairScores exact override** — visited=DL, target=MK: MK's *Tiana's Bayou Adventure* must show **EXACT MATCH** (family `family-splash-tianas`, pairScores `"dl-mk":{strict:1,weighted:1.0}`)
- [ ] **Default 0.5 score** — visited=MK, target=TDL: TDL's *Splash Mountain* must show **SIMILAR VIBE** in weighted mode, **FRESH** in strict mode (no pairScores override, defaultScoreWeighted=0.5, defaultScoreStrict=0)
- [ ] **OneOfAKind badge** — visited=none, target=DL: *Finding Nemo Submarine Voyage* fresh card carries **ONE OF A KIND** badge (ride has `isOneOfAKind:true`)
- [ ] **No-data edge** — if a park somehow has 0 RIDES entries → "Coming soon" state shown
- [ ] **All-conquered edge** — select every park of a brand as visited → Step 3 shows 🏆 state

---

## Known design gaps (needs Design follow-up)

1. **No `[data-role="unique-badge"]` template node in mockup** — the ONE OF A KIND badge is rendered via `rb-excl` class on `.rbadge`, matching the mockup's static example. If Design wants a separate toggle node inside the card, they should add `<div data-role="unique-badge" class="rbadge rb-excl">ONE OF A KIND</div>` to the ride card template and the JS will be updated to toggle its visibility instead.

2. **No `[data-role="partial-match-badge"]` template node** — similar-vibe cards use the existing `.rb-sim` badge class. Same approach as above if Design wants a separate node.

3. **Target cards have no real images** — the `.tcard-ph` placeholder shows the park name as text. The mockup does the same; real photos can be added later by populating a `src` on an `<img>` inside `.tcard-img`.

---

## How to update the data

1. Edit `/Users/happywang/Downloads/parks-data.js` (or your data-review tool).
2. Copy the updated file: `cp ~/Downloads/parks-data.js "pages/parks-data.js"`.
3. No JS changes needed unless you add new top-level fields to RIDE/FAMILY objects.

Key schema notes:
- **FAMILY** uses `defaultScoreStrict` (0|1) and `defaultScoreWeighted` (0|0.5|1.0) — no `defaultScore` field.
- **FAMILY.pairScores** keys must be two parkIds sorted alphabetically joined by `-` (e.g. `"dl-mk"`, not `"mk-dl"`).
- **RIDE.isOneOfAKind: true** → ONE OF A KIND badge on fresh cards.
- **RIDE.isSignature: true** → sorted above non-signature in fresh list (after OneOfAKind).
