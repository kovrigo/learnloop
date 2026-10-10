import React from 'react';
import {clamp01, easeOutCubic} from '../../common';
import {C, FONT, SET, SHADOW, SHADOW_S, usePaperId, smoothPath} from '../../paper';

/** G3 helpers (chapter 2, first half). Everything is a pure function of the frame numbers passed in. */

/** Overshooting ease-out for a growing paper boat: c = overshoot strength. */
export const easeOutBack = (t: number, c = 1.1) => {
  const x = clamp01(t) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
/** Short damped bump: 0 before f, up to amp and back over len frames. */
export const bump = (N: number, f: number, amp: number, len = 10) => (N >= f && N < f + len ? amp * Math.sin(((N - f) / len) * Math.PI) : 0);
/** Damped swing kicked at frame f. */
export const kick = (N: number, f: number, amp: number, period = 22, decay = 18) => (N >= f ? amp * Math.sin(((N - f) / period) * Math.PI * 2) * Math.exp(-(N - f) / decay) : 0);

/** Frame position of a point (u, v) in the PaperCharacter symbol (380 wide), for a character placed at (x, y) with height h and crop cropY. */
export const charPt = (x: number, y: number, h: number, cropY: number, u: number, v: number) => {
  const w = (h * 380) / 540;
  const sp = (h / 540) * (cropY / (cropY + 20));
  return {x: x + (w - 380 * sp) / 2 + u * sp, y: y - (20 * h) / 540 + (v + 20) * sp};
};
/** Symbol position of the hero's right fist when armR = deg (shoulder pivot (328, 342), hanging fist at (357, 505)). */
export const heroFistR = (deg: number) => {
  const r = (deg * Math.PI) / 180;
  const dx = 357 - 328, dy = 505 - 342;
  return {u: 328 + dx * Math.cos(r) - dy * Math.sin(r), v: 342 + dx * Math.sin(r) + dy * Math.cos(r)};
};
/** Frame position of the raised hand of a CrowdFigure (cx, by, h) with its outer arm at `arm` degrees (pivot (82, 98), hand at (112, 62) when arm = 0). */
export const crowdHand = (cx: number, by: number, h: number, arm: number, flip: boolean) => {
  const s = h / 150;
  const r = (arm * Math.PI) / 180;
  const dx = 30, dy = -36;
  const hx = 82 + dx * Math.cos(r) - dy * Math.sin(r);
  const hy = 98 + dx * Math.sin(r) + dy * Math.cos(r);
  return {x: cx - 50 * s + (flip ? 100 - hx : hx) * s, y: by - h + hy * s};
};

/** Rolling rows (odometer): `rows` stacked, the window shows row p (fractional while rolling). */
export const Roller: React.FC<{rows: string[]; p: number; size: number; w: number; color?: string; align?: 'left' | 'center'}> = ({rows, p, size, w, color = C.graphite, align = 'left'}) => {
  const lh = size * 1.05;
  return (
    <div style={{position: 'relative', width: w, height: lh, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: -p * lh, width: '100%'}}>
        {rows.map((r, i) => (
          <div key={i} style={{height: lh, lineHeight: `${lh}px`, textAlign: align, fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: -2, color, whiteSpace: 'nowrap', fontFeatureSettings: '"tnum"'}}>{r}</div>
        ))}
      </div>
    </div>
  );
};

/** Rope or cord: quadratic curve from a to b hanging by `sag` px (and `bulge` px sideways), white paper edge; `twist` draws a darker twisted strand. */
export const Cord: React.FC<{a: [number, number]; b: [number, number]; sag?: number; bulge?: number; color?: string; width?: number; edge?: number; twist?: string}> = ({a, b, sag = 20, bulge = 0, color = '#E7D3B0', width = 6, edge = 4, twist}) => {
  const d = `M${a[0]} ${a[1]}Q${(a[0] + b[0]) / 2 + bulge} ${(a[1] + b[1]) / 2 + sag} ${b[0]} ${b[1]}`;
  return (
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={d} fill="none" stroke="#fff" strokeWidth={width + 2 * edge} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
      {twist ? <path d={d} fill="none" stroke={twist} strokeWidth={width} strokeLinecap="butt" strokeDasharray="3 7" /> : null}
    </svg>
  );
};

/**
 * Paper bag of winds (kraft paper, white edge, hard shadow). (x, y) = bottom centre in the parent's px, w = width.
 * open 0 = neck gathered and tied (twine, knot, two tails), 1 = mouth wide open. tied: draw the twine.
 */
export const Bag: React.FC<{x: number; y: number; w: number; open?: number; tied?: boolean; rot?: number; squash?: number; style?: React.CSSProperties}> = ({x, y, w, open = 0, tied = true, rot = 0, squash = 1, style}) => {
  const k = w / 120;
  const tw = 19 + 25 * open; // neck half-width at the mouth
  const ty = 26 - 7 * open; // mouth y
  const neck = `M47 58L${60 - tw} ${ty}Q60 ${ty - 9 - 4 * open} ${60 + tw} ${ty}L73 58Z`;
  const body = 'M24 72Q4 106 22 128Q60 144 98 128Q116 106 96 72Q84 58 60 56Q36 58 24 72Z';
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - 140 * k, width: w, height: 140 * k, transformOrigin: '50% 100%', transform: `rotate(${rot}deg) scale(${1 / squash}, ${squash})`, filter: SHADOW_S, ...style}}>
      <svg width={w} height={140 * k} viewBox="0 0 120 140" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <g fill="#fff" stroke="#fff" strokeWidth={12} strokeLinejoin="round">
          <path d={body} />
          <path d={neck} />
        </g>
        <path d={body} fill="#CDA574" stroke="#7A5A3A" strokeWidth={3} strokeLinejoin="round" />
        <path d="M24 72Q14 100 22 124" fill="none" stroke="#E6C79B" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
        <path d={neck} fill="#C29A68" stroke="#7A5A3A" strokeWidth={3} strokeLinejoin="round" />
        {open > 0.05 ? <ellipse cx={60} cy={ty - 1} rx={tw * 0.92} ry={1 + 7.5 * open} fill="#4D3524" /> : null}
        {/* printed swirl on the belly */}
        <path d="M60 104C68 104 70 114 62 116C50 118 46 100 58 94C74 88 84 104 76 118" fill="none" stroke="#FAF7EE" strokeWidth={4.5} strokeLinecap="round" />
        {tied ? (
          <>
            <path d="M43 47Q60 56 77 47" fill="none" stroke="#fff" strokeWidth={13} strokeLinecap="round" />
            <path d="M43 47Q60 56 77 47" fill="none" stroke="#F7E9D7" strokeWidth={7} strokeLinecap="round" />
            <path d="M60 52Q50 64 44 72M60 52Q70 62 78 68" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
            <path d="M60 52Q50 64 44 72M60 52Q70 62 78 68" fill="none" stroke="#F7E9D7" strokeWidth={4.5} strokeLinecap="round" />
            <circle cx={60} cy={52} r={7} fill="#F7E9D7" stroke="#fff" strokeWidth={3} />
          </>
        ) : null}
      </svg>
    </div>
  );
};
/** Position of the bag's tie (knot), same arguments as Bag. */
export const bagTie = (x: number, y: number, w: number) => ({x, y: y - (140 - 52) * (w / 120)});
/** Position of the bag's mouth when open. */
export const bagMouth = (x: number, y: number, w: number) => ({x, y: y - (140 - 20) * (w / 120)});

/** Paper wind swirl: a curl with a tail, foam-coloured ribbon with a white edge. (x, y) = centre, s = scale. */
const SWIRL_D = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 30; i++) {
    const th = 0.15 * i;
    const r = 4 + 7.2 * th;
    pts.push(`${(r * Math.cos(th)).toFixed(1)} ${(r * Math.sin(th)).toFixed(1)}`);
  }
  // tail leaves the outer end of the spiral to the right
  return `M${pts.join('L')}Q70 -30 110 -6`;
})();
export const Swirl: React.FC<{x: number; y: number; s?: number; rot?: number; color?: string; op?: number}> = ({x, y, s = 1, rot = 0, color = SET.sea.foam, op = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, opacity: op, transform: `rotate(${rot}deg) scale(${s})`, filter: SHADOW_S}}>
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={SWIRL_D} fill="none" stroke="#fff" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
      <path d={SWIRL_D} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
      <path d={SWIRL_D} fill="none" stroke="#3E7899" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
    </svg>
  </div>
);

/** Island with a small house, for the horizon (sage hill, white edge, hard shadow). (cx, base) = bottom centre, w = width. */
export const Island: React.FC<{cx: number; base: number; w: number}> = ({cx, base, w}) => {
  const k = w / 200;
  return (
    <div style={{position: 'absolute', left: cx - w / 2, top: base - 120 * k, width: w, height: 120 * k, filter: SHADOW}}>
      <svg width={w} height={120 * k} viewBox="0 0 200 120" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d="M-6 130Q10 70 50 58Q76 22 112 38Q150 36 176 72Q196 92 206 130Z" fill={SET.ithaca.shape} stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
        {/* house */}
        <path d="M70 42 102 22 134 42Z" fill={SET.troy.bg} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
        <rect x={76} y={40} width={52} height={32} fill={C.cream2} stroke="#fff" strokeWidth={5} />
        <rect x={94} y={50} width={16} height={22} fill={SET.ithaca.night} />
      </svg>
    </div>
  );
};

/** Warning triangle with "!" (our own icon). */
export const WarnIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={{display: 'block'}}>
    <path d="M30 6 56 52H4Z" fill={C.pink} stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
    <rect x={27} y={20} width={6} height={19} rx={3} fill="#fff" />
    <circle cx={30} cy={45} r={3.6} fill="#fff" />
  </svg>
);

/** Rock silhouette used as a thrown rock's shadow (lumpy polygon, 0..400 × 0..320). */
export const ROCK_D = smoothPath([[40, 180], [64, 104], [120, 74], [150, 36], [230, 24], [290, 50], [340, 62], [386, 130], [370, 200], [392, 252], [318, 298], [250, 310], [196, 296], [120, 318], [70, 262]], true);
export const RockShadow: React.FC<{x: number; y: number; s: number; rot: number; op?: number}> = ({x, y, s, rot, op = 0.32}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `rotate(${rot}deg) scale(${s})`}}>
    <svg width={400} height={320} viewBox="0 0 400 320" style={{position: 'absolute', left: -200, top: -160, overflow: 'visible'}}>
      <path d={ROCK_D} fill={C.shadow} opacity={op} strokeLinejoin="round" stroke={C.shadow} strokeWidth={14} />
    </svg>
  </div>
);

/** Pig snout paper cut-out: pink oval, two nostrils, white edge. (x, y) = centre. */
export const Snout: React.FC<{x: number; y: number; w: number; style?: React.CSSProperties}> = ({x, y, w, style}) => {
  const h = w * 0.7;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, filter: SHADOW_S, ...style}}>
      <svg width={w} height={h} viewBox="0 0 100 70" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <ellipse cx={50} cy={35} rx={44} ry={30} fill={C.pink} stroke="#fff" strokeWidth={8} />
        <ellipse cx={34} cy={36} rx={8} ry={12} fill="#8E3F58" />
        <ellipse cx={66} cy={36} rx={8} ry={12} fill="#8E3F58" />
      </svg>
    </div>
  );
};

/** Herb sprig (moly): green stem, leaves, small cream flower. Local origin = the end the fingers hold; extends to the left (−x) by ~150. */
export const Sprig: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `rotate(${rot}deg) scale(${s})`, filter: SHADOW_S}}>
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <g>
        <path d="M18 2Q-40 -6 -140 -30" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
        {[-30, -66, -102].map((px, i) => (
          <React.Fragment key={i}>
            <path d={`M${px} ${-6 - (i * 7.5)}q-8 -34 -34 -44q-6 30 34 44Z`} fill="#fff" stroke="#fff" strokeWidth={9} strokeLinejoin="round" />
            <path d={`M${px} ${-6 - (i * 7.5)}q18 -20 36 -22q-6 22 -36 22Z`} fill="#fff" stroke="#fff" strokeWidth={9} strokeLinejoin="round" />
          </React.Fragment>
        ))}
        <path d="M18 2Q-40 -6 -140 -30" fill="none" stroke="#5F8F5B" strokeWidth={7} strokeLinecap="round" />
        {[-30, -66, -102].map((px, i) => (
          <React.Fragment key={i}>
            <path d={`M${px} ${-6 - (i * 7.5)}q-8 -34 -34 -44q-6 30 34 44Z`} fill="#7FB07A" stroke="#3F6B3C" strokeWidth={2.5} strokeLinejoin="round" />
            <path d={`M${px} ${-6 - (i * 7.5)}q18 -20 36 -22q-6 22 -36 22Z`} fill="#8CC088" stroke="#3F6B3C" strokeWidth={2.5} strokeLinejoin="round" />
          </React.Fragment>
        ))}
        <circle cx={-146} cy={-32} r={15} fill="#fff" />
        <circle cx={-146} cy={-32} r={9.5} fill="#FAF7EE" stroke="#E4B89B" strokeWidth={2} />
        <circle cx={-146} cy={-32} r={3.5} fill={C.yellow} />
      </g>
    </svg>
  </div>
);

/** Hermes's hand (drawn, pointing left), coming from the right edge: cream cuff with a small gold wing, hand pinching what is held at its fingertips.
 *  (x, y) = fingertip pinch point; the forearm runs to the right off the frame. */
export const HermesHand: React.FC<{x: number; y: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({x, y, style, children}) => {
  const id = usePaperId('hh');
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, filter: SHADOW, ...style}}>
      <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id={id} x1="0" x2="1">
            <stop offset="0" stopColor="#F7E9D7" />
            <stop offset="1" stopColor="#F7E9D7" />
          </linearGradient>
        </defs>
        {/* forearm + cuff, running off to the right */}
        <path d="M110 -20H330V28H110Z" fill="#fff" stroke="#fff" strokeWidth={12} strokeLinejoin="round" />
        <path d="M110 -20H330V28H110Z" fill={C.skin} />
        <path d="M150 -30H330V38H150Z" fill="#fff" stroke="#fff" strokeWidth={12} strokeLinejoin="round" />
        <path d="M150 -30H330V38H150Z" fill={`url(#${id})`} stroke="#E0B54A" strokeWidth={4} />
        <path d="M150 -4H330" stroke="#E0B54A" strokeWidth={5} />
        {/* small wing on the cuff: three feathers */}
        {[[178, -52, -38], [198, -60, -12], [218, -54, 16]].map(([fx, fy, fr], i) => (
          <g key={i} transform={`translate(${fx} ${fy}) rotate(${fr})`}>
            <ellipse rx={11} ry={34} fill="#fff" stroke="#fff" strokeWidth={8} />
            <ellipse rx={11} ry={34} fill="#FAF7EE" stroke="#E0B54A" strokeWidth={2.5} />
          </g>
        ))}
        {/* palm, fingers and thumb */}
        <path d="M30 -6Q50 -34 118 -28L128 26Q70 34 30 14Z" fill="#fff" stroke="#fff" strokeWidth={12} strokeLinejoin="round" />
        <path d="M30 -6Q50 -34 118 -28L128 26Q70 34 30 14Z" fill={C.skin} stroke="#B98B6E" strokeWidth={3} strokeLinejoin="round" />
        <path d="M34 -4 4 -9Q-6 -4 4 4L32 8Z" fill={C.skin} stroke="#B98B6E" strokeWidth={3} strokeLinejoin="round" />
        <path d="M40 8 8 12Q-2 18 8 24L42 22Z" fill={C.skin} stroke="#B98B6E" strokeWidth={3} strokeLinejoin="round" />
        <path d="M60 -26 30 -34Q18 -30 24 -22L56 -14Z" fill={C.skin} stroke="#B98B6E" strokeWidth={3} strokeLinejoin="round" />
        {children}
      </svg>
    </div>
  );
};

export {easeOutCubic};

/** Plum shape of the Circe sheet (SC13), bottom right. SC12's exit wipe carries the same shape so the first frame of SC13 continues it. */
export const CIRCE_SHAPE = 'M1280 330Q1120 360 1050 480Q990 590 860 720H1280Z';

/** Cream paper ring around an object (no purple, no glow): white-edged cream ring, a dashed outer ring and ten short paper rays, pulsing. (x, y) = centre. */
export const PaperRing: React.FC<{x: number; y: number; r: number; N: number; n: number}> = ({x, y, r, N, n}) => {
  const k = n < 0 ? 0 : n < 6 ? 1.15 - 0.15 * easeOutCubic(n / 6) : 1;
  const pulse = 1 + 0.07 * Math.sin((N / 34) * Math.PI * 2);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, opacity: n < 0 ? 0 : Math.min(1, (n + 1) / 2), transform: `scale(${k * pulse})`, filter: SHADOW_S}}>
      <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <circle r={r} fill="none" stroke="#fff" strokeWidth={22} />
        <circle r={r} fill="none" stroke="#FAF7EE" strokeWidth={11} />
        <g transform={`rotate(${N * 0.9})`}>
          {Array.from({length: 10}, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const c = Math.cos(a), s = Math.sin(a);
            return (
              <g key={i}>
                <line x1={c * (r + 20)} y1={s * (r + 20)} x2={c * (r + 40)} y2={s * (r + 40)} stroke="#fff" strokeWidth={13} strokeLinecap="round" />
                <line x1={c * (r + 20)} y1={s * (r + 20)} x2={c * (r + 40)} y2={s * (r + 40)} stroke="#FAF7EE" strokeWidth={6} strokeLinecap="round" />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
