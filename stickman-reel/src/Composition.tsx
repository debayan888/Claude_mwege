import {Composition} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {Station} from './Station';
import {EndCard, Hook, Office} from './Scenes';

// Hook 75 + Station 915 + Office 210 + End 120, minus three 12-frame transitions
const DURATION = 75 + 915 + 210 + 120 - 36;

export const Reel: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Hook" durationInFrames={75}>
      <Hook />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={wipe({direction: 'from-bottom'})} timing={linearTiming({durationInFrames: 12})} />
    <TransitionSeries.Sequence name="Station" durationInFrames={915}>
      <Station />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={linearTiming({durationInFrames: 12})} />
    <TransitionSeries.Sequence name="Office" durationInFrames={210}>
      <Office />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 12})} />
    <TransitionSeries.Sequence name="End card" durationInFrames={120}>
      <EndCard />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);

export const MyComposition = () => {
  return (
    <Composition
      id="ThreeSeconds"
      component={Reel}
      durationInFrames={DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
