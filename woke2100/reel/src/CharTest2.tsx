import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {Person, MIRA, KID_A} from './character2';
const T: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#20305a,#0b1020)'}}>
    <svg width={1080} height={1920}>
      <line x1={0} y1={900} x2={1080} y2={900} stroke="#3df0ff" strokeWidth={3} />
      <Person x={150} ground={900} s={0.62} expr="neutral" />
      <Person x={400} ground={900} s={0.62} expr="smile" walk={1.2} />
      <Person x={650} ground={900} s={0.62} expr="worried" walk={1.4} run />
      <Person x={900} ground={900} s={0.62} view="back" />
      <line x1={0} y1={1800} x2={1080} y2={1800} stroke="#3df0ff" strokeWidth={3} />
      <Person x={250} ground={1800} s={0.6} p={MIRA} hair="pony" expr="smile" />
      <Person x={560} ground={1800} s={0.6} expr="neutral" />
      <Person x={850} ground={1800} s={0.42} p={KID_A} hair="bun" expr="laugh" />
    </svg>
  </AbsoluteFill>
);
export const CharTest2 = () => <Composition id="CharTest2" component={T} durationInFrames={1} fps={30} width={1080} height={1920} />;
