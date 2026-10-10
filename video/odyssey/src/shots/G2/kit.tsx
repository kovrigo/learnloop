import React from 'react';
import {rnd, clamp01} from '../../common';
import {C, SHADOW, PaperCharacter, slap} from '../../paper';

/**
 * Helpers for group G2 (chapter 1). Everything here is a pure function of the frame number.
 */

// ---------------------------------------------------------------- damped kicks, bumps
/** Damped swing started at frame f: amp · sin · e^(−t/decay). */
export const kick = (N: number, f: number, amp: number, period = 22, decay = 18) => (N >= f ? amp * Math.sin(((N - f) / period) * Math.PI * 2) * Math.exp(-(N - f) / decay) : 0);
/** One half-sine bump of height amp over len frames from f. */
export const bump = (N: number, f: number, amp: number, len = 8) => (N >= f && N < f + len ? amp * Math.sin(((N - f) / len) * Math.PI) : 0);
/** Sum of kicks (speech beats). */
export const kicks = (N: number, list: Array<[number, number]>, period = 22, decay = 18) => list.reduce((a, [f, amp]) => a + kick(N, f, amp, period, decay), 0);

// ---------------------------------------------------------------- PaperCharacter geometry
/** PaperCharacter draws its 380×(cropY+20) viewBox into w × h·cropY/540 (centred): symbol (u, v) → frame px. */
export const charGeom = (x: number, y: number, h: number, cropY = 540) => {
  const w = (h * 380) / 540;
  const sp = (h * cropY) / (540 * (cropY + 20));
  return {w, sp, H: (h * cropY) / 540, pt: (u: number, v: number) => ({x: x + (w - 380 * sp) / 2 + u * sp, y: y - (20 * h) / 540 + (v + 20) * sp})};
};

/** An SVG drawn in a PaperCharacter's own symbol coordinates (same box, same viewBox), so extras sit exactly on the figure. */
export const CharSpace: React.FC<{x: number; y: number; h: number; cropY?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({x, y, h, cropY = 540, children, style}) => {
  const g = charGeom(x, y, h, cropY);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: g.w, height: g.H, overflow: 'visible', ...style}}>
      <svg width={g.w} height={g.H} viewBox={`0 -20 380 ${cropY + 20}`} style={{position: 'absolute', left: 0, top: (-20 * h) / 540, overflow: 'visible'}}>
        {children}
      </svg>
    </div>
  );
};

/** The body of every variant ends in a flat edge at symbol y 540. RobeExt continues it downward (same robe, same outline) so a wide camera shows no flat edge. */
const EXT = {
  hero: {bl: 11.3, br: 388.4, rl: 35.1, rr: 370.6, fill: C.heroRobe, line: C.heroLine},
  penelope: {bl: 7.1, br: 388.7, rl: 24.1, rr: 379, fill: C.penelope, line: '#472e4c'},
  cyclops: {bl: 7.9, br: 390.3, rl: 27.4, rr: 378, fill: C.cyclops, line: '#553f59'},
} as const;
const EXT_TOP = 528; // overlaps the flat edge at 540 by 12 units
export const RobeExt: React.FC<{variant: keyof typeof EXT; x: number; y: number; h: number; to?: number; fill?: string; line?: string; layer: 'shadow' | 'front'}> = ({variant, x, y, h, to = 1400, fill, line, layer}) => {
  const e = EXT[variant];
  const top = layer === 'front' ? EXT_TOP : 540;
  return (
    <CharSpace x={x} y={y} h={h} style={layer === 'shadow' ? {filter: SHADOW} : undefined}>
      <path d={`M${e.bl} ${top + 2}H${e.br}V${to}H${e.bl}Z`} fill="#fff" />
      <path d={`M${e.rl} ${top}H${e.rr}V${to}H${e.rl}Z`} fill={fill ?? e.fill} />
      <path d={`M${e.rl} ${top}V${to}M${e.rr} ${top}V${to}`} stroke={line ?? e.line} strokeWidth={5} fill="none" />
    </CharSpace>
  );
};

/** A whole PaperCharacter plus its robe extension. The shadow layer sits behind the figure, the front layer (no shadow) covers the flat edge and the figure's own shadow under it. */
export const LongFigure: React.FC<React.ComponentProps<typeof PaperCharacter> & {extTo?: number}> = ({extTo = 1400, ...p}) => (
  <>
    <RobeExt variant={p.variant} x={p.x} y={p.y} h={p.h} to={extTo} fill={p.robeFill} line={p.robeLine} layer="shadow" />
    <PaperCharacter {...p} />
    <RobeExt variant={p.variant} x={p.x} y={p.y} h={p.h} to={extTo} fill={p.robeFill} line={p.robeLine} layer="front" />
  </>
);

// ---------------------------------------------------------------- drawn skin arms (for figures whose body has none)
/** Raised arm drawn in symbol coordinates: white border, skin fill, a mitten hand. d = path from shoulder to wrist; the hand is a circle at the wrist. */
export const SkinArm: React.FC<{d: string; hand: [number, number]; rot?: number; pivot: [number, number]; r?: number}> = ({d, hand, rot = 0, pivot, r = 22}) => (
  <g transform={`rotate(${rot} ${pivot[0]} ${pivot[1]})`}>
    <path d={d} fill="none" stroke="#fff" strokeWidth={50} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={hand[0]} cy={hand[1]} r={r + 8} fill="#fff" />
    <path d={d} fill="none" stroke="#ddbfa7" strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={hand[0]} cy={hand[1]} r={r} fill="#ddbfa7" />
  </g>
);

// ---------------------------------------------------------------- baby bundle
/** Swaddled paper baby: cream cloth, white border, a drawn sleeping face (no photo head). Centre (cx, cy) in the SVG's own units. */
export const BabyBundle: React.FC<{cx: number; cy: number; rot?: number; n: number; scale?: number; sway?: number}> = ({cx, cy, rot = -18, n, scale = 1, sway = 0}) => {
  const k = slap(n, 1);
  if (n < 0) return null;
  const body = 'M-76 -4Q-78 -46 -34 -52L36 -44Q82 -36 80 6Q76 44 32 52L-34 48Q-74 44 -76 -4Z';
  return (
    <g opacity={k.op} transform={`translate(${cx} ${cy}) rotate(${rot + k.r + sway}) scale(${k.s * scale})`}>
      <path d={body} fill="#fff" stroke="#fff" strokeWidth={18} strokeLinejoin="round" />
      <path d={body} fill={C.cream2} stroke="#E3D3BC" strokeWidth={3} strokeLinejoin="round" />
      {/* cloth folds */}
      <path d="M-14 -48Q8 -4 -6 48M28 -42Q50 4 40 50" fill="none" stroke="#DCC9AD" strokeWidth={4} strokeLinecap="round" />
      <path d="M-76 8Q0 22 80 4" fill="none" stroke={C.pink} strokeWidth={9} strokeLinecap="round" opacity={0.85} />
      {/* face */}
      <circle cx={-46} cy={-16} r={27} fill="#fff" />
      <circle cx={-46} cy={-16} r={22} fill={C.skin} />
      <path d="M-58 -18Q-53 -13 -48 -18M-44 -18Q-39 -13 -34 -18" fill="none" stroke="#6B4A3A" strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={-52} cy={-6} rx={5} ry={3} fill={C.pink} opacity={0.6} />
      <ellipse cx={-38} cy={-6} rx={5} ry={3} fill={C.pink} opacity={0.6} />
      <path d="M-66 -28Q-46 -50 -26 -28" fill={C.cream2} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

// ---------------------------------------------------------------- sea (wide, drifting) for G2's water scenes
/** Foam dashes scattered over a large area: one path, deterministic. */
export const foamDashes = (x0: number, y0: number, x1: number, y1: number, rows: number, perRow: number, seed: number, len = 46) => {
  let d = '';
  for (let r = 0; r < rows; r++) {
    const y = y0 + ((y1 - y0) * (r + 0.5)) / rows;
    for (let i = 0; i < perRow; i++) {
      const x = x0 + ((x1 - x0) * (i + 0.5 + 0.7 * (rnd(seed, r, i) - 0.5))) / perRow;
      const yy = y + 18 * (rnd(seed, r, i, 9) - 0.5);
      const l = len * (0.6 + 0.8 * rnd(seed, r, i, 4));
      d += `M${(x - l / 2).toFixed(0)} ${yy.toFixed(0)}q${(l / 4).toFixed(0)} -9 ${(l / 2).toFixed(0)} 0t${(l / 2).toFixed(0)} 0`;
    }
  }
  return d;
};

/** Linear mix of two #rrggbb colours (t 0 → a, 1 → b). */
export const mixHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp01(t)).toString(16).padStart(2, '0')).join('');
};

/** Open arrowhead at `tip`, pointing along `deg` (degrees, 0 = right, 90 = down), as an SVG path (for DottedPath's `arrow`). */
export const arrowHead = (tx: number, ty: number, deg: number, len = 20, spread = 30) => {
  const a = (deg * Math.PI) / 180, s = (spread * Math.PI) / 180;
  const p = (k: number) => `${(tx - len * Math.cos(a + k)).toFixed(1)} ${(ty - len * Math.sin(a + k)).toFixed(1)}`;
  return `M${p(-s)}L${tx} ${ty}L${p(s)}`;
};
