import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, easeInOutPow} from '../../common';
import {C, FONT, SET, SHADOW, PaperBg, PaperWipe, PaperTag, ExampleCard, PhotoPrint, PaperCharacter, CrowdFigure, CAST, CREW_HEADS, IMG, slapCss, prog} from '../../paper';
import {bump, kick, smooth, charPt, heroFistR, Snout, Sprig, HermesHand, PaperRing, CIRCE_SHAPE} from './parts';

/**
 * SC13 · frames 4005–4336 · S37–S41 · source IN HOMER / BOOK 10. Lavender (Circe) with a plum shape at the bottom right.
 * 4005 starts on the sheet the SC12 wipe left. 4013 Odysseus slaps in (right of centre, half-length, looks at the panel). 4046 the Circe krater picture
 *   (Met 253627, the MANIFEST crop: Circe only, the whole vessel shows nudity) slaps in top right as a print with a white border.
 *   4104–4113 the BEFORE / AFTER meme panel slides in from the left (crew A's head, then the same with a paper pig snout; the snout slaps on AFTER at 4111);
 *   caption "NEW BODY. SAME BRAIN.". 4161 Hermes's drawn hand slides in from the right edge with a herb sprig; Odysseus turns to it and reaches.
 *   4205 he takes the sprig, the hand slides away. 4247 the herb gets a cream paper ring (no purple); the "1 YEAR" tag slaps (pre-hung for S41, 4277).
 * Hold: ring and tag land 4247–4256 → exit 4329 (73 frames). Exit: the turquoise sheet of SC14 (#7FC4C0) wipes in over the last 8 frames.
 */
const F0 = 4005;
const END = 4336;
const B = {od: 4013, krater: 4046, panel: 4104, snout: 4111, hand: 4161, grab: 4205, ring: 4247};
const EXIT = 4329;

const OD = {x: 716, y: 340, h: 400, cropY: 540};
const PANEL = {x: 52, y: 190, w: 650, h: 420};
const PINCH = {x: 1062, y: 514};
const CELL = {h: 236, by: 336, ax: 156, bx: 468};

export const SC13: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const wipe = prog(N, EXIT, END - EXIT, easeOutCubic);

  // ---- Odysseus: faces the panel (left), turns to Hermes's hand, reaches, takes the sprig
  const turn = smooth((N - 4155) / 6);
  const headFlip = 1 - 2 * turn;
  const reach = smooth((N - 4152) / 10);
  const closeUp = smooth((N - B.grab) / 6);
  const armR = -6 - 106 * reach - 8 * closeUp + kick(N, B.grab, 3, 16, 10);
  const armL = 4 * Math.sin((N - B.od) / 15);
  const headTilt = bump(N, B.od, 4) + bump(N, B.krater, -4) + bump(N, 4108, 4) + bump(N, B.hand + 4, -4) + bump(N, B.grab, 4) + bump(N, B.ring, -4);
  const fist = heroFistR(armR);
  const fistPt = charPt(OD.x, OD.y, OD.h, OD.cropY, fist.u, fist.v);

  // ---- Hermes's hand: in from the right edge, out again after the sprig is taken
  const handIn = easeOutCubic(clamp01((N - B.hand) / 12));
  const handOut = smooth((N - 4210) / 14);
  const hx = 330 * (1 - handIn) + 330 * handOut;
  const hy = PINCH.y + 3 * Math.sin((N - B.hand) / 6);
  const g = smooth((N - B.grab) / 8); // sprig moves from Hermes's fingers to his fist
  const sprig = {x: PINCH.x + hx + (fistPt.x - PINCH.x - hx) * g, y: hy + (fistPt.y - hy) * g, rot: 75 - 4 * g};
  const ringAt = {x: sprig.x + 2, y: sprig.y - 84}; // centred on the sprig's leaves, clear of his face

  // ---- meme panel entrance: slides in from the left, settles with a small wobble
  const pn = N - B.panel;
  const slideX = pn < 0 ? -760 : pn < 10 ? -760 * (1 - easeOutCubic(pn / 10)) : pn < 15 ? 8 * Math.sin(((pn - 10) / 5) * Math.PI) * (1 - (pn - 10) / 5) : 0;
  // the krater print lands big on the left, then hops to the top right to make room for the panel
  const mv = prog(N, B.panel - 8, 10, easeInOutPow(2));
  const tiltCrew = (n0: number) => bump(N, n0, 3, 12);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <PaperBg color={SET.circe.bg}>
        <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
          <path d={CIRCE_SHAPE} fill={SET.circe.shape} />
        </svg>
      </PaperBg>

      {/* Odysseus, half-length: body runs off the bottom edge */}
      {N >= B.od - 6 ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: '860px 700px', ...slapCss(N - B.od, 0, 1)}}>
          <PaperCharacter variant="hero" x={OD.x} y={OD.y} h={OD.h} cropY={OD.cropY} head={headTilt} headFlip={headFlip} headTurn={0.9} armR={armR} armL={armL} />
        </div>
      ) : null}

      {/* Circe krater picture (Met 253627, MANIFEST crop) */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '996px 104px', transform: `translate(${-900 * (1 - mv)}px, ${86 * (1 - mv)}px) scale(${1 + 0.46 * (1 - mv)})`}}>
        <PhotoPrint src={IMG('circe_met253627_crop.jpg')} x={996} y={104} w={226} h={223} rot={4} n={N - B.krater} dir={1} />
      </div>

      {/* BEFORE / AFTER meme panel */}
      {N >= B.panel - 6 ? (
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${slideX}px)`}}>
          <ExampleCard x={PANEL.x} y={PANEL.y} w={PANEL.w} h={PANEL.h} rot={-2}>
            {/* header strips */}
            {(['BEFORE', 'AFTER'] as const).map((t, i) => (
              <div key={t} style={{position: 'absolute', left: i * 312, top: 0, width: i ? 312 : 312, height: 52, background: C.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: 1, color: C.navy}}>{t}</div>
            ))}
            <div style={{position: 'absolute', left: 310, top: 0, width: 4, height: 336, background: '#fff'}} />
            {/* the same man twice; the second with a paper pig snout */}
            {[CELL.ax, CELL.bx].map((cx, i) => (
              <CrowdFigure key={cx} head={CREW_HEADS[0]} cx={cx} by={CELL.by} h={CELL.h} tunic={CAST.crewA.robeFill} line={CAST.crewA.robeLine} headTilt={(i ? 1 : -1) * 1.5 + tiltCrew(4108 + 3 * i) + (i ? bump(N, B.snout + 2, 4, 12) : 0)} />
            ))}
            {N >= B.snout - 6 ? (
              <div style={{position: 'absolute', inset: 0, transformOrigin: `${CELL.bx}px 184px`, ...slapCss(N - B.snout, 0, 1)}}>
                <Snout x={CELL.bx} y={186} w={62} />
              </div>
            ) : null}
            {/* caption bar */}
            <div style={{position: 'absolute', left: 0, top: 336, width: 624, height: 58, background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 36, letterSpacing: 0.5, color: C.cream, whiteSpace: 'nowrap'}}>NEW BODY. SAME BRAIN.</div>
          </ExampleCard>
        </div>
      ) : null}

      {/* "1 YEAR" (pre-hung: S41 starts at 4277) */}
      <PaperTag text="1 YEAR" x={505} y={146} rot={-5} size={64} n={N - B.ring} bg={C.yellow} color={C.navy} />

      {/* Hermes's drawn hand with the herb sprig; the ring marks the herb once it works */}
      {N >= B.hand - 6 && N < 4226 ? <HermesHand x={PINCH.x + hx} y={hy} /> : null}
      <PaperRing x={ringAt.x} y={ringAt.y} r={56} N={N} n={N - B.ring} />
      {N >= B.hand - 6 ? <Sprig x={sprig.x} y={sprig.y} rot={sprig.rot} /> : null}

      {/* exit: SC14's turquoise sheet */}
      <PaperWipe p={wipe} color={SET.sirens.bg} from="right" />
    </AbsoluteFill>
  );
};
