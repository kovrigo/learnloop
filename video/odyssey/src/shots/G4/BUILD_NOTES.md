# G4 build notes: chapter 2, second half (SC14–SC17, frames 4337–5735)

Files: `index.ts` (4 ShotDefs, empty `BG_G4`, `FOOTAGE_G4`), `SC14.tsx`–`SC17.tsx`, `kit.tsx` (drawn pieces), `bg.tsx` (the shots' background sheets as functions of the frame number).
Stills: `P/stills/G4/` (f_<frame>.png, 1280×720). Camera and animation are pure functions of `N = useCurrentFrame() + F0`; no `Math.random`.

## Seams
- In: frame 4337 is a flat #7FC4C0 sheet plus grain (SC13 wipes it in). The meadow strip rises in over 4340–4354, so 4337 is flat.
- Out: frame 5735 is a flat #D9D3B7 sheet plus grain (SC17's last 8 frames wipe in SET.ithaca.bg).
- Between my shots: the last 8 frames of each shot are a `PaperWipe` whose children are the next shot's first-frame background (`Back15(END+1)` etc.), so the first frame of the next shot is identical to the wipe's last frame. Checked on stills 4768/4769, 5139/5140, 5421/5422.
Edge test (share of the outer 3 px with all channels ≤ 12) on all 88 stills: 0 over 0.5 %.

## SC14 · 4337–4768 · `SC14.tsx` · source IN HOMER / BOOK 12 · highlight moment
- On screen: turquoise meadow with deep sea on the right; two drawn singer silhouettes in robes (no photo heads); Odysseus (PaperCharacter hero) tied to a mast on a paper boat; four rowers (CrowdFigure heads from CREW_HEADS, wax plugs, drawn headphones); two dotted lines with note bubbles; tags "2" and "A DUET, NOT A CHOIR"; speech bubble IGNORE / EVERYTHING / I SAY.
- Main subject: Odysseus h = 490 px (about 598 px on screen after the push).
- Camera: push-in (640,360,×1) → (900,330,×1.22), frames 4610–4652 (42 frames, easeInOutPow 2.5); ends 108 frames before the end.
- Beats (beat → entrance): 4345 → sirens 4343/4346, sea sheet slide from 4339, boat slide from 4341; 4390 → "2" 4390, "A DUET, NOT A CHOIR" 4393; 4446 → dotted lines 4444 and 4448, note bubbles 4446 and 4449; 4518 → wax plugs 4515–4518 (one per rower); 4590 → ropes 4588/4593/4598, knot 4606; 4657 → headphones 4654–4657; 4701 → bubble 4701.
- Hold: bubble opens 4701 (settled 4709), exit starts 4760: 51 frames from the last element. motion_check hold 36 f.
- Pictures: none (all drawn).

## SC15 · 4769–5139 · `SC15.tsx` · source IN HOMER / BOOK 12
- On screen: dark strait water (#285F80) with drifting waves; generic poll card "WHICH WAY?" with rows "SCYLLA — 6 HEADS" and "CHARYBDIS — DRAINS 3× A DAY" and a mouse pointer; Flaxman Scylla print on the left; coded whirlpool on the right; "6" tag on the Scylla side. No app name.
- Main subject: poll card 520 × 316 px.
- Camera: none (waves drift, pointer glides, whirlpool spins).
- Beats: 4777 → poll slap 4775–4777; 4848 → print slides in from 4846, connector 4850, pointer picks Scylla 4851; 4927 → pointer glides to the Charybdis row 4927–4939; 4988 → whirlpool slap 4988, connector 4990, spin 9°/frame max, slows to 1°/frame by 5088; 5071 → poll closes over 6 frames from 5071, "6" slaps at 5074.
- Hold: "6" lands 5074 (settled 5084), exit starts 5131: 47 frames. motion_check hold 42 f.
- Pictures: `scylla_rijks_RP-P-1975-75-61.jpg` (MANIFEST crop, the six men are not in the crop), 360 × 281 px plus 14 px border.

## SC16 · 5140–5421 · `SC16.tsx` · source IN HOMER / BOOK 12
- On screen: sky blue (#8DB9D3) with the sun god's yellow ground; van Tulden print; four paper cows (one leaves the table); sign "350 COWS · DO NOT EAT"; the boat slides in from the right; storm cloud and paper thunderbolt; the boat tears in two along a zigzag paper edge, the half with the rowers sinks behind the water; counter card "→ 1". Nobody is shown hurt.
- Main subject: print 640 × 312 px plus 14 px border = 668 × 340 px.
- Camera: none.
- Beats: 5148 → print slap 5148, cows 5148–5151, boat slide from 5150; 5198 → sign slap 5198, cow leaves from 5200; 5286 → cloud slides in from 5280, bolt slap 5288, tear from 5289 (36 frames), cloud peels away 5312; 5356 → counter slap 5356.
- Hold: counter lands 5356 (settled 5366), exit starts 5413: 47 frames. motion_check hold 51 f.
- Pictures: `helios_rijks_RP-P-OB-66.758.jpg` (MANIFEST crop; the chariot with the nude figures is not in the crop).

## SC17 · 5422–5735 · `SC17.tsx` · source IN HOMER / BOOKS 5, 7
- On screen: mint island with sea on the left and a second sea with a horizon on the far right; Odysseus slides in from the water and crawls ashore, then stands; Calypso (CAST.calypso); counter "DAY" rolling to 2,555; dialog "BECOME IMMORTAL?" with YES / NO, a finger presses NO; camera pans right, he looks up and points at the horizon; a dotted line with an arrow runs from his hand to the horizon.
- Main subject: Odysseus h = 480 px (Calypso h = 420 px).
- Camera: pan 330 px to the right, frames 5635–5675 (40 frames, easeInOutPow 2.5); ends 52 frames before the exit.
- Beats: 5430 → Odysseus slide from 5428; 5491 → Calypso slap 5491, counter 5491–5533; 5540 → dialog 5540; 5602 → finger in from 5596, press 5604, NO pressed 5605, dialog closes 5624–5632; 5637 → pan from 5635, arm up 5638; 5674 → dotted line 5674.
- Hold: dotted line lands 5688, exit starts 5727: 39 frames. motion_check hold 51 f.
- Pictures: none (all drawn).

## Stills (`P/stills/G4/`, 88 files, `f_<frame>.png`)
- SC14: 4337 4343 4346 4352 4366 4390 4393 4400 4446 4452 4470 4518 4524 4540 4590 4600 4610 4631 4652 4657 4664 4701 4705 4730 4750 4760 4764 4768
- SC15: 4769 4777 4782 4800 4848 4856 4927 4940 4988 4995 5030 5071 5074 5084 5110 5131 5135 5139
- SC16: 5140 5148 5152 5160 5198 5203 5240 5286 5290 5300 5320 5356 5362 5390 5409 5412 5413 5414 5416 5417 5419 5421
- SC17: 5422 5430 5445 5470 5491 5495 5530 5540 5546 5580 5602 5606 5628 5640 5655 5675 5700 5727 5731 5735

## Exports for other groups
None. `kit.tsx` and `bg.tsx` are for G4 only.

## motion_check (`python3 scripts/motion_check.py G4 --exit-tail 8`, exit 0)
| shot | len | still% | longest still | hold | verdict |
|---|---|---|---|---|---|
| SC14 | 14.4 s | 1 % | 0.1 s | 36 f | OK |
| SC15 | 12.4 s | 49 % | 2.1 s | 42 f | OK |
| SC16 | 9.4 s | 9 % | 0.3 s | 51 f | OK |
| SC17 | 10.5 s | 25 % | 1.7 s | 51 f | OK |

`shots failing: 0`.

## Test render
`scripts/test_render.sh G4 4600 g4` (SC14, busiest shot, frames 4600–4629 with the camera push starting at 4610): 35.0 s for 30 frames, exit 0, with machine load average about 10 on 4 cores (other projects were rendering).
Same bundle, same minute: G1 frame 300 (approved) 13.9 s; SC17 frame 5560 18.3 s; SC15 frame 4780 6.1 s.
I switched parts of SC14 off one by one for a 20-frame render of 4589–4608 (full 25.6 s): without the singers 21.4 s, without the note bubbles 22.1 s, without meadow strip and front waves 21.1 s, without the rowers 21.9 s, all four 17.9 s. No single hot spot; the cost is spread over the shot's many drop-shadow elements (SHADOW filter) and the large moving layers.

## Deviations from the storyboard
- SC14: four rowers (the row gives no number). The note-bubble stream stops emitting after frame 4640 (the last bubble arrives at the ear by about 4710) and the boat's rocking, oars, rower nods and Odysseus's strain tremor ease off from 4672–4720; this is so the hold (4709–4760) passes motion_check. The two dotted lines keep running.
- SC15: the print is the MANIFEST crop at 360 × 281 px; the row gives no print size.
- SC16: the tear zigzag is drawn only along the hull.
- No picture was missing.

## Requests for shared files
- `src/paper.tsx` line 241: the comment on the `PaperCharacter` arm props says "positive = outward"; in the rendered result a negative `armL`/`armR` swings the arm out to the side and a positive value pulls it in toward the body (checked on stills). The comment should be corrected (no code change needed).
- `rock(N, amp, period, phase)` returns exactly 0 when `N + phase` is a multiple of half the period. Chrome then snaps the identity `rotate(0deg)` to the pixel grid and the boat jumps for 1–2 frames (seen in SC14 at frame 4725 with phase 0). I use phase 0.37 in SC14 and SC16; no change to the shared file is required.
