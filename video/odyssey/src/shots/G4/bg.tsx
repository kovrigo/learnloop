import React from 'react';
import {C, SET, Waves, wavePath, foamPath, usePaperId} from '../../paper';
import {rnd} from '../../common';

/**
 * Background sheets of the four G4 shots, drawn as plain functions of the frame number so that the previous shot's last 8 frames can
 * wipe the next shot's first frame in (PaperWipe children). Flat setting colour + shapes; the paper grain is added by the caller.
 */
const SHADOW_FILL = 'rgba(22,21,31,0.22)';
export const BG14 = SET.sirens.bg; // #7FC4C0 turquoise meadow (the sheet SC13 wipes in)
export const BG15 = SET.sea.deep; // #285F80 dark strait water
export const BG16 = SET.sea.sky; // #8DB9D3 sky, with the sun-god's yellow ground
export const BG17 = SET.calypso.bg; // #A8D5C2 mint island
export const BG_END = SET.ithaca.bg; // #D9D3B7: sheet of chapter card 3

/** Oversize flat colour (world layers move with the camera). */
export const Flat: React.FC<{color: string}> = ({color}) => <div style={{position: 'absolute', left: -1400, top: -900, width: 4400, height: 3200, background: color}} />;

// ---------------------------------------------------------------- SC14: sirens' meadow and the sea
const SEA14 = 'M440 900C470 760 500 640 480 520C462 410 540 300 640 190C700 120 710 20 690 -300L2400 -300L2400 900Z';
export const Back14: React.FC<{N: number; slide?: number}> = ({N, slide = 0}) => {
  const id = usePaperId('sea14');
  const drift = N * 0.8;
  return (
    <>
      <Flat color={BG14} />
      {/* the deep sea sheet slides in from the right while the shot opens (slide 0 = at rest) */}
      <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transform: `translateX(${slide}px)`}}>
        <defs>
          <clipPath id={id}>
            <path d={SEA14} />
          </clipPath>
        </defs>
        <path d={SEA14} fill={SET.sirens.shape} />
        <g clipPath={`url(#${id})`}>
          <path d={wavePath(548, 12, 700, drift, 300, 2400, 900)} fill="#25595E" />
        </g>
      </svg>
    </>
  );
};
/** Foreground water in front of the hull: second band and the foam line. */
export const Front14: React.FC<{N: number; slide?: number}> = ({N, slide = 0}) => {
  const id = usePaperId('sea14f');
  const drift = N * 0.8;
  return (
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transform: `translateX(${slide}px)`}}>
      <defs>
        <clipPath id={id}>
          <path d={SEA14} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <path d={wavePath(618, 14, 600, 200 + drift * 1.2, 300, 2400, 900)} fill="#1D4A4F" />
        <path d={foamPath(664, 12, 640, 90 + drift, 300, 2400)} fill="none" stroke="#C8E8EA" strokeWidth={18} strokeLinecap="round" opacity={0.42} />
      </g>
    </svg>
  );
};
/** Grass strip with flowers in front of the singers' hems. */
export const Meadow14: React.FC = () => {
  const tufts: React.ReactNode[] = [];
  for (let i = 0; i < 11; i++) {
    const x = 18 + i * 40 + rnd(i, 1) * 12, h = 30 + rnd(i, 2) * 22;
    tufts.push(<path key={`t${i}`} d={`M${x} 722Q${x - 4} ${722 - h * 0.6} ${x - 12} ${722 - h}Q${x + 2} ${722 - h * 0.5} ${x + 6} 722ZM${x + 4} 722Q${x + 10} ${722 - h * 0.8} ${x + 22} ${722 - h * 0.9}Q${x + 14} ${722 - h * 0.4} ${x + 14} 722Z`} fill="#2C6E73" />);
  }
  const flowers = [[70, 676], [168, 692], [262, 672], [352, 690], [418, 668]].map(([x, y], i) => (
    <g key={`f${i}`}>
      <path d={`M${x} ${y}V722`} stroke="#2C6E73" strokeWidth={4} />
      {[0, 1, 2, 3, 4].map((k) => (
        <circle key={k} cx={x + 9 * Math.cos((k / 5) * Math.PI * 2)} cy={y + 9 * Math.sin((k / 5) * Math.PI * 2)} r={6.5} fill={i % 2 ? C.cream : C.pink} stroke="#fff" strokeWidth={2} />
      ))}
      <circle cx={x} cy={y} r={5.5} fill={C.yellow} />
    </g>
  ));
  return (
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d="M-200 740V700Q-60 676 60 698T250 694T440 700V740Z" fill="#2C6E73" stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
      {tufts}
      {flowers}
    </svg>
  );
};

// ---------------------------------------------------------------- SC15: dark water strait
export const Back15: React.FC<{N: number}> = ({N}) => (
  <>
    <Flat color={BG15} />
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {/* two low rock walls frame the strait (behind the cards) */}
      <path d="M-100 780V330Q10 296 90 346Q150 392 188 484Q222 590 270 780Z" fill="#1D4A63" />
      <path d="M1380 780V330Q1270 296 1190 346Q1130 392 1092 484Q1058 590 1010 780Z" fill="#1D4A63" />
    </svg>
    <Waves top={468} drift={N * 0.9} />
  </>
);

// ---------------------------------------------------------------- SC16: sky, the sun god's yellow ground, the sea
const GROUND16 = 'M-300 440Q-100 410 120 418Q330 410 520 436Q690 458 750 520Q800 580 760 740L-300 740Z';
export const Back16: React.FC<{N: number}> = ({N}) => (
  <>
    <Flat color={BG16} />
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <circle cx={1066} cy={188} r={70} fill={SET.ithaca.sun} stroke="#fff" strokeWidth={10} />
    </svg>
    <Waves top={470} drift={N * 0.9} />
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {/* hard offset shadow drawn as a shape: a CSS filter on this big svg left a black patch in the exit wipe (5414–5417) */}
      <path d={GROUND16} transform="translate(8 13)" fill={SHADOW_FILL} />
      <path d={GROUND16} fill={SET.gods.bg} />
      <path d="M-300 440Q-100 410 120 418Q330 410 520 436Q690 458 750 520Q800 580 760 740" fill="none" stroke="#fff" strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  </>
);

// ---------------------------------------------------------------- SC17: Calypso's island (world is 330 px wider on the right: the pan shows the horizon)
const shoreL = (y: number, N: number) => 262 + 26 * Math.sin(y / 95) + 9 * Math.sin(N / 15 + y / 45);
const shoreR = (y: number, N: number) => 1384 + 22 * Math.sin(y / 80 + 1) + 9 * Math.sin(N / 15 + y / 45 + 2);
export const HORIZON17 = 300;
export const Back17: React.FC<{N: number}> = ({N}) => {
  const L: string[] = [], R: string[] = [];
  for (let y = -200; y <= 900; y += 25) L.push(`${shoreL(y, N).toFixed(1)} ${y}`);
  for (let y = HORIZON17; y <= 900; y += 25) R.push(`${shoreR(y, N).toFixed(1)} ${y}`);
  const seaL = `M-600 -200L${L.join('L')}L-600 900Z`;
  const seaR = `M${R[0]}L2400 ${HORIZON17}L2400 900L${[...R].reverse().join('L')}Z`;
  const foam = (pts: string[], dx: number, ph: number) => `M${pts.map((p) => {
    const [x, y] = p.split(' ').map(Number);
    return `${(x + dx + 6 * Math.sin(N / 12 + ph + y / 60)).toFixed(1)} ${y}`;
  }).join('L')}`;
  return (
    <>
      <Flat color={BG17} />
      <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d="M120 706Q480 628 860 642T1500 652V900H120Z" transform="translate(8 13)" fill={SHADOW_FILL} />
        <path d="M120 706Q480 628 860 642T1500 652V900H120Z" fill="#93C9B3" />
        <path d="M120 706Q480 628 860 642T1500 652" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
        <path d={seaL} fill={SET.calypso.shape} />
        <path d={foam(L, 12, 0)} fill="none" stroke="#C8E8EA" strokeWidth={16} strokeLinecap="round" opacity={0.55} />
        <path d={foam(L, 34, 2)} fill="none" stroke="#C8E8EA" strokeWidth={9} strokeLinecap="round" opacity={0.3} />
        <path d={seaR} fill={SET.calypso.shape} />
        <path d={foam(R, -12, 1)} fill="none" stroke="#C8E8EA" strokeWidth={16} strokeLinecap="round" opacity={0.55} />
        <path d={foam(R, -34, 3)} fill="none" stroke="#C8E8EA" strokeWidth={9} strokeLinecap="round" opacity={0.3} />
        <path d={`M${shoreR(HORIZON17, N) - 4} ${HORIZON17}H2400`} stroke="#C8E8EA" strokeWidth={8} />
      </svg>
    </>
  );
};
