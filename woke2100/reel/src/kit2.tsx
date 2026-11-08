// Episode 2 timeline and captions (same caption style as episode 1).
import React from 'react';
import TL from './timeline2.json';
import {MONT, Scene, back, clamp, useT} from './kit';

export const SCENES2 = TL.scenes as unknown as Scene[];
export const DURATION2 = TL.duration as number;
const SCENES = SCENES2;

// ---------- captions synced to the narration, word by word ----------
const HOT = new Set(['run', 'glides', 'faster', 'three', 'hundred', 'four', 'hoverbike', 'flies', 'erased', 'list', 'tonight', 'red', 'drones', 'you', 'three?', 'subscribe,', '2100', 'twenty-one', 'hundred', 'frozen', 'seventy-five', 'fly', 'trees', 'museum', 'face', 'printed', "that's", 'you', 'staring', 'from', '2025', "don't", 'trust', 'robot', 'behind', 'two?', 'follow,', 'subscribe,']);
type Chunk = {words: Scene['words']; start: number; end: number};
const chunks: Chunk[] = (() => {
  const all = SCENES.flatMap((s) => s.words);
  const out: Chunk[] = [];
  let cur: Scene['words'] = [];
  all.forEach((w, i) => {
    cur.push(w);
    const next = all[i + 1];
    const breakHere = cur.length >= 3 || /[.,?!]$/.test(w.text) || !next || next.start - w.end > 0.35;
    if (breakHere) { out.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end}); cur = []; }
  });
  return out;
})();
const show = (w: string) => w.replace(/^twenty$/i, '').replace(/twenty-five\.?/i, '2025').replace(/twenty-one/i, '21').replace(/^hundred\.?$/i, '00');
export const Captions2: React.FC<{hide?: (t: number) => boolean}> = ({hide}) => {
  const t = useT();
  if (hide && hide(t)) return null;
  const c = chunks.find((q, i) => t >= q.start - 0.05 && t < Math.max(q.end + 0.25, (chunks[i + 1]?.start ?? 999) - 0.02 < q.end + 0.25 ? chunks[i + 1].start - 0.02 : q.end + 0.25));
  if (!c) return null;
  // join "twenty" + "twenty-five" into "2025" and "twenty-one hundred" into "2100"
  const words = c.words.map((w) => ({...w, shown: show(w.text)})).filter((w) => w.shown !== '');
  const merged: typeof words = [];
  words.forEach((w) => { if (w.shown === '00' && merged.length && merged[merged.length - 1].shown === '21') { merged[merged.length - 1].shown = '2100' + (w.text.endsWith('.') ? '.' : ''); merged[merged.length - 1].end = w.end; } else merged.push(w); });
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 1210, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 26px'}}>
      {merged.map((w, i) => {
        const on = t >= w.start - 0.03;
        const active = t >= w.start - 0.03 && t < w.end + 0.05;
        const hot = HOT.has(w.text.toLowerCase().replace(/[.,!?"]/g, '')) || HOT.has(w.text.toLowerCase());
        const p = clamp((t - w.start + 0.03) / 0.12);
        return (
          <span key={i} style={{fontFamily: MONT, fontWeight: 900, fontSize: 92, lineHeight: 1.15, color: active ? '#ffe14d' : hot ? '#7df9ff' : '#fff', WebkitTextStroke: '16px #000', paintOrder: 'stroke fill', textTransform: 'uppercase', opacity: on ? 1 : 0.0, scale: String(on ? 0.7 + 0.3 * back(p) + (active ? 0.06 : 0) : 0.7), display: 'inline-block', textShadow: '0 10px 0 rgba(0,0,0,0.4)'}}>
            {w.shown.replace(/[.,]$/, '')}
          </span>
        );
      })}
    </div>
  );
};

