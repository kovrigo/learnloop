import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC14} from './SC14';
import {SC15} from './SC15';
import {SC16} from './SC16';
import {SC17} from './SC17';
// G4 (chapter 2, second half): SC14–SC17. Frames from 分镜表.md / script/timeline.md.
// Shot components: N = useCurrentFrame() + F0 (F0 = the shot's from). Style library: '../../paper'. Helpers: ./kit (drawn pieces), ./bg (background sheets).
// source/beat feed the HUD's source label (src/overlay/Hud.tsx).
export const SHOTS_G4: ShotDef[] = [
  {id: 'SC14', from: 4337, to: 4768, Comp: SC14, source: 'IN HOMER / BOOK 12', beat: 4345},
  {id: 'SC15', from: 4769, to: 5139, Comp: SC15, source: 'IN HOMER / BOOK 12', beat: 4777},
  {id: 'SC16', from: 5140, to: 5421, Comp: SC16, source: 'IN HOMER / BOOK 12', beat: 5148},
  {id: 'SC17', from: 5422, to: 5735, Comp: SC17, source: 'IN HOMER / BOOKS 5, 7', beat: 5430},
];
export const BG_G4: BgSpec[] = [];
export const FOOTAGE_G4: FootageSpec[] = [];
