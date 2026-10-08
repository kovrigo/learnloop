import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeInOutPow} from '../common';
import {VIDEO} from '../config';
import {FONT, C, SET, SHAPES, SHADOW, PaperBg, slapCss, prog} from '../paper';
import {S} from './Overlay';

/**
 * LearnLoop sting between the cold open and S04 (storyboard G0): the map sky sheet stays; paper letters
 * L-E-A-R-N-L-O-O-P slap in 3 frames apart; a yellow loop arrow runs once around the word; a cream strip
 * "THE ODYSSEY · A TEN-YEAR TRIP HOME" lands below. Last 10 frames: the sheet slides up while the next
 * background (SC02 terracotta) slides in. No voice.
 */
export const STING_RANGE: [number, number] = [S('S03').to + 3, S('S04').from - 9];

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
  const strip = title(VIDEO.title.big, VIDEO.title.en);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${-out * 720}px)`}}>
        <PaperBg color={SET.map.bg}>
          {/* loop arrow behind the letters */}
          <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: SHADOW}}>
            <path d={LOOP} fill="none" stroke={C.yellow} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - loopP} />
            {loopP >= 0.98 ? <path d={HEAD} fill="none" stroke={C.yellow} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" /> : null}
          </svg>
          {LETTERS.map((ch, i) => {
            const t = TILE[i % 3];
            const n = N - (a + 3 + i * 3);
            const rest = [-4, 3, -2, 4, -3, 2, -4, 3, -2][i];
            return (
              <div key={i} style={{position: 'absolute', left: X0 + i * (TW + GAP), top: Y0 + (i % 2 ? 6 : -4), width: TW, height: TH, filter: SHADOW}}>
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
