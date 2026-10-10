import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, easeOutCubic, easeInOutPow} from '../../common';
import {C, CAST, CREW_HEADS, Grain, PaperWipe, PaperTag, SpeechBubble, DottedPath, PaperCharacter, Boat, FONT, prog, rock, samplePath} from '../../paper';
import {Back14, Front14, Meadow14, Back15, BG15} from './bg';
import {Siren, NoteBubble, Crew, Rope, heroMap, kick} from './kit';

/**
 * SC14 · frames 4337–4768 · S42–S45 · source IN HOMER / BOOK 12 · highlight moment of chapter 2: the Sirens.
 * Turquoise meadow (the sheet SC13 wipes in), deep sea on the right. Two drawn singer silhouettes on the meadow, Odysseus at the mast of a paper boat, four rowers.
 * 4345 sirens slap in, the sea sheet and the boat slide in; 4390 "2" tag (+3: "A DUET, NOT A CHOIR"); 4446 two dotted lines run from the singers to the boat and
 * "knowledge" note bubbles stream along them; 4518 wax plugs pop into the rowers' ears; 4590 ropes wrap Odysseus, he strains;
 * 4657 headphones slap on the rowers; 4701 Odysseus's speech bubble. Camera: push-in to Odysseus 4610–4652, ends 108 frames before the shot's end.
 * Hold: bubble opens 4701 → 4709, exit starts 4760 (51 frames). Exit: the strait's water sheet (#285F80) wipes in over the last 8 frames.
 */
const F0 = 4337;
const END = 4768;
const EXIT = END - 8;
const B = {sirens: 4345, two: 4390, notes: 4446, wax: 4518, rope: 4590, phones: 4657, bubble: 4701};
const PUSH = {a: 4610, len: 42};
const CAM0 = {x: 640, y: 360, s: 1};
const CAM1 = {x: 900, y: 330, s: 1.22};

// boat in world px: hull top (gunwale) at y 530; Odysseus at x 840, the mast just right of him
const BOAT = {x: 560, y: 185, s: 0.93};
const HERO_CX = 840;
const MAST_X = 1018;
const GUN_Y = 530;
const HERO = {h: 490, y: 124};
const HERO_X = HERO_CX - (HERO.h * 380) / 540 / 2;
const HM = heroMap(HERO_X, HERO.y, HERO.h);

// dotted lines from the singers' mouths to Odysseus's ear
const PATH_A = samplePath([[182, 440], [240, 362], [340, 286], [470, 248], [610, 252], [752, 292]]);
const PATH_B = samplePath([[352, 440], [408, 362], [480, 312], [570, 288], [670, 288], [752, 298]]);

const CREW_X = [635, 697, 1085, 1145];
const OARS = [660, 760, 1070, 1150];

export const SC14: React.FC = () => {
  const N = useCurrentFrame() + F0;

  // camera
  const p = prog(N, PUSH.a, PUSH.len, easeInOutPow(2.5));
  const cam = {x: CAM0.x + (CAM1.x - CAM0.x) * p, y: CAM0.y + (CAM1.y - CAM0.y) * p, s: CAM0.s + (CAM1.s - CAM0.s) * p};
  const world: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '0 0', transform: `translate(640px, 360px) scale(${cam.s.toFixed(4)}) translate(${(-cam.x).toFixed(2)}px, ${(-cam.y).toFixed(2)}px)`};

  // entrances: sea sheet and boat slide in from the right, singers slap
  const seaSlide = 1000 * (1 - easeOutCubic(clamp01((N - 4339) / 20)));
  const boatSlide = 780 * (1 - easeOutCubic(clamp01((N - 4341) / 24)));
  const exitP = prog(N, EXIT, END - EXIT, easeOutCubic);

  // boat rocks on the water; the singers sway on their own (Siren)
  // the rocking, oars and nodding ease down toward the hold (4680 → 4720) so the layout is calm for the last 40 frames
  const calm = clamp01((N - 4680) / 40);
  const rot = rock(N, 0.6 - 0.42 * calm, 90, 0.37); // phase 0.37: never exactly 0° (Chrome snaps an exact identity transform to the pixel grid: a 1–2 frame jump)
  const bob = (1.6 - 0.9 * calm) * Math.sin((N / 62) * Math.PI * 2 + 1);

  // Odysseus: faces the singers (photo unflipped), bobs on the speech beats, strains once the ropes are on
  const roped = N >= B.rope + 12;
  const strain = roped ? clamp01((N - B.rope - 12) / 14) : 0;
  // the tremor eases off toward the hold (4672 → 4708) so the layout settles; the tied-down pose stays
  const tremor = strain * Math.max(0, Math.min(1, 1 - (N - 4672) / 36));
  const headTilt = [B.sirens, B.two, B.notes, B.wax, B.rope, B.phones, B.bubble].reduce((a, f) => a + kick(N, f, 4, 15, 10), 0) + tremor * 2.2 * Math.sin(N * 0.55) - 3 * strain;
  const arm = N >= B.wax && N < B.wax + 22 ? 38 * Math.sin(((N - B.wax) / 22) * Math.PI) : 0; // hands out the wax
  // PaperCharacter: positive = arm pulled in toward the body, negative = out to the side
  const armL = 4 + strain * 9 + tremor * 5 * Math.sin(N * 0.55);
  const armR = 4 + strain * 9 + tremor * 5 * Math.sin(N * 0.55 + 2.2) - arm;
  const lean = -1.2 * strain + tremor * 1.0 * Math.sin(N * 0.27); // pulls toward the singers against the ropes

  // rope bands across the chest, drawn on one after the other
  const band = (v: number, drop: number) => {
    // from his left side across the chest, once around the mast (x MAST_X) and back to his right shoulder
    const a = HM.pt(36, v), b = HM.pt(352, v + drop), c = HM.pt(196, v + drop / 2 + 22);
    return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}L${(MAST_X + 14).toFixed(1)} ${(b.y + 6).toFixed(1)}`;
  };
  const knot = {x: MAST_X, y: HM.pt(196, 372).y + 14};

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={world}>
        <Back14 N={N} slide={seaSlide} />
      </div>
      <Grain />
      <div style={world}>
        {/* the two singers on the meadow */}
        <Siren cx={150} by={770} h={430} N={N} v={0} phase={0} n={N - (B.sirens - 2)} dir={-1} />
        <Siren cx={322} by={770} h={430} N={N} v={1} phase={11} n={N - (B.sirens + 1)} dir={1} />

        {/* dotted lines and note bubbles */}
        <DottedPath d={PATH_A.d} N={N} reveal={prog(N, B.notes - 2, 22, easeOutCubic)} speed={0.7} width={7} />
        <DottedPath d={PATH_B.d} N={N} reveal={prog(N, B.notes + 2, 22, easeOutCubic)} speed={0.7} width={7} />
        <Notes N={N} />

        {/* boat: hull, rowers, mast, Odysseus, oars */}
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `translate(${boatSlide.toFixed(1)}px, ${bob.toFixed(2)}px)`}}>
          <Boat
            x={BOAT.x}
            y={BOAT.y}
            s={BOAT.s}
            rot={rot}
            sail={false}
            front={
              <div style={{position: 'absolute', left: -BOAT.x, top: -BOAT.y, width: 1280, height: 720}}>
                <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                  {OARS.map((x, i) => {
                    const th = 32 + (9 - 5 * calm) * Math.sin((N / 60) * Math.PI * 2 + i * 0.8 + (i > 1 ? 0.5 : 0));
                    return (
                      <g key={i} transform={`translate(${x} ${GUN_Y + 18}) rotate(${th.toFixed(2)})`}>
                        <rect x={-5} y={-34} width={10} height={196} rx={5} fill="#2C6E73" stroke="#fff" strokeWidth={4} />
                        <rect x={-13} y={112} width={26} height={64} rx={9} fill={C.hull} stroke="#fff" strokeWidth={4} />
                      </g>
                    );
                  })}
                </svg>
              </div>
            }
          >
            <div style={{position: 'absolute', left: -BOAT.x, top: -BOAT.y, width: 1280, height: 720}}>
              {/* mast with the furled sail on its yard, right of Odysseus */}
              <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                <rect x={MAST_X - 12} y={64} width={24} height={520} rx={4} fill={C.hull} stroke="#fff" strokeWidth={8} />
                <rect x={MAST_X - 100} y={96} width={200} height={14} rx={7} fill={C.hull} stroke="#fff" strokeWidth={6} />
                <rect x={MAST_X - 92} y={108} width={184} height={20} rx={10} fill={C.sail} stroke="#fff" strokeWidth={5} />
              </svg>
              {CREW_X.map((cx, i) => {
                const c = CAST[i % 2 === 0 ? 'crewA' : 'crewB'];
                return (
                  <Crew
                    key={i}
                    head={CREW_HEADS[i % 2]}
                    tunic={c.robeFill}
                    line={c.robeLine}
                    cx={cx}
                    by={548}
                    h={140}
                    tilt={(2.6 - 1.4 * calm) * Math.sin((N / 60) * Math.PI * 2 + i * 0.9)}
                    waxN={N - (B.wax - 3 + i)}
                    phonesN={N >= B.phones - 3 + i ? N - (B.phones - 3 + i) : -1}
                    phonesDir={i % 2 ? -1 : 1}
                  />
                );
              })}
              {/* Odysseus at the mast */}
              <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: `${MAST_X}px 560px`, transform: `rotate(${lean.toFixed(2)}deg)`}}>
                <PaperCharacter variant="hero" x={HERO_X} y={HERO.y} h={HERO.h} head={headTilt} headTurn={1} headFlip={1} armL={armL} armR={armR} />
                <Rope d={band(318, 20)} reveal={prog(N, B.rope - 2, 14, easeOutCubic)} />
                <Rope d={band(372, 20)} reveal={prog(N, B.rope + 3, 14, easeOutCubic)} />
                <Rope d={band(426, 20)} reveal={prog(N, B.rope + 8, 14, easeOutCubic)} />
                {N >= B.rope + 16 ? (
                  <div style={{position: 'absolute', left: knot.x - 13, top: knot.y - 13, width: 26, height: 26, borderRadius: 13, background: '#D9B77E', border: '5px solid #fff', boxSizing: 'border-box'}} />
                ) : null}
              </div>
            </div>
          </Boat>
        </div>
        <Front14 N={N} slide={seaSlide} />
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `translateY(${(90 * (1 - easeOutCubic(clamp01((N - 4340) / 14)))).toFixed(1)}px)`}}>
          <Meadow14 />
        </div>

        {/* tags */}
        <PaperTag text="2" x={118} y={250} rot={-6} size={96} n={N - B.two} bg={C.yellow} color={C.navy} />
        <PaperTag text="A DUET, NOT A CHOIR" x={270} y={556} rot={-3} size={34} n={N - (B.two + 3)} dir={-1} color={C.navy} />

        {/* Odysseus's bubble */}
        {N >= B.bubble ? (
          <SpeechBubble x={1052} y={112} w={308} h={212} tx={962} ty={322} n={N - B.bubble}>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, letterSpacing: 0, color: C.graphite, lineHeight: 1}}>IGNORE</div>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 44, letterSpacing: -2, color: C.graphite, lineHeight: 1.05, marginTop: 4}}>EVERYTHING</div>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, letterSpacing: 0, color: C.graphite, lineHeight: 1, marginTop: 4}}>I SAY</div>
          </SpeechBubble>
        ) : null}
      </div>
      <PaperWipe p={exitP} color={BG15} from="right">
        <Back15 N={END + 1} />
      </PaperWipe>
    </AbsoluteFill>
  );
};

/** Note bubbles stream along both dotted lines from 4446 on: one every 17 frames per line, 70 frames from mouth to ear.
 *  The last one leaves at 4640 and has arrived by 4710, so the hold (4709 → 4760) is calm. */
const Notes: React.FC<{N: number}> = ({N}) => {
  const out: React.ReactNode[] = [];
  const lines: Array<[typeof PATH_A, number, string]> = [[PATH_A, B.notes, 'a'], [PATH_B, B.notes + 3, 'b']];
  for (const [path, start, tag] of lines) {
    for (let j = 0; j < 24; j++) {
      const e = start + j * 17;
      if (e > 4640) break;
      const t = (N - e) / 70;
      if (t < 0 || t > 1) continue;
      const q = path.at(t);
      const s = Math.min(1, t / 0.07) * (t > 0.9 ? Math.max(0, (1 - t) / 0.1) : 1);
      out.push(<NoteBubble key={`${tag}${j}`} x={q.x} y={q.y - 30} s={s * (0.8 + 0.2 * Math.min(1, t * 3))} kind={j + (tag === 'b' ? 1 : 0)} rot={7 * Math.sin((N + j * 7) / 7)} />);
    }
  }
  return <>{out}</>;
};
