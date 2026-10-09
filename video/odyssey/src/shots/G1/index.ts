import type {ShotDef, BgSpec, FootageSpec} from '../../common';
import {G1_01} from './G1_01';
import {G1_02} from './G1_02';
import {G1_03} from './G1_03';
import {Sting} from '../../overlay/Sting';
// G1 (pilot, first 30 s): cold open, LearnLoop sting, Homer and Troy, Odysseus and twelve ships. Frames from 分镜表.md / script/timeline.md.
// Shot components: N = useCurrentFrame() + F0 (F0 = the shot's from). Style library: '../../paper'.
// source/beat feed the HUD's source label (src/overlay/Hud.tsx).
export const SHOTS_G1: ShotDef[] = [
  {id: 'SC01', from: 1, to: 487, Comp: G1_01},
  {id: 'STING', from: 488, to: 746, Comp: Sting}, // = STING_RANGE (S03.to+3 → S05.from−9), literal for selfcheck.py
  {id: 'SC02', from: 747, to: 954, Comp: G1_02},
  {id: 'SC03', from: 955, to: 1110, Comp: G1_03, source: 'IN HOMER / BOOK 9', beat: 963},
];
export const BG_G1: BgSpec[] = [];
export const FOOTAGE_G1: FootageSpec[] = [];
