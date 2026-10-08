import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, TOTAL_FRAMES} from '../common';
import type {ShotDef} from '../common';
import {VIDEO} from '../config';
import {FONT, C} from '../paper';
import {S, CHAPTER_CARDS} from './Overlay';

/**
 * LearnLoop HUD (storyboard G0), drawn above the shots and below the progress bar:
 * - "LEARNLOOP" at x 42, baseline 47, Inter Black 19, caps, spacing 2, white — frames 1–TOTAL;
 * - chapter tag right-aligned at x 1238, baseline 47, Inter Black 18 — from config.chapterTagFromS, swaps at each chapter card's midpoint;
 * - source label (second line) at x 42, baseline 78, Inter Black 16, cream — read from each shot's ShotDef.source (its only source).
 */
export type TagSpan = {text: string; from: number; to: number};
export const CHAPTER_TAGS: TagSpan[] = (() => {
  const starts = [S(VIDEO.chapterTagFromS).from, ...CHAPTER_CARDS.map((c) => Math.round((c.from + c.to) / 2))];
  return starts.map((f, i) => ({text: VIDEO.chapterTags[i] ?? '', from: f, to: i < starts.length - 1 ? starts[i + 1] - 1 : TOTAL_FRAMES}));
})();

const hudText = (x: number, y: number, size: number, fill: string, anchor: 'start' | 'end', op: number, text: string, key?: string) =>
  op > 0.004 ? (
    <text key={key} x={x} y={y} fill={fill} fontFamily={FONT} fontWeight={900} fontSize={size} letterSpacing={2} textAnchor={anchor} opacity={op}>
      {text}
    </text>
  ) : null;

export const HudLayer: React.FC<{shots: ShotDef[]}> = ({shots}) => {
  const N = useCurrentFrame() + 1;
  // chapter tag: first one fades in 8 frames; swaps: old out 4 frames, new in 6
  const tags: React.ReactNode[] = [];
  CHAPTER_TAGS.forEach((t, i) => {
    if (N < t.from - 4 || N > t.to + 4) return;
    const isFirst = i === 0;
    const inOp = isFirst ? clamp01((N - t.from + 1) / 8) : clamp01((N - t.from - 3) / 6);
    const outOp = i < CHAPTER_TAGS.length - 1 ? 1 - clamp01((N - t.to) / 4) : 1;
    const op = Math.min(inOp, outOp);
    tags.push(hudText(1238, 47, 18, '#FFFFFF', 'end', op, t.text, `t${i}`));
  });
  // source label from the shot that owns frame N
  const src = shots.find((s) => s.source && N >= s.from && N <= s.to);
  let srcNode: React.ReactNode = null;
  if (src && src.source) {
    const beat = src.beat ?? src.from;
    const op = Math.min(clamp01((N - beat + 1) / 8), clamp01((src.to - N + 1) / 8));
    srcNode = hudText(42, 78, 16, C.hud, 'start', op, src.source.toUpperCase());
  }
  return (
    <svg width={1280} height={110} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none', overflow: 'visible'}}>
      {hudText(42, 47, 19, '#FFFFFF', 'start', 1, 'LEARNLOOP')}
      {tags}
      {srcNode}
    </svg>
  );
};
