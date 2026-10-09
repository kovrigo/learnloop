import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeInOutPow} from '../common';
import {SUBS} from '../common/subs';
import {VIDEO} from '../config';
import {FONT, C, SET, SHAPES, SHADOW, PaperBg, slapCss, prog} from '../paper';
import {S} from './Overlay';

/**
 * LearnLoop sting between the cold open and S05 (storyboard G0): the map sky sheet stays; paper letters
 * L-E-A-R-N-L-O-O-P slap in 3 frames apart; a yellow loop arrow runs once around the word; a cream strip
 * "THE ODYSSEY · A TEN-YEAR TRIP HOME" lands below. No voice for the first 3 s, then the greeting S04:
 * its first subtitle block ("Hi, and welcome to LearnLoop,") starts the letter wave (each bobs 8 px up and back, 2 frames apart);
 * its second block ("where old stories loop back to your life.") starts a second lap of the loop arrow (a bright run along
 * the same path, 30 frames, easeInOut). Last 10 frames: the sheet slides up while the next background (SC02 terracotta) slides in.
 */
export const STING_RANGE: [number, number] = [S('S03').to + 3, S('S05').from - 9];

// S04 subtitle-block starts (script/timeline.json via src/common/subs.ts)
const [GREET_1, GREET_2] = (() => {
  const g = S('S04');
  const starts = SUBS.filter((b) => b.from >= g.from && b.to <= g.to).map((b) => b.from);
  if (starts.length !== 2) throw new Error(`Sting: S04 should have 2 subtitle blocks, found ${starts.length}`);
  return starts;
})();
const WAVE = {step: 2, len: 12, dy: 8}; // letter i bobs from GREET_1 + 2i: up 8 px and back over 12 frames
const LAP2 = {len: 30, run: 0.3}; // second lap: a bright run (30% of the path long) travels the whole path in 30 frames

const LETTERS = 'LEARNLOOP'.split('');
const TILE = [
  {bg: C.cream, fg: C.navy},
  {bg: C.pink, fg: '#FFFFFF'},
  {bg: C.yellow, fg: C.navy},
];
const TW = 92, TH = 118, GAP = 8;
const WORD_W = LETTERS.length * TW + (LETTERS.length - 1) * GAP;
const X0 = (1280 - WORD_W) / 2;
const Y0 = 238;
// loop arrow: an open ellipse around the word with an arrowhead at its end
const LOOP = 'M640 168C900 160 1102 205 1102 297S900 436 640 438 178 392 178 297 360 172 560 166';
const HEAD = 'M532 140 566 166 534 194';

export const Sting: React.FC = () => {
  const [a, b] = STING_RANGE;
  const N = useCurrentFrame() + a;
  const out = prog(N, b - 9, 9, easeInOutPow(2.2)); // last 10 frames: sheet up, next background in
  const loopP = prog(N, a + 24, 30, easeInOutPow(1.8));
  const lap2 = prog(N, GREET_2, LAP2.len, easeInOutPow(1.8));
  const runOn = N >= GREET_2 && lap2 < 1;
  const runFront = lap2 * (1 + LAP2.run); // front of the bright run along the path; the run leaves the path past 1
  const strip = title(VIDEO.title.big, VIDEO.title.en);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${-out * 720}px)`}}>
        <PaperBg color={SET.map.bg}>
          {/* loop arrow behind the letters */}
          <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: SHADOW}}>
            <path d={LOOP} fill="none" stroke={C.yellow} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - loopP} />
            {loopP >= 0.98 ? <path d={HEAD} fill="none" stroke={runOn && runFront >= 1 ? C.white : C.yellow} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" /> : null}
            {runOn ? <path d={LOOP} fill="none" stroke={C.white} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={`${LAP2.run} 2`} strokeDashoffset={LAP2.run - runFront} /> : null}
          </svg>
          {LETTERS.map((ch, i) => {
            const t = TILE[i % 3];
            const n = N - (a + 3 + i * 3);
            const rest = [-4, 3, -2, 4, -3, 2, -4, 3, -2][i];
            const bob = -WAVE.dy * Math.sin(Math.PI * Math.min(1, Math.max(0, (N - (GREET_1 + WAVE.step * i)) / WAVE.len)));
            return (
              <div key={i} style={{position: 'absolute', left: X0 + i * (TW + GAP), top: Y0 + (i % 2 ? 6 : -4), width: TW, height: TH, filter: SHADOW, transform: `translateY(${bob}px)`}}>
                <div style={{position: 'absolute', inset: 0, ...slapCss(n, rest, i % 2 ? -1 : 1), background: t.bg, border: '7px solid #fff', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 84, lineHeight: 1, color: t.fg}}>
                  {ch}
                </div>
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 640, top: 512, width: 0, height: 0}}>
            <div style={{position: 'absolute', transform: 'translate(-50%, -50%)', filter: SHADOW}}>
              <div style={{...slapCss(N - (a + 48), -2, -1), background: C.cream2, border: '8px solid #fff', padding: '14px 28px', fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: 2, color: C.navy, whiteSpace: 'nowrap'}}>{strip}</div>
            </div>
          </div>
        </PaperBg>
      </div>
      {out > 0 ? (
        <div style={{position: 'absolute', left: 0, top: 720 * (1 - out), width: 1280, height: 720, boxShadow: '0 -10px 24px 4px rgba(22,21,31,0.25)'}}>
          <PaperBg color={SET.troy.bg}>
            <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
              <path d={SHAPES.troySand} fill={SET.troy.shape} />
            </svg>
          </PaperBg>
        </div>
      ) : null}
    </>
  );
};
const title = (big: string, en: string) => `${big} · ${en}`.toUpperCase();
