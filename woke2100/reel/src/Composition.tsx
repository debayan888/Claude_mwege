import React from 'react';
import {AbsoluteFill, Composition, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {Captions, DURATION, Grain, SCENES, Vignette, k, useT} from './kit';
import {CtaScene, FoodScene, NewsScene, PhoneScene, PodScene, RobotScene, TwistScene, Wake, WarningScene, WindowScene} from './scenes';

const VIEWS: Record<string, React.FC<{lt: number; m: Record<string, number>; t: number}>> = {
  wake: Wake, pod: PodScene, robot: RobotScene, window: WindowScene, phone: PhoneScene,
  food: FoodScene, news: NewsScene, twist: TwistScene, warning: WarningScene, cta: CtaScene,
};

// each scene punches in slightly as it starts, so every cut feels like a move
const SceneView: React.FC<{id: string; start: number; marks: Record<string, number>}> = ({id, start, marks}) => {
  const t = useT() + start;
  const lt = t - start;
  const V = VIEWS[id];
  const punch = 1 + (1 - k(lt, 0, 0.45)) * 0.08;
  return (
    <AbsoluteFill style={{scale: String(punch)}}>
      <V lt={lt} m={marks} t={t} />
    </AbsoluteFill>
  );
};

// a quick flash and zoom-blur on every cut
const Cuts: React.FC = () => {
  const t = useT();
  const near = Math.min(...SCENES.slice(1).map((s) => Math.abs(t - s.start)));
  const a = Math.max(0, 1 - near / 0.12);
  return a > 0 ? <AbsoluteFill style={{background: '#e9fbff', opacity: a * 0.55, mixBlendMode: 'screen'}} /> : null;
};

// series badge, so viewers know there are more episodes
const Badge: React.FC = () => {
  const t = useT();
  const cta = SCENES.find((s) => s.id === 'cta')!.start;
  const a = k(t, 3.2, 3.6) * (1 - k(t, 11.6, 12.1)) + k(t, cta + 0.2, cta + 0.6);
  if (a <= 0) return null;
  return (
    <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div style={{fontFamily: 'Montserrat', fontWeight: 900, fontSize: 32, letterSpacing: 2, color: '#fff', background: 'rgba(10,14,30,0.6)', border: '2px solid #3df0ff', borderRadius: 999, padding: '10px 28px'}}>YOU WOKE UP IN 2100 · <span style={{color: '#3df0ff'}}>EP 1</span></div>
    </div>
  );
};

export const Reel: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SCENES.map((s) => (
        <Sequence key={s.id} name={s.id} from={Math.round(s.start * fps)} durationInFrames={Math.round(s.dur * fps) + 1}>
          <SceneView id={s.id} start={s.start} marks={s.marks} />
        </Sequence>
      ))}
      <Vignette />
      <Grain />
      <Cuts />
      <Badge />
      <Captions hide={(t) => t > SCENES.find((s) => s.id === 'cta')!.start} />
      <Audio src={staticFile('soundtrack.wav')} />
    </AbsoluteFill>
  );
};

export const MyComposition = () => (
  <Composition id="WokeUp2100" component={Reel} durationInFrames={Math.ceil(DURATION * 30)} fps={30} width={1080} height={1920} />
);
