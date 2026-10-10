import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {easeOutCubic} from '../../common';
import {C, FONT, SET, SHADOW, PaperBg, PaperWipe, ExampleCard, PaperCharacter, Boat, Waves, slapCss, prog, rock} from '../../paper';
import {CharSpace, BabyBundle, kick, kicks} from './kit';

/**
 * SC04 · frames 1092–1328 · S08–S10. Ithaca sand + sage shore.
 * 1092 starts on the flat Ithaca sheet that SC03 wipes in; the sea and the shore slide up from 1094 (beat 1100 −6).
 * 1100 Penelope slaps in on the shore, looking out to sea. 1176 the swaddled baby slaps into her arms; camera push-in 1.0 → 1.08 over 45 frames from 1176.
 * 1245 navigator card "ETA: SOON" slaps top-right; from 1275 the flap spins SOON → ?? → ??? → ?? (pre-hang for the short last block at 1286).
 * Hold: the card lands 1245 (settled 1255) → exit 1320: no new element, no camera move after 1221. Exit: the plum sheet of SC05 wipes in over 1320–1328.
 */
const F0 = 1092;
const END = 1328;
const B = {a: 1100, b: 1176, c: 1245, d: 1286};
const EXIT = END - 8;
const SPIN = 1275;

// Penelope: half-length, body runs off the bottom edge
const PEN = {x: 150, y: 112, h: 640};
// the baby bundle sits in the crook of her arms, symbol coordinates of the penelope body
const BABY = {u: 200, v: 452, rot: -14};

export const SC04: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const cam = 1 + 0.08 * prog(N, B.b, 45);
  const sea = prog(N, 1094, 12, easeOutCubic);
  const shore = prog(N, 1095, 12, easeOutCubic);
  const sunUp = prog(N, B.a, 22, easeOutCubic);
  const wipe = prog(N, EXIT, 8, easeOutCubic);
  const nP = N - B.a;
  const headTilt = kicks(N, [[B.a, 4], [B.b, -5], [B.c, 2.5]], 20, 12) + kick(N, B.d, -1.6, 20, 8);
  const babySway = kicks(N, [[B.b + 8, 2.4], [B.c, 1.2]], 26, 18) + kick(N, B.d, -0.8, 26, 8);
  const armA = kicks(N, [[B.b, -2.5], [B.c, 1.5]], 24, 16) + kick(N, B.d, -1, 24, 8);
  const dot = N < SPIN ? 0.08 : 0.08 + 0.1 * Math.abs(Math.sin((N - SPIN) / 8)); // the route dot twitches while the ETA spins
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <PaperBg color={SET.ithaca.bg}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '600px 440px', transform: `scale(${cam})`}}>
          {/* sea: horizon at y 440, far and near bands */}
          <div style={{position: 'absolute', left: 0, top: (1 - sea) * 560, width: 1280, height: 720}}>
            <Waves top={440} drift={N * 0.6} />
            {/* a far boat on the horizon, rocking */}
            <Boat x={866} y={402} s={0.11} rot={rock(N, 3, 70)} />
          </div>
          {/* the shore: sage hill with a white edge, runs off the bottom */}
          <div style={{position: 'absolute', left: 0, top: (1 - shore) * 560, width: 1280, height: 720, filter: SHADOW}}>
            <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <circle cx={176} cy={236 + 380 * (1 - sunUp)} r={58} fill={SET.ithaca.sun} />
              <path d="M-160 566C40 508 280 500 450 538C590 568 690 622 800 820H-160Z" fill={SET.ithaca.shape} />
              <path d="M-160 566C40 508 280 500 450 538C590 568 690 622 800 820" fill="none" stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
            </svg>
          </div>
          {/* Penelope with the baby */}
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '350px 700px', ...slapCss(nP, 0, -1)}}>
            <PaperCharacter variant="penelope" x={PEN.x} y={PEN.y} h={PEN.h} headFlip={-1} head={headTilt} armL={-6 + armA} armR={-6 - armA} />
            <div style={{filter: SHADOW}}>
              <CharSpace x={PEN.x} y={PEN.y} h={PEN.h}>
                <BabyBundle cx={BABY.u} cy={BABY.v} rot={BABY.rot} n={N - B.b} sway={babySway} scale={1.4} />
              </CharSpace>
            </div>
          </div>
          {/* navigator card: ETA: SOON */}
          <ExampleCard x={820} y={124} w={350} h={196} rot={3} n={N - B.c} label="ETA">
            <div style={{position: 'absolute', left: 38, top: 70}}>
              <Spin N={N} />
            </div>
            <div style={{position: 'absolute', left: 22, right: 22, top: 152, height: 6, borderRadius: 3, background: C.rule}} />
            <div style={{position: 'absolute', left: 22, top: 152, width: 290 * dot, height: 6, borderRadius: 3, background: C.pink}} />
            <div style={{position: 'absolute', left: 22 + 290 * dot - 9, top: 146, width: 18, height: 18, borderRadius: 9, background: C.pink, border: '3px solid #fff', boxSizing: 'border-box'}} />
          </ExampleCard>
        </div>
        {/* exit: the feast sheet of SC05 wipes in */}
      </PaperBg>
      <PaperWipe p={wipe} color={SET.feast.bg} from="right" />
    </AbsoluteFill>
  );
};

/** The ETA value: a window with the text rolling up like a slot reel, SOON → ?? → ??? → ?? from 1275, a new roll every 18 frames to the end. */
const REEL = ['SOON', '??', '???', '??'];
const Spin: React.FC<{N: number}> = ({N}) => {
  const lh = 66;
  let pos = 0;
  for (let i = 0; i < REEL.length - 1; i++) pos += prog(N, SPIN + 18 * i, 14);
  return (
    <div style={{position: 'relative', width: 262, height: lh, overflow: 'hidden', background: '#E9DFCB', borderRadius: 10, border: '4px solid #fff', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: 0, top: -pos * lh, width: '100%'}}>
        {REEL.map((t, i) => (
          <div key={i} style={{height: lh, lineHeight: `${lh - 8}px`, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 46, letterSpacing: -2, color: C.navy}}>{t}</div>
        ))}
      </div>
    </div>
  );
};
