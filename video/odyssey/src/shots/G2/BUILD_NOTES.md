# G2 build notes (chapter 1, "The Cyclops": SC04–SC09, frames 1092–3165)

Files: `SC04.tsx` … `SC09.tsx`, `kit.tsx` (group helpers), `shared.tsx` (exports for later groups), `index.ts` (`SHOTS_G2`; `source` / `beat` on SC05–SC09), `Preview.tsx` (pre-existing, unchanged). Preview comp: `G2`.
Stills: `stills/G2/` (50 frames, tag g2; first and last frame of the group are 1092 and 3165). All animation is a pure function of `N = useCurrentFrame() + F0`; `rnd` is never needed (no random).
Every shot draws `PaperBg` (flat colour + grain) and, as a sibling after it (not inside it, so the grain is laid once, as in G1/G3), a `PaperWipe` that carries the next shot's static first frame as children. Seam test on the stills (last frame of one shot vs first frame of the next): mean abs difference 0.01–0.03 per pixel (HUD label differences only); SC04 frame 1092 is the flat Ithaca sheet; SC09 frame 3165 is the flat #8DB9D3 sheet.

## Shots

### SC04 · 1092–1328 · `SC04.tsx` · beat 1100 (no source label)
- On screen: Ithaca sand sheet #D9D3B7 (SC03's last frame) → the sea (V2 waves, one far boat) and the sage shore with a sun slide up from 1094; Penelope (half-length, body off the bottom) looks out to sea; the swaddled baby (cream cloth, drawn sleeping face) in her arms; the paper card "ETA" with a slot window that rolls SOON → ?? → ??? → ?? and a progress bar with a twitching dot.
- Main subject: Penelope, about 520 px visible (head top y 112 to the bottom edge).
- Camera: push-in 1.0 → 1.08 over 45 frames from 1176 (origin 600,440).
- Beats (entrance vs beat): sea and shore 1094 (−6), sun rise 1100 (0), Penelope slaps 1100 (0), baby 1176 (0), ETA card 1245 (0), the card's reel rolls 1275 / 1293 / 1311 (pre-hang for the short last block at 1286).
- Hold: the card lands 1245 (settled 1255) → exit 1320; motion_check 63 frames.
- Exit: PaperWipe from the right in #8C647B (`SET.feast.bg`) over 1320–1328; SC05 starts on that bare sheet.
- Pictures: Penelope head (style library, `CAST` penelope body). No museum picture beyond the cast head.

### SC05 · 1329–1538 · `SC05.tsx` · beat 1337
- On screen: plum feast at night; table (gold top, cream cloth, plates, cups, jug, roast) slides up 1334; night window (crescent); Odysseus behind the table, arms swinging as he talks; two Phaeacian listeners (`CAST.phaeacianM`, `CAST.phaeacianW`); the post card "TRAVEL BLOG / BY ODYSSEUS" (avatar, sea picture with a tiny cyclops and a ship, generic heart/comment row, no brand) grows out of his raised hand; tag "HIS VERSION" (yellow).
- Main subject: Odysseus, about 460 px visible above the table (head top y 162 to the table at y 556).
- Camera: none (the speaker's arms and head carry the motion; no push so that the hold stays quiet).
- Beats: Odysseus, window, table 1337 (0, window and listeners +2/+3), card grows 1402–1418 (beat 1404, −2), "HIS VERSION" slaps 1444 (pre-hang for the short last block 1481). Head kicks at 1337 / 1404 / 1481; talk amplitude decays from 1470.
- Hold: tag lands 1444 (settled 1454) → exit 1530; motion_check 36 frames.
- Exit: PaperWipe from the right in #D681A1 pink (`SET.cave.bg`) with `CaveStatic` as children over 1530–1538; SC06 starts on that sheet.
- Pictures: Odysseus hero head, the two Phaeacian heads and the Polyphemus head (tiny, on the post) from `CAST` / style library.

### SC06 · 1539–2035 · `SC06.tsx` · beat 1547 · HIGHLIGHT (the NOBODY two-shot)
- On screen: cave pink with a graphite cave shape and accent arc (V1); three crew figures (`CrowdFigure`, `CREW_HEADS` A, B, A; tunics #7FC4C0 / #9CAE91 / #7FC4C0) walk in from the left; Polyphemus rises behind them; the crew hop back and fade; "6" (yellow tag, 170 px) slaps and peels; Odysseus slaps in on the left; the bubble "MY NAME IS / NOBODY." and the dotted line to Polyphemus; the Met alabastron (the blinding, as an object only, nothing else) slaps between them; the frame dims (overlay opacity 0.4, ramp 1947–1983).
- Main subject: the two-shot at 1840: Odysseus (h 640, x 76, y 157) and Polyphemus (h 560, x 846, y 176, rot 4.5°), the same placement as `brand/examples/V1.png`; the bubble is the V1 box (462,155, 396×217) with the tail tip at (582,436).
- Camera: wide (k 0.8 at (690,400)) with a 0.03 drift until 1800, then a push-in over 36 frames to k 1.0 at the frame centre = V1 framing.
- Beats: crew start 1546 (−1), Polyphemus rises 1613 (0), crew hop and head tip 1694 (0), "6" slaps 1728 (0), peels 1790, Odysseus 1797 (−3) and bubble 1800 (0, the push starts), bubble peels 1880, alabastron slaps 1887 (0), dim starts 1947 (0).
- Hold: dim ends 1983 → exit 2027; motion_check 42 frames.
- Exit: PaperWipe from the right in navy #2F3E5C (`SET.night.bg`) with `NightStatic` (the gold crescent) over 2027–2035; SC07 starts on it.
- Pictures: Odysseus hero head, Polyphemus head with the drawn eye band (style library), `CREW_HEADS`, `alabastron_met244857.png`.
- Robe extension (`kit.tsx`): the paper body ends flat at 540 symbol units; in the wide camera shot the two bodies would show a flat bottom edge, so `LongFigure` continues the robe downward (shadow layer behind, front layer without a filter, 2-unit overlap so no seam line shows).

### SC07 · 2036–2350 · `SC07.tsx` · beat 2044
- On screen: night navy with the gold moon (SC06's sheet); the group-chat panel "CYCLOPS NEIGHBORS (5)" with five one-eyed avatars (Polyphemus' with a drawn eye band), bubble "Who is hurting you?!", a big pink bubble "NOBODY!" (it shakes), four avatars dropping out one by one and the system line "4 neighbors left the chat"; the panel peels off; dawn (navy → pink over 30 frames: moon sinks, graphite hill and sun rise); the Getty man-under-ram statuette slaps in at the left; three drawn paper rams with a tiny crew head and tunic under each belly cross to the right and stand.
- Main subject: chat panel 452 × 570 px (rot −2°); then the statuette 402 × 440 px.
- Camera: none.
- Beats: panel slaps 2044 (0), "Who is hurting you?!" 2085, "NOBODY!" 2152, avatars drop 2195 (every 5 frames), system line 2197, panel peels 2236–2244, dawn and statuette 2244, rams 2282–2306.
- Hold: rams stop ≈2306 → exit 2342; motion_check 33 frames (rams were shortened to end 33 frames before the exit).
- Exit: PaperWipe from the right in the sea sky colour (`SET.sea.sky`) with `SeaStatic` (the V2 waves) over 2342–2350.
- Pictures: `ram_getty_103TP1.png` (whole object), Polyphemus head, `CREW_HEADS`.
- Exports: `NightStatic({sink})` (the moon on night navy, used by SC06's wipe).

### SC08 · 2351–2701 · `SC08.tsx` · beat 2359
- On screen: V2 sea (sky, waves); the Cyclops' island (graphite shape with a dark cave mouth) rises behind the far wave from 2354; the boat with Odysseus (facing the shore, arm out) slides in; bubble typed line by line "ODYSSEUS" / "SON OF LAERTES" / "ITHACA"; the bubble peels; `LocationCard` ("LOCATION SHARED · ITHACA · Odysseus, unfortunately · VISIBLE TO: POLYPHEMUS") slaps in at the right while the camera follows; the dotted arrow runs from the card to the island.
- Main subject: Odysseus in the boat, about 500 px visible (head top y 75 to the hull); card 416 × 264 px (520 × 330 × 0.8).
- Camera: follow pan right by 150 px over 42 frames from 2583 (the card slaps as the pan starts).
- Beats: boat 2359 (0), line 1 types 2439 (0), line 2 2512 (0), line 3 2543 (0), bubble peels 2575, card 2583 (0, all four lines at once: pre-hang for 2650), arrow reveal 2586–2608.
- Hold: pan ends 2625, arrow lands 2608 → exit 2693; motion_check 66 frames (boat rocking and his arms calm down after 2556).
- Exit: PaperWipe from the right in navy with `DeepStatic` (the band stack of SC09) over 2693–2701.
- Pictures: Odysseus hero head.
- Exports: `SeaStatic` (V2 waves, used by SC07's wipe).

### SC09 · 2702–3165 · `SC09.tsx` · beat 2710
- On screen: deep water: 18 navy bands with foam edges (drift 0.8 px/frame); the Neptune statuette (Met 247973, whole object) rises from the waves; Polyphemus on his graphite rock with raised, praying hands slaps in; `RequestList` ("LATE / ALONE / ON SOMEONE ELSE'S SHIP") slaps in; the bubble "Request received." from Poseidon; the camera pulls back across the sea to the tiny boat with Odysseus.
- Main subject: Neptune statuette 500 × 420 px at the left; Polyphemus 480 px visible; list 480 × 240 px (600 × 300 × 0.8).
- Camera: pull-back from k 1.0 to 0.45 over 45 frames from 3074 (the list and bubble peel at 3074, the statuette sinks 3076–3102); ends with the boat hull at (640,430) at screen scale 0.25 (Boat s 0.556 in the world × 0.45), Odysseus in it as in SC03.
- Beats: statuette rises 2710–2740 (0), nod 2763, Polyphemus slaps 2797 (0), list slaps 2849 (0) with "LATE" 2850 and "ALONE" 2852, "ON SOMEONE ELSE'S SHIP" 2918 (0), bubble 2965 (0), nod 3018, pull-back 3074.
- Hold: pull-back ends 3119 → exit 3157; motion_check 39 frames.
- Exit: PaperWipe from the right in #8DB9D3 (flat, no children) over 3157–3165; the chapter-card sheet that follows is flat #8DB9D3.
- Pictures: `neptune_met247973.png` (whole object), Polyphemus head, hero head.
- Exports: `DeepStatic` (all bands at drift 0, used by SC08's wipe).

## Exports for other groups
`shared.tsx` (self-contained: only `src/paper.tsx` and `src/common`):

- `LocationCard({x, y, scale = 1, n, off = 0, rot = 4, dir = 1})` — the card of SC08, flippable to "LOCATION SHARING: OFF". (x, y) is the centre of the card in frame px; base size 520 × 330 px, scales about its centre; `n` frames since the card slaps in (n < 0 = hidden; slap: scale 1.15 → 1 and ±4° in 6 frames); `off` 0 → 1 fades the old lines up, slides the paper toggle knob from ON to OFF, and shows "LOCATION SHARING:" with a large "OFF" (use `prog(N, beat, 14)`); `dir` = slap direction 1 | −1. For G7: `<LocationCard x={..} y={..} scale={..} n={N - slapFrame} off={prog(N, flipFrame, 14)} />`.
- `RequestList({x, y, scale = 1, n, lines = [99, 99, 99], tick = [0, 0, 0], rot = −2, dir = −1})` — the paper list of SC09. (x, y) centre in frame px; base size 600 × 300 px, scales about its centre; `n` frames since the paper slaps in; `lines[i]` = frames since row i's text slaps in (default 99 = all there, a negative value leaves the row blank); `tick[i]` 0 → 1 = a navy check drawn into the box of row i (the caller animates it, e.g. `prog(N, beat, 8)`). Rows: LATE / ALONE / ON SOMEONE ELSE'S SHIP. G6 SC24 ticks the three rows on the three beats of "Late, alone, on someone else's ship".
- Other read-only imports: `SC06.tsx` `CaveStatic`; `SC07.tsx` `NightStatic`; `SC08.tsx` `SeaStatic`; `SC09.tsx` `DeepStatic`; `kit.tsx`: `kick`, `bump`, `kicks` (head kick curves), `charGeom`, `CharSpace` (SVG in a `PaperCharacter`'s symbol coordinates), `RobeExt`, `LongFigure` (a body with the robe continued downward), `SkinArm`, `BabyBundle`, `mixHex`, `arrowHead(tx, ty, deg, len, spread)`.

## motion_check (`python3 scripts/motion_check.py G2 --exit-tail 8`)
Final run, after the last code change:

| shot | len | still% | longest | hold | verdict |
|---|---|---|---|---|---|
| SC04 | 7.9s | 33% | 1.4s | 63f | OK |
| SC05 | 7.0s | 6% | 0.2s | 36f | OK |
| SC06 | 16.6s | 28% | 1.4s | 42f | OK |
| SC07 | 10.5s | 61% | 1.9s | 33f | OK |
| SC08 | 11.7s | 2% | 0.1s | 66f | OK |
| SC09 | 15.5s | 16% | 0.8s | 39f | OK |

shots failing: 0.

## Test render
`scripts/test_render.sh G2 2860 g2` (SC09, busiest by filters: 18 bands, statuette, rock, list): 30 frames in 4.8 s. `scripts/test_render.sh G2 1700 g2` (SC06: crew, Polyphemus, camera): 30 frames in 4.1 s. Machine load average about 14 on 4 cores.

## Checks on the stills (50 frames in `stills/G2/`)
- Edge test: share of the outer 3 px border with all channels ≤ 12: 0.000 % on every still.
- Seams (mean abs RGB difference per pixel): 1328/1329 0.028, 1538/1539 0.014, 2035/2036 0.027, 2350/2351 0.011, 2701/2702 0.025. The only differing pixels are the HUD's label text.
- First frame 1092: flat Ithaca sheet with grain (mean 214, 208, 181 against #D9D3B7 = 217, 211, 183). Last frame 3165: flat #8DB9D3 with grain (mean 140, 183, 208 against 141, 185, 211).
- `bunx tsc --noEmit`: exit 0. `python3 scripts/selfcheck.py`: exit 0, "problems: 1" is the hole SC28→SC32 (G7 not built yet); none in G2. Literals it lists from G2 are the storyboard texts "CYCLOPS NEIGHBORS (5)" and "4 neighbors left the chat" and image file names.

## Deviations from the storyboard
- US spelling "neighbors" (brief) where the storyboard row may read "neighbours".
- "ETA: SOON" is drawn as the label "ETA" and a value window that shows SOON, then rolls to "??", "???", "??" (pre-hang for the short last block at 1286).
- Dawn pink #E0A09A (SC07) is not in the palette: it is the cave pink #D681A1 lifted 35 % toward the sun yellow #F3D98C, so that the sky shifts from navy to a lighter pink than SC06.
- SC07 rams: the three rams cross left to right and stop at the right (finished 33 frames before the exit) instead of walking out of frame, so that the hold stays quiet. A tiny crew head and tunic under each belly marks the crew.
- SC06 has no boulder: the crew hop back and Polyphemus' head tips (1694); then "6" and the crew fade. Nothing is eaten on screen; only the number, objects and dimming show the violence.
- SC06: the crew start at 1546 together (beat −1) with their start x staggered (−130 / −170 / −210) so that no entrance falls outside beat −6 … +3.
- SC04 and SC08 holds are longer than 45 frames (63 and 66) because the beats are fixed by the row; SC09 hold is 39 and SC07 33.
- SC09 the sea is stylised as a stack of navy bands with foam edges (drift 0.8) instead of the V2 wave shapes, so that the pull-back and the wipe from SC08 land on the same first frame (`DeepStatic`).
- Polyphemus has drawn skin arms (two `SkinArm` paths): the cyclops body of the style library has none, and SC09 needs raised, praying hands.
- The baby is a drawn cream bundle with a drawn sleeping face (no museum picture for a baby).
- SC05 post card: sea postcard with a tiny cyclops and a ship, generic heart / comment icons; no app name, logo or brand colour.
- A tiny Polyphemus on the SC08 island is omitted; the dark ellipse on the island is the cave mouth.

## Requests for shared files
None.
