import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, easeInOutPow} from '../../common';
import {C, CAST, FONT, Grain, PaperWipe, ExampleCard, DottedPath, PaperCharacter, slapCss, peelCss, prog} from '../../paper';
import {Back17, BG_END} from './bg';
import {Hand, Odometer4, heroMap, kick} from './kit';

/**
 * SC17 · frames 5422–5735 · S51–S54 · source IN HOMER / BOOKS 5, 7. Mint island (the sheet SC16 wipes in), sea on the left, a second sea with a horizon on the far right.
 * 5430 Odysseus slides in from the water and crawls up the beach; 5491 Calypso slaps in, the counter "DAY 2,555" rolls; 5540 the dialog "BECOME IMMORTAL?" with YES / NO;
 * 5602 a hand comes in from the right, nearly horizontal, and its index finger presses NO (he shakes his head; the question stays clear), the dialog closes; 5637 camera pans right toward the horizon (hand-over to chapter 3's map), he looks and points that way;
 * 5674 a dotted line runs from his hand to the horizon. Pan 5635–5675, ends 52 frames before the exit; the last element (dotted line) lands 5688, exit starts 5727 (39 frames).
 * Exit: the Ithaca sheet (#D9D3B7), the sheet of chapter card 3, wipes in over the last 8 frames.
 */
const F0 = 5422;
const END = 5735;
const EXIT = END - 8;
const B = {hero: 5430, calypso: 5491, dialog: 5540, no: 5602, pan: 5637, line: 5674};
const PAN = {a: 5635, len: 40, dx: 330};

const OD = {cx: 520, h: 480, y: 280};
const ODX = OD.cx - (OD.h * 380) / 540 / 2;
const HM = heroMap(ODX, OD.y, OD.h);
const CA = {cx: 1000, h: 420, y: 350};
const CAX = CA.cx - (CA.h * 380) / 540 / 2;
const DLG = {x: 588, y: 76, w: 380, h: 270, rot: -2};
const NO_BTN = {x: DLG.x + 13 + 263, y: DLG.y + 13 + 158 + 33};

export const SC17: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const cam = PAN.dx * prog(N, PAN.a, PAN.len, easeInOutPow(2.5));
  const world: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `translateX(${(-cam).toFixed(2)}px)`};
  const exitP = prog(N, EXIT, END - EXIT, easeOutCubic);

  // ---- Odysseus: slides in from the sea, crawls up the beach, gets up when Calypso arrives
  const e = easeOutCubic(clamp01((N - (B.hero - 2)) / 34));
  const dx = -820 * (1 - e);
  const get = prog(N, B.calypso, 24, easeInOutPow(2));
  const crawl = N < B.hero + 36 ? 5 * Math.sin((N - B.hero) / 3.6) * (1 - e) : 0;
  const pant = N >= B.hero + 34 && N < B.calypso ? 2.5 * Math.sin((N - B.hero) / 6) : 0;
  const rot = 62 + (26 - 62) * e + crawl - 23 * get + pant;
  const bobY = N < B.hero + 36 ? 7 * Math.abs(Math.sin((N - B.hero) / 5)) * (1 - e) : 0;
  // head: droops while crawling, listens, shakes "no" at 5602, looks up at the horizon from 5637
  const noN = N - B.no;
  const shake = noN >= 0 && noN < 26 ? Math.sin((noN / 26) * Math.PI * 4) * (1 - noN / 26) : 0;
  const look = prog(N, B.pan, 10, easeOutCubic);
  const headTilt = 12 * (1 - get) + [B.calypso, B.dialog, B.no, B.pan].reduce((a, f) => a + kick(N, f, 3, 15, 10), 0) + 8 * shake - 9 * look;
  const headTurn = 1 - 0.5 * Math.abs(shake) - 0.85 * look;
  const armUp = prog(N, B.pan + 1, 14, easeOutCubic); // right arm points at the horizon
  const armR = -(4 + 116 * armUp); // PaperCharacter: negative = out to the side; 120° = up and out, pointing at the horizon
  const armL = 4 + (N >= B.hero && N < B.hero + 36 ? 18 * Math.sin((N - B.hero) / 3.6) * (1 - e) : 0);

  // ---- Calypso
  const nC = N - B.calypso;
  const offer = N >= B.dialog && N < B.dialog + 40 ? Math.sin(((N - B.dialog) / 40) * Math.PI) : 0; // right arm opens toward the dialog
  const cHead = [B.calypso, B.dialog, B.dialog + 36].reduce((a, f) => a + kick(N, f, 3.5, 15, 10), 0) + 2.5 * Math.sin(clamp01((N - B.no) / 30) * Math.PI);

  // ---- counter
  const day = 2555 * easeOutCubic(clamp01((N - B.calypso) / 42));

  // ---- dialog and finger
  const dN = N - B.dialog;
  const closeP = clamp01((N - 5624) / 8);
  const dlgS = 1 - closeP * closeP;
  const fingerIn = easeOutCubic(clamp01((N - (B.no - 6)) / 10));
  const fingerOut = easeInOutPow(2)(clamp01((N - 5610) / 12));
  const pressK = N >= B.no + 2 && N < B.no + 8 ? Math.sin(((N - B.no - 2) / 6) * Math.PI) : 0;
  // a side hand (index finger extended to the left, thumb on top) slides in from the right along its own axis and presses the lower-right of NO,
  // so "BECOME IMMORTAL?", YES, the NO label and both faces stay clear
  const HAND_ROT = -18;
  const HAND_DIR = {x: Math.cos((HAND_ROT * Math.PI) / 180), y: Math.sin((HAND_ROT * Math.PI) / 180)}; // from the fingertip toward the cuff
  const TIP = {x: NO_BTN.x + 44, y: NO_BTN.y + 20};
  const travel = 520 * (1 - fingerIn) + 540 * fingerOut - 12 * pressK; // along the hand's axis, away from the button
  const tipX = TIP.x + HAND_DIR.x * travel, tipY = TIP.y + HAND_DIR.y * travel;
  const noPressed = N >= B.no + 3 && N < 5624 + 8;

  // ---- hand and arrow to the horizon
  const hand = HM.pt(455, 235); // fist of the raised right arm (shoulder pivot (328, 342), arm 165 units, 120° out and up)
  const sx = hand.x + 22, sy = hand.y - 20;
  const ex = 1486, ey = 296;
  const route = `M${sx.toFixed(1)} ${sy.toFixed(1)}Q1010 150 ${ex} ${ey}`;
  const arrow = `M${ex} ${ey}L${ex - 28} ${ey - 22}M${ex} ${ey}L${ex - 30} ${ey + 16}`;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={world}>
        <Back17 N={N} />
      </div>
      <Grain />
      <div style={world}>
        {/* counter on the left sea */}
        {N >= B.calypso - 2 && N < 5634 ? (
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, ...peelCss(N - 5626, 8, -1)}}>
            <ExampleCard x={60} y={128} w={320} h={200} rot={-3} n={N - B.calypso} dir={-1} label="DAY">
              <div style={{position: 'absolute', left: 20, top: 66}}>
                <Odometer4 value={day} size={90} />
              </div>
            </ExampleCard>
          </div>
        ) : null}

        {/* Odysseus crawling ashore */}
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: `${OD.cx}px 700px`, transform: `translate(${dx.toFixed(1)}px, ${bobY.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`}}>
          <PaperCharacter variant="hero" x={ODX} y={OD.y} h={OD.h} head={headTilt} headTurn={headTurn} headFlip={-1} armL={armL} armR={armR} />
        </div>

        {/* Calypso */}
        {nC >= 0 ? (
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: `${CA.cx}px 740px`, ...slapCss(nC, 0, -1)}}>
            <PaperCharacter x={CAX} y={CA.y} h={CA.h} {...CAST.calypso} head={cHead} headFlip={1} armR={-(10 + 42 * offer)} armL={6} />
          </div>
        ) : null}

        {/* dialog box */}
        {dN >= 0 && closeP < 1 ? (
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: `${DLG.x + DLG.w / 2}px ${DLG.y + DLG.h / 2}px`, transform: `scale(${dlgS.toFixed(3)}) rotate(${(closeP * -8).toFixed(2)}deg)`}}>
            <ExampleCard x={DLG.x} y={DLG.y} w={DLG.w} h={DLG.h} rot={DLG.rot} n={dN}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 18, textAlign: 'center', fontFamily: FONT, fontWeight: 900, color: C.graphite}}>
                <div style={{fontSize: 36, letterSpacing: 0, lineHeight: 1}}>BECOME</div>
                <div style={{fontSize: 52, letterSpacing: -2, lineHeight: 1.1, marginTop: 4}}>IMMORTAL?</div>
              </div>
              <Btn x={26} y={158} label="YES" face="#fff" color={C.navy} />
              <Btn x={188} y={158} label="NO" face={C.pink} color="#fff" pressed={noPressed} />
            </ExampleCard>
          </div>
        ) : null}
        {N >= B.no - 6 && fingerOut < 1 ? <Hand x={tipX} y={tipY} rot={HAND_ROT} s={0.9} /> : null}

        {/* dotted line from his hand to the horizon */}
        <DottedPath d={route} N={N} reveal={prog(N, B.line, 14, easeOutCubic)} speed={0.8} width={8} arrow={arrow} />
      </div>
      <PaperWipe p={exitP} color={BG_END} from="right" />
    </AbsoluteFill>
  );
};

const Btn: React.FC<{x: number; y: number; label: string; face: string; color: string; pressed?: boolean}> = ({x, y, label, face, color, pressed}) => (
  <div style={{position: 'absolute', left: x, top: y + (pressed ? 5 : 0), width: 140, height: 66, borderRadius: 18, boxSizing: 'border-box', border: `4px solid ${C.navy}`, background: pressed ? '#C9567A' : face, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 32, color, boxShadow: pressed ? 'none' : `0 5px 0 ${C.navy}`, transform: pressed ? 'scale(0.95)' : undefined}}>{label}</div>
);
