import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {SC04} from './SC04';
import {SC05} from './SC05';
import {SC06} from './SC06';
import {SC07} from './SC07';
import {SC08} from './SC08';
import {SC09} from './SC09';
// G2 (chapter 1, the Cyclops): SC04–SC09. Frames from 分镜表.md / script/timeline.md.
// Shot components: N = useCurrentFrame() + F0 (F0 = the shot's from). Style library: '../../paper'. Helpers: ./kit. Exports for later groups: ./shared (LocationCard, RequestList).
// source/beat feed the HUD's source label (src/overlay/Hud.tsx).
export const SHOTS_G2: ShotDef[] = [
  {id: 'SC04', from: 1092, to: 1328, Comp: SC04},
  {id: 'SC05', from: 1329, to: 1538, Comp: SC05, source: 'IN HOMER / BOOKS 9–12', beat: 1337},
  {id: 'SC06', from: 1539, to: 2035, Comp: SC06, source: 'IN HOMER / BOOK 9', beat: 1547},
  {id: 'SC07', from: 2036, to: 2350, Comp: SC07, source: 'IN HOMER / BOOK 9', beat: 2044},
  {id: 'SC08', from: 2351, to: 2701, Comp: SC08, source: 'IN HOMER / BOOK 9', beat: 2359},
  {id: 'SC09', from: 2702, to: 3165, Comp: SC09, source: 'IN HOMER / BOOKS 1, 9', beat: 2710},
];
export const BG_G2: BgSpec[] = [];
export const FOOTAGE_G2: FootageSpec[] = [];
