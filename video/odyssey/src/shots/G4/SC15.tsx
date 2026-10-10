import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic} from '../../common';
import {C, FONT, Grain, PaperWipe, PaperTag, ExampleCard, PhotoPrint, DottedPath, IMG, slapCss, prog} from '../../paper';
import {Back15, Back16, BG16} from './bg';
import {Cursor, Whirlpool} from './kit';

/**
 * SC15 · frames 4769–5139 · S46–S48 · source IN HOMER / BOOK 12. Dark water strait (#285F80), drifting waves.
 * 4777 poll card "WHICH WAY?" slaps in (generic, no app name): "SCYLLA — 6 HEADS" / "CHARYBDIS — DRAINS 3× A DAY";
 * 4848 the Flaxman Scylla print slides in at the left, the pointer picks the Scylla row; 4927 the pointer moves to the Charybdis row;
 * 4988 the coded whirlpool slaps in at the right and spins up; 5071 the poll closes itself (6 frames) and "6" slaps on the Scylla side at 5074 (no close-up of the monster's victims).
 * Hold: "6" lands 5074 → 5084, exit starts 5131 (49 frames). Exit: the sun-god sheet (sky #8DB9D3 with yellow ground) wipes in over the last 8 frames.
 */
const F0 = 4769;
const END = 5139;
const EXIT = END - 8;
const B = {poll: 4777, print: 4848, charyb: 4927, whirl: 4988, close: 5071};

const CARD = {x: 380, y: 108, w: 520, h: 316, rot: -2};
const ROW_Y = [96, 182]; // inside the card's border box
const ROW_H = 74;
const rowCentre = (i: number) => ({x: CARD.x + 13 + 22 + 17, y: CARD.y + 13 + ROW_Y[i] + ROW_H / 2});
const PRINT = {x: 44, y: 322, w: 360, h: 281};
const WP = {cx: 1068, cy: 452, d: 320};

// spins up over 40 frames to 9°/frame, holds, then slows to 1°/frame by n = 100 (5088) so the hold is calm
const spin = (n: number) => {
  if (n < 0) return 0;
  if (n < 40) return (9 * n * n) / 80;
  if (n < 60) return 180 + 9 * (n - 40);
  if (n < 100) return 360 + 9 * (n - 60) - (8 * (n - 60) * (n - 60)) / 80;
  return 560 + (n - 100);
};

export const SC15: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitP = prog(N, EXIT, END - EXIT, easeOutCubic);

  // poll closes itself at 5071: shrinks and turns away in 6 frames
  const closeP = clamp01((N - B.close) / 6);
  const pollS = 1 - closeP * closeP;
  const pollGone = N >= B.close + 6;

  // print slides in from the left edge
  const nPrint = N - (B.print - 2);
  const pe = easeOutCubic(clamp01(nPrint / 18));

  // pointer: appears at the Scylla row, glides to the Charybdis row
  const r1 = rowCentre(0), r2 = rowCentre(1);
  const glide = prog(N, B.charyb, 12, easeOutCubic);
  const cur = {x: r1.x + 8 + (r2.x - r1.x) * glide, y: r1.y + 6 + (r2.y - r1.y) * glide};
  const curIn = clamp01((N - (B.print - 2)) / 5);
  const press = (f: number) => (N >= f && N < f + 6 ? Math.sin(((N - f) / 6) * Math.PI) : 0);
  const sel = N >= B.charyb + 12 ? 1 : N >= B.print + 3 ? 0 : -1;

  const nWp = N - B.whirl;
  // when the poll closes the two pictures move toward the middle
  const cmp = easeOutCubic(clamp01((N - B.close) / 16));
  const wpx = WP.cx - 100 * cmp;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill>
        <Back15 N={N} />
      </AbsoluteFill>
      <Grain />

      {/* Scylla print: Flaxman, Rijksmuseum RP-P-1975-75-61 (crop in MANIFEST.md), white border, hard shadow */}
      {N >= B.print - 2 ? (
        <PhotoPrint src={IMG('scylla_rijks_RP-P-1975-75-61.jpg')} x={PRINT.x} y={PRINT.y} w={PRINT.w} h={PRINT.h} rot={-4 + 7 * (1 - pe)} n={99} style={{transform: `translateX(${(-560 * (1 - pe) + 120 * cmp).toFixed(1)}px)`}} />
      ) : null}

      {/* coded whirlpool */}
      {nWp >= 0 ? (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: `${wpx}px ${WP.cy}px`, ...slapCss(nWp, 0, 1)}}>
          <Whirlpool cx={wpx} cy={WP.cy} d={WP.d} rot={spin(nWp)} contrast={1 - 0.55 * clamp01((N - B.close) / 20)} />
        </div>
      ) : null}

      {/* dotted connectors from the poll rows to the pictures (they leave with the poll) */}
      {!pollGone ? (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, opacity: 1 - closeP}}>
          <DottedPath d="M376 270Q300 270 236 318" N={N} reveal={prog(N, B.print + 2, 12, easeOutCubic)} speed={0.7} width={7} arrow="M236 318 250 296M236 318 262 322" />
          <DottedPath d="M904 340Q964 296 1040 290" N={N} reveal={prog(N, B.whirl + 2, 12, easeOutCubic)} speed={0.7} width={7} arrow="M1040 290 1018 280M1040 290 1022 308" />
        </div>
      ) : null}

      {/* the poll */}
      {N >= B.poll - 2 && !pollGone ? (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: `${CARD.x + CARD.w / 2}px ${CARD.y + CARD.h / 2}px`, transform: `scale(${pollS.toFixed(3)}) rotate(${(closeP * 9).toFixed(2)}deg)`}}>
          <ExampleCard x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} rot={CARD.rot} n={N - B.poll}>
            <div style={{position: 'absolute', left: 26, top: 14, fontFamily: FONT, fontWeight: 900, fontSize: 50, letterSpacing: -2, color: C.graphite, lineHeight: 1.1}}>WHICH WAY?</div>
            <div style={{position: 'absolute', left: 22, right: 22, top: 82, height: 3, background: C.rule}} />
            <Row y={ROW_Y[0]} text="SCYLLA — 6 HEADS" selected={sel === 0} />
            <Row y={ROW_Y[1]} text="CHARYBDIS — DRAINS 3× A DAY" selected={sel === 1} />
          </ExampleCard>
          {curIn > 0 ? <Cursor x={cur.x} y={cur.y} s={curIn} press={Math.max(press(B.print + 3), press(B.charyb + 12))} /> : null}
        </div>
      ) : null}

      {/* "6" on the Scylla side */}
      <PaperTag text="6" x={252 + 120 * cmp} y={258} rot={-6} size={150} n={N - (B.close + 3)} bg={C.yellow} color={C.navy} />

      <PaperWipe p={exitP} color={BG16} from="right">
        <Back16 N={END + 1} />
      </PaperWipe>
    </AbsoluteFill>
  );
};

/** Poll option row: radio + label. Positioned inside the card's border box. */
const Row: React.FC<{y: number; text: string; selected: boolean}> = ({y, text, selected}) => (
  <div style={{position: 'absolute', left: 16, right: 16, top: y, height: ROW_H, borderRadius: 18, boxSizing: 'border-box', border: `3px solid ${selected ? C.pink : C.rule}`, background: selected ? '#FFF1C4' : '#fff'}}>
    <div style={{position: 'absolute', left: 14, top: 17, width: 34, height: 34, borderRadius: 17, boxSizing: 'border-box', border: `4px solid ${C.navy}`, background: '#fff'}}>
      {selected ? <div style={{position: 'absolute', left: 4, top: 4, width: 18, height: 18, borderRadius: 9, background: C.pink}} /> : null}
    </div>
    <div style={{position: 'absolute', left: 62, top: 0, height: ROW_H - 6, display: 'flex', alignItems: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 21, letterSpacing: 0, color: C.navy, whiteSpace: 'nowrap'}}>{text}</div>
  </div>
);
