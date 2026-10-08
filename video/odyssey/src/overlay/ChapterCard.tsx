import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SET, C, PaperBg, PaperTag, peelCss} from '../paper';
import {CHAPTER_CARDS} from './Overlay';

/** Paper chapter card (chapter 2 on): flat sheet, big paper tag "0n" + chapter name slapped in, peeled off in the last 8 frames. */
const SHEET: Record<number, string> = {2: SET.sea.sky, 3: SET.ithaca.bg, 4: SET.ithaca.shape, 5: SET.loop.bg};
export const ChapterCard: React.FC<{card: (typeof CHAPTER_CARDS)[number]}> = ({card}) => {
  const N = useCurrentFrame() + card.from;
  const n = N - card.from;
  const exit = peelCss(N - (card.to - 7), 8, -1);
  return (
    <PaperBg color={SHEET[card.n] ?? SET.loop.bg}>
      <div style={{position: 'absolute', inset: 0, ...exit}}>
        <PaperTag text={`0${card.n}`} x={640} y={250} rot={-5} size={96} n={n - 2} bg={C.yellow} color={C.navy} />
        <PaperTag text={card.title} x={640} y={400} rot={3} size={64} n={n - 6} dir={-1} color={C.navy} />
        {card.n === 5 ? <PaperTag text="THE LOOP" x={640} y={520} rot={-4} size={28} n={n - 10} bg={C.pink} color="#FFFFFF" /> : null}
      </div>
    </PaperBg>
  );
};
