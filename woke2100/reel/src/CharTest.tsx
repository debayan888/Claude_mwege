import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {Person, Robot, KID_A, KID_B, Expr} from './character';
const T: React.FC = () => {
  const ex: Expr[] = ['neutral', 'shock', 'scared', 'confused', 'wonder', 'worried', 'smile', 'sleepy', 'laugh'];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#20305a,#0b1020)'}}>
      <svg width={1080} height={1920}>
        <Person x={270} y={330} s={0.62} expr="neutral" armL={[0.2, 0.1]} armR={[1.9, 0.6]} />
        <Person x={790} y={330} s={0.62} view="back" />
        {ex.map((e, i) => <Person key={e} x={140 + (i % 5) * 200} y={1060 + Math.floor(i / 5) * 280} s={0.75} part="head" expr={e} look={[i % 2 ? 0.6 : -0.4, 0]} turn={i === 3 ? 0.6 : 0} />)}
        <Person x={240} y={1700} s={0.45} p={KID_A} hair="bun" expr="laugh" armL={[2.6, 0.2]} />
        <Person x={420} y={1700} s={0.45} p={KID_B} hair="short" expr="laugh" />
        <Robot x={800} y={1620} s={0.9} t={0.5} mood="happy" armR={1.6} />
      </svg>
    </AbsoluteFill>
  );
};
export const CharTest = () => <Composition id="CharTest" component={T} durationInFrames={1} fps={30} width={1080} height={1920} />;
