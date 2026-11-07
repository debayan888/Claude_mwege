import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {DAD, HERO, KID, P0, SIT_CHAIR, Stick, THUMBS, k, lerp, mixP, pose, walk} from './rig';
import {Cap, Captions, MONT, Sfx} from './ui';

// ---------- 1. HOOK: the first second decides if people keep watching ----------
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const pop = interpolate(t, [0.45, 0.65], [2.2, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))});
  const glow = interpolate(t, [1.0, 2.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const beat = 1 + Math.max(0, Math.sin((t - 0.9) * 7)) * 0.05 * (t > 0.9 ? 1 : 0);
  return (
    <AbsoluteFill style={{background: '#050505', justifyContent: 'center', alignItems: 'center'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 62%, rgba(255,247,209,${glow}) 0%, rgba(255,200,80,${glow * 0.5}) ${10 + glow * 30}%, rgba(0,0,0,0) ${30 + glow * 40}%)`}} />
      <div style={{textAlign: 'center', fontFamily: MONT, fontWeight: 900, scale: String(beat)}}>
        <div style={{fontSize: 96, color: '#fff', opacity: t > 0.15 ? 1 : 0, letterSpacing: 4}}>HE HAD</div>
        <div style={{fontSize: 170, lineHeight: 1, color: '#ff2d2d', opacity: t > 0.45 ? 1 : 0, scale: String(pop), WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>3 SECONDS.</div>
      </div>
      <Sfx at={0.45} src="vine-boom.wav" volume={0.9} />
      <Sfx at={0.9} src="heartbeat.wav" volume={1} />
      <Sfx at={1.6} src="heartbeat.wav" volume={1} />
    </AbsoluteFill>
  );
};

// ---------- 3. THE TWIST: the interview ----------
const OCAPS: Cap[] = [
  {at: 0.2, until: 1.9, text: '*52 minutes* late.'},
  {at: 2.0, until: 2.7, text: 'It was over.'},
  {at: 2.8, until: 4.5, text: "The interviewer? The *kid's dad*."},
  {at: 4.6, until: 7, text: "\"*You're hired.*\""},
];
export const Office: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const FL = 1300;
  // the hero walks in, dusty, and waits
  const hx = t < 1.6 ? lerp(-120, 330, t / 1.6) : t < 4.2 ? 330 : lerp(330, 420, k(t, 4.2, 4.6));
  const hp = t < 1.6 ? walk(t * 9) : t < 4.2 ? mixP(pose({nod: 0.25}), pose({nod: 0}), k(t, 2.4, 2.8)) : t < 4.6 ? walk(t * 9) : pose({a1: 1.4, a2: 0.1});
  // the chair turns around
  const turn = k(t, 2.4, 2.9);
  const stand = k(t, 3.7, 4.1);
  const dx = lerp(830, 720, k(t, 4.1, 4.6));
  const dp = stand < 0.5 ? SIT_CHAIR : t < 4.6 && t > 4.1 ? walk(t * 9) : t >= 4.6 ? pose({a1: 1.4, a2: 0.1, lean: 0.05}) : P0;
  const dy = stand < 0.5 ? 1195 : FL;
  // the kid pops up behind the desk
  const kidUp = k(t, 2.9, 3.3);
  const hired = interpolate(t, [4.6, 4.85], [3, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))});
  return (
    <AbsoluteFill style={{background: '#f3efe6'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect x={0} y={0} width={1080} height={FL} fill="#efe8da" />
        <rect x={0} y={FL} width={1080} height={620} fill="#c9b79c" />
        {/* window with the city and the wall clock */}
        <rect x={560} y={560} width={420} height={330} rx={10} fill="#9fd3f5" stroke="#7a6a55" strokeWidth={14} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={580 + i * 80} y={700 - (i % 3) * 50} width={60} height={190 + (i % 3) * 50} fill="#6b8fb0" />)}
        <circle cx={250} cy={640} r={90} fill="#fff" stroke="#333" strokeWidth={10} />
        <line x1={250} y1={640} x2={250} y2={575} stroke="#333" strokeWidth={9} strokeLinecap="round" />
        <line x1={250} y1={640} x2={300} y2={640 + 18} stroke="#e63946" strokeWidth={7} strokeLinecap="round" />
        <text x={250} y={775} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={40} fill="#e63946">9:52</text>
        {/* the kid, behind the desk */}
        <defs><clipPath id="aboveDesk"><rect x={0} y={0} width={1080} height={1150} /></clipPath></defs>
        <g clipPath="url(#aboveDesk)">
          <Stick x={640} y={FL + (1 - kidUp) * 240} s={1.25} f={-1} p={pose({a1: 2.6 * kidUp, a2: 0.2, b1: 0.3})} look={KID} t={t} />
        </g>
        {/* the dad, then the chair in front of him until it turns */}
        <Stick x={dx} y={dy} s={2.2} f={turn > 0.5 ? -1 : 1} p={dp} look={DAD} hip={stand < 0.5} t={t} />
        <rect x={812} y={1205} width={90} height={18} fill="#3b2f2f" />
        <rect x={850} y={1220} width={14} height={80} fill="#3b2f2f" />
        {turn < 1 ? <rect x={735 + turn * 90} y={880} width={190 * (1 - turn)} height={360} rx={40} fill="#3b2f2f" /> : null}
        {/* the desk */}
        <rect x={500} y={1140} width={270} height={22} fill="#7a5230" />
        <rect x={505} y={1150} width={260} height={150} fill="#8a5d36" />
        <rect x={560} y={1105} width={90} height={35} rx={4} fill="#ffffff" stroke="#bbb" strokeWidth={3} />
        <Stick x={hx} y={FL} s={2.2} f={1} p={hp} look={HERO} t={t} />
      </svg>
      <Captions caps={OCAPS} />
      {t > 4.6 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{marginTop: -260, scale: String(hired), rotate: '-8deg', border: '12px solid #16a34a', color: '#16a34a', fontFamily: MONT, fontWeight: 900, fontSize: 120, padding: '10px 40px', borderRadius: 24, background: 'rgba(255,255,255,0.85)'}}>HIRED</div>
        </AbsoluteFill>
      ) : null}
      {t > 4.6
        ? Array.from({length: 70}).map((_, i) => {
            const x = (i * 157) % 1080, sp = 500 + (i % 7) * 90, y = -60 + (t - 4.6) * sp - (i % 5) * 120;
            return <div key={i} style={{position: 'absolute', left: x + Math.sin(t * 3 + i) * 30, top: y, width: 18, height: 30, background: ['#e63946', '#ffc300', '#1d4ed8', '#16a34a', '#ff7ab6'][i % 5], rotate: `${t * 300 + i * 40}deg`}} />;
          })
        : null}
      <Sfx at={0} src="whoosh.wav" volume={0.7} />
      <Sfx at={2.4} src="record-scratch.wav" volume={0.7} />
      <Sfx at={2.85} src="vine-boom.wav" volume={0.9} />
      <Sfx at={4.6} src="ding.wav" volume={0.8} />
      <Sfx at={4.65} src="yippee.wav" volume={0.7} />
      <Sfx at={4.7} src="cheer.wav" volume={0.6} />
    </AbsoluteFill>
  );
};

// ---------- 4. END CARD: a question people answer in the comments ----------
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const a = interpolate(t, [0.1, 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#111', alignItems: 'center'}}>
      <div style={{marginTop: 330, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 104, lineHeight: 1.05, color: '#fff', opacity: a, padding: '0 80px'}}>
        WOULD YOU HAVE <span style={{color: '#ffd60a'}}>JUMPED?</span>
      </div>
      <div style={{marginTop: 40, fontFamily: MONT, fontWeight: 900, fontSize: 56, color: '#ffd60a', opacity: k(t, 0.6, 0.9), scale: String(1 + Math.sin(t * 6) * 0.04)}}>👇 Comment YES or NO</div>
      <svg width={1080} height={700} viewBox="0 0 1080 700" style={{marginTop: 20}}>
        <line x1={200} y1={560} x2={880} y2={560} stroke="#444" strokeWidth={6} />
        <Stick x={430} y={560} s={2.2} f={1} p={mixP(P0, THUMBS, k(t, 0.5, 0.9))} look={{...HERO, color: '#f5f5f5'}} t={t} />
        <Stick x={650} y={560} s={1.25} f={-1} p={pose({a1: 2.6, a2: 0.2})} look={{...KID, color: '#f5f5f5'}} t={t} />
      </svg>
      <div style={{position: 'absolute', bottom: 330, left: 90, right: 90, textAlign: 'center', fontFamily: MONT, fontWeight: 700, fontSize: 36, color: '#9ca3af', opacity: k(t, 1.0, 1.4)}}>
        In real life: alert staff and use the platform emergency button first. Never go onto the tracks.
      </div>
      <Sfx at={0} src="whoosh.wav" volume={0.6} />
    </AbsoluteFill>
  );
};
