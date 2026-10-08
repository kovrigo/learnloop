/**
 * LearnLoop paper-collage style library (brand/brandbook.md, approved frames brand/examples/V1–V3,
 * frame code reference/mockups/make_scenes.py + make_revised.py). Every shot group imports from here.
 *
 * Rules carried by these pieces:
 * - flat background + static paper grain (36% overlay), no backdrop, no glow;
 * - cut-outs: white paper border + hard shadow (dx 8, dy 13, σ 8, #16151F at 27%);
 * - entrances "slap" (scale 1.15 → 1, ±4° → rest in 6 frames, 4-frame settle), exits "peel" or a paper wipe;
 * - type: Inter (OFL). Black for big words (letter-spacing −4 at 70 px+), ExtraBold / Bold for labels.
 * All animation is a pure function of the frame number passed in (n = N − f0).
 */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp01, easeOutCubic, easeInOutPow} from './common';

// ---------------------------------------------------------------- palette / type
export const FONT = `'Inter', 'Helvetica Neue', Arial, sans-serif`;
export const C = {
  cream: '#FAF7EE', // paper, bubbles, cards
  cream2: '#F7E9D7', // tags
  card: '#F5F7F1', // example-card face (V2)
  white: '#FFFFFF',
  graphite: '#303039', // text
  navy: '#263C54', // text
  ink: '#354459', // card labels
  grey: '#67717D',
  rule: '#D0D4D4',
  yellow: '#FFE38B', // dotted lines, arrows
  pink: '#E881A0', // pin, warning
  pinkText: '#E26B8C',
  hud: '#FFFDF3', // source label
  shadow: '#16151F',
  heroRobe: '#4C8AAC',
  heroLine: '#193650',
  penelope: '#8C647B',
  cyclops: '#BF7780',
  skin: '#E4B89B',
  hull: '#E8C394',
  sail: '#E4E1CA',
  hullEdge: '#F7F3E9',
} as const;
/** Backgrounds by setting (storyboard "Palette by setting"). */
export const SET = {
  map: {bg: '#8DB9D3', accent: '#FFE38B'},
  troy: {bg: '#C9785B', shape: '#E8D9B8'},
  ithaca: {bg: '#D9D3B7', shape: '#9CAE91', sun: '#F3D98C', night: '#344B55'},
  cave: {bg: '#D681A1', shape: '#303039', accent: '#685462'},
  sea: {sky: '#8DB9D3', water: '#3E7899', deep: '#285F80', foam: '#C8E8EA'},
  night: {bg: '#2F3E5C', accent: '#E0B54A'},
  feast: {bg: '#8C647B', accent: '#E0B54A'},
  circe: {bg: '#B7A6D9', shape: '#6E5470'},
  sirens: {bg: '#7FC4C0', shape: '#2C6E73'},
  calypso: {bg: '#A8D5C2', shape: '#3E7899'},
  gods: {bg: '#E8D27A', shape: '#FAF7EE'},
  loop: {bg: '#EFE8DA', ink: '#263C54', accent1: '#E881A0', accent2: '#3E7899'},
} as const;

/** Background shapes shared across shot boundaries (so a wipe can hand over seamlessly). */
export const SHAPES = {
  troySand: 'M0 560Q180 520 380 548T780 552 1280 530V720H0Z',
} as const;

export const IMG = (file: string) => staticFile(`assets/odyssey/img/${file}`);
/** Hard shadow as a CSS filter (feDropShadow stdDeviation 8 = CSS blur radius 16). Put it on a wrapper, one per group. */
export const SHADOW = 'drop-shadow(8px 13px 16px rgba(22,21,31,0.27))';
export const SHADOW_S = 'drop-shadow(4px 7px 8px rgba(22,21,31,0.25))'; // small cut-outs (crowd, tiny ships)

let uid = 0;
/** Stable per-instance id for SVG clip/mask ids (React's useId has colons, which break url(#…)). */
export const usePaperId = (p: string) => {
  const ref = React.useRef<string | null>(null);
  if (ref.current === null) ref.current = `${p}${uid++}`;
  return ref.current;
};

// ---------------------------------------------------------------- motion helpers
export type Slap = {op: number; s: number; r: number};
/** Slap-in: n = N − f0. Before f0 hidden; 0–6 scale 1.15 → 1 and ±4° → 0 (easeOut); 6–10 settle wobble; then rest. */
export const slap = (n: number, dir: 1 | -1 = 1): Slap => {
  if (n < 0) return {op: 0, s: 1.15, r: 4 * dir};
  if (n < 6) {
    const t = easeOutCubic(n / 6);
    return {op: Math.min(1, (n + 1) / 2), s: 1.15 - 0.15 * t, r: 4 * dir * (1 - t)};
  }
  if (n < 10) {
    const u = (n - 6) / 4;
    const w = Math.sin(u * Math.PI) * (1 - 0.4 * u);
    return {op: 1, s: 1 - 0.014 * w, r: -1.3 * dir * w};
  }
  return {op: 1, s: 1, r: 0};
};
/** CSS for a slapped element: rest rotation `rot`, extra transform appended. */
export const slapCss = (n: number, rot = 0, dir: 1 | -1 = 1, extra = ''): React.CSSProperties => {
  const k = slap(n, dir);
  return {opacity: k.op, transform: `${extra} rotate(${rot + k.r}deg) scale(${k.s})`};
};
/** Peel exit: n = N − exitStart, len = frames until the shot's last frame inclusive (α reaches 0 on the last frame). */
export const peel = (n: number, len = 8, dir: 1 | -1 = -1) => {
  if (n < 0) return {op: 1, r: 0, dx: 0};
  const t = clamp01((n + 1) / len);
  return {op: 1 - Math.pow(t, 1.5), r: 6 * dir * t, dx: 30 * dir * t};
};
export const peelCss = (n: number, len = 8, dir: 1 | -1 = -1): React.CSSProperties => {
  const p = peel(n, len, dir);
  return {opacity: p.op, transform: `translateX(${p.dx}px) rotate(${p.r}deg)`};
};
/** Eased 0→1 over [a, a+len]. */
export const prog = (N: number, a: number, len: number, ease: (t: number) => number = easeInOutPow(2.5)) => ease(clamp01((N - a) / len));
/** Gentle rocking for things on water (boats only — never use as idle float on still objects). */
export const rock = (N: number, amp = 2, period = 64, phase = 0) => amp * Math.sin(((N + phase) / period) * Math.PI * 2);
/** Smooth closed/open path through points (Catmull-Rom → cubic Bézier). */
export const smoothPath = (pts: Array<[number, number]>, closed = false) => {
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  const end = closed ? pts.length : pts.length - 1;
  for (let i = 1; i <= end; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return closed ? d + 'Z' : d;
};

/** Dense samples of the same curve as smoothPath(pts) (open), with arc-length lookup: at(t 0..1) → {x, y, a (deg)}. */
export const samplePath = (pts: Array<[number, number]>, per = 24) => {
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  const out: Array<[number, number]> = [];
  for (let i = 1; i < P.length - 2; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let k = 0; k < per; k++) {
      const t = k / per, u = 1 - t;
      out.push([u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0], u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1]]);
    }
  }
  out.push(pts[pts.length - 1]);
  const L = [0];
  for (let i = 1; i < out.length; i++) L.push(L[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  const total = L[L.length - 1];
  const at = (t01: number) => {
    const s = clamp01(t01) * total;
    let lo = 0, hi = L.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (L[m] <= s) lo = m; else hi = m;
    }
    const f = L[hi] > L[lo] ? (s - L[lo]) / (L[hi] - L[lo]) : 0;
    const x = out[lo][0] + (out[hi][0] - out[lo][0]) * f, y = out[lo][1] + (out[hi][1] - out[lo][1]) * f;
    const a = (Math.atan2(out[hi][1] - out[lo][1], out[hi][0] - out[lo][0]) * 180) / Math.PI;
    return {x, y, a};
  };
  return {d: smoothPath(pts), at, total};
};

// ---------------------------------------------------------------- background
/** Static grain tile (public/assets/odyssey/img/paper_grain.png), 36% overlay. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.36}) => (
  <AbsoluteFill style={{backgroundImage: `url(${IMG('paper_grain.png')})`, backgroundRepeat: 'repeat', backgroundSize: '256px 256px', opacity, pointerEvents: 'none'}} />
);
/** Flat full-frame background + grain. */
export const PaperBg: React.FC<{color: string; children?: React.ReactNode; grain?: number}> = ({color, children, grain = 0.36}) => (
  <AbsoluteFill style={{background: color}}>
    {children}
    <Grain opacity={grain} />
  </AbsoluteFill>
);

/**
 * PaperWipe: a new background sheet slides over the frame. p 0→1 (pass an eased value); at p = 1 the frame is fully covered.
 * from: edge the sheet comes from. Children are drawn on the sheet (e.g. the next scene's first shapes).
 */
export const PaperWipe: React.FC<{p: number; color: string; from?: 'top' | 'bottom' | 'left' | 'right'; children?: React.ReactNode}> = ({p, color, from = 'right', children}) => {
  if (p <= 0) return null;
  const q = clamp01(p);
  const off = 1 - q;
  const pad = 60;
  const tx = from === 'left' ? -off * (1280 + 2 * pad) : from === 'right' ? off * (1280 + 2 * pad) : 0;
  const ty = from === 'top' ? -off * (720 + 2 * pad) : from === 'bottom' ? off * (720 + 2 * pad) : 0;
  const rot = (from === 'left' || from === 'bottom' ? -1 : 1) * 2.5 * off;
  return (
    <div style={{position: 'absolute', left: -pad, top: -pad, width: 1280 + 2 * pad, height: 720 + 2 * pad, transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg)`, background: color, boxShadow: q < 1 ? '0 0 26px 6px rgba(22,21,31,0.28)' : undefined, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: pad, top: pad, width: 1280, height: 720}}>
        {children}
        <Grain />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- characters
type HeadSpec = {file: string; x: number; y: number; w: number; h: number; vbW: number; vbH: number; clip: string; stroke: number; band?: boolean};
type BodySpec = {border: string; borderW: number; borderJoin: 'round' | 'bevel'; robe: string; robeFill: string; robeLine: string; collar?: React.ReactNode; neck?: React.ReactNode; armL?: {d: string; hand?: string; pivot: [number, number]; mode: 'fill' | 'stroke'}; armR?: {d: string; hand?: string; pivot: [number, number]; mode: 'fill' | 'stroke'}; neckPivot: [number, number]; head: HeadSpec};

// Clip paths, bodies and head boxes copied from reference/mockups/make_scenes.py (approved V1–V3).
// Heads: the Met originals (255427 511×700, 252511 525×700, 249052 1744×2000) drawn into the mockup viewBoxes (aspect within 0.1%).
const CLIP_MAN = 'M70 62Q114 10 224 13Q347 10 411 73L443 174 450 261 437 354 409 442 369 508 297 567 229 605 174 574 114 533 61 462 26 382 15 277 31 172Z';
const CLIP_WOMAN = 'M168 101Q223 67 293 83Q383 83 422 149L441 248 416 353 378 449 338 548 269 585 207 553 157 470 116 354 117 222Z';
const CLIP_GIANT = 'M101 24Q189 -12 293 20Q401 34 447 134L454 242 422 347 366 456 262 559 181 548 89 476 22 350 9 223 48 97Z';
export const BODIES: Record<'hero' | 'penelope' | 'cyclops', BodySpec> = {
  hero: {
    border: 'M23 540 35 391 60 320 113 289 123 237 271 233 286 283 329 311 363 387 377 540Z', borderW: 25, borderJoin: 'round',
    robe: 'M34 550 42 378Q53 320 118 283L270 279Q338 316 355 385L373 550Z', robeFill: C.heroRobe, robeLine: C.heroLine,
    collar: <path d="M99 291 191 357 281 288 257 429 128 429Z" fill="#f0e3cd" stroke="#193650" strokeWidth={5} />,
    neck: <path d="M120 238h151v55l-73 46-78-48Z" fill="#dbc0a0" />,
    armL: {d: 'M38 361Q15 391 0 483L38 500 76 410', hand: 'M53 498q-23-14-31-1t18 24l26 4', pivot: [62, 350], mode: 'fill'},
    armR: {d: 'M340 349q43 48 37 146l-41 11-29-89', hand: 'M337 499q28-18 41-3t-20 28l-29 3', pivot: [328, 342], mode: 'fill'},
    neckPivot: [195, 282],
    head: {file: 'odysseus_met255427.jpg', x: 79, y: -4, w: 225, h: 303, vbW: 456, vbH: 625, clip: CLIP_MAN, stroke: 29},
  },
  penelope: {
    border: 'M18 540 35 359 85 293 126 269 139 239 264 243 279 274 327 303 360 381 378 540Z', borderW: 24, borderJoin: 'round',
    robe: 'M22 550 40 370Q62 297 131 268L263 266Q345 298 363 378L381 550Z', robeFill: C.penelope, robeLine: '#472e4c',
    collar: <path d="M135 268 194 330 259 270" fill="none" stroke="#f0cf9f" strokeWidth={13} />,
    armL: {d: 'M53 382 30 470 97 490', pivot: [53, 382], mode: 'stroke'},
    armR: {d: 'M332 376l32 108-70 23', pivot: [332, 376], mode: 'stroke'},
    neckPivot: [195, 262],
    head: {file: 'penelope_met249052.jpg', x: 77, y: -13, w: 235, h: 283, vbW: 545, vbH: 625, clip: CLIP_WOMAN, stroke: 36},
  },
  cyclops: {
    border: 'M19 540 34 369 79 302 125 278 130 237 266 238 281 273 335 306 364 389 379 540Z', borderW: 25, borderJoin: 'bevel',
    robe: 'M26 548 37 386Q53 307 126 275H265Q349 312 362 390L380 548Z', robeFill: C.cyclops, robeLine: '#553f59',
    collar: <path d="M117 302Q191 328 275 302" fill="none" stroke="#e7c89b" strokeWidth={16} strokeDasharray="29 11" />,
    neckPivot: [190, 285],
    head: {file: 'polyphemus_met252511.jpg', x: 70, y: 0, w: 240, h: 303, vbW: 468, vbH: 624, clip: CLIP_GIANT, stroke: 27, band: true},
  },
};

export type PaperCharacterProps = {
  variant: keyof typeof BODIES;
  /** top-left of the 380×540 symbol box in px, and its rendered height (width = h·380/540) */
  x: number;
  y: number;
  h: number;
  /** head tilt in degrees, pivot at the neck; headTurn 0..1 squashes the head as if turning (1 = facing viewer) */
  head?: number;
  headTurn?: number;
  /** 1 = photo as is, −1 = mirrored (head faces the other way); animate through 0 for a paper-puppet head flip */
  headFlip?: number;
  /** arm swing in degrees, pivot at the shoulder (positive = outward) */
  armL?: number;
  armR?: number;
  /** crop the body at symbol y (e.g. 430 to sit in a boat); default full */
  cropY?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
};
/** Photo head (clip path + white border) on a drawn paper body. Head and arms move on their own pivots. */
export const PaperCharacter: React.FC<PaperCharacterProps> = ({variant, x, y, h, head = 0, headTurn = 1, headFlip = 1, armL = 0, armR = 0, cropY = 540, shadow = true, style}) => {
  const b = BODIES[variant];
  const id = usePaperId(`pc${variant}`);
  const w = (h * 380) / 540;
  const hs = b.head;
  const [nx, ny] = b.neckPivot;
  const arm = (a: BodySpec['armL'], deg: number, side: 1 | -1) => {
    if (!a) return null;
    const t = `rotate(${(-side * deg).toFixed(2)} ${a.pivot[0]} ${a.pivot[1]})`;
    return a.mode === 'fill' ? (
      <g transform={t}>
        <path d={a.d} fill="none" stroke="#fff" strokeWidth={16} strokeLinejoin="round" />
        {a.hand ? <path d={a.hand} fill="none" stroke="#fff" strokeWidth={14} strokeLinejoin="round" /> : null}
        <path d={a.d} fill={C.skin} stroke={b.robeLine} strokeWidth={6} />
        {a.hand ? <path d={a.hand} fill={C.skin} stroke={b.robeLine} strokeWidth={5} /> : null}
      </g>
    ) : (
      <g transform={t}>
        <path d={a.d} fill="none" stroke="#fff" strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" />
        <path d={a.d} fill="none" stroke="#ddbfa7" strokeWidth={32} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: (h * cropY) / 540, overflow: 'visible', filter: shadow ? SHADOW : undefined, ...style}}>
      <svg width={w} height={(h * cropY) / 540} viewBox={`0 -20 380 ${cropY + 20}`} style={{position: 'absolute', left: 0, top: (-20 * h) / 540, overflow: 'visible'}}>
        <defs>
          <clipPath id={`${id}c`}>
            <path d={hs.clip} />
          </clipPath>
          <clipPath id={`${id}b`}>
            <rect x={-60} y={-60} width={500} height={cropY + 60} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}b)`}>
          <path d={b.border} fill="#fff" stroke="#fff" strokeWidth={b.borderW} strokeLinejoin={b.borderJoin} />
          <path d={b.robe} fill={b.robeFill} stroke={b.robeLine} strokeWidth={5} />
          {b.collar}
          {arm(b.armL, armL, 1)}
          {arm(b.armR, armR, -1)}
          {b.neck}
        </g>
        <g transform={`rotate(${head.toFixed(2)} ${nx} ${ny}) translate(${nx} ${ny}) scale(${((0.82 + 0.18 * headTurn) * headFlip).toFixed(3)} 1) translate(${-nx} ${-ny})`}>
          <svg x={hs.x} y={hs.y} width={hs.w} height={hs.h} viewBox={`0 0 ${hs.vbW} ${hs.vbH}`} overflow="visible">
            <path d={hs.clip} fill="white" stroke="white" strokeWidth={hs.stroke} strokeLinejoin="bevel" />
            <image href={IMG(hs.file)} width={hs.vbW} height={hs.vbH} preserveAspectRatio="none" clipPath={`url(#${id}c)`} />
            {hs.band ? (
              <>
                <path d="M66 215h342v166H66Z" fill="#41364a" stroke="#f9f4ea" strokeWidth={10} />
                <ellipse cx={236} cy={300} rx={93} ry={63} fill="#f7f4e9" />
                <ellipse cx={236} cy={300} rx={46} ry={57} fill="#7295a1" />
                <ellipse cx={236} cy={300} rx={20} ry={43} fill="#25344b" />
                <circle cx={217} cy={278} r={13} fill="white" />
              </>
            ) : null}
          </svg>
        </g>
      </svg>
    </div>
  );
};

/** Small crowd figure: a cut-out head PNG (white border baked in) on a simple paper tunic. (cx, by) = bottom centre; h = total height.
 *  arm (deg): outer arm rotation about the shoulder, 0 = raised up-and-out, ~70 = lowered; children are drawn at the hand (local 100×150 units). */
export const CrowdFigure: React.FC<{head: string; cx: number; by: number; h: number; tunic: string; line?: string; headTilt?: number; arm?: number; flip?: boolean; children?: React.ReactNode}> = ({head, cx, by, h, tunic, line = '#3b3346', headTilt = 0, arm, flip = false, children}) => {
  // local 100×150 box: head 0–78, tunic 66–150
  const s = h / 150;
  return (
    <div style={{position: 'absolute', left: cx - 50 * s, top: by - h, width: 100 * s, height: h}}>
      <svg width={100 * s} height={h} viewBox="0 0 100 150" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d="M8 150 12 104Q16 78 40 72H60Q84 78 88 104L92 150Z" fill="#fff" stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
        <path d="M11 152 15 105Q19 82 41 76H59Q81 82 85 105L89 152Z" fill={tunic} stroke={line} strokeWidth={2.2} />
        <path d="M38 77 50 92 62 77" fill="none" stroke="#f0e3cd" strokeWidth={4} />
      </svg>
      <Img src={IMG(head)} style={{position: 'absolute', left: 50 * s - 34 * s, top: -8 * s, width: 68 * s, height: 'auto', transform: `rotate(${headTilt}deg)`, transformOrigin: '50% 90%'}} />
      {arm !== undefined ? (
        <svg width={100 * s} height={h} viewBox="0 0 100 150" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined}}>
          <g transform={`rotate(${arm} 82 98)`}>
            <path d="M82 98 112 62" stroke="#fff" strokeWidth={15} strokeLinecap="round" />
            <path d="M82 98 112 62" stroke={C.skin} strokeWidth={9} strokeLinecap="round" />
            <g transform="translate(112 62)">{children}</g>
          </g>
        </svg>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------- cards, tags, bubbles
/** Paper tag: rotated cream strip, white 8 px border, Inter Black caps. (x, y) = centre. */
export const PaperTag: React.FC<{text: string; x: number; y: number; rot?: number; size?: number; n?: number; dir?: 1 | -1; bg?: string; color?: string; style?: React.CSSProperties}> = ({text, x, y, rot = -6, size = 30, n = 99, dir = 1, bg = C.cream2, color = '#4A4A4E', style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0}}>
    <div style={{position: 'absolute', left: 0, top: 0, transform: 'translate(-50%, -50%)', filter: SHADOW}}>
      <div style={{...slapCss(n, rot, dir), background: bg, border: '8px solid #fff', padding: `${Math.round(size * 0.34)}px ${Math.round(size * 0.62)}px`, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, color, whiteSpace: 'nowrap', letterSpacing: size >= 70 ? -4 : size >= 44 ? -1 : 0, textTransform: 'uppercase', ...style}}>{text}</div>
    </div>
  </div>
);

/** Example card shell (generic, no brand): card face, white 13 px border, hard shadow, optional label row with rule. */
export const ExampleCard: React.FC<{x: number; y: number; w: number; h: number; rot?: number; n?: number; dir?: 1 | -1; label?: string; face?: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({x, y, w, h, rot = 0, n = 99, dir = 1, label, face = C.card, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, filter: SHADOW, ...style}}>
    <div style={{position: 'absolute', inset: 0, ...slapCss(n, rot, dir), transformOrigin: '50% 50%'}}>
      <div style={{position: 'absolute', inset: 0, background: face, border: '13px solid #fff', boxSizing: 'border-box'}}>
        {label ? (
          <>
            <div style={{position: 'absolute', left: 22, top: 22, fontFamily: FONT, fontWeight: 900, fontSize: 20, letterSpacing: 2, color: C.ink, textTransform: 'uppercase'}}>{label}</div>
            <div style={{position: 'absolute', left: 22, right: 22, top: 60, height: 3, background: C.rule}} />
          </>
        ) : null}
        {children}
      </div>
    </div>
  </div>
);

/** Speech bubble (V1): cream, white 10 px border, tail toward the speaker; opens from the tail in 8 frames. Box (x, y, w, h); tail tip (tx, ty) in frame px. */
export const SpeechBubble: React.FC<{x: number; y: number; w: number; h: number; tx: number; ty: number; n: number; children?: React.ReactNode}> = ({x, y, w, h, tx, ty, n, children}) => {
  const t = clamp01(n / 8);
  if (n < 0) return null;
  const k = 1 - Math.pow(1 - t, 3);
  const over = t < 1 ? 1 + 0.06 * Math.sin(t * Math.PI) : 1;
  const r = 28;
  // tail on the edge nearest the tip (bottom, top, left or right)
  const lx = tx - x, ly = ty - y;
  const cx = Math.max(r + 30, Math.min(w - r - 30, lx)), cy = Math.max(r + 24, Math.min(h - r - 24, ly));
  const side = ly > h ? 'b' : ly < 0 ? 't' : lx < 0 ? 'l' : 'r';
  const d =
    `M${r} 0` + (side === 't' ? `H${cx - 26}L${lx} ${ly}L${cx + 26} 0` : '') + `H${w - r}Q${w} 0 ${w} ${r}` +
    (side === 'r' ? `V${cy - 24}L${lx} ${ly}L${w} ${cy + 24}` : '') + `V${h - r}Q${w} ${h} ${w - r} ${h}` +
    (side === 'b' ? `H${cx + 26}L${lx} ${ly}L${cx - 26} ${h}` : '') + `H${r}Q0 ${h} 0 ${h - r}` +
    (side === 'l' ? `V${cy + 24}L${lx} ${ly}L0 ${cy - 24}` : '') + `V${r}Q0 0 ${r} 0Z`;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transformOrigin: `${lx}px ${ly}px`, transform: `scale(${(k * over).toFixed(3)})`, opacity: Math.min(1, t * 3), filter: SHADOW}}>
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d={d} fill={C.cream} stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: C.graphite}}>{children}</div>
    </div>
  );
};

/** Dotted connector: yellow, width 8, dash 3/19, round caps, running dash offset. reveal 0..1 draws it on from the start. */
export const DottedPath: React.FC<{d: string; N: number; reveal?: number; speed?: number; width?: number; color?: string; arrow?: string}> = ({d, N, reveal = 1, speed = 0.6, width = 8, color = C.yellow, arrow}) => {
  const id = usePaperId('dp');
  if (reveal <= 0) return null;
  return (
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-2000} y={-2000} width={6000} height={6000}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={width * 3} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - reveal} />
        </mask>
      </defs>
      <g mask={reveal < 1 ? `url(#${id})` : undefined}>
        <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray="3 19" strokeDashoffset={-N * speed} />
        {arrow && reveal >= 1 ? <path d={arrow} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" /> : null}
      </g>
    </svg>
  );
};

/** Rolling counter (odometer). value may be fractional while rolling; digits roll continuously. */
export const Counter: React.FC<{value: number; digits: number; size: number; color?: string; weight?: number}> = ({value, digits, size, color = C.graphite, weight = 900}) => {
  const lh = size * 1.05;
  const cols = [];
  for (let k = digits - 1; k >= 0; k--) {
    const place = Math.pow(10, k);
    const raw = value / place;
    // lower digits roll continuously; higher digits snap with the carry of the digit below
    const below = (value % place) / place;
    const d = k === 0 ? raw % 10 : (Math.floor(raw) % 10) + (below > 0.9 ? (below - 0.9) * 10 : 0);
    const visible = value >= place || k === 0;
    cols.push(
      <div key={k} style={{position: 'relative', width: size * 0.62, height: lh, overflow: 'hidden', opacity: visible ? 1 : 0}}>
        <div style={{position: 'absolute', left: 0, top: -d * lh, width: '100%'}}>
          {Array.from({length: 11}, (_, i) => (
            <div key={i} style={{height: lh, lineHeight: `${lh}px`, textAlign: 'center', fontFamily: FONT, fontWeight: weight, fontSize: size, color, fontFeatureSettings: '"tnum"'}}>{i % 10}</div>
          ))}
        </div>
      </div>,
    );
  }
  return <div style={{display: 'flex', flexDirection: 'row', letterSpacing: -2}}>{cols}</div>;
};

/** Split-flap text: flips through seq; flip i starts at frame flips[i] (relative n) and takes 6 frames. */
export const SplitFlap: React.FC<{seq: string[]; flips: number[]; n: number; w: number; h: number; size: number; bg?: string; color?: string}> = ({seq, flips, n, w, h, size, bg = C.navy, color = C.cream}) => {
  let cur = 0;
  for (let i = 0; i < flips.length; i++) if (n >= flips[i] + 6) cur = i + 1;
  const active = flips.findIndex((f) => n >= f && n < f + 6);
  const from = seq[active >= 0 ? active : cur];
  const to = seq[active >= 0 ? active + 1 : cur];
  const u = active >= 0 ? (n - flips[active]) / 6 : 1;
  const face = (txt: string): React.ReactNode => (
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: size >= 70 ? -4 : -2, color, whiteSpace: 'nowrap'}}>{txt}</div>
  );
  const half = (txt: string, top: boolean, extra?: React.CSSProperties) => (
    <div style={{position: 'absolute', left: 0, top: top ? 0 : h / 2, width: w, height: h / 2, overflow: 'hidden', background: bg, borderRadius: top ? '10px 10px 0 0' : '0 0 10px 10px', ...extra}}>
      <div style={{position: 'absolute', left: 0, top: top ? 0 : -h / 2, width: w, height: h}}>{face(txt)}</div>
    </div>
  );
  const flipping = active >= 0;
  return (
    <div style={{position: 'relative', width: w, height: h, perspective: 600}}>
      {/* static: top half shows next text, bottom half shows current until the flap lands */}
      {half(to, true)}
      {half(flipping ? from : to, false)}
      {flipping && u < 0.5 ? half(from, true, {transformOrigin: '50% 100%', transform: `rotateX(${(-180 * u).toFixed(1)}deg)`, filter: `brightness(${1 - u * 0.6})`}) : null}
      {flipping && u >= 0.5 ? half(to, false, {transformOrigin: '50% 0%', transform: `rotateX(${(180 * (1 - u)).toFixed(1)}deg)`, filter: `brightness(${0.7 + 0.3 * u})`}) : null}
      <div style={{position: 'absolute', left: 0, top: h / 2 - 1.5, width: w, height: 3, background: 'rgba(0,0,0,0.35)'}} />
    </div>
  );
};

/** Whole museum object on a white photo border, slapped like a print. (x, y) = top-left of the image area; w, h = image size. */
export const PhotoPrint: React.FC<{src: string; x: number; y: number; w: number; h: number; border?: number; rot?: number; n?: number; dir?: 1 | -1; fit?: 'cover' | 'contain'; pos?: string; style?: React.CSSProperties}> = ({src, x, y, w, h, border = 14, rot = 0, n = 99, dir = 1, fit = 'cover', pos = '50% 50%', style}) => (
  <div style={{position: 'absolute', left: x - border, top: y - border, width: w + 2 * border, height: h + 2 * border, filter: SHADOW, ...style}}>
    <div style={{position: 'absolute', inset: 0, background: '#fff', padding: border, boxSizing: 'border-box', ...slapCss(n, rot, dir)}}>
      <Img src={src} style={{width: w, height: h, objectFit: fit, objectPosition: pos, display: 'block'}} />
    </div>
  </div>
);

// ---------------------------------------------------------------- sea
/** Periodic wave band path from x0 to x1 (closed to y bottom). */
export const wavePath = (y0: number, amp: number, wl: number, phase: number, x0 = -400, x1 = 1700, bottom = 760) => {
  let d = `M${x0} ${bottom}L${x0} ${(y0 + amp * Math.sin(((x0 + phase) / wl) * Math.PI * 2)).toFixed(1)}`;
  for (let x = x0 + 20; x <= x1; x += 20) d += `L${x} ${(y0 + amp * Math.sin(((x + phase) / wl) * Math.PI * 2)).toFixed(1)}`;
  return d + `L${x1} ${bottom}Z`;
};
export const foamPath = (y0: number, amp: number, wl: number, phase: number, x0 = -400, x1 = 1700) => {
  let d = `M${x0} ${(y0 + amp * Math.sin(((x0 + phase) / wl) * Math.PI * 2)).toFixed(1)}`;
  for (let x = x0 + 20; x <= x1; x += 20) d += `L${x} ${(y0 + amp * Math.sin(((x + phase) / wl) * Math.PI * 2)).toFixed(1)}`;
  return d;
};
/** V2 sea: two water bands and a foam line. shift = [far, mid, near] horizontal offsets for parallax; drift moves the wave phase;
 *  only = which layers to draw (0 far band, 1 deep band, 2 foam), e.g. [0] behind an object and [1, 2] in front of it. */
export const Waves: React.FC<{top?: number; shift?: [number, number, number]; drift?: number; only?: Array<0 | 1 | 2>}> = ({top = 452, shift = [0, 0, 0], drift = 0, only = [0, 1, 2]}) => (
  <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {only.includes(0) ? <path d={wavePath(top, 16, 760, drift * 0.5)} transform={`translate(${shift[0]} 0)`} fill={SET.sea.water} /> : null}
    {only.includes(1) ? <path d={wavePath(top + 72, 18, 680, 220 + drift * 0.8)} transform={`translate(${shift[1]} 0)`} fill={SET.sea.deep} /> : null}
    {only.includes(2) ? <path d={foamPath(top + 128, 16, 640, 90 + drift)} transform={`translate(${shift[2]} 0)`} fill="none" stroke={SET.sea.foam} strokeWidth={21} strokeLinecap="round" opacity={0.45} /> : null}
  </svg>
);

/** V2 paper boat (hull + sail). (x, y) = top-left of a 720×520 box (keel at y+500·s); scale s; rocking angle rot; sailDx moves the mast (box units). */
export const Boat: React.FC<{x: number; y: number; s?: number; rot?: number; sail?: boolean; sailDx?: number; children?: React.ReactNode; front?: React.ReactNode}> = ({x, y, s = 1, rot = 0, sail = true, sailDx = 0, children, front}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 720 * s, height: 520 * s, transform: `rotate(${rot}deg)`, transformOrigin: '50% 80%'}}>
    <svg width={720 * s} height={520 * s} viewBox="0 0 720 520" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {sail ? <path d="M357 360V12M356 24 575 350H358Z" transform={`translate(${sailDx} 0)`} fill={C.sail} stroke={C.hullEdge} strokeWidth={12} strokeLinejoin="round" /> : null}
    </svg>
    {children}
    <svg width={720 * s} height={520 * s} viewBox="0 0 720 520" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: SHADOW}}>
      <path d="M0 371h710l-100 117Q339 543 106 488Z" fill={C.hull} stroke={C.hullEdge} strokeWidth={18} strokeLinejoin="round" />
    </svg>
    {front}
  </div>
);

/** Small paper ship (mockup `ship` symbol, 240×160). (x, y) = centre of the hull; w = width. */
export const Ship: React.FC<{x: number; y: number; w?: number; rot?: number; op?: number}> = ({x, y, w = 72, rot = 0, op = 1}) => {
  const s = w / 240;
  return (
    <div style={{position: 'absolute', left: x - 120 * s, top: y - 112 * s, width: 240 * s, height: 160 * s, transform: `rotate(${rot}deg)`, transformOrigin: '50% 70%', opacity: op}}>
      <svg width={240 * s} height={160 * s} viewBox="0 0 240 160" style={{overflow: 'visible'}}>
        <path d="M22 95H221L191 130Q114 161 51 130Z" fill="#28374e" stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
        <path d="M119 85V17M119 22 191 86H119Z" fill="#f6e4bd" stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
      </svg>
    </div>
  );
};
