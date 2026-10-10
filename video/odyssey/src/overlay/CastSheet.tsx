import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Fonts} from '../common';
import {C, FONT, BODIES, CAST, SUITOR_HEADS, CREW_HEADS, PaperCharacter, CrowdFigure} from '../paper';
import type {CastRole} from '../paper';

/**
 * Cast sheet (composition "Cast", 1 frame, 1560×1120): flat cream, every role as PaperCharacter at h 300 and every crew / suitor head on
 * CrowdFigure at h 150, each with its name and head file. Build agents look at it to keep the cast consistent:
 * the same role always gets the same CAST entry (variant, headImg, robeFill, robeLine); crowds take their heads from SUITOR_HEADS / CREW_HEADS.
 */
export const CAST_SHEET = {w: 1560, h: 1120};

const NAMES: Record<CastRole, string> = {
  athena: 'ATHENA', calypso: 'CALYPSO', telemachus: 'TELEMACHUS', mentor: 'MENTOR', maid: 'MAID',
  crewA: 'CREW A', crewB: 'CREW B', phaeacianM: 'PHAEACIAN M', phaeacianW: 'PHAEACIAN W',
};
const SUITOR_TUNICS = ['#B7A6D9', '#C9785B', '#7FC4C0', '#E0B54A']; // as in G1_01

const Label: React.FC<{cx: number; y: number; name: string; file: string}> = ({cx, y, name, file}) => (
  <div style={{position: 'absolute', left: cx - 120, top: y, width: 240, textAlign: 'center', fontFamily: FONT, color: C.graphite}}>
    <div style={{fontWeight: 900, fontSize: 22, letterSpacing: 1}}>{name}</div>
    <div style={{fontWeight: 700, fontSize: 13, color: C.grey, marginTop: 2}}>{file}</div>
  </div>
);

export const CastSheet: React.FC = () => {
  const H = 300, PITCH = 250, X0 = 30 + PITCH / 2; // column centres
  const W_BODY = (H * 380) / 540;
  const rows: Array<Array<{name: string; file: string; node: (x: number, y: number) => React.ReactNode}>> = [
    [
      {name: 'ODYSSEUS', file: BODIES.hero.head.file, node: (x, y) => <PaperCharacter variant="hero" x={x} y={y} h={H} />},
      {name: 'PENELOPE', file: BODIES.penelope.head.file, node: (x, y) => <PaperCharacter variant="penelope" x={x} y={y} h={H} />},
      {name: 'POLYPHEMUS', file: BODIES.cyclops.head.file, node: (x, y) => <PaperCharacter variant="cyclops" x={x} y={y} h={H} />},
      ...(['athena', 'calypso', 'telemachus'] as CastRole[]).map((r) => ({name: NAMES[r], file: CAST[r].headImg, node: (x: number, y: number) => <PaperCharacter x={x} y={y} h={H} {...CAST[r]} />})),
    ],
    (['mentor', 'maid', 'crewA', 'crewB', 'phaeacianM', 'phaeacianW'] as CastRole[]).map((r) => ({name: NAMES[r], file: CAST[r].headImg, node: (x: number, y: number) => <PaperCharacter x={x} y={y} h={H} {...CAST[r]} />})),
  ];
  const crowd = [
    ...SUITOR_HEADS.map((f, i) => ({name: `SUITOR ${i + 1}`, file: f, head: f, tunic: SUITOR_TUNICS[i % SUITOR_TUNICS.length], line: undefined as string | undefined})),
    ...CREW_HEADS.map((f, i) => ({name: i === 0 ? 'CREW A' : 'CREW B', file: f, head: f, tunic: CAST[i === 0 ? 'crewA' : 'crewB'].robeFill, line: CAST[i === 0 ? 'crewA' : 'crewB'].robeLine})),
  ];
  return (
    <AbsoluteFill style={{background: C.cream}}>
      <Fonts />
      <div style={{position: 'absolute', left: 30, top: 22, fontFamily: FONT, fontWeight: 900, fontSize: 18, letterSpacing: 2, color: C.ink}}>CAST: ONE HEAD PER ROLE FOR THE WHOLE VIDEO. PaperCharacter h 300, CrowdFigure h 150.</div>
      {rows.map((row, ri) =>
        row.map((c, ci) => {
          const cx = X0 + ci * PITCH, top = 90 + ri * 410;
          return (
            <React.Fragment key={`${ri}-${ci}`}>
              {c.node(cx - W_BODY / 2, top)}
              <Label cx={cx} y={top + H + 14} name={c.name} file={c.file} />
            </React.Fragment>
          );
        }),
      )}
      {crowd.map((c, i) => {
        const cx = X0 + i * PITCH, by = 1040;
        return (
          <React.Fragment key={`c${i}`}>
            <CrowdFigure head={c.head} cx={cx} by={by} h={150} tunic={c.tunic} line={c.line} />
            <Label cx={cx} y={by + 12} name={c.name} file={c.file} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
