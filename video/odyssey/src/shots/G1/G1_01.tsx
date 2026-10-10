import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic} from '../../common';
import {
  FONT, C, SET, IMG, SHADOW, SHADOW_S, Grain, PaperWipe, PaperTag, ExampleCard, SplitFlap, Counter, PhotoPrint, DottedPath,
  PaperCharacter, CrowdFigure, Boat, slapCss, prog, rock, samplePath,
} from '../../paper';

/**
 * SC01 · frames 1–481 · cold open (S01–S03). One continuous paper tabletop, three stations left to right.
 * (a) map: sea chart print, Odysseus in his boat sliding along a yellow dotted route, ETA card "3 DAYS" → "10 YEARS".
 * (b) booking cards "CALYPSO'S ISLAND · 7 YEARS" and "CIRCE'S PALACE · 1 YEAR"; Odysseus, a half-length figure whose body runs off the bottom
 *     edge, stands between them with a suitcase; HOUSEGUEST lands on his tunic as a badge; he looks to Calypso, then hops along a dotted arc toward Circe.
 * (c) Ithaca: the house stands on green ground that runs off the bottom edge; its doors open on a long feast table of suitors,
 *     "+96" chip, counter card "GUESTS 108"; plates empty.
 * Text, numbers and faces stay above y 620 (YouTube's optional captions and controls); bodies, ground and set pieces use the full frame.
 * Exit: the sting's sky sheet drops over the frame from 472 (counter lands 431 → 41 frames hold).
 */
const F0 = 1;
const END = 481;
// beats (subtitle-block starts, script/timeline.md)
const B = {s01a: 86, s01b: 136, s02a: 183, s02b: 248, s02c: 309, s03a: 361, s03b: 409, s03c: 451};
const PAN1 = {a: B.s02a, len: 40};
const PAN2 = {a: B.s03a - 6, len: 36};
const ST_B = {x: 1280, y: 0};
const ST_C = {x: 2560, y: -300}; // up-right of (b): during pan 2 everything moves down-left, so nothing passes under the top-left HUD
const EXIT = 472; // counter lands 431 → 41 frames hold

// ---- station (a): chart print and route, chart-local coordinates (image 485×470 at screen 118,116, rotated −2.5°)
const CH = {x: 118, y: 116, w: 485, h: 470, rot: -2.5};
const TROY: [number, number] = [302, 201]; // Dardanelles on Goos's chart (file px 1245,830 of 2000×1939)
const ITHACA: [number, number] = [192, 224]; // next to Kefalonia (file px 790,925)
// the boat sails west from the chart's east side past Troy; the "detour" route then loops south along the bottom of the chart and back up to Ithaca
const BOAT_A: [number, number] = [600, 372];
const BOAT_B: [number, number] = [458, 332];
const ROUTE = samplePath([BOAT_A, BOAT_B, [372, 262], TROY, [318, 300], [372, 400], [300, 462], [170, 462], [98, 380], [122, 286], ITHACA]);

// ground top edge (station (c) coordinates): gentle curve from (0, 622) under the house (y ≈ 596–603), then a fillet up into the old hill's slope
// (the hill's first segment M780 720 Q860 470 1080 452 cut at t = 0.4, then T → explicit Q)
const GROUND_TOP = 'M0 622C90 604 170 598 300 596C440 594 600 600 700 603C780 603 825.6 604.3 866.4 557.1Q948 462.8 1080 452Q1300 434 1500 380';

const SUITOR_HEADS = ['suitor_met251524.png', 'suitor_met254640.png', 'suitor_met247994.png', 'suitor_met248895.png'];
const TUNICS = ['#B7A6D9', '#C9785B', '#7FC4C0', '#E0B54A', '#8C647B', '#9CAE91'];

export const G1_01: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // ---------------- camera
  const p1 = prog(N, PAN1.a, PAN1.len);
  const p2 = prog(N, PAN2.a, PAN2.len);
  const push = 1 + 0.04 * prog(N, 1, 180, easeInOutPow(1.6)) * (1 - p1); // slow push on the map, released during pan 1
  const camX = ST_B.x * p1 + (ST_C.x - ST_B.x) * p2;
  const camY = ST_C.y * p2;
  const world: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '640px 360px', transform: `scale(${push}) translate(${-camX}px, ${-camY}px)`};

  // ---------------- exit: sky sheet (the sting's background) drops over everything
  const wipe = prog(N, EXIT, END - EXIT, easeOutCubic);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* backgrounds (world) */}
      <div style={world}>
        <div style={{position: 'absolute', left: -400, top: -400, width: 1680, height: 2000, background: SET.map.bg}} />
        <div style={{position: 'absolute', left: ST_B.x, top: -400, width: 640, height: 2000, background: SET.calypso.bg}} />
        <div style={{position: 'absolute', left: ST_B.x + 640, top: -400, width: 640, height: 2000, background: SET.circe.bg}} />
        <div style={{position: 'absolute', left: ST_C.x, top: -400, width: 1800, height: 2400, background: SET.ithaca.bg}} />
        {/* Ithaca ground + hill, station (c) coordinates: starts at station x 0, top edge runs under the house (y ≈ 600) and bends up into the hill;
            runs down to station y 1400, so its lower edge is never on screen (pan 2 slides station (c) down into view from above: lowest visible station y is 1020).
            Clipped to the Ithaca sheet: otherwise its stroke and shadow peek in at the right edge of station (b), frames 219–360 */}
        <div style={{position: 'absolute', left: ST_C.x, top: -400, width: 1800, height: 2400, overflow: 'hidden'}}>
          <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: ST_C.y + 400, overflow: 'visible', filter: SHADOW}}>
            <path d={`${GROUND_TOP}V1400H0Z`} fill={SET.ithaca.shape} />
            <path d={GROUND_TOP} fill="none" stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <Grain />
      {/* content (world) */}
      <div style={world}>
        <StationA N={N} />
        <StationB N={N} p1={p1} camX={camX} />
        <StationC N={N} />
      </div>
      <PaperWipe p={wipe} color={SET.map.bg} from="top" />
    </AbsoluteFill>
  );
};

// ======================================================================== (a) map
const StationA: React.FC<{N: number}> = ({N}) => {
  const t = easeInOutPow(1.4)(clamp01((N - 1) / (B.s02a - 1)));
  const k = {x: BOAT_A[0] + (BOAT_B[0] - BOAT_A[0]) * t, y: BOAT_A[1] + (BOAT_B[1] - BOAT_A[1]) * t};
  const boatRot = rock(N, 2, 70);
  const nod = N >= B.s01b - 2 ? 3 * Math.sin(clamp01((N - B.s01b + 2) / 14) * Math.PI) : 0; // head reacts when the ETA flips
  // boat box: Boat s=.42 → 302×218, keel centre at local (149, 210)
  const s = 0.42;
  return (
    <>
      <div style={{position: 'absolute', left: CH.x, top: CH.y, width: CH.w, height: CH.h, transform: `rotate(${CH.rot}deg)`}}>
        <PhotoPrint src={IMG('chart_rijks_NG-501-52.jpg')} x={0} y={0} w={CH.w} h={CH.h} />
        <div style={{position: 'absolute', left: 0, top: 0, width: CH.w, height: CH.h}}>
          <DottedPath d={ROUTE.d} N={N} speed={0.5} width={7} />
        </div>
        <Pin x={TROY[0]} y={TROY[1]} label="TROY" dx={-84} dy={-36} />
        <Pin x={ITHACA[0]} y={ITHACA[1]} label="ITHACA" dx={-118} dy={-34} />
        {/* Odysseus in his boat, keel on the route */}
        <Boat x={k.x - 149} y={k.y - 210} s={s} rot={boatRot}>
          <PaperCharacter variant="hero" x={22} y={-46} h={280} cropY={440} head={nod} armR={4 * Math.sin(N / 22)} />
        </Boat>
      </div>
      <EtaCard N={N} t={t} />
    </>
  );
};

const Pin: React.FC<{x: number; y: number; label: string; dx: number; dy: number}> = ({x, y, label, dx, dy}) => (
  <>
    <div style={{position: 'absolute', left: x - 11, top: y - 11, width: 22, height: 22, borderRadius: 11, background: C.pink, border: '4px solid #fff', boxSizing: 'border-box', filter: SHADOW_S}} />
    <div style={{position: 'absolute', left: x + dx, top: y + dy, background: C.cream2, border: '4px solid #fff', padding: '3px 8px', fontFamily: FONT, fontWeight: 900, fontSize: 15, letterSpacing: 1.5, color: C.navy, filter: SHADOW_S}}>{label}</div>
  </>
);

const EtaCard: React.FC<{N: number; t: number}> = ({N, t}) => {
  const n = N - B.s01a;
  if (n < 0) return null;
  const q = t;
  return (
    <ExampleCard x={760} y={112} w={440} h={232} rot={4} n={n} label="TRIP HOME">
      <div style={{position: 'absolute', left: 22, top: 78, fontFamily: FONT, fontWeight: 800, fontSize: 18, letterSpacing: 2, color: C.grey}}>ETA</div>
      <div style={{position: 'absolute', left: 74, top: 74}}>
        <SplitFlap seq={['3 DAYS', '? DAYS', '?? YEARS', '10 YEARS']} flips={[B.s01b, B.s01b + 7, B.s01b + 14]} n={N} w={312} h={88} size={56} />
      </div>
      {/* generic route progress: track + moving dot (follows the boat) */}
      <div style={{position: 'absolute', left: 22, right: 22, top: 182, height: 6, borderRadius: 3, background: C.rule}} />
      <div style={{position: 'absolute', left: 22, top: 182, width: 370 * (0.08 + 0.1 * q), height: 6, borderRadius: 3, background: C.pink}} />
      <div style={{position: 'absolute', left: 22 + 370 * (0.08 + 0.1 * q) - 9, top: 176, width: 18, height: 18, borderRadius: 9, background: C.pink, border: '3px solid #fff', boxSizing: 'border-box'}} />
    </ExampleCard>
  );
};

// ======================================================================== (b) booking cards + Odysseus the houseguest
// Odysseus stands world-fixed at the centre of station (b), suitcase in his left hand; HOUSEGUEST lands on his tunic as a badge.
// PaperCharacter draws its 380×(cropY+20) viewBox into w × h·cropY/540, so 1 symbol unit = HB.sp px, centred horizontally (heroPt).
// Half-length figure: head and badge stay above y 620 (YouTube draws its optional captions and controls over y 620–720), the body runs off the
// bottom edge. `bottom` is where the body's flat bottom edge (symbol y 540, white border included) would be; at 800 it stays below y 720 in every
// frame (hop lift 48 px + lean 5° around the chest raise a bottom corner by about 66 px, so the highest it gets on screen is about 734).
const HB = (() => {
  const h = 620, cropY = 540, bottom = 800;
  const w = (h * 380) / 540, sp = (h / 540) * (cropY / (cropY + 20));
  const y = bottom + (20 * h) / 540 - (h * cropY) / 540;
  const x = 640 - (w - 380 * sp) / 2 - 195 * sp; // body centre (symbol x 195) at station x 640
  return {h, cropY, w, sp, x, y, bottom};
})();
/** symbol (u, v) of the hero body → station px */
const heroPt = (u: number, v: number) => ({x: HB.x + (HB.w - 380 * HB.sp) / 2 + u * HB.sp, y: HB.y - (20 * HB.h) / 540 + (v + 20) * HB.sp});
const CHEST = heroPt(195, 330); // badge centre: upper chest, bottom of the badge stays above y 620 through the landing dips
const GRIP = {u: 44, v: 508, pivot: [62, 350] as [number, number]}; // left fist, shoulder pivot (BODIES.hero.armL)
const ARM_L = -74; // left arm held out to the side so the whole suitcase hangs inside the frame (case bottom stays above y 720 by a margin)
const HOP = {a: B.s02c + 5, len: 14, dx: 70, h: 48}; // take-off 314, lands 328
const BADGE_S = 0.58; // HOUSEGUEST size 36 → badge ≈ 21 px type
/** damped swing kicked at frame f */
const kick = (N: number, f: number, amp: number, period = 22, decay = 18) => (N >= f ? amp * Math.sin(((N - f) / period) * Math.PI * 2) * Math.exp(-(N - f) / decay) : 0);
const bumpAt = (N: number, f: number, amp: number, len = 8) => (N >= f && N < f + len ? amp * Math.sin(((N - f) / len) * Math.PI) : 0);

const StationB: React.FC<{N: number; p1: number; camX: number}> = ({N, p1, camX}) => {
  const bump = (f: number) => (N >= f ? 2.2 * Math.sin(clamp01((N - f) / 12) * Math.PI * 2) * (1 - clamp01((N - f) / 12)) : 0);
  const tagJiggle = bump(B.s02b) + bump(B.s02c);
  const ox = ST_B.x;

  // ---- hop (S02.c3): anticipation dip 310–314, air 314–328 on a parabola, landing dip
  const u = clamp01((N - HOP.a) / HOP.len);
  const air = N >= HOP.a && N < HOP.a + HOP.len;
  const hx = HOP.dx * u;
  const hy = air ? -4 * HOP.h * u * (1 - u) : 0;
  const antic = N >= HOP.a - 4 && N < HOP.a ? 4 * Math.sin(((N - HOP.a + 4) / 4) * (Math.PI / 2)) : N >= HOP.a && N < HOP.a + 3 ? 4 * (1 - (N - HOP.a) / 3) : 0;
  const land = bumpAt(N, HOP.a + HOP.len, 3, 7);
  const dy = hy + antic + land + bumpAt(N, PAN1.a + PAN1.len, 4, 7); // + jolt when the badge lands (223)
  const lean = (N >= HOP.a - 4 && N < HOP.a ? (-1.5 * (N - HOP.a + 4)) / 4 : 0) + (air ? 5 * Math.sin(Math.PI * u) - 1.5 * Math.pow(1 - u, 3) : 0) + kick(N, HOP.a + HOP.len, -1.5, 16, 10);

  // ---- head: mirrored (facing right) → flips to Calypso (left) at S02.c2 → flips back to Circe (right) at S02.c3
  const f1 = prog(N, B.s02b + 1, 6, easeInOutPow(2));
  const f2 = prog(N, B.s02c, 6, easeInOutPow(2));
  const headFlip = -1 + 2 * f1 - 2 * f2;
  const headTilt = -7 * f1 + 13 * f2 + bumpAt(N, B.s02b - 20, 3, 10) + bumpAt(N, B.s02b + 34, -3, 10) + kick(N, HOP.a + HOP.len, 3, 14, 10) + bumpAt(N, B.s02c + 31, 3, 10);
  const headTurn = 0.8 + 0.2 * Math.abs(headFlip);

  // ---- left arm with the suitcase: swings on speech beats; the case hangs plumb and lags (pendulum)
  // negative = the case lifts first, so it never dips toward the bottom edge
  const armBeats: Array<[number, number]> = [[PAN1.a, -5], [PAN1.a + PAN1.len, -4], [B.s02b, -7], [B.s02b + 34, -4], [HOP.a + HOP.len, -4], [B.s02c + 31, -4]];
  const armL = ARM_L + armBeats.reduce((acc, [f, a]) => acc + kick(N, f, a), 0);
  const swing = armBeats.reduce((acc, [f, a]) => acc + kick(N, f + 3, -1.6 * a), 0) + kick(N, HOP.a, 14, 18, 16) + kick(N, HOP.a + HOP.len, -8, 18, 20);
  const ar = (-armL * Math.PI) / 180; // PaperCharacter rotates armL by −armL (SVG, clockwise +)
  const gu = GRIP.pivot[0] + (GRIP.u - GRIP.pivot[0]) * Math.cos(ar) - (GRIP.v - GRIP.pivot[1]) * Math.sin(ar);
  const gv = GRIP.pivot[1] + (GRIP.u - GRIP.pivot[0]) * Math.sin(ar) + (GRIP.v - GRIP.pivot[1]) * Math.cos(ar);
  const grip = heroPt(gu, gv);

  // ---- HOUSEGUEST: slaps at S02.c1 right of the boat (clear of station a's figure), rides pan 1 (position, height and scale
  //      ease onto his chest), then sticks to the tunic
  const riding = N < PAN1.a + PAN1.len;
  const lead = 260 * (1 - p1) + 40 * Math.sin(Math.PI * p1);
  const badge = (x: number, y: number, k: number) => (
    <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, transform: `translate(${x}px, ${y}px) scale(${k})`}}>
      <PaperTag text="HOUSEGUEST" x={0} y={0} rot={-6 + tagJiggle} size={36} n={N - B.s02a} bg={C.yellow} color={C.navy} />
    </div>
  );

  // ---- hop arc: yellow dots above his head, from where he stands to where he lands. Its ends sit 14 px above the head top at the peak of the
  //      hop (head top − HOP.h), its apex RISE higher: y ≈ 105, below the HUD row (y ≥ 100)
  const RISE = 28;
  const top = heroPt(195, -6).y - HOP.h - 14;
  const a0: [number, number] = [ox + 640 - 26, top], a1: [number, number] = [ox + 640 + HOP.dx + 20, top];
  const arc = `M${a0[0]} ${a0[1]}Q${(a0[0] + a1[0]) / 2} ${top - 2 * RISE} ${a1[0]} ${a1[1]}`;
  const back = Math.atan2(-2 * RISE, -(a1[0] - a0[0]) / 2); // reverse end tangent of the quadratic
  const tip = (k: number) => `${a1[0] + 18 * Math.cos(back + k)} ${a1[1] + 18 * Math.sin(back + k)}`;
  const arrow = `M${tip(-0.52)}L${a1[0]} ${a1[1]}L${tip(0.52)}`;

  return (
    <>
      {/* cards moved from (95, 135) / (845, 135): left 20 px out and 25 up, right 30 px out and 20 up, to clear the wider half-length body, the raised arm and the hop landing */}
      <BookingCard x={ox + 75} y={110} rot={-4 + bump(B.s02c) * 0.6} n={N - B.s02b} dir={-1} img="calypso_rijks_RP-P-1975-75-49_crop.jpg" pos="50% 8%" title="CALYPSO'S ISLAND" big="7 YEARS" />
      <BookingCard x={ox + 875} y={115} rot={4} n={N - B.s02c} dir={1} img="circe_met253627_crop.jpg" pos="70% 30%" title="CIRCE'S PALACE" big="1 YEAR" />
      <div style={{position: 'absolute', left: 0, top: 0}}>
        <DottedPath d={arc} N={N} reveal={prog(N, B.s02c - 1, 10, easeOutCubic)} speed={0.5} width={7} arrow={arrow} />
      </div>
      <div style={{position: 'absolute', left: ox, top: 0, width: 1280, height: 720, transformOrigin: `640px ${CHEST.y}px`, transform: `translate(${hx}px, ${dy}px) rotate(${lean}deg)`}}>
        <Suitcase x={grip.x} y={grip.y} rot={swing - lean} />
        <PaperCharacter variant="hero" x={HB.x} y={HB.y} h={HB.h} cropY={HB.cropY} head={headTilt} headTurn={headTurn} headFlip={headFlip} armL={armL} armR={-3 + kick(N, B.s02b, 3, 26, 20) + kick(N, HOP.a, -5, 20, 14)} />
        {riding ? null : badge(CHEST.x, CHEST.y, BADGE_S)}
      </div>
      {riding ? badge(camX + 640 + lead, 440 + (CHEST.y - 440) * p1, 1 + (BADGE_S - 1) * p1) : null}
    </>
  );
};

/** Small paper suitcase hanging from a fist at (x, y) (station px): terracotta case, cream straps, white paper border, hard shadow. */
const Suitcase: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
  <div style={{position: 'absolute', left: x - 50, top: y - 10, width: 100, height: 84, filter: SHADOW}}>
    <svg width={100} height={84} viewBox="-50 -10 100 84" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transform: `rotate(${rot}deg)`, transformOrigin: '50px 10px'}}>
      <path d="M-12 22V4Q-12 -3 -5 -3H5Q12 -3 12 4V22" fill="none" stroke="#fff" strokeWidth={12} strokeLinejoin="round" />
      <path d="M-12 22V4Q-12 -3 -5 -3H5Q12 -3 12 4V22" fill="none" stroke={C.navy} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-44} y={18} width={88} height={48} rx={8} fill={SET.troy.bg} stroke="#fff" strokeWidth={7} />
      <rect x={-28} y={21} width={9} height={42} fill={C.cream2} />
      <rect x={19} y={21} width={9} height={42} fill={C.cream2} />
      <rect x={-40} y={38} width={80} height={3} fill={C.heroLine} opacity={0.35} />
      <circle cx={0} cy={51} r={6.5} fill={C.yellow} stroke="#fff" strokeWidth={2.5} />
    </svg>
  </div>
);

const BookingCard: React.FC<{x: number; y: number; rot: number; n: number; dir: 1 | -1; img: string; pos: string; title: string; big: string}> = ({x, y, rot, n, dir, img, pos, title, big}) => {
  if (n < 0) return null;
  return (
    <ExampleCard x={x} y={y} w={340} h={420} rot={rot} n={n} dir={dir} face={C.card}>
      <div style={{position: 'absolute', left: 14, top: 14, width: 286, height: 204, overflow: 'hidden', background: '#ddd'}}>
        <Img src={IMG(img)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
      </div>
      <div style={{position: 'absolute', left: 0, width: 314, top: 236, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 22, letterSpacing: 1.5, color: C.navy, whiteSpace: 'nowrap'}}>{title}</div>
      <div style={{position: 'absolute', left: 14, right: 14, top: 274, height: 3, background: C.rule}} />
      <div style={{position: 'absolute', left: 0, width: 314, top: 286, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 76, lineHeight: 1, letterSpacing: -4, color: C.graphite}}>{big}</div>
    </ExampleCard>
  );
};

// ======================================================================== (c) Ithaca
const DOOR = {x: 220, y: 250, w: 420, h: 362};
const StationC: React.FC<{N: number}> = ({N}) => {
  const ox = ST_C.x, oy = ST_C.y;
  const open = prog(N, B.s03a + 1, 22, easeInOutPow(2.2)); // doors swing open as the camera arrives (pan 355–391)
  const roll = 108 * easeOutCubic(clamp01((N - B.s03b) / 22));
  return (
    <div style={{position: 'absolute', left: ox, top: oy, width: 1280, height: 720}}>
      {/* contact shadow: the house base stands on the ground (GROUND_TOP, behind the house at y ≈ 596–603), light from the upper left */}
      <div style={{position: 'absolute', left: 134, top: 604, width: 640, height: 26, borderRadius: 13, background: 'rgba(22,21,31,0.34)', filter: 'blur(5px)'}} />
      {/* house front */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, filter: SHADOW}}>
        <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <path d="M96 196 430 100 764 196Z" fill={SET.troy.bg} stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
          <rect x={124} y={190} width={612} height={422} fill={C.cream2} stroke="#fff" strokeWidth={10} />
          <rect x={DOOR.x - 12} y={DOOR.y - 12} width={DOOR.w + 24} height={DOOR.h + 12} fill={SET.ithaca.night} />
          <circle cx={430} cy={152} r={20} fill={C.cream} stroke="#fff" strokeWidth={6} />
          {/* threshold slab in front of the doorway, on the ground */}
          <rect x={DOOR.x - 22} y={612} width={DOOR.w + 44} height={20} rx={3} fill={C.cream} stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
        </svg>
      </div>
      {/* interior seen through the doorway */}
      <div style={{position: 'absolute', left: DOOR.x, top: DOOR.y, width: DOOR.w, height: DOOR.h, overflow: 'hidden', background: SET.ithaca.night}}>
        <Feast N={N} />
      </div>
      {/* doors */}
      <div style={{position: 'absolute', left: DOOR.x, top: DOOR.y, width: DOOR.w, height: DOOR.h, perspective: 900}}>
        <DoorLeaf side="l" a={open} />
        <DoorLeaf side="r" a={open} />
      </div>
      {/* +96 chip at the far end of the table */}
      <div style={{position: 'absolute', left: 430, top: 300, width: 0, height: 0}}>
        <div style={{position: 'absolute', transform: 'translate(-50%, -50%)', filter: SHADOW_S}}>
          <div style={{...slapCss(N - (B.s03b - 3), -5), background: C.pink, border: '6px solid #fff', borderRadius: 30, padding: '6px 16px', fontFamily: FONT, fontWeight: 900, fontSize: 30, color: '#fff'}}>+96</div>
        </div>
      </div>
      {/* counter card */}
      {N >= B.s03b ? (
        <ExampleCard x={805} y={135} w={395} h={252} rot={3} n={N - B.s03b} label="GUESTS">
          <div style={{position: 'absolute', left: 54, top: 78}}>
            <Counter value={roll} digits={3} size={132} color={C.graphite} />
          </div>
        </ExampleCard>
      ) : null}
    </div>
  );
};

const DoorLeaf: React.FC<{side: 'l' | 'r'; a: number}> = ({side, a}) => {
  const deg = 86 * a * (side === 'l' ? 1 : -1); // opens inward (free edge moves away), stays inside the doorway
  return (
    <div style={{position: 'absolute', left: side === 'l' ? 0 : DOOR.w / 2, top: 0, width: DOOR.w / 2, height: DOOR.h, transformOrigin: side === 'l' ? '0% 50%' : '100% 50%', transform: `rotateY(${deg}deg)`, background: SET.ithaca.shape, border: '6px solid #fff', boxSizing: 'border-box', backgroundImage: 'repeating-linear-gradient(90deg, rgba(48,48,57,0) 0 48px, rgba(48,48,57,0.22) 48px 51px)'}}>
      <div style={{position: 'absolute', top: DOOR.h / 2 - 10, left: side === 'l' ? DOOR.w / 2 - 34 : 18, width: 16, height: 16, borderRadius: 8, background: C.yellow, border: '3px solid #fff'}} />
    </div>
  );
};

/** Long feast table running into depth, 12 suitors (4 shared heads), plates that empty one by one from S03.c3. */
const Feast: React.FC<{N: number}> = ({N}) => {
  // local coords of the doorway box (420×362). near edge y 352, far edge y 112
  const seats: Array<{t: number; side: 1 | -1; i: number}> = [];
  for (let i = 0; i < 6; i++) {
    seats.push({t: i / 5, side: -1, i: i * 2});
    seats.push({t: i / 5, side: 1, i: i * 2 + 1});
  }
  const yAt = (t: number) => 350 - 236 * t;
  const xEdge = (t: number, side: 1 | -1) => 210 + side * (180 - 150 * t);
  const hAt = (t: number) => 128 - 84 * t;
  // plates empty one by one, near ones first, every 2 frames
  const order = [...seats].sort((p, q) => p.t - q.t || p.side - q.side);
  const eatenAt = (i: number) => B.s03c + 2 * order.findIndex((s) => s.i === i);
  const far = [...seats].sort((p, q) => q.t - p.t);
  const raiser = 5; // right side, third seat (clear of the door leaf) raises the drumstick
  const raise = prog(N, B.s03c, 7, easeOutCubic);
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 0, width: 420, height: 112, background: '#2C3E47'}} />
      <svg width={420} height={362} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={`M${xEdge(0, -1) + 16} 362 L${xEdge(1, -1) + 8} ${yAt(1) - 6} L${xEdge(1, 1) - 8} ${yAt(1) - 6} L${xEdge(0, 1) - 16} 362Z`} fill={C.hull} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
      </svg>
      {far.map((st) => {
        const y = yAt(st.t), h = hAt(st.t);
        const xe = xEdge(st.t, st.side);
        const plateX = xe - st.side * h * 0.32;
        const eaten = clamp01((N - eatenAt(st.i)) / 4);
        const food = 1 - eaten;
        const isRaiser = st.i === raiser;
        return (
          <React.Fragment key={st.i}>
            {/* plate on the table */}
            <svg width={420} height={362} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <ellipse cx={plateX} cy={y + h * 0.06} rx={h * 0.24} ry={h * 0.09} fill="#fff" stroke="#E7E1D3" strokeWidth={2} />
              {food > 0.01 && !isRaiser ? (
                <g transform={`translate(${plateX} ${y + h * 0.03}) scale(${food * h * 0.017})`}>
                  <ellipse cx={-3} cy={0} rx={9} ry={6} fill="#B9774A" />
                  <path d="M4 -2 12 -6" stroke="#F3E9D2" strokeWidth={4} strokeLinecap="round" />
                </g>
              ) : null}
            </svg>
            <div style={{position: 'absolute', left: 0, top: 0, filter: SHADOW_S}}>
              <CrowdFigure
                head={SUITOR_HEADS[st.i % 4]}
                cx={xe + st.side * h * 0.42}
                by={y + h * 0.42}
                h={h}
                tunic={TUNICS[st.i % TUNICS.length]}
                headTilt={isRaiser ? -6 * raise : (st.i % 3) - 1 + (N >= eatenAt(st.i) && N < eatenAt(st.i) + 8 ? 3 * Math.sin(((N - eatenAt(st.i)) / 8) * Math.PI) : 0)}
                arm={isRaiser ? 75 * (1 - raise) : undefined}
                flip={st.side === 1}
              >
                {isRaiser ? (
                  <g transform="rotate(-20)">
                    <path d="M0 0 0 -14" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
                    <path d="M0 0 0 -14" stroke="#F3E9D2" strokeWidth={5} strokeLinecap="round" />
                    <ellipse cx={0} cy={-26} rx={11} ry={15} fill="#B9774A" stroke="#fff" strokeWidth={3} />
                  </g>
                ) : null}
              </CrowdFigure>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};


