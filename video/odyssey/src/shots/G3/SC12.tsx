import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic} from '../../common';
import {C, FONT, SET, SHAPES, SHADOW, SHADOW_S, PaperBg, PaperWipe, ExampleCard, Ship, IMG, slapCss, prog, rock} from '../../paper';
import {Roller, RockShadow, smooth, CIRCE_SHAPE} from './parts';

/**
 * SC12 · frames 3787–4004 · S34–S36 · source IN HOMER / BOOK 10. Terracotta with the sand shape (as SC02).
 * 3787 starts on the sheet the SC11 wipe left. 3795 the Cleveland warship dinos (as SC03, whole object) slaps in with twelve paper ships around it.
 * 3842 giant shadows of thrown rocks sweep across the frame (no giants shown): the table jolts when one lands.
 * 3901 the counter card slaps ("12 →" over a number that rolls 12 → 1); from 3903 the ships fall off the table one by one (every 3.2 frames), the number
 *   counts them down, more rock shadows cross. The last ship stays: his. 3952 (S36 "Now there is one.") has no new element: the counter already shows 1 from 3935.
 * Hold: last ship gone ~3953 → exit 3997 (44 frames). Exit: the lavender sheet of SC13 (with its plum shape) wipes in over the last 8 frames.
 */
const F0 = 3787;
const END = 4004;
const B = {dinos: 3795, shadows: 3842, counter: 3901};
const EXIT = 3997;
const DROP0 = 3903;
const DROP_STEP = 3.2;

const DINOS = {x: 270, y: 152, w: 470};
// twelve ships in two rows on the sand; index 8 is his (stays)
const SHIPS: Array<{x: number; y: number; w: number}> = [
  ...[80, 270, 460, 650, 840, 1030].map((x) => ({x, y: 590, w: 104})),
  ...[175, 365, 555, 745, 935, 1125].map((x) => ({x, y: 650, w: 104})),
];
const HIS = 8;
SHIPS[HIS] = {...SHIPS[HIS], w: 126};
// drop order: the other eleven, left to right
const ORDER = SHIPS.map((s, i) => ({i, x: s.x})).filter((s) => s.i !== HIS).sort((a, b) => a.x - b.x).map((s) => s.i);
const dropTime = (i: number) => DROP0 + DROP_STEP * ORDER.indexOf(i);

// rock shadows: t0, duration, from → to (frame px), scale, spin; they cross the whole frame
const SHADOWS = [
  {t0: 3842, dur: 26, from: [-300, 120], to: [1560, 520], s: 1.15, spin: 3},
  {t0: 3853, dur: 28, from: [-300, 520], to: [1560, 190], s: 1.0, spin: -4},
  {t0: 3866, dur: 26, from: [-300, 330], to: [1560, 640], s: 1.3, spin: 2.5},
  {t0: 3901, dur: 28, from: [-300, 470], to: [1560, 600], s: 1.1, spin: -3},
  {t0: 3913, dur: 26, from: [-300, 160], to: [1560, 560], s: 1.25, spin: 4},
  {t0: 3924, dur: 26, from: [-300, 600], to: [1560, 300], s: 1.0, spin: -2.5},
];
// the table jolts when a shadow is over the middle of the frame
const THUDS = SHADOWS.map((s) => s.t0 + Math.round(s.dur * 0.5));

export const SC12: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const wipe = prog(N, EXIT, END - EXIT, easeOutCubic);
  const jolt = THUDS.reduce((acc, t) => (N >= t && N < t + 8 ? acc + 6 * Math.sin(((N - t) / 8) * Math.PI) * (1 - (N - t) / 8) : acc), 0);

  // ships fallen so far (fractional while the last one drops out of the count)
  const fallen = ORDER.reduce((acc, i) => acc + smooth((N - dropTime(i)) / 3), 0);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <PaperBg color={SET.troy.bg}>
        <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
          <path d={SHAPES.troySand} fill={SET.troy.shape} />
        </svg>
      </PaperBg>

      <div style={{position: 'absolute', inset: 0, transform: `translateY(${jolt}px)`}}>
        {/* the Cleveland warship dinos, whole object (as SC03) */}
        {N >= B.dinos - 6 ? (
          <div style={{position: 'absolute', left: DINOS.x, top: DINOS.y, width: DINOS.w, filter: SHADOW, transformOrigin: '50% 90%', ...slapCss(N - B.dinos, -1, -1)}}>
            <Img src={IMG('dinos_cma1971.46.png')} style={{width: DINOS.w, height: 'auto', display: 'block'}} />
          </div>
        ) : null}

        {/* the fleet */}
        <div style={{position: 'absolute', inset: 0, filter: SHADOW_S}}>
          {SHIPS.map((p, i) => {
            const n = N - (B.dinos + Math.floor(i / 3));
            if (n < -6) return null;
            const T = i === HIS ? 1e9 : dropTime(i);
            const t = N - T;
            const dir = i % 2 ? 1 : -1;
            let x = p.x, y = p.y, rot = rock(N, 1.8, 52, i * 9);
            if (t >= 0) {
              const u = Math.max(0, t - 2);
              y = p.y - (t < 3 ? 10 * Math.sin((t / 3) * Math.PI) : 0) + 1.2 * u * u;
              x = p.x + dir * 1.4 * t;
              rot += dir * 4.5 * t;
              if (y > 840) return null;
            }
            return (
              <div key={i} style={{position: 'absolute', inset: 0, transformOrigin: `${p.x}px ${p.y}px`, ...(t < 0 ? slapCss(n, 0, dir as 1 | -1) : {})}}>
                <Ship x={x} y={y} w={p.w} rot={rot} />
              </div>
            );
          })}
        </div>

        {/* counter: "12 →" over the number rolling 12 → 1 */}
        {N >= B.counter - 6 ? (
          <ExampleCard x={846} y={150} w={364} h={262} rot={3} n={N - B.counter} dir={-1}>
            <div style={{position: 'absolute', left: 26, top: 16, fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.grey, whiteSpace: 'nowrap'}}>12 →</div>
            <div style={{position: 'absolute', left: 24, top: 64}}>
              <Roller rows={['12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1']} p={fallen} size={150} w={300} color={C.graphite} />
            </div>
          </ExampleCard>
        ) : null}
      </div>

      {/* shadows of thrown rocks (the giants are never shown) */}
      {SHADOWS.map((s, i) => {
        const t = (N - s.t0) / s.dur;
        if (t < 0 || t > 1) return null;
        const q = t * t * (3 - 2 * t) * 0.35 + t * 0.65; // fast through the middle
        return <RockShadow key={i} x={s.from[0] + (s.to[0] - s.from[0]) * q} y={s.from[1] + (s.to[1] - s.from[1]) * q} s={s.s * (0.8 + 0.4 * Math.sin(Math.PI * t))} rot={s.spin * (N - s.t0) * 2} />;
      })}

      {/* exit: SC13's lavender sheet with its plum shape */}
      <PaperWipe p={wipe} color={SET.circe.bg} from="right">
        <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
          <path d={CIRCE_SHAPE} fill={SET.circe.shape} />
        </svg>
      </PaperWipe>
    </AbsoluteFill>
  );
};
