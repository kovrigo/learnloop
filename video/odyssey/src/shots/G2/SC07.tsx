import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic} from '../../common';
import {C, FONT, SET, IMG, SHADOW, SHADOW_S, PaperBg, PaperWipe, ExampleCard, CREW_HEADS, slapCss, peelCss, prog} from '../../paper';
import {kicks, mixHex} from './kit';
import {SeaStatic} from './SC08';

/**
 * SC07 · frames 2036–2350 · S17–S20 · source IN HOMER / BOOK 9.
 * Night navy; SC06's navy sheet (with its gold moon) is on screen at 2036.
 * 2044 the group-chat panel "CYCLOPS NEIGHBORS (5)" slaps in (its 5 one-eyed avatars on top).  2085 "Who is hurting you?!" pops.
 * 2152 "NOBODY!" pops large from Polyphemus and shakes.  2195 the four neighbors leave one by one (their avatars drop), the system line "4 neighbors left the chat" slaps.
 * 2236 the panel peels off; 2244 the sky shifts navy → dawn pink over 30 frames (moon sinks, sun rises behind the graphite hill) and the Getty man-under-ram statuette slaps in.
 * 2282–2310 three paper rams cross left to right with a tiny crew figure under each belly and stand at the right (done 33 frames before the exit).
 * Exit: the sky sheet of SC08 (with its waves) wipes in over 2342–2350.
 */
const F0 = 2036;
const END = 2350;
const B = {panel: 2044, q: 2085, no: 2152, leave: 2195, dawn: 2244, rams: 2288};
const EXIT = END - 8;
const DAWN = '#E0A09A'; // dawn pink: cave pink #D681A1 lifted toward the sun yellow #F3D98C (35 %)

/** Night sky with the moon, as SC06's wipe sheet and SC07's first frame draw it. */
const MOON = {x: 1010, y: 196, r: 60};
export const NightStatic: React.FC<{sink?: number}> = ({sink = 0}) => (
  <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <circle cx={MOON.x} cy={MOON.y + 420 * sink} r={MOON.r} fill={SET.night.accent} />
    <circle cx={MOON.x + 22} cy={MOON.y - 12 + 420 * sink} r={MOON.r - 4} fill={mixHex(SET.night.bg, DAWN, sink)} />
  </svg>
);

const AV = ['#9CAE91', '#C9785B', '#E0B54A', '#7FC4C0']; // the four neighbors; Polyphemus is the fifth

/** A one-eyed avatar (drawn, generic): colour disc, white border, a single big eye. */
const Avatar: React.FC<{color: string; size: number; band?: boolean}> = ({color, size, band}) => (
  <svg width={size} height={size} viewBox="0 0 50 50" style={{display: 'block', overflow: 'visible'}}>
    <circle cx={25} cy={25} r={23} fill={color} stroke="#fff" strokeWidth={4} />
    {band ? <rect x={5} y={14} width={40} height={22} fill="#41364a" stroke="#f9f4ea" strokeWidth={2} /> : null}
    <ellipse cx={25} cy={25} rx={13} ry={9} fill="#f7f4e9" />
    <ellipse cx={25} cy={25} rx={6.5} ry={8} fill="#7295a1" />
    <ellipse cx={25} cy={25} rx={3} ry={6} fill="#25344b" />
  </svg>
);

export const SC07: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const dawn = prog(N, B.dawn, 30);
  const wipe = prog(N, EXIT, 8, easeOutCubic);
  const bg = mixHex(SET.night.bg, DAWN, dawn);
  const panelOut = peelCss(N - 2236, 8, -1);
  const sunUp = prog(N, B.dawn + 4, 56, (t) => t);
  const ground = prog(N, B.dawn, 14, easeOutCubic);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <PaperBg color={bg}>
        {/* moon sinks behind the hill, sun rises behind it */}
        <NightStatic sink={dawn} />
        {N >= B.dawn ? (
          <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <circle cx={860} cy={780 - 450 * sunUp} r={84} fill={SET.ithaca.sun} />
          </svg>
        ) : null}
        {/* graphite hill the rams stand on */}
        <div style={{position: 'absolute', left: 0, top: (1 - ground) * 260, width: 1280, height: 720, filter: SHADOW}}>
          <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <path d="M-120 600Q260 580 640 604T1400 596V820H-120Z" fill={SET.cave.shape} />
            <path d="M-120 600Q260 580 640 604T1400 596" fill="none" stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
          </svg>
        </div>
        {/* group chat */}
        {N >= B.panel && N < 2244 ? <ChatPanel N={N} out={panelOut} /> : null}
        {/* dawn: the statuette and the rams */}
        {N >= B.dawn ? (
          <div style={{position: 'absolute', left: 70, top: 108, width: 402, height: 440, filter: SHADOW, ...slapCss(N - B.dawn, -3, 1)}}>
            <Img src={IMG('ram_getty_103TP1.png')} style={{width: 402, height: 440, display: 'block'}} />
          </div>
        ) : null}
        {[2, 1, 0].map((i) => (
          <Ram key={i} i={i} N={N} />
        ))}
      </PaperBg>
      <PaperWipe p={wipe} color={SET.sea.sky} from="right">
        <SeaStatic />
      </PaperWipe>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ chat panel
const ChatPanel: React.FC<{N: number; out: React.CSSProperties}> = ({N, out}) => {
  const pop = (n: number, over = 0.06) => {
    if (n < 0) return null;
    const t = clamp01(n / 7);
    return {k: (1 - Math.pow(1 - t, 3)) * (t < 1 ? 1 + over * Math.sin(t * Math.PI) : 1), op: Math.min(1, t * 3)};
  };
  const p1 = pop(N - B.q);
  const p2 = pop(N - B.no, 0.14);
  const shake = N >= B.no ? 7 * Math.sin((N - B.no) * 2.3) * Math.exp(-(N - B.no) / 14) : 0;
  const sys = N - (B.leave + 2);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, ...out}}>
      <ExampleCard x={200} y={90} w={452} h={570} rot={-2} n={N - B.panel} label="CYCLOPS NEIGHBORS (5)">
        {/* members: Polyphemus first, then the four neighbors who leave one by one */}
        <div style={{position: 'absolute', left: 24, top: 76, width: 46, height: 46}}>
          <Avatar color={C.cyclops} size={46} band />
        </div>
        {AV.map((c, i) => {
          const t = clamp01((N - (B.leave + 5 * i)) / 14);
          return (
            <div key={i} style={{position: 'absolute', left: 90 + 62 * i, top: 76 + 150 * t * t, width: 46, height: 46, opacity: 1 - t * t, transform: `rotate(${(i % 2 ? 1 : -1) * 40 * t}deg)`}}>
              <Avatar color={c} size={46} />
            </div>
          );
        })}
        {/* neighbor: "Who is hurting you?!" */}
        {p1 ? (
          <div style={{position: 'absolute', left: 22, top: 148, width: 380, height: 84, transformOrigin: '20px 70px', transform: `scale(${p1.k.toFixed(3)})`, opacity: p1.op}}>
            <div style={{position: 'absolute', left: 0, top: 26, width: 40, height: 40}}>
              <Avatar color={AV[0]} size={40} />
            </div>
            <div style={{position: 'absolute', left: 50, top: 0, width: 330, height: 76, background: C.cream2, border: '4px solid #fff', borderRadius: 22, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 25, color: C.graphite, filter: SHADOW_S}}>Who is hurting you?!</div>
          </div>
        ) : null}
        {/* Polyphemus: "NOBODY!" big and shaking */}
        {p2 ? (
          <div style={{position: 'absolute', left: 40, top: 252, width: 360, height: 112, transformOrigin: '340px 100px', transform: `translateX(${shake.toFixed(2)}px) scale(${p2.k.toFixed(3)})`, opacity: p2.op}}>
            <div style={{position: 'absolute', inset: 0, background: C.cyclops, border: '5px solid #fff', borderRadius: 26, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 68, letterSpacing: -2, color: '#fff', filter: SHADOW_S}}>NOBODY!</div>
          </div>
        ) : null}
        {/* system line */}
        {sys >= 0 ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: 394, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 21, color: C.grey, ...slapCss(sys, 0, 1)}}>4 neighbors left the chat</div>
        ) : null}
        {/* message field */}
        <div style={{position: 'absolute', left: 22, right: 22, top: 462, height: 44, borderRadius: 22, background: '#E9ECE6', border: '3px solid #fff', boxSizing: 'border-box'}} />
      </ExampleCard>
    </div>
  );
};

// ------------------------------------------------------------------ rams
const RAM_FINAL = [610, 840, 1070];
const RAM_START = [2284, 2283, 2282]; // the rightmost ram leads (it has the farthest to go); nobody overtakes
const RAM_LEN = 22;
const RAM_S = 1.4;
const GROUND_Y = 612;
const Ram: React.FC<{i: number; N: number}> = ({i, N}) => {
  const t0 = RAM_START[i];
  if (N < t0) return null;
  const u = clamp01((N - t0) / RAM_LEN);
  const e = 1 - Math.pow(1 - u, 1.6);
  const cx = -300 + (RAM_FINAL[i] + 300) * e;
  const moving = u < 1 ? 1 : 0;
  const ph = (N - t0) * 0.9;
  const bob = moving * Math.abs(Math.sin(ph)) * 8;
  const swing = moving * 16 * Math.sin(ph);
  const head = CREW_HEADS[i % 2];
  const tunic = i % 2 ? '#9CAE91' : '#7FC4C0';
  const nod = kicks(N, [[t0 + RAM_LEN, 2.5]], 14, 10);
  const legs = [38, 62, 128, 152].map((x, j) => {
    const a = (j % 2 ? 1 : -1) * swing;
    return (
      <g key={j} transform={`rotate(${a} ${x} 98)`}>
        <path d={`M${x} 98V142`} stroke="#fff" strokeWidth={17} strokeLinecap="round" />
        <path d={`M${x} 98V142`} stroke="#4A4A52" strokeWidth={10} strokeLinecap="round" />
      </g>
    );
  });
  return (
    <div style={{position: 'absolute', left: cx - 100 * RAM_S, top: GROUND_Y - 146 * RAM_S - bob, width: 220 * RAM_S, height: 160 * RAM_S, filter: SHADOW_S}}>
      <svg width={220 * RAM_S} height={160 * RAM_S} viewBox="0 0 220 160" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <defs>
          <clipPath id={`ramclip${i}`}>
            <rect x={-20} y={0} width={260} height={150} />
          </clipPath>
        </defs>
        {/* the crew figure under the belly (only head and shoulders show between the legs) */}
        <g clipPath={`url(#ramclip${i})`}>
          <path d="M70 150 76 128Q82 122 100 122Q118 122 124 128L130 150Z" fill={tunic} stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
          <image href={IMG(head)} x={82} y={92} width={36} height={52} preserveAspectRatio="xMidYMid meet" />
        </g>
        {legs}
        {/* wool body */}
        <path d="M26 70Q14 42 48 38Q58 12 92 24Q124 6 146 34Q182 36 172 70Q184 98 146 100Q112 110 80 100Q40 108 26 70Z" fill="#fff" stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
        <path d="M26 70Q14 42 48 38Q58 12 92 24Q124 6 146 34Q182 36 172 70Q184 98 146 100Q112 110 80 100Q40 108 26 70Z" fill="#F4EFE3" />
        <path d="M56 56Q70 44 84 56M96 46Q110 34 124 46M120 74Q134 62 148 74M60 82Q74 72 88 82" fill="none" stroke="#DCD3BF" strokeWidth={4} strokeLinecap="round" />
        {/* head and horn */}
        <g transform={`rotate(${nod} 160 58)`}>
          <path d="M156 38Q198 28 206 62Q208 88 188 92Q164 90 156 66Z" fill="#fff" stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
          <path d="M156 38Q198 28 206 62Q208 88 188 92Q164 90 156 66Z" fill="#4A4A52" />
          <path d="M162 38Q150 18 168 14Q184 14 180 30" fill="none" stroke="#fff" strokeWidth={13} strokeLinecap="round" />
          <path d="M162 38Q150 18 168 14Q184 14 180 30" fill="none" stroke="#D9D3B7" strokeWidth={7} strokeLinecap="round" />
          <circle cx={186} cy={52} r={4.5} fill="#fff" />
        </g>
      </svg>
    </div>
  );
};
