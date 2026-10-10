import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic} from '../../common';
import {C, FONT, SET, IMG, SHADOW, SHADOW_S, PaperBg, PaperWipe, PaperTag, DottedPath, CrowdFigure, CREW_HEADS, slapCss, peelCss, prog} from '../../paper';
import {kick, kicks, bump, LongFigure} from './kit';
import {NightStatic} from './SC07';

/**
 * SC06 · frames 1539–2035 · S13–S16 · source IN HOMER / BOOK 9 · highlight moment of chapter 1.
 * World = the V1 frame (brand/examples/V1.png): Odysseus left, the bubble between, Polyphemus right in front of the dark cave shape. The camera starts wide (0.80)
 * and ends on exactly that two-shot (1.0).
 *   1547 three crew figures walk in from the left toward the dark cave mouth (walk cycle: body bob, swinging legs).
 *   1613 Polyphemus rises from below, in front of the dark shape.   1694 the crew hop back, his head tips toward them.
 *   1728 "6" slaps, the crew fade (nothing eaten on screen).   1790 "6" peels off.
 *   1797 Odysseus slaps in; 1800 camera push-in over 36 frames to the V1 two-shot; the bubble "MY NAME IS / NOBODY." opens from his side; dotted line runs.
 *   1881 the bubble peels off; 1887 the Met alabastron slaps in centre (the blinding, as an object only).   1947–1983 the whole frame dims to 60 %.
 * Hold: the dim ends 1983 → exit 2027 (44 frames). Exit: the night sheet of SC07 wipes in over 2027–2035.
 */
const F0 = 1539;
const END = 2035;
const B = {walk: 1547, rise: 1613, trap: 1694, six: 1728, name: 1800, alab: 1887, dim: 1947};
const EXIT = END - 8;

// ---- camera: world point `f` at the screen centre, scale k
const WIDE = {k: 0.8, fx: 690, fy: 400};
const PRE_DRIFT = 0.03; // slow creep before the push (keeps the wide shot alive)
const camAt = (N: number) => {
  const k0 = WIDE.k + PRE_DRIFT * clamp01((N - F0) / (B.name - F0));
  const t = prog(N, B.name, 36);
  return {k: k0 + (1 - k0) * t, fx: WIDE.fx + (640 - WIDE.fx) * t, fy: WIDE.fy + (360 - WIDE.fy) * t};
};
const worldCss = (N: number): React.CSSProperties => {
  const c = camAt(N);
  return {position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '0 0', transform: `translate(640px, 360px) scale(${c.k.toFixed(4)}) translate(${-c.fx.toFixed(2)}px, ${-c.fy.toFixed(2)}px)`};
};

// ---- the dark cave shape of V1 (left edge from (816, 0) to (905, 720)), extended far up, down and right
const ROCK = 'M818 -700C850 -300 790 -120 786 90C782 200 808 300 850 420C890 520 915 600 908 720C900 880 880 1000 884 1500L2600 1500L2600 -700Z';
const CaveRock: React.FC = () => (
  <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <path d={ROCK} fill={SET.cave.shape} />
    <path d="M928 22Q1040 24 1115 132" fill="none" stroke={SET.cave.accent} strokeWidth={26} strokeLinecap="round" />
  </svg>
);
/** The sheet SC05 wipes in: the cave background exactly as SC06's first frame draws it. */
export const CaveStatic: React.FC = () => {
  const N = F0;
  return (
    <div style={worldCss(N)}>
      <CaveRock />
    </div>
  );
};

// ---- characters (V1 placements, world px)
const ODY = {x: 76, y: 157, h: 640};
const POLY = {x: 846, y: 176, h: 560, rot: 4.5};
const CREW = [
  {head: CREW_HEADS[0], tunic: '#7FC4C0', line: '#2C6E73', from: -130, to: 840},
  {head: CREW_HEADS[1], tunic: '#9CAE91', line: '#44553C', from: -170, to: 748},
  {head: CREW_HEADS[0], tunic: '#7FC4C0', line: '#2C6E73', from: -210, to: 656},
];
const FEET = 700;
const BUBBLE = {x: 462, y: 155, w: 396, h: 217, tip: [582, 436] as [number, number]};

export const SC06: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const dim = 0.4 * prog(N, B.dim, 36, (t) => t);
  const wipe = prog(N, EXIT, 8, easeOutCubic);
  const rise = prog(N, B.rise, 22, easeOutCubic);
  const nO = N - (B.name - 3);
  const headP = kicks(N, [[B.rise + 18, -3], [B.trap, -6], [B.six, 3], [B.name + 8, 4], [B.alab, -3]], 22, 16);
  const headO = kicks(N, [[B.name, -4], [B.name + 20, 3]], 24, 16) - 6;
  const sixPeel = peelCss(N - 1790, 8, -1);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <PaperBg color={SET.cave.bg}>
        <div style={worldCss(N)}>
          <CaveRock />
          {/* Polyphemus rises in front of the dark shape */}
          {N >= B.rise ? (
            <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '1030px 400px', transform: `translateY(${((1 - rise) * 560).toFixed(1)}px) rotate(${POLY.rot}deg)`}}>
              <LongFigure variant="cyclops" x={POLY.x} y={POLY.y} h={POLY.h} head={headP} />
            </div>
          ) : null}
          {/* the crew walk into the cave mouth */}
          {CREW.map((c, i) => (
            <Crew key={i} i={i} N={N} {...c} />
          ))}
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, ...sixPeel}}>
            <PaperTag text="6" x={560} y={318} rot={-6} size={170} n={N - B.six} dir={-1} bg={C.yellow} color={C.navy} style={{padding: '8px 56px 12px'}} />
          </div>
          {/* V1 two-shot: Odysseus, bubble, dotted line */}
          {nO >= 0 ? (
            <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '300px 600px', ...slapCss(nO, 0, -1)}}>
              <LongFigure variant="hero" x={ODY.x} y={ODY.y} h={ODY.h} head={headO} armR={2 + kick(N, B.name, 3, 22, 16)} armL={1 - kick(N, B.name + 6, 3, 22, 16)} />
            </div>
          ) : null}
          <DottedPath d="M470 476C520 446 620 440 700 468S800 500 836 440" N={N} reveal={prog(N, B.name, 22, easeOutCubic)} speed={0.55} width={7} />
          <NobodyBubble n={N - B.name} peel={N - (B.alab - 7)} />
          {/* the alabastron, centre: the blinding as an object */}
          {N >= B.alab ? <Alabastron n={N - B.alab} /> : null}
        </div>
        {/* the frame dims to 60 % */}
        <AbsoluteFill style={{background: C.shadow, opacity: dim, pointerEvents: 'none'}} />
      </PaperBg>
      <PaperWipe p={wipe} color={SET.night.bg} from="right">
        <NightStatic />
      </PaperWipe>
    </AbsoluteFill>
  );
};

/** One crew figure: walks in from the left (body bob, swinging legs), hops on 1694, fades on 1728. */
const Crew: React.FC<{i: number; N: number; head: string; tunic: string; line: string; from: number; to: number}> = ({i, N, head, tunic, line, from, to}) => {
  const t0 = B.walk - 1;
  const u = clamp01((N - t0) / 64);
  const e = 1 - Math.pow(1 - u, 1.7);
  const x = from + (to - from) * e;
  const walking = u > 0 && u < 1 ? 1 : 0;
  const ph = (N - t0) * 0.62 + 1.3 * i;
  const bob = walking * Math.abs(Math.sin(ph)) * 7;
  const hop = bump(N, B.trap + 3 * i, 18, 12);
  const fade = clamp01((N - B.six) / 14);
  const h = 150, s = h / 150;
  const by = FEET - 30 * s - bob - hop;
  if (N < t0 - 1 || fade >= 1) return null;
  const swing = walking * 22 * Math.sin(ph);
  const leg = (dx: number, a: number) => (
    <g key={dx} transform={`rotate(${a} ${x + dx * s} ${by - 4 * s})`}>
      <path d={`M${x + dx * s} ${by - 4 * s}V${by + 30 * s}`} stroke="#fff" strokeWidth={16 * s} strokeLinecap="round" />
      <path d={`M${x + dx * s} ${by - 4 * s}V${by + 30 * s}`} stroke={C.skin} strokeWidth={10 * s} strokeLinecap="round" />
    </g>
  );
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, opacity: 1 - fade, transform: `translateY(${fade * 14}px) scale(${1 - 0.1 * fade})`, transformOrigin: `${x}px ${FEET}px`, filter: SHADOW_S}}>
      <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {leg(-14, swing)}
        {leg(14, -swing)}
      </svg>
      <CrowdFigure head={head} cx={x} by={by} h={h} tunic={tunic} line={line} headTilt={walking * 4 * Math.sin(ph * 0.5) + (hop > 0 ? -5 : 0)} />
    </div>
  );
};

/** V1 bubble: box (462, 155)–(858, 372), tail tip (582, 436); opens from the tail in 8 frames; peels off before the alabastron. */
const NobodyBubble: React.FC<{n: number; peel: number}> = ({n, peel}) => {
  if (n < 0 || peel >= 8) return null;
  const t = clamp01(n / 8);
  const k = 1 - Math.pow(1 - t, 3);
  const over = t < 1 ? 1 + 0.06 * Math.sin(t * Math.PI) : 1;
  const {x, y, w, h, tip} = BUBBLE;
  const lx = tip[0] - x, ly = tip[1] - y;
  const r = 28;
  const d = `M${r} 0H${w - r}Q${w} 0 ${w} ${r}V${h - r}Q${w} ${h} ${w - r} ${h}H${lx + 58}L${lx} ${ly}L${lx} ${h}H${r}Q0 ${h} 0 ${h - r}V${r}Q0 0 ${r} 0Z`;
  const p = peelCss(peel, 8, 1);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transformOrigin: `${lx}px ${ly}px`, transform: `scale(${(k * over).toFixed(3)})`, opacity: Math.min(1, t * 3), filter: SHADOW}}>
      <div style={{position: 'absolute', inset: 0, ...(peel >= 0 ? p : {})}}>
        <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <path d={d} fill={C.cream} stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: C.graphite}}>
          <div style={{fontWeight: 800, fontSize: 38, letterSpacing: 0, lineHeight: 1.1, marginBottom: 6}}>MY NAME IS</div>
          <div style={{fontWeight: 900, fontSize: 96, letterSpacing: -4, lineHeight: 1}}>NOBODY.</div>
        </div>
      </div>
    </div>
  );
};

const Alabastron: React.FC<{n: number}> = ({n}) => {
  const slide = 1 - easeOutCubic(clamp01(n / 10));
  const k = slapCss(n, -3, 1);
  const h = 520, w = (h * 792) / 1414;
  return (
    <div style={{position: 'absolute', left: 656 - w / 2, top: 72 + slide * 90, width: w, height: h, filter: SHADOW, ...k, transformOrigin: '50% 60%'}}>
      <Img src={IMG('alabastron_met244857.png')} style={{width: w, height: h, display: 'block'}} />
    </div>
  );
};
