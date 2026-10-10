import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, rnd} from '../../common';
import {C, CAST, CREW_HEADS, FONT, SHADOW, Grain, PaperWipe, PaperTag, ExampleCard, PhotoPrint, PaperCharacter, Boat, IMG, wavePath, foamPath, slapCss, peelCss, prog, rock} from '../../paper';
import {Back16, Back17, BG17} from './bg';
import {Crew, Cow, Cloud, Bolt} from './kit';

/**
 * SC16 · frames 5140–5421 · S49–S50 · source IN HOMER / BOOK 12. Sky and the sun god's yellow ground (the sheet SC15 wipes in).
 * 5148 the van Tulden print of the cattle of Helios slaps in on the ground, four paper cows stand below it, the boat slides in from the right;
 * 5198 the sign "350 COWS · DO NOT EAT" slaps in and one cow peels off the table; 5286 a storm cloud slides over the sun and a paper thunderbolt
 * hits the boat: it tears in two (zigzag paper tear), the half with the rowers sinks behind the water and nobody is hurt on screen;
 * 5356 the crew counter "→ 1" slaps in. Hold: counter lands 5366 → exit starts 5413 (47 frames). Exit: the mint sheet of Calypso's island wipes in.
 */
const F0 = 5140;
const END = 5421;
const EXIT = END - 8;
const B = {print: 5148, sign: 5198, bolt: 5286, counter: 5356};
const TEAR = {a: B.bolt + 3, len: 36, x: 968};

const BOAT = {x: 790, y: 262.6, s: 0.64};
const HULL_Y = 500; // gunwale
const HERO = {h: 250, y: 300, cx: 1060};
const MAST_X = 1178;
const CREW_X = [848, 886, 924];

// zigzag tear line x(y)
const TEAR_PTS: Array<[number, number]> = Array.from({length: 61}, (_, i) => [TEAR.x + (i % 2 ? 5 : -5) + (rnd(i, 7) - 0.5) * 7, -40 + i * 13]);
const tearPoly = (side: 'L' | 'R') => {
  const edge = TEAR_PTS.map(([x, y]) => `${x.toFixed(1)}px ${y}px`);
  return side === 'L' ? `polygon(-400px -200px, ${edge.join(', ')}, -400px 1000px)` : `polygon(1800px -200px, ${edge.join(', ')}, 1800px 1000px)`;
};
// the white torn edge is drawn along the hull only (gunwale 500 down to the keel ≈ 590)
const tearLine = `M${TEAR_PTS.filter(([, y]) => y >= HULL_Y - 14 && y <= HULL_Y + 100).map(([x, y]) => `${x.toFixed(1)} ${y}`).join('L')}`;

export const SC16: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const exitP = prog(N, EXIT, END - EXIT, easeOutCubic);

  const boatSlide = 640 * (1 - easeOutCubic(clamp01((N - (B.print + 2)) / 24)));
  const rot = rock(N, 1.3, 78, 0.37);
  const bob = 3 * Math.sin((N / 62) * Math.PI * 2 + 0.6);

  // tear: both halves swing out about the tear; the crew half sinks behind the water
  const te = easeOutCubic(clamp01((N - TEAR.a) / TEAR.len));
  const torn = N >= TEAR.a;
  const left = {t: `translate(${(-46 * te).toFixed(1)}px, ${(360 * te * te).toFixed(1)}px) rotate(${(-24 * te).toFixed(2)}deg)`};
  const right = {t: `translate(${(14 * te).toFixed(1)}px, ${(-4 * te).toFixed(1)}px) rotate(${(-3 * te).toFixed(2)}deg)`};

  // cow that disappears
  const cowT = clamp01((N - (B.sign + 2)) / 9);

  const boatScene = (
    <Boat x={BOAT.x} y={BOAT.y} s={BOAT.s} rot={rot} sail={false}>
      <div style={{position: 'absolute', left: -BOAT.x, top: -BOAT.y, width: 1280, height: 720}}>
        {/* mast with the furled sail on its yard */}
        <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <rect x={MAST_X - 11} y={292} width={22} height={290} rx={4} fill={C.hull} stroke="#fff" strokeWidth={7} />
          <rect x={MAST_X - 66} y={318} width={132} height={13} rx={6} fill={C.hull} stroke="#fff" strokeWidth={5} />
          <rect x={MAST_X - 60} y={329} width={120} height={17} rx={8} fill={C.sail} stroke="#fff" strokeWidth={4} />
        </svg>
        {CREW_X.map((cx, i) => {
          const c = CAST[i % 2 === 0 ? 'crewA' : 'crewB'];
          return <Crew key={i} head={CREW_HEADS[i % 2]} tunic={c.robeFill} line={c.robeLine} cx={cx} by={HULL_Y + 28} h={92} tilt={3 * Math.sin((N / 40) * Math.PI * 2 + i * 1.1)} />;
        })}
        <PaperCharacter variant="hero" x={HERO.cx - (HERO.h * 380) / 540 / 2} y={HERO.y} h={HERO.h} head={torn ? 4 * Math.sin(N / 7) : 0} headFlip={1} armL={torn ? 30 + 12 * Math.sin(N / 6) : 6} armR={torn ? 30 + 12 * Math.sin(N / 6 + 2) : 6} />
      </div>
    </Boat>
  );
  const piece = (side: 'L' | 'R', tf: string) => (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, clipPath: tearPoly(side), transform: tf, transformOrigin: `${TEAR.x}px ${HULL_Y + 20}px`}}>
      {boatScene}
      <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: clamp01((N - TEAR.a) / 3)}}>
        <path d={tearLine} fill="none" stroke="#fff" strokeWidth={11} strokeLinejoin="miter" />
      </svg>
    </div>
  );

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill>
        <Back16 N={N} />
      </AbsoluteFill>
      <Grain />

      {/* van Tulden print (Rijksmuseum RP-P-OB-66.758, crop in MANIFEST.md) */}
      <PhotoPrint src={IMG('helios_rijks_RP-P-OB-66.758.jpg')} x={70} y={118} w={640} h={312} rot={-2} n={N - B.print} dir={-1} />

      {/* four paper cows on the ground; the right one is taken */}
      {[105, 245, 470, 604].map((cx, i) => {
        const n = N - (B.print + i);
        if (n < 0) return null;
        const gone = i === 3 ? cowT : 0;
        if (gone >= 1) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: `${cx}px 682px`, ...slapCss(n, 0, i % 2 ? 1 : -1), ...(gone > 0 ? {opacity: 1 - Math.pow(gone, 1.5), transform: `translateY(${-90 * gone}px) rotate(${18 * gone}deg)`} : {})}}>
            <Cow cx={cx} by={682} h={100} flip={i % 2 === 1} />
          </div>
        );
      })}

      {/* sign: board on a post, planted in the ground */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '365px 640px', ...slapCss(N - B.sign, -2, 1)}}>
        <div style={{position: 'absolute', left: 351, top: 520, width: 28, height: 150, background: C.hull, border: '6px solid #fff', boxSizing: 'border-box', filter: SHADOW}} />
        <PaperTag text="350 COWS · DO NOT EAT" x={365} y={502} rot={0} size={30} bg="#FFD1DB" color={C.navy} />
      </div>

      {/* the boat (whole, then in two halves) */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `translate(${boatSlide.toFixed(1)}px, ${bob.toFixed(2)}px)`}}>
        {torn ? (
          <>
            {piece('L', left.t)}
            {piece('R', right.t)}
          </>
        ) : (
          boatScene
        )}
      </div>

      {/* water in front of the hull: the sinking half goes behind it */}
      <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <defs>
          <clipPath id="sc16water">
            <rect x={786} y={0} width={900} height={900} />
          </clipPath>
        </defs>
        <g clipPath="url(#sc16water)">
          <path d={wavePath(596, 14, 620, N * 1.1 + 50, -400, 1700, 900)} fill="#285F80" />
          <path d={foamPath(646, 12, 640, 90 + N * 0.9, -400, 1700)} fill="none" stroke="#C8E8EA" strokeWidth={20} strokeLinecap="round" opacity={0.45} />
        </g>
      </svg>

      {/* storm cloud and thunderbolt */}
      <StormCloud N={N} />

      {/* crew counter */}
      {N >= B.counter - 2 ? (
        <ExampleCard x={950} y={92} w={270} h={188} rot={3} n={N - B.counter} label="CREW">
          <div style={{position: 'absolute', left: 22, top: 64, display: 'flex', alignItems: 'center', gap: 8}}>
            <svg width={88} height={62} viewBox="0 0 100 70">
              <path d="M6 35H78M52 10L80 35L52 60" fill="none" stroke={C.graphite} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 96, lineHeight: 1, letterSpacing: -4, color: C.graphite}}>1</div>
          </div>
        </ExampleCard>
      ) : null}

      <PaperWipe p={exitP} color={BG17} from="right">
        <Back17 N={END + 1} />
      </PaperWipe>
    </AbsoluteFill>
  );
};

const StormCloud: React.FC<{N: number}> = ({N}) => {
  const inP = easeOutCubic(clamp01((N - (B.bolt - 6)) / 9));
  const outP = clamp01((N - 5312) / 9);
  if (inP <= 0 || outP >= 1) return null;
  const y = -230 + (80 + 230) * inP;
  const boltN = N - (B.bolt + 2);
  const boltOut = clamp01((N - 5304) / 5);
  return (
    <>
      <Cloud x={820} y={y} s={1.05} style={peelCss(N - 5312, 9, 1)} />
      {boltN >= 0 && boltOut < 1 ? (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '968px 300px', opacity: 1 - boltOut, ...slapCss(boltN, 0, 1)}}>
          <Bolt x={908} y={196} s={0.98} />
        </div>
      ) : null}
    </>
  );
};
