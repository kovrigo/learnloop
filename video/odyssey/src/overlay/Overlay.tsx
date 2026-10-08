import React from 'react';
import {useCurrentFrame} from 'remotion';
import {emphasisPulse, SENTENCES, TOTAL_FRAMES, CHAPTER_STARTS, clamp01, W} from '../common';
import {CText, Pill, ArrowH, PURPLE, GREY, GREY_MID, WHITE, GLOW_PURPLE_S, fadeIn, slideUp} from '../ui';
import {VIDEO} from '../config';
const clampFrames = (n: number, len: number) => clamp01(n / len);

// LearnLoop paper style: no template title card (SC01 starts at frame 1), no capsule HUD.
// The sting, chapter cards and the HUD lines (LEARNLOOP / chapter tag / source label) are in Sting.tsx, ChapterCard.tsx and Hud.tsx.

// ---------- 时间轴查询 ----------
export const S = (id: string) => {
  const s = SENTENCES.find((x) => x.id === id);
  if (!s) throw new Error(`config 引用了不存在的句 id ${id}（请对照 script/timeline.md）`);
  return s;
};

// ---------- 章节卡 ----------
/** 章节卡（第 2 章起）：占据上一章末句结束+3 → 本章首句 from−9（即 tts_build 的章前空白） */
const lastSentenceBefore = (frame: number) => [...SENTENCES].reverse().find((x) => x.to < frame)!;
export const CHAPTER_CARDS: Array<{n: number; title: string; tech: string; from: number; to: number}> = CHAPTER_STARTS.slice(1).map((c, i) => {
  const first = SENTENCES.find((x) => x.chapter === c.n)!;
  const prev = lastSentenceBefore(first.from);
  return {n: c.n, title: c.title, tech: VIDEO.chapterTech[i + 1] ?? '', from: prev.to + 3, to: first.from - 9};
});

// ---------- 流程轨（只在 config.rails 标了轨的章出现）----------
export type RailSpec = {steps: string[]; switches: number[]; from: number; to: number};
export const RAILS: RailSpec[] = (SENTENCES.length ? VIDEO.rails : []).map((r) => ({steps: r.steps, switches: r.switchS.map((id) => S(id).from), from: S(r.fromS).from - 8, to: S(r.toS).to + 2}));
const RAIL_CX = [W / 2 - 400, W / 2 - 200, W / 2, W / 2 + 200, W / 2 + 400];
const RAIL_W = 150, RAIL_H = 44, RAIL_Y = 118;
export const Rail: React.FC<{spec: RailSpec}> = ({spec}) => {
  const N = useCurrentFrame() + spec.from;
  let active = -1;
  spec.switches.forEach((f, i) => { if (N >= f) active = i; });
  const railOut = 1 - clampFrames(N - (spec.to - 8), 8); // 末 8 帧淡出
  return (
    <div style={{position: 'absolute', inset: 0, opacity: railOut}}>
      {spec.steps.map((t, i) => {
        const state = i === active ? 'active' : i < active ? 'done' : 'todo';
        const pulse = i === active ? emphasisPulse(N - spec.switches[i], {peak: 1.1, up: 10, hold: 3, down: 10}) : 1;
        const fill = state === 'active' ? PURPLE : state === 'done' ? '#2A2A2A' : '#000';
        const stroke = state === 'active' ? WHITE : state === 'done' ? GREY_MID : GREY;
        const color = state === 'todo' ? GREY : WHITE;
        return (
          <React.Fragment key={t}>
            <div style={{position: 'absolute', left: RAIL_CX[i] - RAIL_W / 2, top: RAIL_Y + slideUp(N - (spec.from + i * 2), 40, 16), width: RAIL_W, height: RAIL_H, transform: `scale(${pulse})`, opacity: fadeIn(N - (spec.from + i * 2), 8)}}>
              <Pill x={0} y={0} w={RAIL_W} h={RAIL_H} fill={fill} stroke={stroke} sw={2} text={t} fontSize={24} weight={700} color={color} letterSpacing={1} textDy={-1.5} glow={state === 'active' ? GLOW_PURPLE_S : undefined} />
            </div>
            {i < spec.steps.length - 1 ? (
              <ArrowH x={RAIL_CX[i] + RAIL_W / 2 + 6} y={RAIL_Y + RAIL_H / 2 - 9} w={38} h={18} p={clampFrames(N - (spec.from + 4 + i * 2), 10)} color={i < active ? WHITE : GREY} shaft={2} />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ---------- 片尾 ----------
// 压黑层挂在内容之上（Main 里 SHOTS_OVERLAY_TOP 排在所有内容组之后、进度条之下），从末句结束前 endingFade 帧起压黑，末镜头内容在被完全盖住后才结束；
// 最后 30 帧再用 aboveBar 层把进度条也压黑 → 末段纯黑。
const LAST_TO = SENTENCES[SENTENCES.length - 1]?.to ?? TOTAL_FRAMES - 60;
export const ENDING_RANGE: [number, number] = [LAST_TO - VIDEO.endingFade, TOTAL_FRAMES];
export const Ending: React.FC = () => {
  const N = useCurrentFrame() + ENDING_RANGE[0];
  const n = N - ENDING_RANGE[0];
  const op = fadeIn(n, VIDEO.endingFade);
  return <div style={{position: 'absolute', inset: 0, background: '#000', opacity: op}} />;
};
/** 片尾署名（压黑之后、进度条压黑之前）：完整书名 / 作者 / 出版社，停 ≈3 s，让片头 tagline 读不完的信息在这里补齐（QC v1 C1 #1） */
export const END_CREDIT_RANGE: [number, number] = [LAST_TO + 1, TOTAL_FRAMES - 26];  // 9110–9182：末句字幕 9109 结束、内容已全黑后再出署名卡（满态 ≈56 帧）；之后 26 帧纯黑
export const EndCredit: React.FC = () => {
  const N = useCurrentFrame() + END_CREDIT_RANGE[0];
  const n = N - END_CREDIT_RANGE[0];
  const len = END_CREDIT_RANGE[1] - END_CREDIT_RANGE[0];
  const op = Math.min(fadeIn(n, 8), 1 - clampFrames(N - (END_CREDIT_RANGE[1] - 8), 8));
  const c = VIDEO.credit;
  const by = VIDEO.builtBy;
  if (!c && !by) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op}}>
      {c ? (
        <>
          <CText cx={W / 2} cy={300} size={26} weight={500} color={GREY} letterSpacing={4}>{c.kicker}</CText>
          <CText cx={W / 2} cy={352} size={40} weight={700} color={WHITE}>{c.title}</CText>
          <CText cx={W / 2} cy={404} size={26} weight={500} color={GREY}>{c.byline}</CText>
          <div style={{position: 'absolute', left: W / 2 - 80, top: 440, width: 160, height: 2, background: 'rgba(255,255,255,0.35)', transform: `scaleX(${fadeIn(n - 6, 16)})`}} />
          <CText cx={W / 2} cy={476} size={22} weight={500} color={GREY}>{c.note}</CText>
        </>
      ) : null}
      {/* 片尾署名行（config.builtBy，默认开）：有署名卡时排在卡下方，没有卡时单独居中 */}
      {by ? <CText cx={W / 2} cy={c ? 524 : 384} size={22} weight={500} color={GREY_MID} letterSpacing={2}>{by}</CText> : null}
    </div>
  );
};
// QC v1 C4 #2：进度条不能在画面全黑后孤悬 2 s → 进度条随 endingFade 一起压黑（aboveBar 层），署名卡在其上（见 index.ts 层序）
export const ENDING_TOP_RANGE: [number, number] = [LAST_TO - VIDEO.endingFade, TOTAL_FRAMES];
export const EndingTop: React.FC = () => {
  const N = useCurrentFrame() + ENDING_TOP_RANGE[0];
  const op = fadeIn(N - ENDING_TOP_RANGE[0], VIDEO.endingFade);
  return <div style={{position: 'absolute', inset: 0, background: '#000', opacity: op}} />;
};
