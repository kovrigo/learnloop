import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic} from '../../common';
import {SET, SHAPES, IMG, SHADOW, PaperBg, PaperTag, PhotoPrint, peelCss} from '../../paper';

/**
 * SC02 · frames 743–925 · S05–S06. Terracotta table, sand shape at the bottom.
 * 751 Homer bust photograph slaps in (print, white border), slow push 1.0 → 1.05 begins; 788 tag "~2,700 YEARS";
 * 854 (S06.c1 −6) the Trojan Horse maiolica plate rolls in from the right edge like a coin and lands; its tag "10 YEARS OF WAR" slaps on it.
 * Hold: plate lands 876 → exit 917 (41 frames). Exit: peel left over the last 8 frames.
 */
const F0 = 743;
const END = 925;
const B = {s05a: 751, s05b: 788, s06a: 860};
const ROLL = 22;
const PLATE0 = B.s06a - 6; // the plate is pre-hung 6 frames ahead of S06 so it has landed 41 frames before the exit
const EXIT = 917;

export const G1_02: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const push = 1 + 0.05 * clamp01((N - B.s05a) / (EXIT - B.s05a));
  const exit = peelCss(N - EXIT - 1, END - EXIT, -1); // EXIT = last still frame; the peel moves over the last 8 frames, α = 0 on the last
  // plate: rolls from beyond the right edge, rotation 360° → 0, lands at 854+22
  const r = easeOutCubic(clamp01((N - PLATE0) / ROLL));
  const plateCx = 1280 + 230 + (925 - 1280 - 230) * r;
  const plateRot = 360 * (1 - r);
  const landed = N - (PLATE0 + ROLL);
  const settle = landed >= 0 && landed < 8 ? 1 - 0.025 * Math.sin((landed / 8) * Math.PI) : 1;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <PaperBg color={SET.troy.bg}>
        <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
          <path d={SHAPES.troySand} fill={SET.troy.shape} />
        </svg>
      </PaperBg>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '640px 360px', transform: `scale(${push})`}}>
        <div style={{position: 'absolute', inset: 0, ...exit}}>
          {/* Homer bust photograph (Rijksmuseum RP-F-00-311), whole print */}
          <PhotoPrint src={IMG('homer_rijks_RP-F-00-311.jpg')} x={176} y={118} w={302} h={444} rot={-3} n={N - B.s05a} dir={-1} />
          <PaperTag text="~2,700 YEARS" x={452} y={548} rot={6} size={34} n={N - B.s05b} />
          {/* Trojan Horse plate (The Met 202259), whole object cut round */}
          {N >= PLATE0 ? (
            <div style={{position: 'absolute', left: plateCx - 205, top: 338 - 205, width: 410, height: 410, filter: SHADOW, transform: `scale(${settle})`}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: '#fff', padding: 12, boxSizing: 'border-box', transform: `rotate(${plateRot}deg)`}}>
                <Img src={IMG('trojanhorse_met202259.jpg')} style={{width: 386, height: 386, borderRadius: '50%', objectFit: 'cover', display: 'block'}} />
              </div>
            </div>
          ) : null}
          <PaperTag text="10 YEARS OF WAR" x={925} y={540} rot={-5} size={36} n={landed} dir={-1} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

