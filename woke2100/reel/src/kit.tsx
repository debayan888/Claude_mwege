// Shared pieces: timing, the narration captions, the close-up face, the
// robot, the city of 2100 and the film effects.
import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';
import TL from './timeline.json';

export const MONT = 'Montserrat';
loadFont({family: MONT, url: staticFile('Montserrat-700.woff2'), weight: '700'});
loadFont({family: MONT, url: staticFile('Montserrat-900.woff2'), weight: '900'});

export type Scene = {id: string; start: number; dur: number; marks: Record<string, number>; words: {text: string; start: number; end: number}[]};
export const SCENES = TL.scenes as unknown as Scene[];
export const DURATION = TL.duration as number;
export const sc = (id: string) => SCENES.find((s) => s.id === id)!;

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const k = (t: number, a: number, b: number) => { const p = clamp((t - a) / (b - a)); return p * p * (3 - 2 * p); };
export const out = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
export const back = (p: number) => { p = clamp(p); const c = 2.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
export const hash = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

// seconds of the whole video
export const useT = () => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return f / fps; };

// ---------- captions synced to the narration, word by word ----------
const HOT = new Set(['2100', 'twenty-one', 'hundred', 'frozen', 'seventy-five', 'fly', 'trees', 'museum', 'face', 'printed', "that's", 'you', 'staring', 'from', '2025', "don't", 'trust', 'robot', 'behind', 'two?', 'follow,', 'subscribe,']);
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
export const Captions: React.FC<{hide?: (t: number) => boolean}> = ({hide}) => {
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

// ---------- the close-up face (front view) for reactions ----------
export type Expr = 'sleepy' | 'shock' | 'scared' | 'confused' | 'smile' | 'neutral';
export const Face: React.FC<{x: number; y: number; r: number; expr: Expr; blink?: number; lx?: number; ly?: number; shake?: number; ink?: string}> = ({x, y, r, expr, blink = 0, lx = 0, ly = 0, shake = 0, ink = '#121212'}) => {
  const t = useT();
  const sx = Math.sin(t * 60) * shake, sy = Math.cos(t * 53) * shake;
  const eyeR = expr === 'shock' || expr === 'scared' ? r * 0.27 : r * 0.22;
  const pupil = expr === 'shock' || expr === 'scared' ? eyeR * 0.32 : eyeR * 0.5;
  const lid = expr === 'sleepy' ? 0.55 : 0;
  const open = 1 - Math.max(blink, lid);
  const brow = {shock: -0.35, scared: 0.35, confused: 0.25, sleepy: 0, smile: -0.1, neutral: 0}[expr];
  const mouth = {
    shock: <ellipse cx={0} cy={r * 0.45} rx={r * 0.16} ry={r * 0.22} fill="#3a0d12" />,
    scared: <path d={`M ${-r * 0.3} ${r * 0.5} q ${r * 0.1} ${-r * 0.12} ${r * 0.2} 0 q ${r * 0.1} ${r * 0.12} ${r * 0.2} 0 q ${r * 0.1} ${-r * 0.12} ${r * 0.2} 0`} stroke="#fff" strokeWidth={r * 0.05} fill="none" strokeLinecap="round" />,
    confused: <path d={`M ${-r * 0.25} ${r * 0.48} L ${r * 0.25} ${r * 0.4}`} stroke="#fff" strokeWidth={r * 0.06} strokeLinecap="round" />,
    sleepy: <path d={`M ${-r * 0.15} ${r * 0.45} q ${r * 0.15} ${r * 0.06} ${r * 0.3} 0`} stroke="#fff" strokeWidth={r * 0.05} fill="none" strokeLinecap="round" />,
    smile: <path d={`M ${-r * 0.3} ${r * 0.38} q ${r * 0.3} ${r * 0.3} ${r * 0.6} 0`} stroke="#fff" strokeWidth={r * 0.06} fill="none" strokeLinecap="round" />,
    neutral: <path d={`M ${-r * 0.2} ${r * 0.45} L ${r * 0.2} ${r * 0.45}`} stroke="#fff" strokeWidth={r * 0.05} strokeLinecap="round" />,
  }[expr];
  return (
    <g transform={`translate(${x + sx} ${y + sy})`}>
      {/* neck, shoulders and the red scarf */}
      <path d={`M ${-r * 1.4} ${r * 2.6} Q ${0} ${r * 1.15} ${r * 1.4} ${r * 2.6}`} stroke={ink} strokeWidth={r * 0.16} fill="none" strokeLinecap="round" />
      <rect x={-r * 0.08} y={r * 0.9} width={r * 0.16} height={r * 0.6} fill={ink} />
      <path d={`M ${-r * 0.55} ${r * 1.12} Q 0 ${r * 1.42} ${r * 0.55} ${r * 1.12}`} stroke="#e63946" strokeWidth={r * 0.24} fill="none" strokeLinecap="round" />
      <path d={`M ${r * 0.3} ${r * 1.25} q ${r * 0.25} ${r * 0.45 + Math.sin(t * 7) * r * 0.05} ${r * 0.1} ${r * 0.9}`} stroke="#e63946" strokeWidth={r * 0.2} fill="none" strokeLinecap="round" />
      <circle cx={0} cy={0} r={r * 1.04} fill="#fff" opacity={0.9} />
      <circle cx={0} cy={0} r={r} fill={ink} />
      {[-1, 1].map((side) => (
        <g key={side}>
          <ellipse cx={side * r * 0.36} cy={-r * 0.08} rx={eyeR} ry={eyeR * Math.max(0.06, open)} fill="#fff" />
          {open > 0.25 ? <circle cx={side * r * 0.36 + lx * eyeR * 0.45} cy={-r * 0.08 + ly * eyeR * 0.45} r={pupil} fill="#000" /> : null}
          <line x1={side * r * 0.36 - side * r * 0.22} y1={-r * 0.45 + brow * side * -r * 0.0 + (side === 1 ? brow : -brow) * r * 0.0} x2={side * r * 0.36 + side * r * 0.22} y2={-r * 0.45 - brow * r * 0.25} stroke="#fff" strokeWidth={r * 0.06} strokeLinecap="round" />
        </g>
      ))}
      {mouth}
    </g>
  );
};

// ---------- the robot ----------
export const Robot: React.FC<{x: number; y: number; s: number; f?: 1 | -1; eye?: string; arm?: number; glow?: number}> = ({x, y, s, f = 1, eye = '#38e8ff', arm = 0, glow = 1}) => {
  const t = useT();
  const bob = Math.sin(t * 2.4) * 8 * s;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${f * s} ${s})`}>
      <ellipse cx={0} cy={150} rx={70} ry={14} fill={eye} opacity={0.25 * glow} />
      <ellipse cx={0} cy={150} rx={34} ry={8} fill={eye} opacity={0.6 * glow} />
      {/* body */}
      <path d="M -52 20 Q -60 110 0 130 Q 60 110 52 20 Z" fill="#f4f6fb" stroke="#c9d1e3" strokeWidth={4} />
      <rect x={-20} y={50} width={40} height={8} rx={4} fill={eye} opacity={0.8} />
      {/* arms */}
      <path d={`M 48 40 q 26 ${30 - arm * 60} ${30 + arm * 10} ${70 - arm * 120}`} stroke="#dfe5f1" strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d="M -48 40 q -22 30 -26 70" stroke="#dfe5f1" strokeWidth={12} fill="none" strokeLinecap="round" />
      {/* head with a black visor and glowing eyes */}
      <rect x={-62} y={-92} width={124} height={100} rx={46} fill="#f4f6fb" stroke="#c9d1e3" strokeWidth={4} />
      <rect x={-46} y={-70} width={92} height={52} rx={26} fill="#0b0f1c" />
      <circle cx={-6} cy={-44} r={30} fill={eye} opacity={0.18 * glow} />
      <ellipse cx={-16} cy={-44} rx={8} ry={10} fill={eye} />
      <ellipse cx={14} cy={-44} rx={8} ry={10} fill={eye} />
      <line x1={0} y1={-92} x2={0} y2={-112} stroke="#c9d1e3" strokeWidth={5} />
      <circle cx={0} cy={-116} r={7} fill={eye} />
    </g>
  );
};

// ---------- the city of 2100 ----------
type Tower = {x: number; w: number; h: number; tone: number; green: number};
const towers = (seed: number, n: number): Tower[] => Array.from({length: n}, (_, i) => ({x: -100 + i * (1300 / n) + hash(seed + i) * 40, w: 90 + hash(seed * 3 + i) * 90, h: 380 + hash(seed * 7 + i) * 700, tone: hash(seed * 11 + i), green: hash(seed * 13 + i)}));
const FAR = towers(1, 11), MID = towers(2, 8), NEAR = towers(3, 6);
export const City: React.FC<{base: number; t: number; cars?: number; drift?: number}> = ({base, t, cars = 1, drift = 0}) => {
  const layer = (L: Tower[], col: string, win: string, par: number, scale: number) => (
    <g transform={`translate(${-drift * par} 0)`}>
      {L.map((q, i) => {
        const h = q.h * scale, w = q.w * scale, x = q.x, y = base - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h + 400} rx={w * 0.25} fill={col} />
            {Array.from({length: Math.floor(h / 70)}).map((_, r) => (
              <rect key={r} x={x + w * 0.2} y={y + 40 + r * 70} width={w * 0.6} height={10} rx={5} fill={win} opacity={hash(i * 31 + r) > 0.4 ? 0.85 : 0.2} />
            ))}
            {q.green > 0.35 ? Array.from({length: 3}).map((_, r) => (
              <g key={`g${r}`}>
                <ellipse cx={x + w * 0.25} cy={y + 60 + r * h * 0.3} rx={w * 0.32} ry={w * 0.18} fill="#2fbf71" opacity={0.9} />
                <ellipse cx={x + w * 0.7} cy={y + 80 + r * h * 0.3} rx={w * 0.28} ry={w * 0.16} fill="#22a35f" opacity={0.9} />
              </g>
            )) : null}
            <rect x={x + w * 0.46} y={y - 50 * scale} width={6} height={50 * scale} fill={col} />
            <circle cx={x + w * 0.46 + 3} cy={y - 52 * scale} r={6} fill="#ff4d6d" opacity={0.6 + 0.4 * Math.sin(t * 4 + i)} />
          </g>
        );
      })}
    </g>
  );
  return (
    <g>
      {layer(FAR, '#6d5bd0', '#ffd6f5', 0.2, 0.9)}
      {/* sky lanes: flying cars with light trails */}
      {cars > 0 ? Array.from({length: 9}).map((_, i) => {
        const lane = base - 900 + (i % 4) * 150, dir = i % 2 ? 1 : -1, sp = 260 + hash(i) * 260;
        const x = dir > 0 ? ((t * sp + i * 400) % 1600) - 260 : 1340 - ((t * sp + i * 400) % 1600);
        return (
          <g key={i} opacity={cars}>
            <rect x={dir > 0 ? x - 220 : x + 60} y={lane + 18} width={220} height={6} rx={3} fill={i % 3 ? '#7df9ff' : '#ff7ab6'} opacity={0.5} />
            <rect x={x} y={lane} width={70} height={30} rx={15} fill="#f4f6fb" />
            <rect x={x + 14} y={lane + 5} width={36} height={12} rx={6} fill="#0b0f1c" />
          </g>
        );
      }) : null}
      {layer(MID, '#3b2f8f', '#9ef0ff', 0.45, 1.0)}
      {layer(NEAR, '#1d1650', '#7df9ff', 0.8, 1.1)}
    </g>
  );
};

// ---------- film effects ----------
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.22}}>
      <svg width={1080} height={1920}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 30} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={1080} height={1920} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
  <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,${strength}) 100%)`}} />
);
export const LightLeak: React.FC<{t: number; a?: number}> = ({t, a = 0.35}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: a, background: `radial-gradient(circle at ${30 + Math.sin(t * 0.4) * 25}% ${20 + Math.cos(t * 0.3) * 10}%, rgba(255,120,200,0.55), rgba(0,0,0,0) 40%), radial-gradient(circle at ${75 + Math.cos(t * 0.5) * 20}% ${80 + Math.sin(t * 0.35) * 10}%, rgba(80,220,255,0.45), rgba(0,0,0,0) 45%)`}} />
);
// a short glitch: RGB split bars, used on scene cuts and holograms
export const GlitchBars: React.FC<{t: number; amount: number}> = ({t, amount}) => {
  if (amount <= 0) return null;
  const fr = Math.floor(t * 30);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 9}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: hash(fr * 13 + i) * 1920, height: 8 + hash(fr * 7 + i) * 60, background: i % 2 ? 'rgba(0,255,255,0.35)' : 'rgba(255,0,140,0.35)', translate: `${(hash(fr + i * 3) - 0.5) * 160 * amount}px 0`, opacity: amount}} />
      ))}
    </AbsoluteFill>
  );
};
