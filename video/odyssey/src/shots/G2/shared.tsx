import React from 'react';
import {clamp01, easeOutCubic} from '../../common';
import {C, FONT, ExampleCard, slapCss} from '../../paper';

/**
 * Exports of G2 for later groups (self-contained: only src/paper.tsx and src/common are used).
 *
 * LocationCard — the SC08 card "LOCATION SHARED · ITHACA · Odysseus, unfortunately · VISIBLE TO: POLYPHEMUS" (V2).
 *   x, y     centre of the card in frame px
 *   scale    1 = 520 × 330 px (rotated `rot`, default 4°); scales about the centre
 *   n        frames since the card slaps in (n < 0: hidden; slap = scale 1.15 → 1 and ±4° in 6 frames, 4-frame settle)
 *   off      0 → 1: flips the card to "LOCATION SHARING: OFF" with a paper toggle (the old lines fade up, the toggle knob slides from ON to OFF, "OFF" fades in)
 *   dir      slap direction (1 | −1), default 1
 *
 * RequestList — the SC09 paper list "LATE / ALONE / ON SOMEONE ELSE'S SHIP" (three rows, a tick box per row).
 *   x, y     centre in frame px
 *   scale    1 = 600 × 300 px (rotated `rot`, default −2°); scales about the centre
 *   n        frames since the paper slaps in (n < 0: hidden)
 *   lines    frames since each row's text slaps in (default [99, 99, 99] = all there; a negative value leaves that row blank)
 *   tick     tick progress 0 → 1 per row (default [0, 0, 0]); the caller animates it (e.g. prog(N, beat, 8)). G6 SC24 ticks the three rows on the three
 *            beats of "Late, alone, on someone else's ship": "LATE ✓ ALONE ✓ ON SOMEONE ELSE'S SHIP ✓". The tick is a navy check drawn into the row's box.
 */
export const LocationCard: React.FC<{x: number; y: number; scale?: number; n: number; off?: number; rot?: number; dir?: 1 | -1}> = ({x, y, scale = 1, n, off = 0, rot = 4, dir = 1}) => {
  if (n < 0) return null;
  const w = 520, h = 330;
  const p = clamp01(off);
  const oldOp = 1 - clamp01(p * 2.5);
  const newOp = clamp01((p - 0.35) * 2.5);
  const knob = easeOutCubic(clamp01((p - 0.1) / 0.6));
  const toggleOn = '#E881A0', toggleOff = '#C9CFCB';
  const mix = (a: string, b: string, t: number) => {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
  };
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `scale(${scale})`, transformOrigin: '50% 50%'}}>
      <ExampleCard x={0} y={0} w={w} h={h} rot={rot} n={n} dir={dir}>
        {/* label row (the title changes with the switch) */}
        <div style={{position: 'absolute', left: 22, top: 22, fontFamily: FONT, fontWeight: 900, fontSize: 20, letterSpacing: 2, color: C.ink, textTransform: 'uppercase', opacity: oldOp}}>LOCATION SHARED</div>
        <div style={{position: 'absolute', left: 22, top: 22, fontFamily: FONT, fontWeight: 900, fontSize: 20, letterSpacing: 2, color: C.ink, textTransform: 'uppercase', opacity: newOp}}>LOCATION SHARING:</div>
        <div style={{position: 'absolute', left: 22, right: 22, top: 60, height: 3, background: C.rule}} />
        {/* shared state: pin, place, who */}
        <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: oldOp, transform: `translateY(${-14 * clamp01(p * 2.5)}px)`}}>
          <svg width={84} height={84} viewBox="0 0 84 84" style={{position: 'absolute', left: 30, top: 86}}>
            <circle cx={42} cy={42} r={40} fill={C.pink} />
            <path d="M42 14Q58 14 58 34Q58 46 48 50L42 68L36 50Q26 46 26 34Q26 14 42 14Z" fill="#fff" />
            <circle cx={42} cy={33} r={8} fill={C.pink} />
          </svg>
          <div style={{position: 'absolute', left: 134, top: 78, fontFamily: FONT, fontWeight: 900, fontSize: 70, letterSpacing: -3, lineHeight: 1, color: C.navy}}>ITHACA</div>
          <div style={{position: 'absolute', left: 136, top: 158, fontFamily: FONT, fontWeight: 600, fontSize: 24, color: C.grey}}>Odysseus, unfortunately</div>
          <div style={{position: 'absolute', left: 22, right: 22, top: 206, height: 3, background: C.rule}} />
          <div style={{position: 'absolute', left: 22, top: 226, fontFamily: FONT, fontWeight: 900, fontSize: 26, letterSpacing: 1.2, color: C.pinkText, textTransform: 'uppercase'}}>VISIBLE TO: POLYPHEMUS</div>
        </div>
        {/* switch state: paper toggle + OFF */}
        <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: newOp, transform: `translateY(${12 * (1 - newOp)}px)`}}>
          <div style={{position: 'absolute', left: 34, top: 110, width: 150, height: 80, borderRadius: 40, background: mix(toggleOn, toggleOff, knob), border: '6px solid #fff', boxSizing: 'border-box', boxShadow: '0 3px 8px rgba(22,21,31,0.25)'}}>
            <div style={{position: 'absolute', top: 5, left: 5 + 70 * (1 - knob), width: 58, height: 58, borderRadius: 29, background: '#fff', boxShadow: '0 3px 8px rgba(22,21,31,0.3)'}} />
          </div>
          <div style={{position: 'absolute', left: 216, top: 82, fontFamily: FONT, fontWeight: 900, fontSize: 120, letterSpacing: -5, lineHeight: 1, color: C.navy}}>OFF</div>
        </div>
      </ExampleCard>
    </div>
  );
};

const ITEMS = ['LATE', 'ALONE', "ON SOMEONE ELSE'S SHIP"];
export const RequestList: React.FC<{x: number; y: number; scale?: number; n: number; lines?: [number, number, number]; tick?: [number, number, number]; rot?: number; dir?: 1 | -1}> = ({x, y, scale = 1, n, lines = [99, 99, 99], tick = [0, 0, 0], rot = -2, dir = -1}) => {
  if (n < 0) return null;
  const w = 600, h = 300;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `scale(${scale})`, transformOrigin: '50% 50%'}}>
      <ExampleCard x={0} y={0} w={w} h={h} rot={rot} n={n} dir={dir} face={C.cream}>
        {ITEMS.map((t, i) => {
          const k = lines[i];
          return (
            <div key={t} style={{position: 'absolute', left: 0, right: 0, top: 14 + 90 * i, height: 80}}>
              <div style={{position: 'absolute', left: 24, right: 24, bottom: 0, height: 3, background: C.rule}} />
              {/* tick box */}
              <div style={{position: 'absolute', left: 26, top: 12, width: 52, height: 52, background: C.card, border: '5px solid #fff', borderRadius: 11, boxSizing: 'border-box', boxShadow: '0 2px 6px rgba(22,21,31,0.2)'}} />
              <svg width={70} height={70} viewBox="0 0 70 70" style={{position: 'absolute', left: 20, top: 2, overflow: 'visible'}}>
                <path d="M18 38L30 50L56 14" fill="none" stroke={C.navy} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(tick[i])} opacity={tick[i] > 0 ? 1 : 0} />
              </svg>
              {k >= 0 ? (
                <div style={{position: 'absolute', left: 100, top: 10, fontFamily: FONT, fontWeight: 900, fontSize: 31, letterSpacing: 0.4, lineHeight: '48px', whiteSpace: 'nowrap', color: C.navy, textTransform: 'uppercase', ...slapCss(k, 0, 1), transformOrigin: '0% 50%'}}>{t}</div>
              ) : null}
            </div>
          );
        })}
      </ExampleCard>
    </div>
  );
};
