import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, easeInOutPow} from '../../common';
import {C, FONT, SET, SHADOW, PaperBg, PaperWipe, PaperTag, ExampleCard, PhotoPrint, PaperCharacter, Boat, Waves, IMG, slapCss, peelCss, prog, rock} from '../../paper';
import {easeOutBack, bump, kick, charPt, heroFistR, Roller, Cord, Bag, bagTie, Island, WarnIcon} from './parts';

/**
 * SC10 · frames 3211–3573 · S28–S30 · source IN HOMER / BOOK 10. Sea by day.
 * 3211 continues the chapter card: the bare #8DB9D3 sheet with the tiny boat of SC09 (hull centre (640, 430), scale .25, Odysseus in it as in SC03);
 *   the water rises under it. 3219 the boat grows to full size (springy, 26 frames). 3294 the Aeolus engraving (Met 818319) slaps in on the left.
 *   3323 the bag drops into the boat. 3348 the caution sign slaps on, tied to the bag. 3400–3410 the print peels off; 3414 the day counter slaps and rolls
 *   1 → 9, Ithaca rises on the horizon, parallax slide left (40 frames, sea layers at three speeds). 3478 his head droops, "Zzz" tag.
 * Hold: Zzz lands ~3484 → exit 3566. Exit: the next sheet (map sky) wipes in over the last 8 frames.
 */
const F0 = 3211;
const END = 3573;
const B = {grow: 3219, print: 3294, bag: 3323, sign: 3348, day: 3414, sleep: 3478};
const EXIT = 3566;
const PRINT_OUT = 3400;
const DRIFT = 0.3; // wave phase speed (px per frame)

const S1 = 0.66; // full boat scale (as SC03)
const REF = {x: 355, y: 440}; // hull reference point inside the 720×520 boat box
const S0 = 0.25;
const HC0 = {x: 640, y: 430}; // hull centre of SC09's tiny boat
const BOAT1 = {x: 410, y: 290}; // full-size boat box top-left
const HC1 = {x: BOAT1.x + REF.x * S1, y: BOAT1.y + REF.y * S1};
const CH = {x: -8, y: -147, h: 500, cropY: 450}; // Odysseus in boat-local px (S1 units)
const SAIL_DX = 150;
const CLEW = {x: (575 + SAIL_DX) * S1, y: 350 * S1};
const BAG = {x: 392, y: 262, w: 140};
const SIGN = {x: 470, y: -14, w: 352, h: 112};
const ISLAND = {cx: 1170, base: 520, w: 240};

export const SC10: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // ---- boat growth (tiny → full), springy
  const g = easeOutBack(clamp01((N - B.grow) / 26), 1.0);
  const k = S0 / S1 + (1 - S0 / S1) * g;
  const hc = {x: HC0.x + (HC1.x - HC0.x) * g, y: HC0.y + (HC1.y - HC0.y) * g};
  const bx = hc.x - REF.x * S1 * k;
  const by = hc.y - REF.y * S1 * k;

  // ---- water rises under the tiny boat, parallax slide from the day-counter beat
  const rise = 1 - prog(N, F0, 14, easeOutCubic);
  const par = prog(N, B.day, 40, easeInOutPow(2.4));
  const shift: [number, number, number] = [-40 * par, -110 * par, -200 * par];
  const content = -26 * par;
  const wipe = prog(N, EXIT, END - EXIT, easeOutCubic);

  // ---- Odysseus
  const dr = easeOutCubic(clamp01((N - B.sleep) / 16)); // droop
  const headTilt =
    bump(N, B.grow + 4, 4) + bump(N, B.print, -5) + bump(N, B.bag, 4) + bump(N, B.sign, -4) + bump(N, B.day, 4) + 24 * dr;
  const headTurn = 1 - 0.5 * dr;
  const armR = -120 + 10 * dr + kick(N, B.print, 3, 22, 14);
  const armL = -3 * Math.sin((N - B.grow) / 17);
  const fist = heroFistR(armR);
  const hand = charPt(CH.x, CH.y, CH.h, CH.cropY, fist.u, fist.v);

  // ---- bag drop
  const nb = N - B.bag;
  let bagY = BAG.y, bagRot = 0, bagSq = 1;
  if (nb < 12) {
    const t = clamp01(nb / 12);
    bagY = BAG.y - 760 * (1 - t * t);
    bagRot = -12 * (1 - t);
  } else {
    const u = nb - 12;
    bagY = BAG.y - (u < 8 ? 16 * Math.sin((u / 8) * Math.PI) : 0);
    bagSq = u < 5 ? 1 - 0.14 * Math.sin((u / 5) * Math.PI) : 1;
  }
  const tie = bagTie(BAG.x, BAG.y, BAG.w);

  const boatRot = rock(N, 0.8, 120) + kick(N, B.grow + 22, 2.4, 24, 16) + kick(N, B.bag + 12, 2.2, 20, 14);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* sky, far island, water bands (behind everything else) */}
      <PaperBg color={SET.sea.sky}>
        {N >= B.day ? (
          <div style={{position: 'absolute', left: shift[0], top: 0, width: 1280, height: 720}}>
            <Island cx={ISLAND.cx} base={ISLAND.base + 150 * (1 - prog(N, B.day, 22, easeOutCubic))} w={ISLAND.w} />
          </div>
        ) : null}
        <Waves top={452 + 300 * rise} shift={shift} drift={N * DRIFT} />
      </PaperBg>

      <div style={{position: 'absolute', inset: 0, transform: `translateX(${content}px)`}}>
        {/* Aeolus engraving, Met 818319 (MANIFEST crop: top two thirds), peels off before the counter */}
        {N >= B.print - 6 && N < PRINT_OUT + 12 ? (
          <div style={{position: 'absolute', inset: 0, ...peelCss(N - PRINT_OUT, 10, -1)}}>
            <PhotoPrint src={IMG('aeolus_met818319.jpg')} x={92} y={132} w={262} h={372} rot={-4} n={N - B.print} dir={-1} />
          </div>
        ) : null}

        {/* the boat, tiny → full, with Odysseus, rope, bag and the sign */}
        <div style={{position: 'absolute', left: bx, top: by, transformOrigin: '0 0', transform: `scale(${k})`}}>
          <Boat x={0} y={0} s={S1} rot={boatRot} sailDx={SAIL_DX} front={
            N >= B.sign - 6 ? (
              <>
                {N >= B.sign ? <Cord a={[tie.x, tie.y]} b={[SIGN.x + 22, SIGN.y + SIGN.h - 8]} sag={22} /> : null}
                <div style={{position: 'absolute', left: SIGN.x, top: SIGN.y, width: SIGN.w, height: SIGN.h, filter: SHADOW, transformOrigin: '0% 100%', ...slapCss(N - B.sign, -4, 1)}}>
                  <div style={{position: 'absolute', inset: 0, background: C.yellow, border: '8px solid #fff', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 38, lineHeight: 1, letterSpacing: -0.5, color: C.navy}}>DO NOT OPEN</div>
                    <div style={{marginTop: 9, fontFamily: FONT, fontWeight: 900, fontSize: 19, lineHeight: 1, letterSpacing: 0.5, color: C.navy}}>CONTENTS: ALL THE WINDS</div>
                  </div>
                  <div style={{position: 'absolute', left: -26, top: -28}}>
                    <WarnIcon size={58} />
                  </div>
                </div>
              </>
            ) : null
          }>
            {nb >= 0 ? <Bag x={BAG.x} y={bagY} w={BAG.w} rot={bagRot} squash={bagSq} /> : null}
            <PaperCharacter variant="hero" x={CH.x} y={CH.y} h={CH.h} cropY={CH.cropY} head={headTilt} headTurn={headTurn} armR={armR} armL={armL} />
            {/* the sail rope: fist → sail's lower corner; sags when he sleeps */}
            <Cord a={[hand.x, hand.y]} b={[CLEW.x, CLEW.y]} sag={50 + 40 * dr} bulge={-46 - 10 * dr} color="#B0875C" twist="#6E4F2E" width={8} />
          </Boat>
        </div>

        {/* day counter: "DAY 1 →" over "DAY 9" rolling 1 → 9 */}
        {N >= B.day - 6 ? (
          <ExampleCard x={84} y={140} w={350} h={198} rot={-3} n={N - B.day} dir={-1}>
            <div style={{position: 'absolute', left: 24, top: 16, fontFamily: FONT, fontWeight: 900, fontSize: 38, letterSpacing: 0, color: C.grey, whiteSpace: 'nowrap'}}>DAY 1 →</div>
            <div style={{position: 'absolute', left: 24, top: 62, display: 'flex', alignItems: 'center'}}>
              <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 60, lineHeight: '105px', letterSpacing: -2, color: C.navy, marginRight: 14}}>DAY</div>
              <Roller rows={['1', '2', '3', '4', '5', '6', '7', '8', '9']} p={8 * prog(N, B.day + 4, 38, easeOutCubic)} size={100} w={74} color={C.graphite} />
            </div>
          </ExampleCard>
        ) : null}

        <PaperTag text="Zzz" x={818} y={138} rot={8} size={46} n={N - B.sleep} bg={C.cream2} color={C.navy} style={{textTransform: 'none'}} />
      </div>

      {/* exit: the map sky sheet of SC11 */}
      <PaperWipe p={wipe} color={SET.map.bg} from="right" />
    </AbsoluteFill>
  );
};
