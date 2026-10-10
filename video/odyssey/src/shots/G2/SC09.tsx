import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {easeOutCubic} from '../../common';
import {C, FONT, SET, IMG, SHADOW, PaperBg, PaperWipe, PaperCharacter, Boat, SpeechBubble, slapCss, peelCss, prog, rock, wavePath, foamPath} from '../../paper';
import {kicks, mixHex, CharSpace, SkinArm} from './kit';
import {RequestList} from './shared';

/**
 * SC09 · frames 2702–3165 · S24–S27 · source IN HOMER / BOOKS 1, 9. Deep water: navy and foam.
 * SC08's navy sheet with these waves is on screen at 2702.
 * 2710 the Neptune statuette (Met 247973, whole object) rises from the waves; 2763 it nods.  2797 Polyphemus slaps in on his rock, hands up, praying.
 * 2849 the paper list slaps in with "LATE" and "ALONE", 2918 "ON SOMEONE ELSE'S SHIP".  2965 the bubble "Request received." opens from Poseidon.  3018 the statuette nods again.
 * 3074 camera pull-back, 45 frames, scale 1 → 0.45 and across the sea to the tiny boat (list and bubble peel off, the statuette sinks back).
 * End of the shot (before the sheet): Boat s = 0.556 in the world × camera 0.45 = 0.25 on screen, hull centred at (640, 430), Odysseus in it as in SC03.
 * Hold: the pull-back ends 3119 → exit 3157 (38 frames). Exit: the sheet of chapter card 2 (#8DB9D3) wipes in over 3157–3165.
 */
const F0 = 2702;
const END = 3165;
const B = {nep: 2710, nod1: 2763, poly: 2797, list: 2849, item3: 2918, bubble: 2965, nod2: 3018, back: 3074};
const EXIT = END - 8;

// ---- camera: world point f at the screen centre, scale k
const BOAT = {s: 0.556, hullX: 1900, hullY: 300}; // world hull centre; box top-left = hull centre − (355, 440)·s
const CAM_END = {k: 0.45, fx: BOAT.hullX, fy: BOAT.hullY - 70 / 0.45}; // the hull centre lands on screen (640, 430)
const camAt = (N: number) => {
  const t = prog(N, B.back, 45);
  return {k: 1 + (CAM_END.k - 1) * t, fx: 640 + (CAM_END.fx - 640) * t, fy: 360 + (CAM_END.fy - 360) * t};
};
const worldCss = (N: number): React.CSSProperties => {
  const c = camAt(N);
  return {position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '0 0', transform: `translate(640px, 360px) scale(${c.k.toFixed(4)}) translate(${-c.fx.toFixed(2)}px, ${-c.fy.toFixed(2)}px)`};
};

// ---- the sea: a stack of wide navy bands, each with a foam edge; the objects stand between bands, so the pull-back finds only water
const X0 = -600, X1 = 4400, BOTTOM = 2600;
const TOPS = [-720, -570, -420, -270, -120, 30, 180, 340, 514, 696, 860, 1010, 1160, 1310, 1460, 1610, 1760, 1910];
const I_BOAT = 7; // the boat is drawn after the bands before this one (its keel hides behind band 340)
const I_NEP = 8; // the statuette is drawn before band 514 (hides its cut foot)
const I_ROCK = 9; // the rock is drawn before band 696 (hides its foot)
const BLUE_A = SET.night.bg;
const BLUE_B = mixHex(SET.night.bg, SET.sea.deep, 0.5);
const bandAt = (i: number, drift: number) => {
  const y = TOPS[i], amp = 14 + (i % 3) * 2, wl = 540 + (i % 4) * 60, ph = 37 * i + drift * (0.45 + 0.07 * (i % 5));
  return {fill: wavePath(y, amp, wl, ph, X0, X1, BOTTOM), edge: foamPath(y, amp, wl, ph, X0, X1)};
};
/** Bands i0 … i1−1 (back to front). */
const Bands: React.FC<{i0: number; i1: number; drift: number}> = ({i0, i1, drift}) => (
  <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {Array.from({length: i1 - i0}, (_, j) => {
      const i = i0 + j;
      const p = bandAt(i, drift);
      return (
        <g key={i}>
          <path d={p.fill} fill={i % 2 ? BLUE_B : BLUE_A} />
          <path d={p.edge} fill="none" stroke={SET.sea.foam} strokeWidth={9} strokeLinecap="round" opacity={0.4} />
        </g>
      );
    })}
  </svg>
);
/** SC09's first frame without the objects (SC08's wipe sheet draws this): all the bands, drift 0. */
export const DeepStatic: React.FC = () => <Bands i0={0} i1={TOPS.length} drift={0} />;

const NEP = {x: 40, y: 110, w: 500, h: 420}; // PNG 1280×1076
const ROCK_X = 1090; // centre
const POLY = {h: 480};
const LIST = {x: 690, y: 190, scale: 0.8};

export const SC09: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const d = N - F0;
  const dr = d * 0.8;
  const wipe = prog(N, EXIT, 8, easeOutCubic);
  const rise = prog(N, B.nep, 30, easeOutCubic);
  const sink = prog(N, B.back + 2, 26);
  const nepNod = kicks(N, [[B.nod1, 3.5], [B.nod2, -3]], 22, 16);
  const nepY = (1 - rise) * 450 + sink * 450;
  const pray = 3.5 * Math.sin(N / 9);
  const polyHead = kicks(N, [[B.poly + 2, -4], [B.list, 3], [B.bubble + 4, -4], [B.nod2, 4]], 22, 16);
  const peel = peelCss(N - B.back, 8, -1);
  const listN: [number, number, number] = [N - (B.list + 1), N - (B.list + 3), N - B.item3];
  const boatRot = rock(N, 1.4, 96);
  const bx = BOAT.hullX - 355 * BOAT.s, by = BOAT.hullY - 440 * BOAT.s;
  const r = BOAT.s / 0.66; // SC03's boat layout (s 0.66) scaled to this boat's size
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <PaperBg color={SET.night.bg}>
        <div style={worldCss(N)}>
          <Bands i0={0} i1={I_BOAT} drift={dr} />
          {/* the tiny boat, far off to the upper right (the camera finds it at the end) */}
          <Boat x={bx} y={by} s={BOAT.s} rot={boatRot} sailDx={150}>
            <PaperCharacter variant="hero" x={-8 * r} y={-147 * r} h={500 * r} cropY={450} head={-2} />
          </Boat>
          <Bands i0={I_BOAT} i1={I_NEP} drift={dr} />
          {/* Neptune rises behind band 514 */}
          <div style={{position: 'absolute', left: NEP.x, top: NEP.y + nepY, width: NEP.w, height: NEP.h, transformOrigin: '50% 100%', transform: `rotate(${nepNod}deg)`, filter: SHADOW}}>
            <Img src={IMG('neptune_met247973.png')} style={{width: NEP.w, height: NEP.h, display: 'block'}} />
          </div>
          <Bands i0={I_NEP} i1={I_ROCK} drift={dr} />
          {/* Polyphemus on his rock, hands up */}
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: `${ROCK_X}px 700px`, ...slapCss(N - B.poly, 0, -1)}}>
            <PolyOnRock N={N} head={polyHead} pray={pray} />
          </div>
          <Bands i0={I_ROCK} i1={TOPS.length} drift={dr} />
          {/* the paper list and Poseidon's bubble */}
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, ...(N >= B.back ? peel : {})}}>
            <RequestList x={LIST.x} y={LIST.y} scale={LIST.scale} n={N - B.list} lines={listN} />
            <SpeechBubble x={470} y={344} w={380} h={100} tx={318} ty={262} n={N - B.bubble}>
              <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 36, color: C.graphite, letterSpacing: -0.5}}>Request received.</div>
            </SpeechBubble>
          </div>
        </div>
      </PaperBg>
      <PaperWipe p={wipe} color={SET.sea.sky} from="right" />
    </AbsoluteFill>
  );
};

/** Polyphemus (cyclops body, head with the drawn eye band) with drawn raised arms, standing behind a graphite rock that hides his lower body. */
const PolyOnRock: React.FC<{N: number; head: number; pray: number}> = ({N, head, pray}) => {
  const x = ROCK_X - (POLY.h * 380) / 540 / 2;
  const y = 152;
  return (
    <>
      <PaperCharacter variant="cyclops" x={x} y={y} h={POLY.h} head={head} />
      <div style={{filter: SHADOW}}>
        <CharSpace x={x} y={y} h={POLY.h}>
          <SkinArm d="M64 392Q30 340 24 250" hand={[24, 222]} pivot={[64, 392]} rot={pray} />
          <SkinArm d="M326 392Q360 340 366 250" hand={[366, 222]} pivot={[326, 392]} rot={-pray} />
        </CharSpace>
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, filter: SHADOW}}>
        <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <path d="M850 780C860 650 880 540 950 498Q1020 466 1100 466Q1180 466 1250 498C1310 540 1330 660 1340 780Z" fill={SET.cave.shape} />
          <path d="M850 780C860 650 880 540 950 498Q1020 466 1100 466Q1180 466 1250 498C1310 540 1330 660 1340 780" fill="none" stroke="#fff" strokeWidth={9} strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
};
