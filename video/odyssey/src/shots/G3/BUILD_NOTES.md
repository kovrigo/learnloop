# G3 build notes (chapter 2, first half: SC10–SC13, frames 3211–4336)

Files: `SC10.tsx` … `SC13.tsx`, `parts.tsx` (group helpers), `index.ts` (`SHOTS_G3`, all four with `source: 'IN HOMER / BOOK 10'` and `beat` = first beat). Preview comp: `G3`.
Stills: `stills/G3/` (46 frames, tag g3). All animation is a pure function of `N = useCurrentFrame() + F0`.

## Shots

### SC10 · 3211–3573 · `SC10.tsx` · beat 3219
- On screen: sea by day (sky #8DB9D3, V2 water bands rising from below in 14 frames), the tiny boat of SC09 (Boat scale .25, hull centre (640, 430), Odysseus in it as in SC03: `Boat` s .66, `sailDx` 150, hero cropY 450) growing to full size; Aeolus engraving print (left); paper bag of winds dropping into the boat; caution sign tied to the bag by a cord; the sail rope in his raised fist; day-counter card ("DAY 1 →" over "DAY" + rolling digit 1 → 9); Ithaca (sage island with a house) rising on the horizon; "Zzz" tag.
- Main subject: Odysseus in the boat, about 395 px visible (head top y 140 to hull y 535).
- Camera: parallax slide left 3414–3454 (40 frames, easeInOut 2.4): far water band −40 px, deep band −110, foam line −200, Ithaca with the far band, content layer (boat, cards) −26.
- Beats (entrance start vs beat): boat grows 3219 (0), engraving slaps 3294 (0), bag drops 3323 (0, lands 3335), sign slaps 3348 (0), counter slaps 3414 (0, rolls 3418–3456), Ithaca rises 3414 (0), head droops and "Zzz" slaps 3478 (0). The engraving peels off 3400–3410 to make room for the counter.
- Hold: Zzz lands 3484 → exit 3566 (82 frames by the storyboard count; motion_check reads 75; the boat rocks ±0.8°, waves drift).
- Exit: PaperWipe from the right in #8DB9D3 over 3566–3573 (SC11 starts on that bare sheet; first and last frames match pixel for pixel).
- Pictures: `aeolus_met818319.jpg` (MANIFEST crop, top two thirds), `odysseus_met255427.jpg` (hero head via PaperCharacter).

### SC11 · 3574–3786 · `SC11.tsx` · beat 3582
- On screen: sky sheet; sea chart print (Rijksmuseum NG-501-52, whole sheet, as SC01) with the dotted route (Aeolian sea → round Sicily → Ithaca), pink pins and the tiny boat with Odysseus asleep; crew A and crew B (`CrowdFigure`, `CREW_HEADS[0]`, `CREW_HEADS[1]`, robes from `CAST`) and the bag of winds; tag "CREW'S GUESS: GOLD" with three paper coins; paper wind swirls; navigator card with a route glyph that flips 180° and "RECALCULATING" + three dots.
- Main subject: navigator card 510 × 292 px.
- Camera: none.
- Beats: chart slaps 3576 (beat −6), crew A 3578, bag 3579, crew B 3580, tag and coins 3582–3584 (0..+2), bag opens and swirls burst 3652 (0), boat slides back along the route 3673 (0; 44 frames), navigator card slaps 3703 (3673 + 30, pre-hang for S33), route flips 3714–3734. Crew tug the cord 3586–3652 and throw back at 3652; crew heads bob at 3737/3739 (S33).
- Hold: route flip lands 3734 → exit 3779 (45 frames; RECALCULATING dots cycle, route dots run, boat rocks).
- Exit: PaperWipe from the right in #C9785B with the sand shape (`SHAPES.troySand`) over 3779–3786; SC12 starts on it.
- Pictures: `chart_rijks_NG-501-52.jpg`, `crewA_met248801.png`, `crewB_met250744.png`, hero head.

### SC12 · 3787–4004 · `SC12.tsx` · beat 3795
- On screen: terracotta with the sand shape (as SC02); the Cleveland dinos (whole object cut-out, as SC03) with twelve paper ships on the sand in two rows; rock shadows (dark lumpy silhouettes, no giants) sweep across; counter card "12 →" over a number that rolls 12 → 1 as the ships fall off the table one by one; his ship stays.
- Main subject: dinos 470 × 409 px.
- Camera: none (the table jolts a few px when a shadow is mid-frame).
- Beats: dinos and ships slap 3795–3798 (0..+3), shadows 3842, 3853, 3866, counter slaps 3901 (0), ships drop from 3903 every 3.2 frames (last at 3935; counter shows 1 from 3935), more shadows 3901–3950.
- Hold: last ship out of frame ~3953 → exit 3997 (44 frames).
- Exit: PaperWipe from the right in #B7A6D9 with the plum shape (`CIRCE_SHAPE`) over 3997–4004; SC13 starts on it.
- Pictures: `dinos_cma1971.46.png`.

### SC13 · 4005–4336 · `SC13.tsx` · beat 4013
- On screen: lavender with a plum shape bottom right; Odysseus (half-length, body off the bottom); Circe krater picture (`circe_met253627_crop.jpg`, the MANIFEST crop: Circe only) as a white-bordered print; BEFORE / AFTER meme panel (crew A twice, paper pig snout on AFTER, caption bar "NEW BODY. SAME BRAIN."); Hermes's drawn hand (cuff with a small gold wing) passing a herb sprig; cream paper ring (white edge, ten rays, pulsing) around the herb; "1 YEAR" tag.
- Main subject: meme panel 650 × 420 px.
- Camera: none.
- Beats: Odysseus slaps 4013 (0), krater print slaps 4046 (0) large on the left, hops to the top right 4096–4106, panel slides in 4104–4113 (beat −4), snout slaps 4111 (+3), Hermes's hand slides in 4161 (0) and Odysseus turns and reaches, he takes the sprig 4205 (0; hand slides out 4210–4224), ring and "1 YEAR" slap 4247 (0; tag pre-hung for S41 at 4277).
- Hold: ring and tag land 4257 → exit 4329 (72 frames; the ring pulses).
- Exit: PaperWipe from the right in #7FC4C0 over 4329–4336; G4's SC14 starts on a bare #7FC4C0 sheet.
- Pictures: `circe_met253627_crop.jpg`, `crewA_met248801.png`, hero head.

## Exports for other groups
`parts.tsx`: `Roller` (rolling rows), `Cord` (rope with white edge), `Bag`, `bagTie`, `bagMouth`, `Swirl`, `Island`, `WarnIcon`, `RockShadow`, `Snout`, `Sprig`, `HermesHand`, `PaperRing`, `CIRCE_SHAPE`, `easeOutBack`, `smooth`, `bump`, `kick`, `charPt` (frame position of a point on a `PaperCharacter`), `heroFistR`, `crowdHand`. Read-only imports welcome; nothing in them depends on this group's frames.

## motion_check (`python3 scripts/motion_check.py G3 --exit-tail 8`)
Final run, after the last code change:

| shot | len | still% | longest | hold | verdict |
|---|---|---|---|---|---|
| SC10 | 12.1s | 5% | 0.3s | 75f | OK |
| SC11 | 7.1s | 19% | 0.9s | 66f | OK |
| SC12 | 7.3s | 46% | 1.6s | 48f | OK |
| SC13 | 11.1s | 42% | 1.3s | 69f | OK |

## Test render
`scripts/test_render.sh G3 3652 g3` (busiest shot, SC11): 30 frames in 19–24 s on a machine at load average 13–14 on 4 cores. Same load, same bundle, G1 frame 1000 (approved SC03): 22 s.

## Deviations from the storyboard
- Sign text: "DO NOT OPEN" and "CONTENTS: ALL THE WINDS" on two lines; the "·" is the line break.
- Counters: "DAY 1 →" over a rolling "DAY 9", and "12 →" over a number rolling 12 → 1. The right-hand number starts at the left-hand value for the first frames, then rolls.
- SC10: the engraving peels off at 3400 (before the counter) instead of staying; the print and the counter use the same left area.
- SC11: the boat on the chart is small (scale .17, with Odysseus asleep) because the real route on the chart is short; the crew and the bag are large figures in front of the chart, not on the boat. The swirls fly out of the bag, across the chart to the boat.
- SC12: the 4 shadows cross before the counter (3842–3890); the ships stay until 3903, as the row's counter beat (3901) has them at 12.
- SC13: the krater print is shown large first and moves to the top right when the panel arrives (to fill the left side before 4104).
- "RECALCULATING…": the three dots are drawn as three animated "." characters.
- SC10 boat rocking is ±0.8° (SC03 uses ±1.4°): at ±1.4° the whole boat and head moving fills the 1.5 mean-change limit of the hold check.

## Requests for shared files
None.
