import React from 'react';
import {AbsoluteFill, Composition, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {Grain, Vignette, k, useT} from './kit';
import {Captions2, DURATION2, SCENES2} from './kit2';
import {ChaseScene, Cta2Scene, DronesScene, FlyScene, LiftScene, NameScene, Recap, RoofScene, RunScene, TruthScene} from './scenes2';

const VIEWS: Record<string, React.FC<{lt: number; m: Record<string, number>; t: number}>> = {
  recap: Recap, run: RunScene, chase: ChaseScene, lift: LiftScene, roof: RoofScene,
  fly: FlyScene, truth: TruthScene, name: NameScene, drones: DronesScene, cta: Cta2Scene,
};
const SceneView: React.FC<{id: string; start: number; marks: Record<string, number>}> = ({id, start, marks}) => {
  const lt = useT();
  const V = VIEWS[id];
  const punch = 1 + (1 - k(lt, 0, 0.45)) * 0.08;
  return <AbsoluteFill style={{scale: String(punch)}}><V lt={lt} m={marks} t={lt + start} /></AbsoluteFill>;
};
const Cuts: React.FC = () => {
  const t = useT();
  const near = Math.min(...SCENES2.slice(1).map((s) => Math.abs(t - s.start)));
  const a = Math.max(0, 1 - near / 0.12);
  return a > 0 ? <AbsoluteFill style={{background: '#e9fbff', opacity: a * 0.55, mixBlendMode: 'screen'}} /> : null;
};
const Badge: React.FC = () => {
  const t = useT();
  const cta = SCENES2.find((s) => s.id === 'cta')!.start;
  const a = k(t, 7.5, 7.9) * (1 - k(t, 12.6, 13.1)) + k(t, cta + 0.2, cta + 0.6);
  if (a <= 0) return null;
  return (
    <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div style={{fontFamily: 'Montserrat', fontWeight: 900, fontSize: 32, letterSpacing: 2, color: '#fff', background: 'rgba(10,14,30,0.6)', border: '2px solid #ff4fd8', borderRadius: 999, padding: '10px 28px'}}>YOU WOKE UP IN 2100 · <span style={{color: '#ff4fd8'}}>EP 2</span></div>
    </div>
  );
};
export const Ep2: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SCENES2.map((s) => (
        <Sequence key={s.id} name={s.id} from={Math.round(s.start * fps)} durationInFrames={Math.round(s.dur * fps) + 1}>
          <SceneView id={s.id} start={s.start} marks={s.marks} />
        </Sequence>
      ))}
      <Vignette />
      <Grain />
      <Cuts />
      <Badge />
      <Captions2 hide={(t) => t > SCENES2.find((s) => s.id === 'cta')!.start} />
      <Audio src={staticFile('soundtrack2.wav')} />
    </AbsoluteFill>
  );
};
export const Episode2 = () => <Composition id="WokeUp2100Ep2" component={Ep2} durationInFrames={Math.ceil(DURATION2 * 30)} fps={30} width={1080} height={1920} />;
