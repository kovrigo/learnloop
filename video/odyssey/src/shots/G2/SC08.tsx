import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic} from '../../common';
import {C, FONT, SET, SHADOW, PaperBg, PaperWipe, PaperCharacter, Boat, Waves, SpeechBubble, DottedPath, peelCss, prog, rock} from '../../paper';
import {kicks, arrowHead} from './kit';
import {LocationCard} from './shared';
import {DeepStatic} from './SC09';

/**
 * SC08 · frames 2351–2701 · S21–S23 · source IN HOMER / BOOK 9 (V2 frame: sky, waves, Odysseus in the boat).
 * SC07's sky sheet with the V2 waves is on screen at 2351; the shore (the Cyclops' island) rises behind the far wave from 2354.
 * 2359 the boat with Odysseus slides in, he faces the shore and shouts.  2439 / 2512 / 2543 the bubble lines "ODYSSEUS" / "SON OF LAERTES" / "ITHACA" type in.
 * 2575 the bubble peels off.  2583 the card "LOCATION SHARED · ITHACA · Odysseus, unfortunately · VISIBLE TO: POLYPHEMUS" slaps in (all four lines at once: pre-hang for 2650)
 * while the camera follows it right (42 frames); the dotted arrow runs from the card to the shore.
 * Hold: the pan ends 2625, the arrow lands 2614 → exit 2693. Exit: the deep-water sheet of SC09 wipes in over 2693–2701.
 */
const F0 = 2351;
const END = 2701;
const B = {boat: 2359, l1: 2439, l2: 2512, l3: 2543, card: 2583};
const EXIT = END - 8;
const PAN = 150;
const BOAT = {x: 190, y: 150, s: 1};
const CARD = {x: 1090, y: 250, scale: 0.8};
const LINES: Array<[string, number]> = [['ODYSSEUS', B.l1], ['SON OF LAERTES', B.l2], ['ITHACA', B.l3]];

/** The V2 sea as SC07's wipe sheet draws it (sky is the sheet colour). */
export const SeaStatic: React.FC = () => <Waves top={452} />;

export const SC08: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const pan = prog(N, B.card, 42);
  const wipe = prog(N, EXIT, 8, easeOutCubic);
  const island = prog(N, 2354, 12, easeOutCubic);
  const slide = 1 - easeOutCubic(clamp01((N - B.boat) / 20));
  const calm = 1 - 0.65 * prog(N, 2556, 20, (t) => t); // he has finished shouting: the boat and his arms settle
  const boatRot = rock(N, 1.5 * calm, 96);
  const head = kicks(N, [[B.boat + 14, 3], [B.l1, -4], [B.l2, -4], [B.l3, -4]], 20, 14) - 4;
  const sw = (p: number, ph = 0) => Math.sin(((N + ph) / p) * Math.PI * 2);
  const bubblePeel = peelCss(N - 2575, 8, 1);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <PaperBg color={SET.sea.sky}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `translateX(${(-PAN * pan).toFixed(2)}px)`}}>
          <Waves top={452} drift={(N - F0) * 0.5} only={[0]} />
          {/* the shore: the Cyclops' island with its cave mouth, rises behind the near waves */}
          <div style={{position: 'absolute', left: 0, top: (1 - island) * 140, width: 1280, height: 720, filter: SHADOW}}>
            <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <path d="M970 580Q1010 506 1110 484Q1190 452 1284 474Q1360 486 1420 580Z" fill={SET.cave.shape} stroke="#fff" strokeWidth={9} strokeLinejoin="round" />
              <ellipse cx={1152} cy={522} rx={44} ry={28} fill="#1E1E25" />
            </svg>
          </div>
          <Waves top={452} drift={(N - F0) * 0.5} only={[1, 2]} />
          {/* Odysseus in the boat, facing the shore */}
          {N >= B.boat ? (
            <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `translateX(${(-900 * slide).toFixed(1)}px)`}}>
              <Boat x={BOAT.x} y={BOAT.y} s={BOAT.s} rot={boatRot} sailDx={60}>
                <PaperCharacter variant="hero" x={-26} y={-5} h={500} cropY={450} headFlip={-1} head={head} armR={-96 + 8 * calm * sw(30)} armL={-22 + 5 * calm * sw(37, 7)} />
              </Boat>
            </div>
          ) : null}
          {/* the shouted bubble, typed line by line */}
          {N >= B.l1 && N < 2583 ? (
            <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, ...(N >= 2575 ? bubblePeel : {})}}>
              <SpeechBubble x={620} y={92} w={540} h={262} tx={496} ty={292} n={N - B.l1}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
                  {LINES.map(([t, f], i) => (
                    <Typed key={t} text={t} n={N - f} size={i === 2 ? 74 : 52} />
                  ))}
                </div>
              </SpeechBubble>
            </div>
          ) : null}
          {/* the card, then the dotted arrow to the shore */}
          <DottedPath d="M966 404C972 452 1060 470 1124 490" N={N} reveal={prog(N, B.card + 3, 22, easeOutCubic)} speed={0.6} width={7} arrow={arrowHead(1136, 498, 24, 22)} />
          <LocationCard x={CARD.x} y={CARD.y} scale={CARD.scale} n={N - B.card} />
        </div>
      </PaperBg>
      <PaperWipe p={wipe} color={SET.night.bg} from="right">
        <DeepStatic />
      </PaperWipe>
    </AbsoluteFill>
  );
};

/** One bubble line: types in over 10 frames; the full text keeps its place (hidden letters stay in the layout). */
const Typed: React.FC<{text: string; n: number; size: number}> = ({text, n, size}) => {
  const shown = n < 0 ? 0 : Math.min(text.length, Math.ceil((text.length * (n + 1)) / 10));
  return (
    <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: size >= 70 ? -3 : -1, lineHeight: 1.12, color: C.graphite, whiteSpace: 'nowrap'}}>
      <span>{text.slice(0, shown)}</span>
      <span style={{opacity: 0}}>{text.slice(shown)}</span>
    </div>
  );
};
