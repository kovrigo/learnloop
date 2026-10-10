import type {ShotDef, BgSpec} from '../common';
import {CHAPTER_CARDS, Rail, RAILS} from './Overlay';
import {ChapterCard} from './ChapterCard';
export {HudLayer} from './Hud';
export {END_SCREEN_RANGE, VIDEO_FRAMES} from './Overlay';
// Overlay (G0, maintained by the main session; shot groups do not draw these). Lowest layer (Main puts it first).
// No template title card: SC01 owns frames 1–S03.to+2. The LearnLoop sting is shot STING in G1. The LearnLoop HUD is drawn by Main via HudLayer (above the shots).
export const SHOTS_OVERLAY: ShotDef[] = [
  ...CHAPTER_CARDS.map((c) => ({id: `OV-Chapter${c.n}`, from: c.from, to: c.to, Comp: (() => ChapterCard({card: c})) as unknown as React.FC})),
  ...RAILS.map((r, i) => ({id: `OV-Rail${i + 1}`, from: r.from, to: r.to, Comp: (() => Rail({spec: r})) as unknown as React.FC})),
];
// Above all content: nothing. No black end fade and no end credit: the video ends on the end screen (shot END, drawn by G8 in END_SCREEN_RANGE).
export const SHOTS_OVERLAY_TOP: ShotDef[] = [];
// Backdrop is off for the whole video (config.bg = 'none'); kept for the template's BgSpec plumbing.
export const BG_OVERLAY: BgSpec[] = [];
