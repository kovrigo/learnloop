import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {easeOutCubic} from '../../common';
import {C, FONT, SET, SHADOW, SHADOW_S, PaperBg, PaperWipe, PaperTag, PaperCharacter, Ship, CAST, slapCss, prog} from '../../paper';
import {kicks} from './kit';
import {CaveStatic} from './SC06';

/**
 * SC05 · frames 1329–1538 · S11–S12 · source IN HOMER / BOOKS 9–12.
 * Feast at night: plum and gold. SC04's plum sheet is already on screen at 1329.
 * 1337 the table, the night window and Odysseus slap in (the two Phaeacian listeners 2 and 3 frames later); his arms swing as he talks.
 * 1404 the post card grows up from his raised hand: "TRAVEL BLOG BY ODYSSEUS" with a tiny cyclops and a ship.
 * 1444 (pre-hang for the short last block at 1481) the tag "HIS VERSION" slaps on the post.
 * Hold: the tag lands 1444 (settled 1454) → exit 1530. Exit: the cave sheet of SC06 wipes in over 1530–1538.
 */
const F0 = 1329;
const END = 1538;
const B = {a: 1337, b: 1404, c: 1481, tag: 1444};
const EXIT = END - 8;

const ODY = {x: 70, y: 162, h: 620};
const TABLE_TOP = 556;
// raised right hand of Odysseus (screen px, tuned to armR = −128): where the post card starts to grow
const HAND = {x: 566, y: 404};
const CARD = {x: 470, y: 92, w: 384, h: 292, rot: -3};

export const SC05: React.FC = () => {
  const N = useCurrentFrame() + F0;
  const nT = N - B.a;
  const talk = 1 - 0.85 * prog(N, 1470, 22, (t) => t); // he talks until S11 ends, then only the small motion of a speaker who has finished
  const sw = (p: number, ph = 0) => Math.sin(((N + ph) / p) * Math.PI * 2);
  const headO = kicks(N, [[B.a, 4], [B.b, -4], [B.c, 3]], 24, 10) + 1.4 * talk * sw(48);
  const table = prog(N, B.a - 3, 9, easeOutCubic);
  const grow = prog(N, B.b - 2, 16, easeOutCubic);
  const growS = 0.06 + 0.94 * grow + (grow < 1 ? 0.06 * Math.sin(grow * Math.PI) : 0);
  const cx = HAND.x + (CARD.x + CARD.w / 2 - HAND.x) * grow;
  const cy = HAND.y + (CARD.y + CARD.h / 2 - HAND.y) * grow;
  const wipe = prog(N, EXIT, 8, easeOutCubic);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <PaperBg color={SET.feast.bg}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, }}>
          {/* night window */}
          <div style={{position: 'absolute', left: 990, top: 118, width: 190, height: 190, filter: SHADOW, ...slapCss(N - (B.a + 2), 2, 1)}}>
            <div style={{position: 'absolute', inset: 0, background: SET.night.bg, border: '10px solid #fff', boxSizing: 'border-box'}}>
              <svg width={170} height={170} style={{position: 'absolute', left: 0, top: 0}}>
                <circle cx={96} cy={84} r={38} fill={SET.feast.accent} />
                <circle cx={113} cy={74} r={34} fill={SET.night.bg} />
                <path d="M85 0V170M0 85H170" stroke="#fff" strokeWidth={8} />
              </svg>
            </div>
          </div>
          {/* Odysseus behind the table */}
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '290px 600px', ...slapCss(nT, 0, -1)}}>
            <PaperCharacter variant="hero" x={ODY.x} y={ODY.y} h={ODY.h} head={headO} armR={-128 + 14 * talk * sw(34)} armL={-46 + 12 * talk * sw(41, 9)} />
          </div>
          {/* the two Phaeacian listeners */}
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '930px 600px', ...slapCss(N - (B.a + 2), 0, 1)}}>
            <PaperCharacter x={792} y={354} h={400} {...CAST.phaeacianM} headTurn={0.85} head={-3 + kicks(N, [[B.b, 3], [B.c, -2.5]], 22, 10)} />
          </div>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '1110px 600px', ...slapCss(N - (B.a + 3), 0, -1)}}>
            <PaperCharacter x={992} y={372} h={380} {...CAST.phaeacianW} headTurn={0.85} head={3 + kicks(N, [[B.b + 3, -3], [B.c + 3, 2.5]], 22, 10)} />
          </div>
          {/* the table: gold top, cream cloth, plates and cups; runs off the sides and the bottom */}
          <div style={{position: 'absolute', left: -40, top: TABLE_TOP + (1 - table) * 260, width: 1360, height: 360, filter: SHADOW}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 1360, height: 52, background: SET.feast.accent, borderTop: '9px solid #fff', boxSizing: 'border-box'}} />
            <div style={{position: 'absolute', left: 0, top: 52, width: 1360, height: 320, background: C.cream2}} />
            <div style={{position: 'absolute', left: 0, top: 52, width: 1360, height: 12, background: 'rgba(22,21,31,0.12)'}} />
            {[200, 520, 900, 1180].map((x) => (
              <div key={x} style={{position: 'absolute', left: x, top: 90, width: 6, height: 240, background: 'rgba(48,48,57,0.12)'}} />
            ))}
          </div>
          {N >= B.a - 3 ? <Table N={N} t={table} /> : null}
          {/* post card growing from his hand */}
          {N >= B.b - 2 ? (
            <div style={{position: 'absolute', left: cx - CARD.w / 2, top: cy - CARD.h / 2, width: CARD.w, height: CARD.h, transform: `rotate(${CARD.rot * grow}deg) scale(${growS})`, filter: SHADOW}}>
              <Post />
            </div>
          ) : null}
          <PaperTag text="HIS VERSION" x={716} y={364} rot={7} size={36} n={N - B.tag} dir={-1} bg={C.yellow} color={C.navy} />
        </div>
      </PaperBg>
      <PaperWipe p={wipe} color={SET.cave.bg} from="right">
        <CaveStatic />
      </PaperWipe>
    </AbsoluteFill>
  );
};

/** Plates, cups, a jug and a roast on the table top (screen px). */
const Table: React.FC<{N: number; t: number}> = ({N, t}) => {
  const dy = (1 - t) * 260;
  const plate = (x: number) => (
    <g key={x}>
      <ellipse cx={x} cy={566} rx={62} ry={14} fill="#fff" />
      <ellipse cx={x} cy={563} rx={46} ry={9} fill="#EFE8DA" />
    </g>
  );
  return (
    <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transform: `translateY(${dy}px)`}}>
      <g style={{filter: SHADOW_S}}>
        {plate(250)}
        {plate(700)}
        {plate(1010)}
        {/* roast leg on the first plate */}
        <ellipse cx={246} cy={546} rx={26} ry={17} fill="#B9774A" stroke="#fff" strokeWidth={5} />
        <path d="M262 540 292 524" stroke="#fff" strokeWidth={13} strokeLinecap="round" />
        <path d="M262 540 292 524" stroke="#F3E9D2" strokeWidth={7} strokeLinecap="round" />
        {/* cups */}
        {[420, 760].map((x) => (
          <g key={x}>
            <path d={`M${x - 22} 508 H${x + 22} L${x + 15} 566 H${x - 15}Z`} fill={SET.feast.accent} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
            <rect x={x - 22} y={512} width={44} height={9} fill="rgba(22,21,31,0.2)" />
          </g>
        ))}
        {/* jug */}
        <path d="M580 566 Q566 520 584 496 H620 Q638 520 624 566Z" fill={C.hull} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
        <path d="M624 512 Q652 514 642 542" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
        <path d="M624 512 Q652 514 642 542" fill="none" stroke={C.hull} strokeWidth={4} strokeLinecap="round" />
      </g>
    </svg>
  );
};

/** The phone-style post (generic: no app name, no logo, no brand colour). Inner size 358×266. */
const Post: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: C.card, border: '13px solid #fff', boxSizing: 'border-box'}}>
    <div style={{position: 'absolute', left: 18, top: 14, width: 44, height: 44, borderRadius: 22, background: C.cream2, border: '4px solid #E3D3BC', boxSizing: 'border-box'}}>
      <svg width={36} height={36} viewBox="0 0 36 36" style={{position: 'absolute', left: 0, top: 0}}>
        <path d="M17 26V8M17 9 27 24H17Z" fill={C.sail} stroke={C.hullEdge} strokeWidth={2} strokeLinejoin="round" />
        <path d="M6 25H30L26 31H11Z" fill={C.hull} stroke={C.hullEdge} strokeWidth={2} strokeLinejoin="round" />
      </svg>
    </div>
    <div style={{position: 'absolute', left: 74, top: 12, fontFamily: FONT, fontWeight: 900, fontSize: 22, letterSpacing: 1.5, lineHeight: '26px', color: C.ink}}>TRAVEL BLOG<br />BY ODYSSEUS</div>
    <div style={{position: 'absolute', left: 18, right: 18, top: 70, height: 3, background: C.rule}} />
    {/* picture: sea postcard with two tiny cut-outs */}
    <div style={{position: 'absolute', left: 18, top: 82, width: 322, height: 120, overflow: 'hidden', background: SET.sea.sky, border: '3px solid #fff', boxSizing: 'content-box'}}>
      <div style={{position: 'absolute', left: 0, top: 78, width: 322, height: 60, background: SET.sea.water}} />
      <div style={{position: 'absolute', left: 0, top: 96, width: 322, height: 40, background: SET.sea.deep}} />
      <PaperCharacter variant="cyclops" x={18} y={14} h={112} cropY={330} />
      <Ship x={252} y={96} w={100} rot={-3} />
    </div>
    {/* generic reaction row */}
    <svg width={322} height={44} style={{position: 'absolute', left: 18, top: 214}}>
      <path d="M22 30C6 18 8 6 18 6 21 6 22 9 22 9S23 6 26 6C36 6 38 18 22 30Z" fill={C.pink} stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
      <path d="M62 8H96Q102 8 102 14V24Q102 30 96 30H80L70 38V30H62Q56 30 56 24V14Q56 8 62 8Z" fill="none" stroke={C.grey} strokeWidth={4} strokeLinejoin="round" />
      <rect x={130} y={12} width={96} height={6} rx={3} fill={C.rule} />
      <rect x={130} y={24} width={64} height={6} rx={3} fill={C.rule} />
    </svg>
  </div>
);
