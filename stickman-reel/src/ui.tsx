import React from 'react';
import {Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

// Montserrat is bundled in public/ (OFL licence), so rendering needs no network
export const MONT = 'Montserrat';
loadFont({family: MONT, url: staticFile('Montserrat-700.woff2'), weight: '700'});
loadFont({family: MONT, url: staticFile('Montserrat-900.woff2'), weight: '900'});

// one sound placed at a time in seconds
export const Sfx: React.FC<{at: number; src: string; volume?: number; dur?: number}> = ({at, src, volume = 1, dur}) => {
  const {fps} = useVideoConfig();
  return (
    <Sequence from={Math.round(at * fps)} durationInFrames={dur ? Math.round(dur * fps) : undefined} layout="none">
      <Audio src={staticFile(src)} volume={volume} />
    </Sequence>
  );
};

// Reels-style captions: bold white words with a black outline that pop in
// one by one. *starred* words are highlighted in yellow.
export type Cap = {at: number; until: number; text: string};
export const Captions: React.FC<{caps: Cap[]; y?: number}> = ({caps, y = 190}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cur = caps.find((c) => t >= c.at && t < c.until);
  if (!cur) return null;
  const words = cur.text.split(' ');
  const out = interpolate(t, [cur.until - 0.15, cur.until], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 30px', opacity: out}}>
      {words.map((w, i) => {
        const hot = w.startsWith('*') || w.endsWith('*') || w.includes('*');
        const clean = w.replace(/\*/g, '');
        const local = t - cur.at - i * 0.09;
        return (
          <span
            key={i}
            style={{
              fontFamily: MONT,
              fontWeight: 900,
              fontSize: 78,
              lineHeight: 1.1,
              color: hot ? '#ffd60a' : '#ffffff',
              WebkitTextStroke: '14px #000',
              paintOrder: 'stroke fill',
              textShadow: '0 8px 0 rgba(0,0,0,0.35)',
              opacity: local > 0 ? 1 : 0,
              scale: String(interpolate(local, [0, 0.18], [0.4, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2.5))})),
              display: 'inline-block',
            }}
          >
            {clean}
          </span>
        );
      })}
    </div>
  );
};
