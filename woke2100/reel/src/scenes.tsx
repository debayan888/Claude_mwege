// "You woke up in 2100", episode 1: ten illustrated scenes. Each scene gets
// lt (seconds since it started), the narration marks m and the global time t.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HERO_P, KID_A, KID_B, Person, Robot} from './character';
import {City, GlitchBars, LightLeak, MONT, back, clamp, hash, k, lerp, out} from './kit';

type SP = {lt: number; m: Record<string, number>; t: number};

const Txt: React.FC<{x: number; y: number; size: number; color?: string; children: React.ReactNode; o?: number; s?: number; glow?: string; weight?: number}> = ({x, y, size, color = '#fff', children, o = 1, s = 1, glow, weight = 900}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={MONT} fontWeight={weight} fontSize={size} fill={color} opacity={o} transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`} style={glow ? {filter: `drop-shadow(0 0 16px ${glow})`} : undefined}>{children}</text>
);
// a camera: [x, y] is the point placed at the frame centre (540, 640), z is zoom
const Cam: React.FC<{children: React.ReactNode; c?: [number, number, number]; shake?: number; t?: number}> = ({children, c = [540, 640, 1], shake = 0, t = 0}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
    <g transform={`translate(${540 - c[0] * c[2] + Math.sin(t * 61) * shake} ${640 - c[1] * c[2] + Math.cos(t * 47) * shake}) scale(${c[2]})`}>{children}</g>
  </svg>
);
const Sky: React.FC<{stops: string[]}> = ({stops}) => {
  const id = `sky${stops.join('').replace(/#/g, '')}`;
  return (
    <>
      <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1">{stops.map((c, i) => <stop key={i} offset={i / (stops.length - 1)} stopColor={c} />)}</linearGradient></defs>
      <rect x={-800} y={-800} width={2700} height={3600} fill={`url(#${id})`} />
    </>
  );
};
const Glow: React.FC<{x: number; y: number; r: number; c: string; o?: number}> = ({x, y, r, c, o = 1}) => {
  const id = `gl${c.replace('#', '')}`;
  return (
    <>
      <defs><radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity="0.9" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient></defs>
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} opacity={o} />
    </>
  );
};
const Bubble: React.FC<{x: number; y: number; w: number; text: string; p: number}> = ({x, y, w, text, p}) => {
  if (p <= 0) return null;
  const shown = text.slice(0, Math.round(text.length * clamp(p * 1.5)));
  const sc = back(clamp(p * 5));
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}>
      <rect x={x - w / 2} y={y - 64} width={w} height={128} rx={40} fill="#f4fbff" stroke="#3df0ff" strokeWidth={5} />
      <path d={`M ${x + w / 4} ${y + 62} l 40 56 l -6 -58 Z`} fill="#f4fbff" />
      <text x={x} y={y + 15} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={44} fill="#0b1020">{shown}</text>
    </g>
  );
};
const QMark: React.FC<{x: number; y: number; p: number; c?: string}> = ({x, y, p, c = '#ffe14d'}) => (p > 0 ? <Txt x={x} y={y} size={120} color={c} s={back(p)} glow="#000">?</Txt> : null);
// soft mist blobs
const Mist: React.FC<{lt: number; x0: number; x1: number; y: number; from: number}> = ({lt, x0, x1, y, from}) => (
  <g style={{filter: 'blur(14px)'}}>
    {Array.from({length: 30}).map((_, i) => {
      const life = lt - from - (i % 15) * 0.14;
      if (life < 0) return null;
      const p = clamp(life / 3.2);
      const x = lerp(x0, x1, hash(i)) + (hash(i * 5) - 0.5) * p * 420;
      return <ellipse key={i} cx={x} cy={y + p * 300 + hash(i * 3) * 50} rx={70 + p * 110} ry={40 + p * 50} fill="#eaf8ff" opacity={0.42 * (1 - p)} />;
    })}
  </g>
);
// the cryo pod seen from the front: white base, frosted glass canopy
const Pod: React.FC<{x: number; y: number; s: number; open: number; frost?: number; t: number; dim?: boolean}> = ({x, y, s, open, frost = 1, t, dim}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={dim ? 0.55 : 1}>
    <defs>
      <linearGradient id="podBase" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f6f9ff" /><stop offset="1" stopColor="#aab6cc" /></linearGradient>
      <linearGradient id="podGlass" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#d6f6ff" stopOpacity="0.55" /><stop offset="1" stopColor="#7fd9f5" stopOpacity="0.22" /></linearGradient>
    </defs>
    <ellipse cx={0} cy={250} rx={420} ry={40} fill="#3df0ff" opacity={0.15} />
    <path d="M -380 60 Q -380 240 -200 240 L 200 240 Q 380 240 380 60 Z" fill="url(#podBase)" />
    <rect x={-330} y={110} width={660} height={22} rx={11} fill="#3df0ff" opacity={0.55 + 0.25 * Math.sin(t * 2)} />
    <rect x={-120} y={160} width={240} height={46} rx={14} fill="#0b1020" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-100 + i * 52} y={174} width={36} height={18} rx={5} fill={i === 3 ? '#ff4d6d' : '#3df0ff'} opacity={0.5 + 0.5 * Math.sin(t * 3 + i)} />)}
    {/* canopy lifts up and back */}
    <g transform={`translate(0 ${-open * 300}) scale(1 ${1 - open * 0.45})`} opacity={1 - open * 0.35}>
      <path d="M -370 64 Q -370 -260 0 -270 Q 370 -260 370 64 Z" fill="url(#podGlass)" stroke="#e8fbff" strokeWidth={6} />
      <path d="M -300 -80 Q -260 -220 -80 -240" stroke="#fff" strokeWidth={14} opacity={0.55} fill="none" strokeLinecap="round" />
      {frost > 0 ? Array.from({length: 18}).map((_, i) => <circle key={i} cx={-300 + hash(i) * 600} cy={-220 + hash(i * 7) * 270} r={14 + hash(i * 3) * 30} fill="#fff" opacity={0.18 * frost} />) : null}
    </g>
  </g>
);
const Lab: React.FC<{t: number; red?: number}> = ({t, red = 0}) => (
  <g>
    <Sky stops={red > 0.5 ? ['#2a0610', '#12030a'] : ['#0a1a35', '#123663', '#0a1a35']} />
    {/* back wall panels with light strips */}
    {Array.from({length: 7}).map((_, i) => (
      <g key={i}>
        <rect x={-260 + i * 260} y={120} width={230} height={760} rx={20} fill={red > 0.5 ? '#3a0a14' : '#163c6b'} opacity={0.7} />
        <rect x={-150 + i * 260} y={150} width={10} height={700} rx={5} fill={red > 0.5 ? '#ff2244' : '#3df0ff'} opacity={0.35 + 0.2 * Math.sin(t * 1.5 + i)} />
      </g>
    ))}
    <rect x={-800} y={880} width={2700} height={1200} fill={red > 0.5 ? '#14040a' : '#081428'} />
    <rect x={-800} y={880} width={2700} height={8} fill={red > 0.5 ? '#ff2244' : '#3df0ff'} opacity={0.5} />
  </g>
);

// =====================================================================
// 1. WAKE: asleep on New Year's Eve 2025, eyes open in 2100
// =====================================================================
export const Wake: React.FC<SP> = ({lt, m, t}) => {
  const o = m.open;
  if (lt < o) {
    const z = lerp(1, 1.12, lt / o);
    return (
      <AbsoluteFill>
        <Cam c={[540, 700, z]}>
          <Sky stops={['#0c1030', '#1b1f4a', '#2a2350']} />
          {/* window with the city and New Year fireworks */}
          <rect x={540} y={160} width={460} height={520} rx={16} fill="#06081a" stroke="#3a3f6e" strokeWidth={14} />
          {Array.from({length: 9}).map((_, i) => <rect key={i} x={560 + i * 50} y={520 - (i % 3) * 60} width={38} height={160 + (i % 3) * 60} fill="#15183a" />)}
          {[0, 1, 2].map((i) => {
            const ph = (lt * 0.8 + i * 0.37) % 1, cx = 640 + i * 130, cy = 300 + (i % 2) * 70, col = ['#ff7ab6', '#ffd166', '#7df9ff'][i];
            return <g key={i} opacity={1 - ph}>{Array.from({length: 12}).map((_, j) => <circle key={j} cx={cx + Math.cos(j / 12 * 6.283) * ph * 80} cy={cy + Math.sin(j / 12 * 6.283) * ph * 80} r={5} fill={col} />)}</g>;
          })}
          <line x1={770} y1={160} x2={770} y2={680} stroke="#3a3f6e" strokeWidth={10} />
          {/* bed, pillow, blanket and you, asleep */}
          <rect x={-60} y={820} width={1200} height={400} rx={30} fill="#2c2a5a" />
          <ellipse cx={270} cy={820} rx={210} ry={70} fill="#e9e6ff" />
          <g transform="translate(300 760) rotate(-78)">
            <Person x={0} y={0} s={0.95} part="head" expr="sleepy" blink={1} />
          </g>
          {/* shoulder in the grey hoodie and the red scarf, then the blanket over your body */}
          <ellipse cx={410} cy={812} rx={80} ry={56} fill="#8e96a3" />
          <path d="M 352 790 Q 380 830 420 812" stroke="#e63946" strokeWidth={20} fill="none" strokeLinecap="round" />
          <path d={`M 440 ${770 + Math.sin(lt * 2) * 4} C 520 ${700 + Math.sin(lt * 2) * 6} 660 ${700 + Math.sin(lt * 2) * 6} 720 740 C 800 720 900 712 980 740 C 1040 720 1100 730 1140 760 L 1140 1100 L 400 1100 Z`} fill="#4a5fa8" />
          <path d={`M 440 ${770 + Math.sin(lt * 2) * 4} C 520 ${700 + Math.sin(lt * 2) * 6} 660 ${700 + Math.sin(lt * 2) * 6} 720 740`} stroke="#6d82cc" strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d="M 760 800 Q 900 770 1080 800" stroke="#3b4d8f" strokeWidth={10} fill="none" />
          {/* your arm resting on the blanket, hand near the phone */}
          <line x1={470} y1={790} x2={600} y2={830} stroke="#8e96a3" strokeWidth={36} strokeLinecap="round" />
          <line x1={600} y1={830} x2={690} y2={870} stroke="#8e96a3" strokeWidth={32} strokeLinecap="round" />
          <circle cx={700} cy={874} r={19} fill="#f2c4a0" />
          {/* phone glowing on the bed */}
          <g transform="translate(760 860) rotate(-12)">
            <rect x={-46} y={-80} width={92} height={160} rx={16} fill="#111" />
            <rect x={-38} y={-70} width={76} height={140} rx={10} fill="#2b4a8a" />
            <text x={0} y={-20} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={22} fill="#fff">11:59</text>
            <text x={0} y={6} textAnchor="middle" fontFamily={MONT} fontWeight={700} fontSize={12} fill="#cfe0ff">DEC 31</text>
          </g>
          {[0, 1, 2].map((i) => <Txt key={i} x={200 + i * 50} y={600 - ((lt * 70 + i * 50) % 170)} size={56 + i * 12} color="#b9c4ff" o={0.75}>z</Txt>)}
          <Txt x={540} y={1030} size={130} color="#fff" glow="#7a8cff">2025</Txt>

        </Cam>
        <LightLeak t={t} a={0.2} />
        <div style={{position: 'absolute', top: 210, left: 60, right: 60, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 70, lineHeight: 1.1, color: '#ffe14d', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', scale: String(back(lt / 0.35))}}>WHAT IF YOU WOKE UP<br />75 YEARS LATER?</div>
      </AbsoluteFill>
    );
  }
  const year = lt < o + 0.4 ? 2025 : lt < o + 1.9 ? Math.round(lerp(2025, 2100, out((lt - o - 0.4) / 1.5))) : 2100;
  const lids = out((lt - o) / 0.9) * (1 - (lt - o < 0.7 ? 0.5 * Math.max(0, Math.sin((lt - o) * 9)) : 0));
  const blur = (1 - k(lt, o, o + 1.4)) * 16;
  const land = k(lt, o + 1.9, o + 2.1);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: `blur(${blur}px)`}}>
        <Cam>
          <Sky stops={['#0d3a66', '#0a2546']} />
          {/* lab ceiling seen lying on your back, and the robot leaning over you */}
          {Array.from({length: 6}).map((_, i) => <rect key={i} x={-200 + i * 300} y={-200} width={60} height={2000} fill="#7df9ff" opacity={0.18} transform={`rotate(${(i - 2.5) * 8} 540 640)`} />)}
          <Glow x={540} y={640} r={420} c="#7df9ff" o={0.5} />
          <Robot x={540} y={lerp(-180, 60, k(lt, o + 0.3, o + 1.6))} s={1.4} t={t} mood="happy" />
          <Txt x={540} y={960} size={250} color={year === 2100 ? '#7df9ff' : '#fff'} glow={year === 2100 ? '#3df0ff' : '#000'} s={1 + land * 0.12 * (1 - k(lt, o + 2.2, o + 2.6))}>{String(year)}</Txt>
        </Cam>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: -120, right: -120, top: 0, height: 980 * (1 - lids), background: '#000', borderBottomLeftRadius: '50%', borderBottomRightRadius: '50%'}} />
      <div style={{position: 'absolute', left: -120, right: -120, bottom: 0, height: 980 * (1 - lids), background: '#000', borderTopLeftRadius: '50%', borderTopRightRadius: '50%'}} />
      <GlitchBars t={lt} amount={lt > o + 1.85 && lt < o + 2.3 ? 1 : 0} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 2. POD: the canopy lifts, mist pours out, you sit up, a voice
// =====================================================================
export const PodScene: React.FC<SP> = ({lt, m, t}) => {
  const open = out((lt - 0.3) / 1.8);
  const sit = out((lt - 1.4) / 1.4);
  const heard = lt > m.voice;
  const out1 = k(lt, 3.3, 3.45);
  return (
    <AbsoluteFill>
      <Cam c={[540, lerp(700, 680, k(lt, 0, 6)), lerp(1.0, 1.1, k(lt, 0, 6))]}>
        <Lab t={t} />
        {/* other sleepers, still frozen, further back */}
        <Pod x={130} y={660} s={0.42} open={0} t={t} dim />
        <Pod x={950} y={660} s={0.42} open={0} t={t} dim />
        {out1 < 1 ? <g opacity={1 - out1}><Person x={540} y={lerp(1060, 800, sit) - out1 * 60} s={1.05} part="bust" extend={false} expr={sit > 0.6 ? 'neutral' : 'sleepy'} blink={lt < 1.6 ? 1 : undefined} armL={[0.5, 0.6]} armR={[0.4, 0.5]} /></g> : null}
        <Pod x={540} y={860} s={1.05} open={open} t={t} />
        {/* climbs out and stands in front of the pod */}
        {out1 > 0 ? <g opacity={out1}><Person x={500} y={lerp(560, 640, out(out1))} s={1.0} expr={heard ? 'confused' : 'neutral'} turn={heard ? 0.7 : 0} look={heard ? [1, -0.2] : [0, 0]} tilt={heard ? 6 : 0} armL={[0.2, 0.15]} armR={heard ? [0.5, -1.2] : [0.2, 0.15]} /></g> : null}
        <Mist lt={lt} x0={200} x1={880} y={820} from={m.fog - 0.4} />
        {/* a burst of mist as you climb out */}
        <g style={{filter: 'blur(20px)'}} opacity={k(lt, 3.1, 3.3) * (1 - k(lt, 3.5, 4.2))}>
          {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={360 + i * 90} cy={760 - (i % 2) * 60} rx={170} ry={120} fill="#eaf8ff" opacity={0.7} />)}
        </g>
        <QMark x={800} y={360} p={(lt - m.voice) / 0.3} />
      </Cam>
      <LightLeak t={t} a={0.25} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 3. ROBOT: "Welcome back, Sleeper #8214" ... 75 years
// =====================================================================
export const RobotScene: React.FC<SP> = ({lt, m, t}) => {
  const rx = lerp(1300, 770, out(lt / 1.4));
  const yrs = Math.round(lerp(0, 75, out((lt - m.years + 0.2) / 1.2)));
  const holo = k(lt, m.years - 0.5, m.years);
  const cu = lt > m.years + 1.3;
  if (cu) {
    const p = (lt - m.years - 1.3) / 0.35;
    return (
      <AbsoluteFill>
        <Cam c={[540, 700, lerp(1.2, 1.0, out(p))]} shake={5} t={t}>
          <Lab t={t} />
          <Glow x={540} y={600} r={600} c="#3df0ff" o={0.35} />
          <Person x={540} y={1040} s={2.3} part="bust" expr="shock" look={[0, -0.3]} />
          <Txt x={540} y={260} size={150} color="#ffe14d" s={back((lt - m.years - 1.4) / 0.3)} glow="#000">75 YEARS?!</Txt>
        </Cam>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Cam c={[540, 660, 1.05]}>
        <Lab t={t} />
        <Pod x={250} y={760} s={0.75} open={1} t={t} />
        <Person x={290} y={660} s={0.92} expr={lt < m.years ? 'confused' : 'worried'} turn={0.6} look={[1, -0.3]} armL={[0.2, 0.15]} armR={lt < 4.1 ? [0.2, 0.15] : [0.6, -1.5]} />
        <Robot x={rx} y={430} s={0.95} t={t} mood={lt > 4.1 ? 'scan' : 'happy'} armL={k(lt, 1.3, 1.7) * (1 - k(lt, 3.4, 3.8)) * 2.4 + Math.sin(t * 9) * 0.25 * k(lt, 1.3, 1.7) * (1 - k(lt, 3.4, 3.8))} tilt={-6} />
        <g opacity={1 - k(lt, 3.9, 4.3)}><Bubble x={600} y={130} w={880} text="Welcome back, Sleeper #8214" p={(lt - 0.2) / 2.2} /></g>
        {holo > 0 ? (
          <g opacity={holo * (0.85 + 0.15 * Math.sin(t * 30))}>
            <path d={`M ${rx} 330 L 160 300 L 920 300 Z`} fill="#3df0ff" opacity={0.08} />
            <rect x={150} y={20} width={780} height={280} rx={30} fill="rgba(10,60,110,0.6)" stroke="#7df9ff" strokeWidth={4} />
            <Txt x={540} y={92} size={44} color="#7df9ff" weight={700}>CRYO SLEEP DURATION</Txt>
            <Txt x={540} y={250} size={140} color="#fff" glow="#3df0ff">{`${yrs} YEARS`}</Txt>
          </g>
        ) : null}
      </Cam>
      <LightLeak t={t} a={0.25} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 4. WINDOW: flying cars, towers covered in trees
// =====================================================================
export const WindowScene: React.FC<SP> = ({lt, m, t}) => {
  const zoom = k(lt, m.trees - 0.3, m.trees + 0.9);
  const walkIn = out(lt / 1.8);
  return (
    <AbsoluteFill>
      <Cam c={[lerp(540, 780, zoom), lerp(640, 470, zoom), lerp(1.0, 1.7, zoom)]}>
        <defs><clipPath id="win"><rect x={50} y={40} width={980} height={1000} rx={24} /></clipPath></defs>
        <rect x={-800} y={-800} width={2700} height={3600} fill="#0a0e1c" />
        <g clipPath="url(#win)">
          <Sky stops={['#2b1466', '#b23a8f', '#ff8a5c', '#ffd08a']} />
          <Glow x={540} y={820} r={520} c="#fff1c4" o={0.9} />
          {/* sun rays */}
          {Array.from({length: 10}).map((_, i) => <path key={i} d={`M 540 820 L ${540 + Math.cos(i / 10 * 3.14 + 3.14) * 1400 - 60} ${820 + Math.sin(i / 10 * 3.14 + 3.14) * 1400} L ${540 + Math.cos(i / 10 * 3.14 + 3.14) * 1400 + 60} ${820 + Math.sin(i / 10 * 3.14 + 3.14) * 1400} Z`} fill="#fff4d6" opacity={0.06} />)}
          <City base={1040} t={t} cars={k(lt, m.fly - 0.5, m.fly + 0.2)} drift={lt * 18} />
        </g>
        <rect x={50} y={40} width={980} height={1000} rx={24} fill="none" stroke="#151b30" strokeWidth={30} />
        <line x1={540} y1={40} x2={540} y2={1040} stroke="#151b30" strokeWidth={20} />
        <rect x={-800} y={1040} width={2700} height={1200} fill="#0d1224" />
        <ellipse cx={540} cy={1040} rx={500} ry={30} fill="#ffb36b" opacity={0.18} />
        {/* you, from behind, lit by the sunrise */}
        <Person x={lerp(140, 470, walkIn)} y={lerp(720, 600, walkIn)} s={lerp(0.85, 0.95, walkIn)} view="back" rim="#ffb36b" armL={[0.15 + (walkIn < 1 ? Math.sin(lt * 8) * 0.2 : 0), 0.1]} armR={[0.15 - (walkIn < 1 ? Math.sin(lt * 8) * 0.2 : 0), 0.1]} />
        {lt > m.fly ? <Txt x={300} y={420} size={100} color="#fff" s={back((lt - m.fly) / 0.3)} o={1 - k(lt, m.fly + 1.3, m.fly + 1.7)} glow="#ff2d95">WOW</Txt> : null}
      </Cam>
      <LightLeak t={t} a={0.45} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 5. PHONE: empty pockets, then the museum
// =====================================================================
const Museum: React.FC<{t: number; night?: boolean}> = ({t, night}) => (
  <g>
    <Sky stops={night ? ['#05060f', '#0b0d1e'] : ['#16112e', '#251c4a']} />
    {[-1, 1].map((sd) => <rect key={sd} x={540 + sd * 430 - 90} y={160} width={180} height={720} rx={14} fill={night ? '#0e0f22' : '#2e2560'} />)}
    <path d="M 540 -100 L 330 900 L 750 900 Z" fill="#fff6d6" opacity={night ? 0.04 : 0.09} />
    <rect x={-800} y={900} width={2700} height={1200} fill={night ? '#07080f' : '#120e26'} />
    <ellipse cx={540} cy={905} rx={300} ry={26} fill="#fff6d6" opacity={night ? 0.04 : 0.12} />
    <rect x={390} y={640} width={300} height={270} fill={night ? '#16152b' : '#3a3170'} />
    <rect x={360} y={610} width={360} height={36} rx={6} fill={night ? '#1f1d3a' : '#4b408a'} />
  </g>
);
const OldPhone: React.FC<{x: number; y: number; s?: number; rot?: number; lit?: boolean; children?: React.ReactNode}> = ({x, y, s = 1, rot = 0, lit, children}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-62} y={-120} width={124} height={240} rx={24} fill="#16181d" stroke="#8c94a3" strokeWidth={5} />
    <rect x={-52} y={-104} width={104} height={208} rx={14} fill={lit ? '#1d3f78' : '#222838'} />
    <rect x={-18} y={-114} width={36} height={8} rx={4} fill="#000" />
    {!lit ? <path d="M -40 -90 L 30 80" stroke="#fff" strokeWidth={6} opacity={0.12} /> : null}
    {children}
  </g>
);
export const PhoneScene: React.FC<SP> = ({lt, m, t}) => {
  if (lt < m.museum) {
    const pat = Math.sin(lt * 14) * 0.18;
    return (
      <AbsoluteFill>
        <Cam c={[540, 660, 1.0]}>
          <Lab t={t} />
          <Person x={540} y={600} s={1.0} expr="worried" look={[0, 1]} tilt={-4} armL={[0.2 + pat, -0.5]} armR={[0.2 - pat, -0.5]} />
          <QMark x={260} y={300} p={(lt - 0.5) / 0.3} />
          <QMark x={840} y={260} p={(lt - 0.9) / 0.3} c="#7df9ff" />
        </Cam>
      </AbsoluteFill>
    );
  }
  const ml = lt - m.museum;
  const kids = k(lt, m.kids - 0.3, m.kids + 0.2);
  const laugh = Math.abs(Math.sin(t * 9));
  return (
    <AbsoluteFill>
      <Cam c={[540, lerp(560, 640, k(ml, 0, 2)), lerp(1.35, 1.0, out(ml / 2.2))]}>
        <Museum t={t} />
        <OldPhone x={540} y={470} rot={Math.sin(t * 0.8) * 8} />
        <rect x={380} y={300} width={320} height={316} rx={8} fill="rgba(190,235,255,0.08)" stroke="#cdeeff" strokeWidth={4} />
        <path d="M 400 320 L 440 320 L 400 380 Z" fill="#fff" opacity={0.2} />
        <g opacity={k(lt, m.case - 0.2, m.case + 0.3)}>
          <rect x={330} y={700} width={420} height={120} rx={14} fill="#f4f1e6" />
          <Txt x={540} y={752} size={36} color="#111">SMARTPHONE · c. 2025</Txt>
          <Txt x={540} y={794} size={26} color="#666" weight={700}>"Needed charging every day"</Txt>
        </g>
        <g opacity={kids}>
          <Person x={150} y={600 - laugh * 10 * kids} s={0.55} p={KID_A} hair="bun" expr="laugh" armR={[2.3, 0.2]} armL={[0.6, -1.6]} tilt={-8 * laugh} />
          <Person x={930} y={600 - laugh * 10 * kids} s={0.55} p={KID_B} hair="short" expr="laugh" armL={[0.5, -1.7]} armR={[0.5, -1.7]} tilt={8 * laugh} />
          <Txt x={150} y={330} size={58} color="#ffe14d" glow="#000">HAHA</Txt>
          <Txt x={930} y={330} size={58} color="#ffe14d" glow="#000">HAHA</Txt>
        </g>
      </Cam>
      <LightLeak t={t} a={0.2} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 6. FOOD: no cash, no cards, pay with your face, a printed burger
// =====================================================================
const Bill: React.FC<{x: number; y: number; p: number; x2: number}> = ({x, y, p, x2}) => (
  <g transform={`translate(${x} ${y}) scale(${back(p)})`}>
    <rect x={-120} y={-64} width={240} height={128} rx={14} fill="#7bc67b" stroke="#3f8f3f" strokeWidth={6} />
    <circle cx={0} cy={0} r={38} fill="#a8dca8" />
    <Txt x={0} y={22} size={56} color="#2d6e2d">$</Txt>
    <path d="M -130 -90 L 130 90 M 130 -90 L -130 90" stroke="#ff2d55" strokeWidth={24} strokeLinecap="round" opacity={x2} />
  </g>
);
const Card: React.FC<{x: number; y: number; p: number; x2: number}> = ({x, y, p, x2}) => (
  <g transform={`translate(${x} ${y}) scale(${back(p)})`}>
    <rect x={-120} y={-76} width={240} height={152} rx={18} fill="#3657c9" />
    <rect x={-120} y={-40} width={240} height={30} fill="#1b2f75" />
    <rect x={-90} y={14} width={50} height={36} rx={6} fill="#e8c35a" />
    <path d="M -130 -100 L 130 100 M 130 -100 L -130 100" stroke="#ff2d55" strokeWidth={24} strokeLinecap="round" opacity={x2} />
  </g>
);
export const FoodScene: React.FC<SP> = ({lt, m, t}) => {
  const scanning = lt > m.scan - 0.15 && lt < m.print - 0.1;
  const printing = lt >= m.print - 0.1;
  if (scanning) {
    const sl = lt - m.scan;
    return (
      <AbsoluteFill>
        <Cam c={[540, 640, lerp(1.15, 1.0, out((sl + 0.15) / 0.5))]}>
          <Sky stops={['#06142a', '#0b2346']} />
          <Person x={540} y={1060} s={2.2} part="bust" expr={sl > 1.0 ? 'wonder' : 'neutral'} look={[0, -0.2]} />
          <g style={{filter: 'drop-shadow(0 0 10px #3df0ff)'}}>
            {[[250, 160], [830, 160], [250, 860], [830, 860]].map(([x, y], i) => <path key={i} d={`M ${x} ${y + (y > 400 ? -70 : 70)} L ${x} ${y} L ${x + (x > 540 ? -70 : 70)} ${y}`} stroke="#7df9ff" strokeWidth={12} fill="none" strokeLinecap="round" />)}
            {sl < 1.0 ? <rect x={250} y={160 + ((sl * 900) % 700)} width={580} height={8} fill="#7df9ff" /> : null}
            {Array.from({length: 22}).map((_, i) => <circle key={i} cx={360 + hash(i) * 360} cy={300 + hash(i * 7) * 420} r={5} fill="#7df9ff" opacity={sl < 1.0 ? 0.8 : 0} />)}
          </g>
          {sl > 1.0 ? <Txt x={540} y={1000} size={110} color="#2bff88" glow="#00ff88" s={back((sl - 1) / 0.3)}>PAID ✓</Txt> : null}
        </Cam>
      </AbsoluteFill>
    );
  }
  if (printing) {
    const pp = clamp((lt - m.print) / 2.0);
    const layers: [string, number, number][] = [['#e9a64a', 30, 300], ['#6b3a1e', 40, 290], ['#ffcc33', 12, 310], ['#5a8f29', 16, 320], ['#d9443a', 14, 290], ['#e9a64a', 56, 300]];
    return (
      <AbsoluteFill>
        <Cam c={[540, 600, 1.08]}>
          <Sky stops={['#0d1430', '#1a2350']} />
          <rect x={210} y={140} width={660} height={800} rx={40} fill="#e9eef7" />
          <rect x={250} y={260} width={580} height={600} rx={24} fill="#0a0f24" />
          <Glow x={540} y={760} r={300} c="#ff9a5a" o={0.35} />
          <rect x={250} y={200} width={580} height={30} rx={15} fill="#3df0ff" opacity={0.6} />
          <rect x={290 + Math.abs(Math.sin(lt * 4)) * 420} y={270} width={80} height={50} rx={10} fill="#c9d1e3" />
          {layers.map(([c, h, w], i) => {
            const on = clamp(pp * layers.length - i);
            const y0 = 820 - layers.slice(0, i).reduce((a, q) => a + q[1], 0);
            return on > 0 ? <rect key={i} x={540 - (w * on) / 2} y={y0 - h} width={w * on} height={h} rx={i === layers.length - 1 ? 40 : 10} fill={c} /> : null;
          })}
          <rect x={250} y={880} width={580} height={20} rx={10} fill="#1a2350" />
          <rect x={250} y={880} width={580 * pp} height={20} rx={10} fill="#2bff88" />
          <Txt x={540} y={110} size={64} color="#fff">{pp < 1 ? `PRINTING ${Math.round(pp * 100)}%` : 'READY!'}</Txt>
        </Cam>
        <LightLeak t={t} a={0.25} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Cam c={[540, 640, 1.0]}>
        <Sky stops={['#140f33', '#2b1a5c', '#3a1d55']} />
        <City base={940} t={t} cars={0.6} drift={lt * 6} />
        {/* the food kiosk */}
        <rect x={560} y={220} width={440} height={720} rx={30} fill="#1a1440" stroke="#ff7ab6" strokeWidth={6} />
        <Txt x={780} y={320} size={80} color="#ff7ab6" glow="#ff2d95">FOOD</Txt>
        {['BURGER', 'NOODLES', 'TACOS'].map((w, i) => <Txt key={w} x={780} y={440 + i * 90} size={44} color="#7df9ff" weight={700}>{w}</Txt>)}
        <rect x={-800} y={940} width={2700} height={1200} fill="#0d0a22" />
        <Person x={300} y={500} s={0.95} expr="worried" look={[1, 0]} turn={0.5} armL={[0.35, -1.5]} armR={[0.35, -1.6]} />
        <Txt x={300} y={240} size={66} color="#ffe14d" o={1 - k(lt, m.cash - 0.2, m.cash)} glow="#000">grrrr…</Txt>
        {lt > m.cash ? <Bill x={300} y={280} p={(lt - m.cash) / 0.3} x2={k(lt, m.cash + 0.35, m.cash + 0.5)} /> : null}
        {lt > m.cash + 0.6 ? <Card x={780} y={760} p={(lt - m.cash - 0.6) / 0.3} x2={k(lt, m.cash + 0.95, m.cash + 1.1)} /> : null}
      </Cam>
      <LightLeak t={t} a={0.3} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 7. NEWS: you are on the giant hologram, everyone stares
// =====================================================================
const CROWD = [KID_B, KID_A, {...HERO_P, hair: '#8a5a2b', hairHi: '#b07a45', top: '#e8ecf4', topShade: '#c3cad8', skin: '#e8b48f', scarf: undefined, outfit: 'future' as const, accent: '#ff7ab6'}, {...KID_A, visor: undefined, top: '#1f2a44', topShade: '#151d33', accent: '#7df9ff'}, {...KID_B, visor: undefined, top: '#3a1f5c', topShade: '#2a1645', hair: '#2a1a12', hairHi: '#4a3020', accent: '#ffd166'}];
export const NewsScene: React.FC<SP> = ({lt, m, t}) => {
  const on = k(lt, 0.2, 0.7);
  if (lt > m.stare - 0.15) {
    const sl = lt - m.stare + 0.15;
    return (
      <AbsoluteFill>
        <Cam c={[540, 660, lerp(1.25, 1.05, out(sl / 1.5))]}>
          <Sky stops={['#120a35', '#3b1f6e']} />
          <City base={900} t={t} cars={0.5} drift={0} />
          <rect x={-800} y={900} width={2700} height={1200} fill="#0b0d1e" />
          {/* everyone turns to look at you */}
          {[[300, 760, 0.62, 0.7], [790, 760, 0.62, -0.7], [110, 860, 0.8, 0.9], [970, 860, 0.8, -0.9]].map(([x, y, s, turn], i) => (
            <Person key={i} x={x} y={y} s={s} part="bust" p={CROWD[i]} hair={i % 2 ? 'short' : 'bun'} expr="neutral" turn={turn * k(sl, 0.1 + i * 0.12, 0.4 + i * 0.12)} look={[turn > 0 ? 1 : -1, 0]} />
          ))}
          <Person x={540} y={930} s={1.35} part="bust" expr="worried" look={[Math.sin(t * 2.4), 0]} armL={[0.3, -0.4]} armR={[0.3, -0.4]} />
          {[[300, 470], [790, 470], [110, 520], [970, 520]].map(([x, y], i) => <Txt key={i} x={x} y={y} size={64} s={back((sl - i * 0.12) / 0.3)}>👀</Txt>)}
        </Cam>
        <LightLeak t={t} a={0.25} />
      </AbsoluteFill>
    );
  }
  const zoom = k(lt, m.photo - 0.2, m.photo + 0.5);
  return (
    <AbsoluteFill>
      <Cam c={[540, lerp(560, 520, zoom), lerp(1.0, 1.3, zoom)]}>
        <Sky stops={['#120a35', '#3b1f6e']} />
        <City base={1000} t={t} cars={0.8} drift={lt * 10} />
        <g opacity={on * (0.85 + 0.15 * Math.sin(t * 25))}>
          <path d="M 540 1000 L 140 860 L 940 860 Z" fill="#3df0ff" opacity={0.08} />
          <rect x={110} y={180} width={860} height={680} rx={26} fill="rgba(8,40,80,0.82)" stroke="#7df9ff" strokeWidth={6} />
          <rect x={110} y={180} width={860} height={90} rx={26} fill="#e63946" />
          <Txt x={540} y={244} size={56} color="#fff">BREAKING NEWS</Txt>
          {lt > m.headline - 0.1 ? <Txt x={540} y={350} size={52} color="#fff" o={k(lt, m.headline - 0.1, m.headline + 0.2)}>SLEEPER FROM 2025</Txt> : null}
          {lt > m.headline + 0.6 ? <Txt x={540} y={418} size={52} color="#7df9ff" o={k(lt, m.headline + 0.6, m.headline + 0.9)}>WAKES UP TODAY</Txt> : null}
          {lt > m.photo - 0.3 ? (
            <g>
              <defs><clipPath id="photo"><rect x={380} y={460} width={320} height={360} rx={16} /></clipPath></defs>
              <rect x={380} y={460} width={320} height={360} rx={16} fill="#9fd8ff" />
              <g clipPath="url(#photo)"><Person x={540} y={720} s={0.9} part="bust" expr="neutral" /></g>
              <rect x={392} y={472} width={96} height={42} rx={8} fill="#e63946" />
              <Txt x={440} y={503} size={28} color="#fff">LIVE</Txt>
            </g>
          ) : null}
        </g>
        <rect x={-800} y={1000} width={2700} height={1200} fill="#0b0d1e" />
        {/* crowd from behind */}
        {[100, 300, 520, 760, 980].map((x, i) => <Person key={i} x={x} y={1000 - (i % 2) * 20} s={0.55} part="bust" view="back" p={CROWD[i]} />)}
      </Cam>
      <GlitchBars t={lt} amount={lt < 0.6 ? 1 - lt / 0.6 : lt > m.photo - 0.25 && lt < m.photo ? 0.8 : 0} />
      <LightLeak t={t} a={0.3} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 8. TWIST: the old phone buzzes: one new message, from you
// =====================================================================
export const TwistScene: React.FC<SP> = ({lt, m, t}) => {
  const buzz = (lt > 1.5 && lt < 2.4) || (lt > m.msg - 0.1 && lt < m.msg + 0.8);
  const close = out(k(lt, 2.2, m.msg - 0.2));
  const lit = lt > 1.5;
  return (
    <AbsoluteFill>
      <Cam c={[540, lerp(560, 470, close), lerp(1.0, 2.6, close)]}>
        <Museum t={t} night />
        <OldPhone x={540 + (buzz ? Math.sin(t * 90) * 6 : 0)} y={470} lit={lit}>
          {lit ? (
            <g>
              <rect x={-46} y={-60} width={92} height={84} rx={12} fill="#fff" opacity={0.95} />
              <circle cx={-26} cy={-36} r={14} fill="#9fd8ff" />
              <g transform="translate(-26 -28) scale(0.1)"><Person x={0} y={0} s={1} part="head" expr="neutral" /></g>
              <text x={8} y={-38} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={9} fill="#111">1 New</text>
              <text x={8} y={-27} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={9} fill="#111">Message</text>
              {lt > m.from ? <text x={0} y={-4} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={10} fill="#e63946">From: ME</text> : null}
              {lt > m.date ? <text x={0} y={12} textAnchor="middle" fontFamily={MONT} fontWeight={700} fontSize={8} fill="#333">31 Dec 2025</text> : null}
            </g>
          ) : null}
          {buzz ? [-1, 1].map((sd) => <path key={sd} d={`M ${sd * 82} -50 q ${sd * 14} 18 0 36 q ${sd * -14} 18 0 36`} stroke="#7df9ff" strokeWidth={5} fill="none" />) : null}
        </OldPhone>
        {lit ? <Glow x={540} y={470} r={260} c="#5aa0ff" o={0.35} /> : null}
        <rect x={380} y={300} width={320} height={316} rx={8} fill="rgba(190,235,255,0.05)" stroke="#5c7a99" strokeWidth={4} />
      </Cam>
      {lt > m.from ? (
        <AbsoluteFill style={{alignItems: 'center'}}>
          <div style={{marginTop: 150, fontFamily: MONT, fontWeight: 900, fontSize: 110, color: '#ff3355', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', scale: String(back((lt - m.from) / 0.3))}}>FROM: YOU</div>
          {lt > m.date ? <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 76, color: '#fff', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', scale: String(back((lt - m.date) / 0.3))}}>SENT IN 2025</div> : null}
        </AbsoluteFill>
      ) : null}
      <GlitchBars t={lt} amount={lt > m.from - 0.05 && lt < m.from + 0.25 ? 1 : 0} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 9. WARNING: "Don't trust the robot." ... it's right behind you
// =====================================================================
export const WarningScene: React.FC<SP> = ({lt, m, t}) => {
  const msg = "DON'T TRUST THE ROBOT.";
  if (lt < m.behind) {
    const typed = msg.slice(0, Math.round(msg.length * clamp((lt - m.read + 0.1) / 1.0)));
    return (
      <AbsoluteFill style={{background: '#05060f'}}>
        <Cam>
          <rect x={-800} y={-800} width={2700} height={3600} fill="#05060f" />
          <rect x={170} y={-40} width={740} height={1120} rx={100} fill="#16181d" stroke="#8c94a3" strokeWidth={14} />
          <rect x={200} y={-10} width={680} height={1060} rx={78} fill="#0e1d38" />
          <circle cx={290} cy={90} r={44} fill="#9fd8ff" />
          <g transform="translate(290 112) scale(0.32)"><Person x={0} y={0} s={1} part="head" expr="neutral" /></g>
          <Txt x={470} y={84} size={40} color="#fff">ME</Txt>
          <Txt x={490} y={124} size={26} color="#8fa3c4" weight={700}>31 Dec 2025, 11:58 PM</Txt>
          {typed.length ? <rect x={240} y={220} width={600} height={300} rx={44} fill="#e63946" /> : null}
          <foreignObject x={270} y={250} width={540} height={260}><div style={{fontFamily: MONT, fontWeight: 900, fontSize: 80, lineHeight: 1.05, color: '#fff'}}>{typed}</div></foreignObject>
        </Cam>
      </AbsoluteFill>
    );
  }
  const bl = lt - m.behind;
  const red = k(bl, 0.3, 1.2);
  const flick = Math.sin(t * 37) > 0.75 ? 0.6 : 1;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: flick}}>
        <Cam c={[540, 640, lerp(1.1, 1.0, out(bl / 2))]} shake={bl < 0.6 ? 6 : 2} t={t}>
          <Lab t={t} red={red} />
          <Glow x={760} y={300} r={500} c={red > 0.5 ? '#ff2244' : '#3df0ff'} o={0.35} />
          <Robot x={760} y={lerp(1300, 380, out(bl / 0.9))} s={1.35} t={t} mood={red > 0.5 ? 'angry' : 'neutral'} armL={0.6} armR={0.6} />
          <Person x={330} y={900} s={1.7} part="bust" expr="scared" turn={0.75} look={[1, -0.2]} tilt={4} armL={[0.3, -0.4]} armR={[0.3, -0.4]} />
        </Cam>
      </AbsoluteFill>
      {bl > 2.9 ? (
        <AbsoluteFill style={{alignItems: 'center'}}>
          <div style={{marginTop: 120, padding: '0 60px', textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 74, lineHeight: 1.1, color: '#ff2244', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill'}}>"YOU WERE NOT SUPPOSED TO READ THAT."</div>
        </AbsoluteFill>
      ) : null}
      <GlitchBars t={lt} amount={bl < 0.35 ? 1 : 0} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 10. PART 2?
// =====================================================================
export const CtaScene: React.FC<SP> = ({lt, m, t}) => {
  const press = k(lt, m.follow + 0.6, m.follow + 0.8) * (1 - k(lt, m.follow + 0.9, m.follow + 1.1));
  const followed = lt > m.follow + 0.85;
  return (
    <AbsoluteFill style={{background: '#050208', alignItems: 'center'}}>
      <Cam c={[540, 640, 1]}>
        <Glow x={540} y={420} r={420} c="#ff2244" o={0.3} />
        <Robot x={540} y={520} s={1.3} t={t} mood="angry" />
      </Cam>
      <div style={{marginTop: 900, fontFamily: MONT, fontWeight: 900, fontSize: 190, color: '#fff', textShadow: '6px 0 #ff2bd6, -6px 0 #00f0ff', scale: String(back(lt / 0.4))}}>PART 2?</div>
      <div style={{marginTop: 30, opacity: k(lt, m.follow - 0.2, m.follow + 0.1), scale: String(1 - press * 0.1), background: followed ? '#2b2f4a' : '#e63946', color: '#fff', fontFamily: MONT, fontWeight: 900, fontSize: 64, padding: '22px 70px', borderRadius: 999}}>{followed ? '✓ FOLLOWING' : '+ FOLLOW'}</div>
    </AbsoluteFill>
  );
};
