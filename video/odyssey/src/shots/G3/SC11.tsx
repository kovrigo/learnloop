import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, easeInOutPow} from '../../common';
import {C, FONT, SET, SHAPES, SHADOW, SHADOW_S, PaperBg, PaperWipe, PaperTag, ExampleCard, PhotoPrint, PaperCharacter, Boat, CrowdFigure, CAST, CREW_HEADS, DottedPath, IMG, slapCss, prog, rock, samplePath} from '../../paper';
import {bump, kick, smooth, Cord, Bag, bagTie, bagMouth, Swirl, crowdHand} from './parts';

/**
 * SC11 · frames 3574–3786 · S31–S33 · source IN HOMER / BOOK 10. Map: sky and chart.
 * 3574 starts on the bare sky sheet the SC10 wipe left. 3576–3581 the Rijksmuseum sea chart (as SC01) slaps in on the left with the tiny boat (Odysseus asleep) at the
 *   Ithaca end of the dotted route; the two crew (crew A, crew B) and the bag of winds slap in on the right. 3582 the tag "CREW'S GUESS: GOLD" slaps over the bag
 *   (three paper coins with it); the crew tug the cord. 3652 the cord comes free, the bag opens, paper wind swirls burst out and fly left across the chart.
 *   3673 the boat slides back along the dotted route. 3703 (= 3673 + 30) the navigator card slaps in; 3714–3733 its route flips 180°. S33 "Recalculating." (3737) needs no new element.
 * Hold: route flipped 3733 → exit 3779 (46 frames). Exit: the terracotta sheet of SC12 (with its sand shape) wipes in over the last 8 frames.
 */
const F0 = 3574;
const END = 3786;
const B = {chart: 3576, crewA: 3578, crewB: 3580, bagIn: 3579, tag: 3582, open: 3652, slide: 3673, nav: 3703, flip: 3714};
const EXIT = 3779;

const CHART = {x: 56, y: 116, w: 516, h: 500, rot: -2.5};
// route on the chart, chart-local px (516×500): from the Aeolian sea north of Sicily, round the east of Sicily, up the Ionian sea to Ithaca
const ROUTE = samplePath([[98, 230], [118, 262], [132, 306], [168, 322], [206, 306], [214, 276], [206, 258], [204, 240]]);
const toFrame = (p: {x: number; y: number}) => {
  const cx = CHART.x + CHART.w / 2, cy = CHART.y + CHART.h / 2;
  const dx = p.x - CHART.w / 2, dy = p.y - CHART.h / 2;
  const r = (CHART.rot * Math.PI) / 180;
  return {x: cx + dx * Math.cos(r) - dy * Math.sin(r), y: cy + dx * Math.sin(r) + dy * Math.cos(r)};
};

const BOAT_S = 0.17; // boat scale on the chart: keel centre (355, 500) of the 720×520 box sits on the route
const CREW = {h: 275, by: 728, ax: 680, bx: 1150};
const BAG = {x: 915, y: 735, w: 190};
const KNOT = bagTie(BAG.x, BAG.y, BAG.w);
const MOUTH = bagMouth(BAG.x, BAG.y, BAG.w);

// swirl flight paths (frame px): out of the bag's mouth, over the chart, off the left edge
const M: [number, number] = [MOUTH.x, MOUTH.y];
const SWIRLS = [
  samplePath([M, [850, 410], [640, 332], [420, 336], [240, 356], [60, 384], [-170, 364]]),
  samplePath([M, [890, 380], [700, 262], [520, 236], [330, 276], [120, 306], [-170, 296]]),
  samplePath([M, [810, 470], [610, 436], [430, 424], [260, 444], [90, 476], [-170, 506]]),
  samplePath([M, [950, 430], [780, 318], [600, 250], [440, 206], [250, 196], [-170, 186]]),
  samplePath([M, [870, 520], [700, 540], [520, 520], [330, 508], [120, 532], [-170, 566]]),
];
const SW_DUR = 44;

const COINS: Array<{x: number; y: number; d: number}> = [
  {x: 826, y: 452, d: 0},
  {x: 915, y: 424, d: 1},
  {x: 1004, y: 452, d: 2},
];

export const SC11: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const wipe = prog(N, EXIT, END - EXIT, easeOutCubic);

  // ---- boat on the chart: at Ithaca, then blown back along the route
  const slide = prog(N, B.slide, 44, easeInOutPow(2));
  const rt = 1 - slide;
  const bp = ROUTE.at(rt);
  const boatRot = rock(N, 2, 70) + 7 * Math.sin(Math.PI * slide) + kick(N, B.slide, -5, 14, 10);
  const kb = BOAT_S / 0.66;
  const boatX = bp.x - 355 * BOAT_S, boatY = bp.y - 500 * BOAT_S;

  // ---- crew: tugging at the cord, then thrown back
  const pull = clamp01((N - 3586) / 20) * (1 - clamp01((N - B.open) / 2));
  const tug = pull * Math.sin(((N - 3586) / 14) * Math.PI * 2);
  const recoil = (side: 1 | -1) => (N >= B.open ? side * 30 * Math.exp(-(N - B.open) / 9) * Math.min(1, (N - B.open) / 2) : 0);
  const armA = 26 + 11 * tug + (N >= B.open ? 40 * smooth((N - B.open - 4) / 10) : 0);
  const armB = 26 - 11 * tug + (N >= B.open ? 40 * smooth((N - B.open - 4) / 10) : 0);
  const tiltA = (N < B.open ? -3 + 3 * tug + bump(N, B.tag, 4, 12) : -10 * smooth((N - B.open) / 6) * (1 - smooth((N - B.open - 30) / 14))) + (N >= B.slide ? bump(N, B.slide, 3, 12) + bump(N, 3737, 4, 12) : 0);
  const tiltB = (N < B.open ? 3 - 3 * tug + bump(N, B.tag + 2, -4, 12) : 10 * smooth((N - B.open) / 6) * (1 - smooth((N - B.open - 30) / 14))) + (N >= B.slide ? bump(N, B.slide + 3, -3, 12) + bump(N, 3739, -4, 12) : 0);
  const hA = crowdHand(CREW.ax + recoil(-1), CREW.by, CREW.h, armA, false);
  const hB = crowdHand(CREW.bx + recoil(1), CREW.by, CREW.h, armB, true);
  const freed = clamp01((N - B.open) / 8);

  // ---- bag
  const bagOpen = smooth((N - B.open) / 6);
  const bagRot = N < B.open ? 2.2 * tug : kick(N, B.open, 5, 12, 8);

  // ---- swirls
  const sw = SWIRLS.map((P, i) => {
    const f = B.open + 3 * i;
    const t = (N - f) / SW_DUR;
    if (t < 0 || t > 1) return null;
    const q = P.at(t);
    return <Swirl key={i} x={q.x} y={q.y} s={0.5 + 0.4 * clamp01(t * 5)} rot={N * 13 + i * 70} op={Math.min(1, t * 8) * (1 - clamp01((t - 0.9) / 0.1))} color={i % 2 ? SET.sea.foam : '#FFFFFF'} />;
  });

  // ---- navigator card: route glyph flips 180°
  const flip = prog(N, B.flip, 20, easeInOutPow(2));
  const dots = Math.floor(((N - B.nav) / 5) % 4);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <PaperBg color={SET.map.bg} />

      {/* sea chart (as SC01), dotted route, tiny boat with sleeping Odysseus */}
      {N >= B.chart - 6 ? (
        <div style={{position: 'absolute', left: CHART.x, top: CHART.y, width: CHART.w, height: CHART.h, ...slapCss(N - B.chart, CHART.rot, -1)}}>
          <PhotoPrint src={IMG('chart_rijks_NG-501-52.jpg')} x={0} y={0} w={CHART.w} h={CHART.h} />
          <div style={{position: 'absolute', left: 0, top: 0, width: CHART.w, height: CHART.h}}>
            <DottedPath d={ROUTE.d} N={N} speed={0.5} width={7} />
          </div>
          {[ROUTE.at(0), ROUTE.at(1)].map((q, i) => (
            <div key={i} style={{position: 'absolute', left: q.x - 11, top: q.y - 11, width: 22, height: 22, borderRadius: 11, background: C.pink, border: '4px solid #fff', boxSizing: 'border-box', filter: SHADOW_S}} />
          ))}
          <div style={{position: 'absolute', left: boatX, top: boatY, transformOrigin: '0 0', transform: `scale(${kb})`}}>
            <Boat x={0} y={0} s={0.66} rot={boatRot} sailDx={150}>
              <PaperCharacter variant="hero" x={-8} y={-147} h={500} cropY={450} head={22} headTurn={0.5} armR={-20} armL={-4} />
            </Boat>
          </div>
        </div>
      ) : null}

      {/* crew and the bag of winds */}
      <div style={{position: 'absolute', inset: 0, filter: SHADOW_S}}>
        {N >= B.crewA - 6 ? (
          <div style={{position: 'absolute', inset: 0, transformOrigin: `${CREW.ax}px ${CREW.by}px`, ...slapCss(N - B.crewA, 0, -1, `translateX(${recoil(-1)}px)`)}}>
            <CrowdFigure head={CREW_HEADS[0]} cx={CREW.ax} by={CREW.by} h={CREW.h} tunic={CAST.crewA.robeFill} line={CAST.crewA.robeLine} headTilt={tiltA} arm={armA} />
          </div>
        ) : null}
        {N >= B.crewB - 6 ? (
          <div style={{position: 'absolute', inset: 0, transformOrigin: `${CREW.bx}px ${CREW.by}px`, ...slapCss(N - B.crewB, 0, 1, `translateX(${recoil(1)}px)`)}}>
            <CrowdFigure head={CREW_HEADS[1]} cx={CREW.bx} by={CREW.by} h={CREW.h} tunic={CAST.crewB.robeFill} line={CAST.crewB.robeLine} headTilt={tiltB} arm={armB} flip />
          </div>
        ) : null}
      </div>
      {N >= B.bagIn - 6 ? (
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${BAG.x}px ${BAG.y}px`, ...slapCss(N - B.bagIn, 0, 1)}}>
          <Bag x={BAG.x} y={BAG.y} w={BAG.w} open={bagOpen} tied={N < B.open} rot={bagRot} />
        </div>
      ) : null}
      {/* the cord the crew pull on: hands → knot; free (hanging from the hands) after 3652 */}
      {N >= B.bagIn && N < B.open + 22 ? (
        <>
          <Cord a={[hA.x, hA.y]} b={[KNOT.x + (hA.x + 4 - KNOT.x) * freed, KNOT.y + (hA.y + 64 - KNOT.y) * freed]} sag={8 + 30 * freed} />
          <Cord a={[hB.x, hB.y]} b={[KNOT.x + (hB.x - 4 - KNOT.x) * freed, KNOT.y + (hB.y + 64 - KNOT.y) * freed]} sag={8 + 30 * freed} />
        </>
      ) : null}

      {/* "CREW'S GUESS: GOLD" and the gold they imagine */}
      {COINS.map((c) => {
        const n = N - (B.tag + c.d);
        const gone = clamp01((N - B.open) / 4);
        if (n < -6 || gone >= 1) return null;
        return (
          <div key={c.x} style={{position: 'absolute', left: c.x, top: c.y, width: 0, height: 0, opacity: 1 - gone, filter: SHADOW_S}}>
            <div style={{position: 'absolute', left: -24, top: -24, width: 48, height: 48, ...slapCss(n, 0, c.d % 2 ? 1 : -1)}}>
              <div style={{width: 48, height: 48, borderRadius: 24, background: '#E0B54A', border: '5px solid #fff', boxSizing: 'border-box', position: 'relative'}}>
                <div style={{position: 'absolute', left: 8, top: 8, width: 20, height: 20, borderRadius: 10, border: '3px solid #C79A2E', boxSizing: 'border-box'}} />
              </div>
            </div>
          </div>
        );
      })}
      <PaperTag text="CREW'S GUESS: GOLD" x={915} y={498} rot={-4} size={24} n={N - B.tag} bg={C.cream2} color={C.navy} />

      {/* wind swirls */}
      {sw}

      {/* navigator card (generic): route glyph and RECALCULATING… */}
      {N >= B.nav - 6 ? (
        <ExampleCard x={715} y={108} w={510} h={292} rot={2} n={N - B.nav} dir={1}>
          <div style={{position: 'absolute', left: 164, top: 16, width: 150, height: 150, borderRadius: 18, background: '#DCE9EE', overflow: 'hidden'}}>
            <svg width={150} height={150} viewBox="0 0 150 150" style={{position: 'absolute', left: 0, top: 0}}>
              <g transform={`rotate(${180 * flip} 75 75)`}>
                <path d="M26 118Q50 84 70 98T114 52" fill="none" stroke={C.pink} strokeWidth={7} strokeLinecap="round" strokeDasharray="3 14" />
                <path d="M96 56 118 46 116 72" fill="none" stroke={C.pink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={26} cy={118} r={9} fill={C.navy} stroke="#fff" strokeWidth={4} />
                <circle cx={122} cy={34} r={13} fill={C.pink} stroke="#fff" strokeWidth={5} />
              </g>
            </svg>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 184, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 45, letterSpacing: -1, color: C.navy, whiteSpace: 'nowrap'}}>
            RECALCULATING
            {[0, 1, 2].map((i) => (
              <span key={i} style={{opacity: dots > i ? 1 : 0.18}}>.</span>
            ))}
          </div>
        </ExampleCard>
      ) : null}

      {/* exit: SC12's terracotta sheet with its sand shape */}
      <PaperWipe p={wipe} color={SET.troy.bg} from="right">
        <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
          <path d={SHAPES.troySand} fill={SET.troy.shape} />
        </svg>
      </PaperWipe>
    </AbsoluteFill>
  );
};
