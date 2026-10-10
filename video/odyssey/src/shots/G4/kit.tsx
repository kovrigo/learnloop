import React from 'react';
import {clamp01, easeOutCubic} from '../../common';
import {FONT, C, SHADOW, SHADOW_S, CrowdFigure, usePaperId, slapCss, IMG} from '../../paper';

/**
 * G4 helpers (chapter 2, second half): drawn singers, wax and headphones for the crew, ropes, finger, cow, cloud and bolt, whirlpool, odometer.
 * Everything is a pure function of the frame number. Local to this group: nothing here is shared with other groups.
 */

/** PaperCharacter symbol → px mapping (same formula as G1_01): the symbol is 380 wide, 1 unit = sp px, centred in the box. */
export const heroMap = (x: number, y: number, h: number, cropY = 540) => {
  const w = (h * 380) / 540;
  const sp = (h / 540) * (cropY / (cropY + 20));
  return {sp, w, pt: (u: number, v: number) => ({x: x + (w - 380 * sp) / 2 + u * sp, y: y - (20 * h) / 540 + (v + 20) * sp})};
};
/** damped swing kicked at frame f */
export const kick = (N: number, f: number, amp: number, period = 22, decay = 18) => (N >= f ? amp * Math.sin(((N - f) / period) * Math.PI * 2) * Math.exp(-(N - f) / decay) : 0);
/** wax-plug / headphone pop: 0 before, overshoots to 1.35, rests at 1 */
export const pop = (n: number) => (n < 0 ? 0 : n < 5 ? 1.35 * easeOutCubic(n / 5) : n < 9 ? 1.35 - 0.35 * ((n - 5) / 4) : 1);

// ------------------------------------------------------------------ Sirens (drawn singer silhouettes in robes)
const SIREN = [
  {robe: '#263C54', fold: '#3E5C7E', accent: '#E881A0'},
  {robe: '#6E5470', fold: '#8A6E8E', accent: '#FFE38B'},
];
/** Singer silhouette in a robe, white paper border, no photo head, no nudity. (cx, by) = bottom centre; h = height (viewBox 240×520). */
export const Siren: React.FC<{cx: number; by: number; h: number; N: number; v: 0 | 1; phase?: number; n: number; dir?: 1 | -1}> = ({cx, by, h, N, v, phase = 0, n, dir = 1}) => {
  const k = h / 520;
  const col = SIREN[v];
  const t = N + phase;
  const sway = 1.8 * Math.sin(t / 19);
  const nod = 4.5 * Math.sin(t / 8.5) + 2 * Math.sin(t / 3.7);
  const open = 0.5 + 0.5 * Math.sin(t * 0.52);
  const arms = v === 0
    ? [{d: 'M84 238Q46 230 24 166', hx: 24, hy: 154}, {d: 'M156 238Q194 230 216 166', hx: 216, hy: 154}]
    : [{d: 'M84 240Q56 298 110 306', hx: 112, hy: 306}, {d: 'M156 238Q212 214 208 130', hx: 208, hy: 120}];
  const robe = 'M40 520C54 410 62 310 80 226Q120 204 160 226C178 310 186 410 200 520Z';
  const neck = 'M108 176H132L134 234H106Z';
  const hair = 'M80 112C66 52 98 28 122 28C150 28 178 54 162 114C176 160 172 214 154 252L92 250C70 214 68 160 80 112Z';
  const border = {fill: '#fff', stroke: '#fff', strokeWidth: 16, strokeLinejoin: 'round' as const};
  return (
    <div style={{position: 'absolute', left: cx - 120 * k, top: by - h, width: 240 * k, height: h, filter: SHADOW, transformOrigin: '50% 100%', ...slapCss(n, sway, dir)}}>
      <svg width={240 * k} height={h} viewBox="0 0 240 520" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {/* border pass */}
        <g>
          <g transform={`rotate(${nod.toFixed(2)} 120 200)`}>
            <path d={hair} {...border} />
            <ellipse cx={120} cy={124} rx={36} ry={44} {...border} />
          </g>
          <path d={robe} {...border} />
          {arms.map((a, i) => (
            <React.Fragment key={i}>
              <path d={a.d} fill="none" stroke="#fff" strokeWidth={26 + 16} strokeLinecap="round" />
              <circle cx={a.hx} cy={a.hy} r={15 + 8} fill="#fff" />
            </React.Fragment>
          ))}
        </g>
        {/* fill pass */}
        <path d={robe} fill={col.robe} />
        <path d="M78 292Q120 310 162 292" fill="none" stroke={col.accent} strokeWidth={9} strokeLinecap="round" />
        <path d="M120 312C116 380 112 440 108 512M92 330C82 400 74 450 66 512M150 330C158 400 166 450 174 512" fill="none" stroke={col.fold} strokeWidth={4} strokeLinecap="round" />
        <path d="M44 500Q120 514 196 500" fill="none" stroke={col.fold} strokeWidth={5} strokeLinecap="round" />
        {arms.map((a, i) => (
          <React.Fragment key={i}>
            <path d={a.d} fill="none" stroke={col.robe} strokeWidth={26} strokeLinecap="round" />
            <circle cx={a.hx} cy={a.hy} r={15} fill={col.robe} />
          </React.Fragment>
        ))}
        <g transform={`rotate(${nod.toFixed(2)} 120 200)`}>
          <path d={hair} fill={col.robe} />
          <path d={neck} fill={col.robe} />
          <ellipse cx={120} cy={124} rx={36} ry={44} fill={col.robe} />
          <ellipse cx={120} cy={132} rx={27} ry={34} fill={col.fold} />
          <circle cx={152} cy={66} r={10} fill={col.accent} />
          <path d="M102 118Q109 125 116 118M124 118Q131 125 138 118" fill="none" stroke={C.cream} strokeWidth={3.5} strokeLinecap="round" />
          <ellipse cx={120} cy={143} rx={10} ry={4 + 7 * open} fill={C.cream} />
        </g>
      </svg>
    </div>
  );
};

// ------------------------------------------------------------------ "knowledge" note bubbles
/** Small cream speech bubble with a drawn glyph (music note, book, text lines): no words. (x, y) = centre; s = scale. */
export const NoteBubble: React.FC<{x: number; y: number; s: number; kind: number; rot?: number}> = ({x, y, s, kind, rot = 0}) => {
  if (s <= 0.01) return null;
  const g = kind % 3;
  return (
    <div style={{position: 'absolute', left: x - 40, top: y - 33, width: 80, height: 66, transform: `rotate(${rot}deg) scale(${s})`, filter: SHADOW_S}}>
      <svg width={80} height={66} viewBox="0 0 80 66" style={{overflow: 'visible'}}>
        <path d="M14 4H66Q76 4 76 14V40Q76 50 66 50H36L20 62L22 50H14Q4 50 4 40V14Q4 4 14 4Z" fill={C.cream} stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
        {g === 0 ? (
          <g fill={C.navy} stroke={C.navy}>
            <ellipse cx={34} cy={36} rx={8} ry={6} transform="rotate(-20 34 36)" stroke="none" />
            <path d="M41 34V14Q54 18 52 30" fill="none" strokeWidth={3.5} strokeLinecap="round" />
          </g>
        ) : g === 1 ? (
          <g fill="#fff" stroke={C.navy} strokeWidth={3} strokeLinejoin="round">
            <path d="M40 17Q28 11 16 15V38Q28 34 40 40Z" />
            <path d="M40 17Q52 11 64 15V38Q52 34 40 40Z" />
          </g>
        ) : (
          <g stroke={C.navy} strokeWidth={4} strokeLinecap="round">
            <path d="M18 17H62M18 27H62M18 37H44" />
          </g>
        )}
      </svg>
    </div>
  );
};

// ------------------------------------------------------------------ crew member: CrowdFigure + wax plugs + drawn headphones
export const Crew: React.FC<{head: string; tunic: string; line: string; cx: number; by: number; h: number; tilt: number; waxN?: number; phonesN?: number; phonesDir?: 1 | -1; flip?: boolean}> = ({head, tunic, line, cx, by, h, tilt, waxN = -1, phonesN = -1, phonesDir = 1, flip}) => {
  const s = h / 150;
  // transform box of the head image: left 16s, top −8s, width 68s, height 98.5s (aspect 326×472), tilt about 50% 90%
  const origin = `${50 * s}px ${(-8 + 0.9 * 98.5) * s}px`;
  const plug = (side: 1 | -1) => {
    const x = (50 + side * 30) * s, y = 36 * s;
    const k = pop(waxN);
    const ring = waxN >= 0 && waxN < 9 ? waxN / 9 : 1;
    return (
      <React.Fragment key={side}>
        {waxN >= 0 && waxN < 9 ? <circle cx={x} cy={y} r={(6 + 22 * ring) * s} fill="none" stroke="#fff" strokeWidth={3.5 * s * (1 - ring)} opacity={1 - ring} /> : null}
        <ellipse cx={x} cy={y} rx={6.5 * s * k} ry={7 * s * k} fill="#E8CB8C" stroke="#fff" strokeWidth={2.4 * s} />
      </React.Fragment>
    );
  };
  const ph = phonesN >= 0 ? slapCss(phonesN, 0, phonesDir) : null;
  return (
    <>
      <CrowdFigure head={head} cx={cx} by={by} h={h} tunic={tunic} line={line} headTilt={tilt} flip={flip} />
      <div style={{position: 'absolute', left: cx - 50 * s, top: by - h, width: 100 * s, height: h, pointerEvents: 'none'}}>
        <svg width={100 * s} height={h} viewBox={`0 0 ${100 * s} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transform: `rotate(${tilt}deg)`, transformOrigin: origin}}>
          {waxN >= 0 && phonesN < 0 ? ([-1, 1] as Array<1 | -1>).map(plug) : null}
        </svg>
        {ph ? (
          <svg width={100 * s} height={h} viewBox={`0 0 ${100 * s} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: ph.opacity, transform: `rotate(${tilt}deg)`, transformOrigin: origin}}>
            <g transform={`translate(${50 * s} ${40 * s}) ${ph.transform} translate(${-50 * s} ${-40 * s})`}>
              <Phones s={s} />
            </g>
          </svg>
        ) : null}
      </div>
    </>
  );
};
/** Headphones around a head centred at x 50s, ears at y 38s: band over the crown, two cups. Drawn at s = h/150. */
const Phones: React.FC<{s: number}> = ({s}) => {
  const band = `M${19 * s} ${40 * s}C${14 * s} ${-26 * s} ${86 * s} ${-26 * s} ${81 * s} ${40 * s}`;
  return (
    <g>
      <path d={band} fill="none" stroke="#fff" strokeWidth={10 * s} strokeLinecap="round" />
      <path d={band} fill="none" stroke={C.graphite} strokeWidth={5.5 * s} strokeLinecap="round" />
      {[19, 81].map((x) => (
        <g key={x}>
          <ellipse cx={x * s} cy={40 * s} rx={11.5 * s} ry={16 * s} fill="#fff" />
          <ellipse cx={x * s} cy={40 * s} rx={9 * s} ry={13.5 * s} fill={C.graphite} />
          <ellipse cx={x * s} cy={40 * s} rx={5 * s} ry={8 * s} fill={C.pink} />
        </g>
      ))}
    </g>
  );
};

// ------------------------------------------------------------------ rope (draws on along its path)
/** Twisted paper rope along path d (frame px), revealed 0..1 from the start. */
export const Rope: React.FC<{d: string; reveal: number; w?: number}> = ({d, reveal, w = 12}) => {
  const id = usePaperId('rope');
  if (reveal <= 0) return null;
  return (
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-3000} y={-3000} width={9000} height={9000}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={w * 3} strokeLinecap="butt" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - reveal} />
        </mask>
      </defs>
      <g mask={reveal < 1 ? `url(#${id})` : undefined}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={w + 8} strokeLinecap="round" />
        <path d={d} fill="none" stroke="#D9B77E" strokeWidth={w} strokeLinecap="round" />
        <path d={d} fill="none" stroke="#A67C45" strokeWidth={w} strokeDasharray={`${w * 0.28} ${w * 0.62}`} />
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------ pointing hand, seen from the side (like the pointing-hand emoji, mirrored): comes in from the right, index finger extended to the LEFT, thumb on top, three fingers curled under, cream cuff on the right.
// Local origin = fingertip, the body extends to +x (hand + cuff about 420 long). rot: negative = the body rises toward the right (the tip points slightly down).
export const Hand: React.FC<{x: number; y: number; rot?: number; s?: number; sleeve?: string}> = ({x, y, rot = 0, s = 1, sleeve = C.cream2}) => {
  const skin = C.skin, crease = '#B98A6C';
  const parts = (mode: 'border' | 'fill') => {
    const b = mode === 'border';
    const f = (c: string) => (b ? '#fff' : c);
    const st = b ? {stroke: '#fff', strokeWidth: 14, strokeLinejoin: 'round' as const} : {};
    return (
      <>
        <rect x={0} y={-15} width={150} height={30} rx={15} fill={f(skin)} {...st} />
        <rect x={70} y={14} width={110} height={24} rx={12} fill={f(skin)} {...st} />
        <rect x={84} y={37} width={100} height={24} rx={12} fill={f(skin)} {...st} />
        <rect x={98} y={60} width={90} height={24} rx={12} fill={f(skin)} {...st} />
        <rect x={120} y={-40} width={112} height={124} rx={34} fill={f(skin)} {...st} />
        <rect x={62} y={-42} width={140} height={27} rx={13.5} fill={f(skin)} {...st} />
        <rect x={226} y={-50} width={200} height={146} rx={8} fill={f(sleeve)} {...st} />
      </>
    );
  };
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `rotate(${rot}deg)`, transformOrigin: '0 0', filter: SHADOW}}>
      <svg width={10} height={10} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <g transform={`scale(${s})`}>
          {parts('border')}
          {parts('fill')}
          <path d="M68 -15H150M72 14H132M86 37H138M100 60H142M70 -28H98" fill="none" stroke={crease} strokeWidth={2.6} strokeLinecap="round" />
          <path d="M232 -50V96" stroke={C.rule} strokeWidth={3} />
        </g>
      </svg>
    </div>
  );
};

/** Generic mouse pointer. Tip at (x, y). */
export const Cursor: React.FC<{x: number; y: number; s?: number; press?: number}> = ({x, y, s = 1, press = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `scale(${s * (1 - 0.12 * press)})`, transformOrigin: '0 0', filter: SHADOW_S}}>
    <svg width={40} height={52} viewBox="-4 -4 40 52" style={{overflow: 'visible'}}>
      <path d="M0 0V32L8 25L14 38L20 35L14 23H25Z" fill="#fff" stroke={C.navy} strokeWidth={3.5} strokeLinejoin="round" />
    </svg>
  </div>
);

// ------------------------------------------------------------------ paper cow, cloud, bolt
/** Paper cow standing on (cx, by), facing right (flip = left). Cream hide, graphite spots, white border. h = height. */
export const Cow: React.FC<{cx: number; by: number; h: number; flip?: boolean; style?: React.CSSProperties}> = ({cx, by, h, flip = false, style}) => {
  const k = h / 150;
  const body = (b: boolean) => {
    const st = b ? {fill: '#fff', stroke: '#fff', strokeWidth: 12, strokeLinejoin: 'round' as const} : {};
    const f = (c: string) => (b ? '#fff' : c);
    return (
      <>
        <path d="M40 66Q22 62 18 86" fill="none" stroke={b ? '#fff' : C.graphite} strokeWidth={b ? 14 : 5} strokeLinecap="round" />
        <rect x={52} y={92} width={13} height={46} rx={5} fill={f(C.cream)} {...st} />
        <rect x={74} y={96} width={13} height={42} rx={5} fill={f(C.cream)} {...st} />
        <rect x={120} y={96} width={13} height={42} rx={5} fill={f(C.cream)} {...st} />
        <rect x={140} y={92} width={13} height={46} rx={5} fill={f(C.cream)} {...st} />
        <rect x={34} y={42} width={124} height={64} rx={30} fill={f(C.cream)} {...st} />
        <rect x={146} y={34} width={46} height={44} rx={16} fill={f(C.cream)} {...st} />
        <path d="M156 36Q152 20 164 18M180 36Q188 22 178 18" fill="none" stroke={b ? '#fff' : C.cream2} strokeWidth={b ? 12 : 6} strokeLinecap="round" />
      </>
    );
  };
  return (
    <div style={{position: 'absolute', left: cx - 100 * k, top: by - h, width: 200 * k, height: h, transform: flip ? 'scaleX(-1)' : undefined, filter: SHADOW_S, ...style}}>
      <svg width={200 * k} height={h} viewBox="0 0 200 150" style={{overflow: 'visible'}}>
        {body(true)}
        {body(false)}
        <ellipse cx={70} cy={64} rx={15} ry={11} fill={C.graphite} />
        <ellipse cx={116} cy={80} rx={13} ry={9} fill={C.graphite} />
        <ellipse cx={100} cy={52} rx={9} ry={6} fill={C.graphite} />
        <ellipse cx={184} cy={66} rx={10} ry={8} fill={C.pink} />
        <circle cx={166} cy={50} r={3.6} fill={C.graphite} />
        <rect x={52} y={128} width={13} height={10} rx={3} fill={C.graphite} />
        <rect x={74} y={128} width={13} height={10} rx={3} fill={C.graphite} />
        <rect x={120} y={128} width={13} height={10} rx={3} fill={C.graphite} />
        <rect x={140} y={128} width={13} height={10} rx={3} fill={C.graphite} />
      </svg>
    </div>
  );
};

/** Paper storm cloud (box 300×160 at scale s), top-left (x, y). */
export const Cloud: React.FC<{x: number; y: number; s?: number; style?: React.CSSProperties}> = ({x, y, s = 1, style}) => {
  const shapes = (fill: string, extra: React.SVGProps<SVGElement> = {}) => (
    <g fill={fill} {...(extra as object)}>
      <circle cx={84} cy={104} r={48} />
      <circle cx={146} cy={72} r={60} />
      <circle cx={212} cy={98} r={50} />
      <rect x={40} y={104} width={222} height={50} rx={25} />
    </g>
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 300 * s, height: 160 * s, filter: SHADOW, ...style}}>
      <svg width={300 * s} height={160 * s} viewBox="0 0 300 160" style={{overflow: 'visible'}}>
        {shapes('#fff', {stroke: '#fff', strokeWidth: 14, strokeLinejoin: 'round'})}
        {shapes('#5B6579')}
      </svg>
    </div>
  );
};

/** Paper thunderbolt, box 120×330 at scale s, top-left (x, y). */
export const Bolt: React.FC<{x: number; y: number; s?: number; style?: React.CSSProperties}> = ({x, y, s = 1, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 120 * s, height: 330 * s, filter: SHADOW, ...style}}>
    <svg width={120 * s} height={330 * s} viewBox="0 0 120 330" style={{overflow: 'visible'}}>
      <path d="M72 0L18 150H62L12 330L108 122H66L106 0Z" fill={C.yellow} stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
    </svg>
  </div>
);

// ------------------------------------------------------------------ whirlpool (coded)
/** Round paper disc with a spiral of foam arms, white border. Centre (cx, cy), diameter d, rotation in degrees. */
export const Whirlpool: React.FC<{cx: number; cy: number; d: number; rot: number; style?: React.CSSProperties; contrast?: number}> = ({cx, cy, d, rot, style, contrast = 1}) => {
  const R = 170; // disc radius in local units
  const arm = (k: number, amt: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 44; i++) {
      const th = (i / 44) * Math.PI * 3.2;
      const r = 20 + (th / (Math.PI * 3.2)) * (R - 14);
      const a = th + (k * Math.PI * 2) / 3 + amt;
      pts.push(`${i === 0 ? 'M' : 'L'}${(R + r * Math.cos(a)).toFixed(1)} ${(R + r * Math.sin(a)).toFixed(1)}`);
    }
    return pts.join('');
  };
  const id = usePaperId('wp');
  return (
    <div style={{position: 'absolute', left: cx - d / 2, top: cy - d / 2, width: d, height: d, filter: SHADOW, ...style}}>
      <svg width={d} height={d} viewBox={`0 0 ${2 * R} ${2 * R}`} style={{overflow: 'visible'}}>
        <defs>
          <clipPath id={id}>
            <circle cx={R} cy={R} r={R - 4} />
          </clipPath>
        </defs>
        <circle cx={R} cy={R} r={R + 8} fill="#fff" />
        <circle cx={R} cy={R} r={R} fill="#3E7899" />
        <g clipPath={`url(#${id})`}>
          <g transform={`rotate(${rot.toFixed(2)} ${R} ${R})`}>
            {[0, 1, 2].map((k) => (
              <path key={`d${k}`} d={arm(k, 0.52)} fill="none" stroke="#285F80" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {[0, 1, 2].map((k) => (
              <path key={k} d={arm(k, 0)} fill="none" stroke={C.cream} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" opacity={0.78 * contrast + 0.22} />
            ))}
          </g>
          <circle cx={R} cy={R} r={26} fill="#16405B" />
        </g>
      </svg>
    </div>
  );
};

// ------------------------------------------------------------------ odometer with a thousands comma
/** Rolling counter (like paper.tsx Counter) with a comma after the first digit of a 4-digit number. */
export const Odometer4: React.FC<{value: number; size: number; color?: string}> = ({value, size, color = C.graphite}) => {
  const lh = size * 1.05;
  const cols: React.ReactNode[] = [];
  for (let k = 3; k >= 0; k--) {
    const place = Math.pow(10, k);
    const raw = value / place;
    const below = (value % place) / place;
    const d = k === 0 ? raw % 10 : (Math.floor(raw) % 10) + (below > 0.9 ? (below - 0.9) * 10 : 0);
    const visible = value >= place || k === 0;
    cols.push(
      <div key={k} style={{position: 'relative', width: size * 0.62, height: lh, overflow: 'hidden', opacity: visible ? 1 : 0}}>
        <div style={{position: 'absolute', left: 0, top: -d * lh, width: '100%'}}>
          {Array.from({length: 11}, (_, i) => (
            <div key={i} style={{height: lh, lineHeight: `${lh}px`, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, color, fontFeatureSettings: '"tnum"'}}>{i % 10}</div>
          ))}
        </div>
      </div>,
    );
    if (k === 3) {
      cols.push(
        <div key="comma" style={{width: size * 0.26, height: lh, lineHeight: `${lh}px`, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, color, opacity: value >= 1000 ? 1 : 0}}>,</div>,
      );
    }
  }
  return <div style={{display: 'flex', flexDirection: 'row', letterSpacing: -2}}>{cols}</div>;
};

export {clamp01, easeOutCubic, IMG};
