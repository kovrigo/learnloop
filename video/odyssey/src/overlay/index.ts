import type {ShotDef, BgSpec} from '../common';
import {CHAPTER_CARDS, Rail, RAILS, Ending, ENDING_RANGE, EndingTop, ENDING_TOP_RANGE, EndCredit, END_CREDIT_RANGE} from './Overlay';
import {Sting, STING_RANGE} from './Sting';
import {ChapterCard} from './ChapterCard';
export {HudLayer} from './Hud';
// Overlay (G0, maintained by the main session; shot groups do not draw these). Lowest layer (Main puts it first).
// No template title card: G1-01 owns frames 1–S03.to+2. The LearnLoop HUD is drawn by Main via HudLayer (above the shots).
export const SHOTS_OVERLAY: ShotDef[] = [
  {id: 'OV-Sting', from: STING_RANGE[0], to: STING_RANGE[1], Comp: Sting},
  ...CHAPTER_CARDS.map((c) => ({id: `OV-Chapter${c.n}`, from: c.from, to: c.to, Comp: (() => ChapterCard({card: c})) as unknown as React.FC})),
  ...RAILS.map((r, i) => ({id: `OV-Rail${i + 1}`, from: r.from, to: r.to, Comp: (() => Rail({spec: r})) as unknown as React.FC})),
];
// Above all content: ending fade (below the progress bar) + progress bar fade (aboveBar) + credit card (aboveBar).
export const SHOTS_OVERLAY_TOP: ShotDef[] = [
  {id: 'OV-Ending', from: ENDING_RANGE[0], to: ENDING_RANGE[1], Comp: Ending},
  {id: 'OV-EndingTop', from: ENDING_TOP_RANGE[0], to: ENDING_TOP_RANGE[1], Comp: EndingTop, layer: 'aboveBar'},
  {id: 'OV-EndCredit', from: END_CREDIT_RANGE[0], to: END_CREDIT_RANGE[1], Comp: EndCredit, layer: 'aboveBar'},
];
// Backdrop is off for the whole video (config.bg = 'none'); kept for the template's BgSpec plumbing.
export const BG_OVERLAY: BgSpec[] = [];
