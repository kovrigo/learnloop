import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, easeInOutPow} from '../../common';
import {SET, SHAPES, IMG, SHADOW, SHADOW_S, C, PaperBg, PaperWipe, PaperTag, DottedPath, PaperCharacter, Boat, Ship, Waves, slapCss, prog, rock, samplePath} from '../../paper';

/**
 * SC03 · frames 926–1091 · S07 · source IN HOMER / BOOK 9.
 * Sea palette (V2 waves). The Cleveland warship dinos (1971.46) stands centre-left as a whole-object cut-out.
 * 934 Odysseus slaps in on his paper boat in front of it, name tag 3 frames later (beat window +3), head turns to the viewer.
 * 1001 (S07.c2 −3) twelve paper ships peel off the vase every 3 frames and sail right along a dotted path;
 * "12 SHIPS" slaps with the 12th ship (1034). Parallax slide left from 1004 (40 frames, sea layers at 3 speeds).
 * Hold: tag lands 1044 → exit 1084 (40 frames). Exit: the Ithaca sheet wipes over (1084–1091).
 */
const F0 = 926;
const END = 1091;
const B = {s07a: 934, s07b: 1004};
const SHIPS0 = B.s07b - 3;
const EXIT = 1084;
const DINOS = {x: 318, y: 132, w: 420}; // PNG 1328×1156 → h 365
const PATH = samplePath([[628, 222], [744, 316], [890, 390], [1060, 418], [1236, 410]]);
const slotT = (i: number) => 0.97 - i * 0.074;

export const G1_03: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const enter = prog(N, F0, 7, easeOutCubic); // sea sheet slides over SC02's terracotta (926–932)
  const par = prog(N, B.s07b, 40, easeInOutPow(2.4)); // parallax slide left
  const shift: [number, number, number] = [-18 * par, -36 * par, -58 * par];
  const content = -30 * par;
  const wipe = prog(N, EXIT, END - EXIT, easeOutCubic);
  const boatRot = rock(N, 1.4, 96); // the big boat rocks slowly so the hold reads as settled
  const nO = N - B.s07a;
  const headTurn = nO < 0 ? 0.4 : 0.4 + 0.6 * easeOutCubic(clamp01((nO - 4) / 14));
  const headTilt = nO < 0 ? 0 : 5 * Math.sin(clamp01((nO - 4) / 18) * Math.PI) - 2;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* SC02's background under the incoming sheet */}
      {enter < 1 ? (
        <PaperBg color={SET.troy.bg}>
          <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
            <path d={SHAPES.troySand} fill={SET.troy.shape} />
          </svg>
        </PaperBg>
      ) : null}
      <PaperWipe p={enter} color={SET.sea.sky} from="right">
        {/* far wave band (behind the vase) */}
        <Waves top={452} shift={shift} only={[0]} />
        {/* dinos, whole object, standing in the sea */}
        <div style={{position: 'absolute', left: DINOS.x + content * 0.8, top: DINOS.y, width: DINOS.w, filter: SHADOW}}>
          <Img src={IMG('dinos_cma1971.46.png')} style={{width: DINOS.w, height: 'auto', display: 'block'}} />
        </div>
        {/* nearer bands: hide the vase foot in the sea */}
        <Waves top={452} shift={shift} only={[1, 2]} />
      </PaperWipe>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${content}px)`}}>
        {/* dotted route and the twelve ships */}
        <DottedPath d={PATH.d} N={N} reveal={prog(N, SHIPS0, 24, easeOutCubic)} speed={0.7} />
        <div style={{position: 'absolute', inset: 0, filter: SHADOW_S}}>
          {Array.from({length: 12}, (_, i) => {
            const start = SHIPS0 + 3 * i;
            if (N < start) return null;
            const dur = 12 + 16 * slotT(i);
            const u = easeOutCubic(clamp01((N - start) / dur));
            const k = PATH.at(slotT(i) * u);
            const peelOff = clamp01((N - start) / 4);
            return <Ship key={i} x={k.x} y={k.y} w={44 + 24 * peelOff} rot={(1 - peelOff) * -18 + rock(N, 2, 50, i * 9)} op={Math.min(1, peelOff * 2)} />;
          })}
        </div>
        {/* Odysseus on his boat, in front of the vase */}
        {nO >= 0 ? (
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, ...slapCss(nO, 0, -1), transformOrigin: '344px 458px'}}>
            <Boat x={104} y={270} s={0.66} rot={boatRot} sailDx={150}>
              <PaperCharacter variant="hero" x={-8} y={-147} h={500} cropY={450} head={headTilt} headTurn={headTurn} armR={6 * Math.sin((N - B.s07a) / 16)} armL={-3 * Math.sin((N - B.s07a) / 19)} />
            </Boat>
          </div>
        ) : null}
        <PaperTag text="ODYSSEUS · KING OF ITHACA" x={356} y={556} rot={-3} size={24} n={N - (B.s07a + 3)} bg={C.cream2} color={C.navy} />
        <PaperTag text="12 SHIPS" x={1000} y={238} rot={4} size={72} n={N - (SHIPS0 + 33)} bg={C.yellow} color={C.navy} />
      </div>
      {/* exit: the Ithaca sheet */}
      <PaperWipe p={wipe} color={SET.ithaca.bg} from="right" />
    </AbsoluteFill>
  );
};
