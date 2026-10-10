import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC10} from './SC10';
import {SC11} from './SC11';
import {SC12} from './SC12';
import {SC13} from './SC13';
// 组 G3 (chapter 2, first half): SC10–SC13. Frames from 分镜表.md / script/timeline.md.
// Shot components: N = useCurrentFrame() + F0 (F0 = the shot's from). Style library: '../../paper'. Group helpers: ./parts.
// source/beat feed the HUD's source label (src/overlay/Hud.tsx).
export const SHOTS_G3: ShotDef[] = [
  {id: 'SC10', from: 3211, to: 3573, Comp: SC10, source: 'IN HOMER / BOOK 10', beat: 3219},
  {id: 'SC11', from: 3574, to: 3786, Comp: SC11, source: 'IN HOMER / BOOK 10', beat: 3582},
  {id: 'SC12', from: 3787, to: 4004, Comp: SC12, source: 'IN HOMER / BOOK 10', beat: 3795},
  {id: 'SC13', from: 4005, to: 4336, Comp: SC13, source: 'IN HOMER / BOOK 10', beat: 4013},
];
export const BG_G3: BgSpec[] = [];
export const FOOTAGE_G3: FootageSpec[] = [];
