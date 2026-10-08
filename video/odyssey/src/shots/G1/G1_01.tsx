import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {clamp01, easeInOutPow, easeOutCubic} from '../../common';
import {
  FONT, C, SET, IMG, SHADOW, SHADOW_S, Grain, PaperWipe, PaperTag, ExampleCard, SplitFlap, Counter, PhotoPrint, DottedPath,
  PaperCharacter, CrowdFigure, Boat, slapCss, prog, rock, samplePath,
} from '../../paper';

/**
 * SC01 · frames 1–499 · cold open (S01–S03). One continuous paper tabletop, three stations left to right.
 * (a) map: sea chart print, Odysseus in his boat sliding along a yellow dotted route, ETA card "3 DAYS" → "10 YEARS".
 * (b) booking cards "CALYPSO'S ISLAND · 7 YEARS" and "CIRCE'S PALACE · 1 YEAR", HOUSEGUEST tag between them.
 * (c) Ithaca: house doors open on a long feast table of suitors, "+96" chip, counter card "GUESTS 108"; plates empty.
 * Exit: the sting's sky sheet drops over the frame in the last 9 frames.
 */
const F0 = 1;
const END = 499;
// beats (subtitle-block starts, script/timeline.md)
const B = {s01a: 86, s01b: 138, s02a: 186, s02b: 258, s02c: 323, s03a: 377, s03b: 423, s03c: 465};
const PAN1 = {a: 186, len: 40};
const PAN2 = {a: B.s03a - 6, len: 36};
const ST_B = {x: 1280, y: 0};
const ST_C = {x: 2560, y: 300};
const EXIT = 491; // counter lands 445 → 46 frames hold

// ---- station (a): chart print and route, chart-local coordinates (image 485×470 at screen 118,116, rotated −2.5°)
const CH = {x: 118, y: 116, w: 485, h: 470, rot: -2.5};
const TROY: [number, number] = [302, 201]; // Dardanelles on Goos's chart (file px 1245,830 of 2000×1939)
const ITHACA: [number, number] = [192, 224]; // next to Kefalonia (file px 790,925)
// the boat sails west from the chart's east side past Troy; the "detour" route then loops south along the bottom of the chart and back up to Ithaca
const BOAT_A: [number, number] = [600, 372];
const BOAT_B: [number, number] = [458, 332];
const ROUTE = samplePath([BOAT_A, BOAT_B, [372, 262], TROY, [318, 300], [372, 400], [300, 462], [170, 462], [98, 380], [122, 286], ITHACA]);

const SUITOR_HEADS = ['suitor_met251524.png', 'suitor_met254640.png', 'suitor_met247994.png', 'suitor_met248895.png'];
const TUNICS = ['#B7A6D9', '#C9785B', '#7FC4C0', '#E0B54A', '#8C647B', '#9CAE91'];

export const G1_01: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // ---------------- camera
  const p1 = prog(N, PAN1.a, PAN1.len);
  const p2 = prog(N, PAN2.a, PAN2.len);
  const push = 1 + 0.04 * prog(N, 1, 180, easeInOutPow(1.6)) * (1 - p1); // slow push on the map, released during pan 1
  const camX = ST_B.x * p1 + (ST_C.x - ST_B.x) * p2;
  const camY = ST_C.y * p2;
  const world: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '640px 360px', transform: `scale(${push}) translate(${-camX}px, ${-camY}px)`};

  // ---------------- exit: sky sheet (the sting's background) drops over everything
  const wipe = prog(N, EXIT, END - EXIT, easeOutCubic);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* backgrounds (world) */}
      <div style={world}>
        <div style={{position: 'absolute', left: -400, top: -400, width: 1680, height: 2000, background: SET.map.bg}} />
        <div style={{position: 'absolute', left: ST_B.x, top: -400, width: 640, height: 2000, background: SET.calypso.bg}} />
        <div style={{position: 'absolute', left: ST_B.x + 640, top: -400, width: 640, height: 2000, background: SET.circe.bg}} />
        <div style={{position: 'absolute', left: ST_C.x, top: -400, width: 1800, height: 2400, background: SET.ithaca.bg}} />
        <svg width={1280} height={720} style={{position: 'absolute', left: ST_C.x, top: ST_C.y, overflow: 'visible'}}>
          <path d="M780 720Q860 470 1080 452T1500 380V900H780Z" fill={SET.ithaca.shape} />
        </svg>
      </div>
      <Grain />
      {/* content (world) */}
      <div style={world}>
        <StationA N={N} />
        <StationB N={N} p1={p1} camX={camX} />
        <StationC N={N} />
      </div>
      <PaperWipe p={wipe} color={SET.map.bg} from="top" />
    </AbsoluteFill>
  );
};

// ======================================================================== (a) map
const StationA: React.FC<{N: number}> = ({N}) => {
  const t = easeInOutPow(1.4)(clamp01((N - 1) / 185));
  const k = {x: BOAT_A[0] + (BOAT_B[0] - BOAT_A[0]) * t, y: BOAT_A[1] + (BOAT_B[1] - BOAT_A[1]) * t};
  const boatRot = rock(N, 2, 70);
  const nod = N >= B.s01b - 2 ? 3 * Math.sin(clamp01((N - B.s01b + 2) / 14) * Math.PI) : 0; // head reacts when the ETA flips
  // boat box: Boat s=.42 → 302×218, keel centre at local (149, 210)
  const s = 0.42;
  return (
    <>
      <div style={{position: 'absolute', left: CH.x, top: CH.y, width: CH.w, height: CH.h, transform: `rotate(${CH.rot}deg)`}}>
        <PhotoPrint src={IMG('chart_rijks_NG-501-52.jpg')} x={0} y={0} w={CH.w} h={CH.h} />
        <div style={{position: 'absolute', left: 0, top: 0, width: CH.w, height: CH.h}}>
          <DottedPath d={ROUTE.d} N={N} speed={0.5} width={7} />
        </div>
        <Pin x={TROY[0]} y={TROY[1]} label="TROY" dx={-84} dy={-36} />
        <Pin x={ITHACA[0]} y={ITHACA[1]} label="ITHACA" dx={-118} dy={-34} />
        {/* Odysseus in his boat, keel on the route */}
        <Boat x={k.x - 149} y={k.y - 210} s={s} rot={boatRot}>
          <PaperCharacter variant="hero" x={22} y={-46} h={280} cropY={440} head={nod} armR={4 * Math.sin(N / 22)} />
        </Boat>
      </div>
      <EtaCard N={N} t={t} />
    </>
  );
};

const Pin: React.FC<{x: number; y: number; label: string; dx: number; dy: number}> = ({x, y, label, dx, dy}) => (
  <>
    <div style={{position: 'absolute', left: x - 11, top: y - 11, width: 22, height: 22, borderRadius: 11, background: C.pink, border: '4px solid #fff', boxSizing: 'border-box', filter: SHADOW_S}} />
    <div style={{position: 'absolute', left: x + dx, top: y + dy, background: C.cream2, border: '4px solid #fff', padding: '3px 8px', fontFamily: FONT, fontWeight: 900, fontSize: 15, letterSpacing: 1.5, color: C.navy, filter: SHADOW_S}}>{label}</div>
  </>
);

const EtaCard: React.FC<{N: number; t: number}> = ({N, t}) => {
  const n = N - B.s01a;
  if (n < 0) return null;
  const q = t;
  return (
    <ExampleCard x={760} y={112} w={440} h={232} rot={4} n={n} label="TRIP HOME">
      <div style={{position: 'absolute', left: 22, top: 78, fontFamily: FONT, fontWeight: 800, fontSize: 18, letterSpacing: 2, color: C.grey}}>ETA</div>
      <div style={{position: 'absolute', left: 74, top: 74}}>
        <SplitFlap seq={['3 DAYS', '? DAYS', '?? YEARS', '10 YEARS']} flips={[B.s01b, B.s01b + 7, B.s01b + 14]} n={N} w={312} h={88} size={56} />
      </div>
      {/* generic route progress: track + moving dot (follows the boat) */}
      <div style={{position: 'absolute', left: 22, right: 22, top: 182, height: 6, borderRadius: 3, background: C.rule}} />
      <div style={{position: 'absolute', left: 22, top: 182, width: 370 * (0.08 + 0.1 * q), height: 6, borderRadius: 3, background: C.pink}} />
      <div style={{position: 'absolute', left: 22 + 370 * (0.08 + 0.1 * q) - 9, top: 176, width: 18, height: 18, borderRadius: 9, background: C.pink, border: '3px solid #fff', boxSizing: 'border-box'}} />
    </ExampleCard>
  );
};

// ======================================================================== (b) booking cards
const StationB: React.FC<{N: number; p1: number; camX: number}> = ({N, p1, camX}) => {
  // HOUSEGUEST: slaps on screen at the beat, the camera follows it to station (b), then it stays there (world-fixed)
  const lead = 70 * Math.sin(Math.PI * p1);
  const tagX = N < PAN1.a + PAN1.len ? camX + 640 + lead : ST_B.x + 640;
  const bump = (f: number) => (N >= f ? 2.2 * Math.sin(clamp01((N - f) / 12) * Math.PI * 2) * (1 - clamp01((N - f) / 12)) : 0);
  const tagJiggle = bump(B.s02b) + bump(B.s02c);
  return (
    <>
      <BookingCard x={ST_B.x + 95} y={135} rot={-4 + bump(B.s02c) * 0.6} n={N - B.s02b} dir={-1} img="calypso_rijks_RP-P-1975-75-49_crop.jpg" pos="50% 8%" title="CALYPSO'S ISLAND" big="7 YEARS" />
      <BookingCard x={ST_B.x + 845} y={135} rot={4} n={N - B.s02c} dir={1} img="circe_met253627_crop.jpg" pos="70% 30%" title="CIRCE'S PALACE" big="1 YEAR" />
      <PaperTag text="HOUSEGUEST" x={tagX} y={404} rot={-6 + tagJiggle} size={36} n={N - B.s02a} bg={C.yellow} color={C.navy} />
    </>
  );
};

const BookingCard: React.FC<{x: number; y: number; rot: number; n: number; dir: 1 | -1; img: string; pos: string; title: string; big: string}> = ({x, y, rot, n, dir, img, pos, title, big}) => {
  if (n < 0) return null;
  return (
    <ExampleCard x={x} y={y} w={340} h={420} rot={rot} n={n} dir={dir} face={C.card}>
      <div style={{position: 'absolute', left: 14, top: 14, width: 286, height: 204, overflow: 'hidden', background: '#ddd'}}>
        <Img src={IMG(img)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
      </div>
      <div style={{position: 'absolute', left: 0, width: 314, top: 236, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 22, letterSpacing: 1.5, color: C.navy, whiteSpace: 'nowrap'}}>{title}</div>
      <div style={{position: 'absolute', left: 14, right: 14, top: 274, height: 3, background: C.rule}} />
      <div style={{position: 'absolute', left: 0, width: 314, top: 286, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 76, lineHeight: 1, letterSpacing: -4, color: C.graphite}}>{big}</div>
    </ExampleCard>
  );
};

// ======================================================================== (c) Ithaca
const DOOR = {x: 220, y: 250, w: 420, h: 362};
const StationC: React.FC<{N: number}> = ({N}) => {
  const ox = ST_C.x, oy = ST_C.y;
  const open = prog(N, B.s03a + 1, 22, easeInOutPow(2.2)); // doors swing open as the camera arrives (pan 371–407)
  const roll = 108 * easeOutCubic(clamp01((N - B.s03b) / 22));
  return (
    <div style={{position: 'absolute', left: ox, top: oy, width: 1280, height: 720}}>
      {/* house front */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, filter: SHADOW}}>
        <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <path d="M96 196 430 100 764 196Z" fill={SET.troy.bg} stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
          <rect x={124} y={190} width={612} height={422} fill={C.cream2} stroke="#fff" strokeWidth={10} />
          <rect x={DOOR.x - 12} y={DOOR.y - 12} width={DOOR.w + 24} height={DOOR.h + 12} fill={SET.ithaca.night} />
          <circle cx={430} cy={152} r={20} fill={C.cream} stroke="#fff" strokeWidth={6} />
        </svg>
      </div>
      {/* interior seen through the doorway */}
      <div style={{position: 'absolute', left: DOOR.x, top: DOOR.y, width: DOOR.w, height: DOOR.h, overflow: 'hidden', background: SET.ithaca.night}}>
        <Feast N={N} />
      </div>
      {/* doors */}
      <div style={{position: 'absolute', left: DOOR.x, top: DOOR.y, width: DOOR.w, height: DOOR.h, perspective: 900}}>
        <DoorLeaf side="l" a={open} />
        <DoorLeaf side="r" a={open} />
      </div>
      {/* +96 chip at the far end of the table */}
      <div style={{position: 'absolute', left: 430, top: 300, width: 0, height: 0}}>
        <div style={{position: 'absolute', transform: 'translate(-50%, -50%)', filter: SHADOW_S}}>
          <div style={{...slapCss(N - (B.s03b - 3), -5), background: C.pink, border: '6px solid #fff', borderRadius: 30, padding: '6px 16px', fontFamily: FONT, fontWeight: 900, fontSize: 30, color: '#fff'}}>+96</div>
        </div>
      </div>
      {/* counter card */}
      {N >= B.s03b ? (
        <ExampleCard x={805} y={135} w={395} h={252} rot={3} n={N - B.s03b} label="GUESTS">
          <div style={{position: 'absolute', left: 54, top: 78}}>
            <Counter value={roll} digits={3} size={132} color={C.graphite} />
          </div>
        </ExampleCard>
      ) : null}
    </div>
  );
};

const DoorLeaf: React.FC<{side: 'l' | 'r'; a: number}> = ({side, a}) => {
  const deg = 86 * a * (side === 'l' ? 1 : -1); // opens inward (free edge moves away), stays inside the doorway
  return (
    <div style={{position: 'absolute', left: side === 'l' ? 0 : DOOR.w / 2, top: 0, width: DOOR.w / 2, height: DOOR.h, transformOrigin: side === 'l' ? '0% 50%' : '100% 50%', transform: `rotateY(${deg}deg)`, background: SET.ithaca.shape, border: '6px solid #fff', boxSizing: 'border-box', backgroundImage: 'repeating-linear-gradient(90deg, rgba(48,48,57,0) 0 48px, rgba(48,48,57,0.22) 48px 51px)'}}>
      <div style={{position: 'absolute', top: DOOR.h / 2 - 10, left: side === 'l' ? DOOR.w / 2 - 34 : 18, width: 16, height: 16, borderRadius: 8, background: C.yellow, border: '3px solid #fff'}} />
    </div>
  );
};

/** Long feast table running into depth, 12 suitors (4 shared heads), plates that empty one by one from S03.c3. */
const Feast: React.FC<{N: number}> = ({N}) => {
  // local coords of the doorway box (420×362). near edge y 352, far edge y 112
  const seats: Array<{t: number; side: 1 | -1; i: number}> = [];
  for (let i = 0; i < 6; i++) {
    seats.push({t: i / 5, side: -1, i: i * 2});
    seats.push({t: i / 5, side: 1, i: i * 2 + 1});
  }
  const yAt = (t: number) => 350 - 236 * t;
  const xEdge = (t: number, side: 1 | -1) => 210 + side * (180 - 150 * t);
  const hAt = (t: number) => 128 - 84 * t;
  // plates empty one by one, near ones first, every 2 frames
  const order = [...seats].sort((p, q) => p.t - q.t || p.side - q.side);
  const eatenAt = (i: number) => B.s03c + 2 * order.findIndex((s) => s.i === i);
  const far = [...seats].sort((p, q) => q.t - p.t);
  const raiser = 5; // right side, third seat (clear of the door leaf) raises the drumstick
  const raise = prog(N, B.s03c, 7, easeOutCubic);
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 0, width: 420, height: 112, background: '#2C3E47'}} />
      <svg width={420} height={362} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={`M${xEdge(0, -1) + 16} 362 L${xEdge(1, -1) + 8} ${yAt(1) - 6} L${xEdge(1, 1) - 8} ${yAt(1) - 6} L${xEdge(0, 1) - 16} 362Z`} fill={C.hull} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
      </svg>
      {far.map((st) => {
        const y = yAt(st.t), h = hAt(st.t);
        const xe = xEdge(st.t, st.side);
        const plateX = xe - st.side * h * 0.32;
        const eaten = clamp01((N - eatenAt(st.i)) / 4);
        const food = 1 - eaten;
        const isRaiser = st.i === raiser;
        return (
          <React.Fragment key={st.i}>
            {/* plate on the table */}
            <svg width={420} height={362} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <ellipse cx={plateX} cy={y + h * 0.06} rx={h * 0.24} ry={h * 0.09} fill="#fff" stroke="#E7E1D3" strokeWidth={2} />
              {food > 0.01 && !isRaiser ? (
                <g transform={`translate(${plateX} ${y + h * 0.03}) scale(${food * h * 0.017})`}>
                  <ellipse cx={-3} cy={0} rx={9} ry={6} fill="#B9774A" />
                  <path d="M4 -2 12 -6" stroke="#F3E9D2" strokeWidth={4} strokeLinecap="round" />
                </g>
              ) : null}
            </svg>
            <div style={{position: 'absolute', left: 0, top: 0, filter: SHADOW_S}}>
              <CrowdFigure
                head={SUITOR_HEADS[st.i % 4]}
                cx={xe + st.side * h * 0.42}
                by={y + h * 0.42}
                h={h}
                tunic={TUNICS[st.i % TUNICS.length]}
                headTilt={isRaiser ? -6 * raise : (st.i % 3) - 1 + (N >= eatenAt(st.i) && N < eatenAt(st.i) + 8 ? 3 * Math.sin(((N - eatenAt(st.i)) / 8) * Math.PI) : 0)}
                arm={isRaiser ? 75 * (1 - raise) : undefined}
                flip={st.side === 1}
              >
                {isRaiser ? (
                  <g transform="rotate(-20)">
                    <path d="M0 0 0 -14" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
                    <path d="M0 0 0 -14" stroke="#F3E9D2" strokeWidth={5} strokeLinecap="round" />
                    <ellipse cx={0} cy={-26} rx={11} ry={15} fill="#B9774A" stroke="#fff" strokeWidth={3} />
                  </g>
                ) : null}
              </CrowdFigure>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};


