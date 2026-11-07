// The ten scenes of "You woke up in 2100". Each takes the local time lt
// (seconds since the scene started) and the scene's narration marks m.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stick, pose, mixP, walk, HERO as HERO0} from './rig';
import {City, Expr, Face, GlitchBars, LightLeak, MONT, Robot, back, clamp, hash, k, lerp, out} from './kit';

const HERO = {...HERO0, eyes: true};
type SP = {lt: number; m: Record<string, number>; t: number};

const Txt: React.FC<{x: number; y: number; size: number; color?: string; children: React.ReactNode; o?: number; s?: number; glow?: string; weight?: number; anchor?: 'middle' | 'start'}> = ({x, y, size, color = '#fff', children, o = 1, s = 1, glow, weight = 900, anchor = 'middle'}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={MONT} fontWeight={weight} fontSize={size} fill={color} opacity={o} transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`} style={glow ? {filter: `drop-shadow(0 0 18px ${glow})`} : undefined}>{children}</text>
);
const Svg: React.FC<{children: React.ReactNode; cam?: [number, number, number]}> = ({children, cam = [540, 700, 1]}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
    <g transform={`translate(${540 - cam[0] * cam[2]} ${700 - cam[1] * cam[2]}) scale(${cam[2]})`}>{children}</g>
  </svg>
);
const Bubble: React.FC<{x: number; y: number; w: number; text: string; p: number; color?: string; tail?: 'left' | 'right'}> = ({x, y, w, text, p, color = '#fff', tail = 'left'}) => {
  if (p <= 0) return null;
  const shown = text.slice(0, Math.round(text.length * clamp(p * 1.6)));
  const sc = back(clamp(p * 5));
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}>
      <rect x={x - w / 2} y={y - 70} width={w} height={140} rx={40} fill={color} />
      <path d={tail === 'left' ? `M ${x - w / 4} ${y + 66} l -30 50 l 70 -50 Z` : `M ${x + w / 4} ${y + 66} l 30 50 l -70 -50 Z`} fill={color} />
      <text x={x} y={y + 16} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={46} fill="#0b0f1c">{shown}</text>
    </g>
  );
};
const Lab: React.FC<{t: number; red?: number}> = ({t, red = 0}) => (
  <g>
    <rect x={-400} y={-400} width={1900} height={2700} fill={red > 0 ? `rgb(${lerp(10, 60, red)},${lerp(22, 6, red)},${lerp(40, 14, red)})` : '#0a1628'} />
    {Array.from({length: 8}).map((_, r) => Array.from({length: 7}).map((__, c) => {
      const x = -60 + c * 180 + (r % 2) * 90, y = 120 + r * 150;
      return <polygon key={`${r}-${c}`} points={[0, 1, 2, 3, 4, 5].map((i) => `${x + Math.cos(i * Math.PI / 3) * 80},${y + Math.sin(i * Math.PI / 3) * 80}`).join(' ')} fill="none" stroke={red > 0.5 ? '#ff3355' : '#1e4b6e'} strokeWidth={3} opacity={0.35 + 0.25 * Math.sin(t * 2 + r + c)} />;
    }))}
    <rect x={-400} y={1100} width={1900} height={900} fill={red > 0 ? '#1a0508' : '#06101e'} />
    <rect x={-400} y={1100} width={1900} height={6} fill={red > 0.5 ? '#ff3355' : '#38e8ff'} opacity={0.6} />
  </g>
);
const Pod: React.FC<{x: number; y: number; open: number; glow?: number}> = ({x, y, open, glow = 1}) => (
  <g>
    <ellipse cx={x + 300} cy={y + 150} rx={380} ry={40} fill="#38e8ff" opacity={0.12 * glow} />
    <rect x={x} y={y} width={600} height={130} rx={65} fill="#dfe7f3" stroke="#9fb3cc" strokeWidth={6} />
    <rect x={x + 40} y={y + 30} width={520} height={20} rx={10} fill="#38e8ff" opacity={0.5 + 0.3 * glow} />
    <rect x={x + 180} y={y + 130} width={240} height={50} fill="#9fb3cc" />
    {/* the glass lid hinges at the back and swings up */}
    <g transform={`rotate(${-open * 75} ${x + 40} ${y + 10})`}>
      <path d={`M ${x + 30} ${y + 10} Q ${x + 300} ${y - 230} ${x + 570} ${y + 10} Z`} fill="rgba(140,230,255,0.28)" stroke="#bff3ff" strokeWidth={5} />
    </g>
  </g>
);

// ---------- 1. wake: sleeping in 2025, eyes open in 2100 ----------
export const Wake: React.FC<SP> = ({lt, m}) => {
  const o = m.open; // "And you just woke up"
  const year = lt < o + 0.4 ? 2025 : lt < o + 1.9 ? Math.round(lerp(2025, 2100, out((lt - o - 0.4) / 1.5))) : 2100;
  const lids = lt < o ? 0 : out((lt - o) / 0.9) * (1 - 0.5 * Math.max(0, Math.sin((lt - o) * 9)) * (lt - o < 0.7 ? 1 : 0));
  const blur = lt < o ? 0 : (1 - k(lt, o, o + 1.4)) * 18;
  const land = k(lt, o + 1.9, o + 2.1);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {lt < o ? (
        <Svg>
          <rect x={-300} y={-300} width={1700} height={2500} fill="#050912" />
          <Face x={540} y={760} r={190} expr="sleepy" blink={1} />
          {[0, 1, 2].map((i) => <Txt key={i} x={760 + i * 60} y={540 - ((lt * 60 + i * 50) % 160)} size={60 + i * 14} color="#9ad8ff" o={0.6}>Z</Txt>)}
          <Txt x={540} y={260} size={56} color="#9ad8ff" weight={700}>DECEMBER 31</Txt>
          <Txt x={540} y={380} size={160} color="#fff" glow="#38e8ff">2025</Txt>
        </Svg>
      ) : (
        <>
          <AbsoluteFill style={{filter: `blur(${blur}px)`}}>
            <Svg>
              <rect x={-300} y={-300} width={1700} height={2500} fill="#06223a" />
              {/* ceiling light strips in perspective, seen lying on your back */}
              {Array.from({length: 7}).map((_, i) => <line key={i} x1={540} y1={700} x2={-400 + i * 310} y2={-300} stroke="#38e8ff" strokeWidth={10} opacity={0.35} />)}
              {Array.from({length: 7}).map((_, i) => <line key={`b${i}`} x1={540} y1={700} x2={-400 + i * 310} y2={1700} stroke="#38e8ff" strokeWidth={10} opacity={0.2} />)}
              <circle cx={540} cy={700} r={220} fill="#bff3ff" opacity={0.25} />
              <Txt x={540} y={760} size={260} color={year === 2100 ? '#7df9ff' : '#fff'} glow={year === 2100 ? '#38e8ff' : undefined} s={1 + land * 0.15 * (1 - k(lt, o + 2.2, o + 2.6))}>{String(year)}</Txt>
              {year === 2100 ? <Txt x={540} y={480} size={64} color="#fff" weight={700} o={land}>YEAR</Txt> : null}
            </Svg>
          </AbsoluteFill>
          {/* eyelids */}
          <div style={{position: 'absolute', left: -100, right: -100, top: 0, height: 960 * (1 - lids), background: '#000', borderBottomLeftRadius: '50%', borderBottomRightRadius: '50%'}} />
          <div style={{position: 'absolute', left: -100, right: -100, bottom: 0, height: 960 * (1 - lids), background: '#000', borderTopLeftRadius: '50%', borderTopRightRadius: '50%'}} />
          <GlitchBars t={lt} amount={lt > o + 1.85 && lt < o + 2.3 ? 1 : 0} />
        </>
      )}
    </AbsoluteFill>
  );
};

// ---------- 2. pod: the lid opens, mist pours out, a voice ----------
export const PodScene: React.FC<SP> = ({lt, m, t}) => {
  const open = out((lt - 0.2) / 1.6);
  const sit = k(lt, 1.5, 3.0);
  const cam: [number, number, number] = [lerp(540, 470, k(lt, 0, 6)), lerp(820, 760, k(lt, 0, 6)), lerp(1.0, 1.25, k(lt, 0, 6))];
  const heard = lt > m.voice;
  return (
    <AbsoluteFill>
      <Svg cam={cam}>
        <Lab t={t} />
        <Pod x={150} y={880} open={open} />
        <Stick x={330} y={935} s={1.9} f={1} p={mixP(pose({l1: 1.57, l2: 0, m1: 1.57, m2: 0, a1: 0.2, b1: 0.2}), pose({l1: 1.5, l2: -0.1, m1: 1.5, m2: -0.1, a1: 0.5, a2: 0.4, b1: 0.3, nod: heard ? -0.2 : 0.1}), sit)} hip rot={lerp(-90, 0, sit)} look={HERO} blink={lt < 1.2 ? 0.8 : 0} look2={heard ? -1 : 0.6} t={t} />
        {/* cold mist rolling over the edge */}
        {Array.from({length: 26}).map((_, i) => {
          const life = lt - m.fog + 0.3 - (i % 13) * 0.12;
          if (life < 0) return null;
          const p = clamp(life / 3);
          const x = 200 + hash(i) * 520 + (i % 2 ? 1 : -1) * p * 180, y = 900 + p * 260 + hash(i * 3) * 60;
          return <circle key={i} cx={x} cy={y} r={40 + p * 70} fill="#eaf8ff" opacity={0.35 * (1 - p)} />;
        })}
        {heard ? <Txt x={210} y={720} size={110} color="#ffe14d" s={back((lt - m.voice) / 0.3)}>?</Txt> : null}
      </Svg>
      <LightLeak t={t} a={0.25} />
    </AbsoluteFill>
  );
};

// ---------- 3. robot: welcome back, sleeper, 75 years ----------
export const RobotScene: React.FC<SP> = ({lt, m, t}) => {
  const rx = lerp(1250, 790, out(lt / 1.3));
  const yrs = Math.round(lerp(0, 75, out((lt - m.years + 0.2) / 1.2)));
  const holo = k(lt, m.years - 0.4, m.years);
  const shock = lt > m.years + 1.3;
  return (
    <AbsoluteFill>
      <Svg cam={[540, 800, 1.05]}>
        <Lab t={t} />
        <Pod x={-60} y={880} open={1} glow={0.6} />
        <Stick x={300} y={940} s={1.9} f={1} p={pose({l1: 1.5, l2: -1.3, m1: 1.45, m2: -1.4, a1: 0.6, a2: 0.4, b1: 0.4, nod: -0.15})} hip look={HERO} look2={1} t={t} />
        <Robot x={rx} y={760} s={1.5} f={-1} arm={k(lt, 1.2, 1.6) * (1 - k(lt, 3.6, 4))} />
        <g opacity={1 - k(lt, 4.0, 4.4)}><Bubble x={600} y={410} w={860} text="Welcome back, Sleeper #8214" p={(lt - 0.2) / 2.2} tail="right" /></g>
        {holo > 0 ? (
          <g opacity={holo * (0.8 + 0.2 * Math.sin(t * 30))}>
            <path d={`M ${rx - 40} 700 L 330 330 L 980 330 Z`} fill="#38e8ff" opacity={0.08} />
            <rect x={160} y={180} width={760} height={300} rx={30} fill="rgba(20,80,120,0.55)" stroke="#7df9ff" strokeWidth={4} />
            <Txt x={540} y={260} size={48} color="#7df9ff" weight={700}>CRYO SLEEP DURATION</Txt>
            <Txt x={540} y={430} size={150} color="#fff" glow="#38e8ff">{`${yrs} YEARS`}</Txt>
          </g>
        ) : null}
      </Svg>
      {shock ? (
        <Svg>
          <rect x={-300} y={-300} width={1700} height={2500} fill="rgba(3,6,14,0.9)" opacity={k(lt, m.years + 1.3, m.years + 1.5)} />
          <Face x={540} y={700} r={lerp(120, 230, back((lt - m.years - 1.3) / 0.35))} expr="shock" shake={6} />
          <Txt x={540} y={300} size={120} color="#ffe14d" s={back((lt - m.years - 1.4) / 0.3)}>75?!</Txt>
        </Svg>
      ) : null}
      <LightLeak t={t} a={0.25} />
    </AbsoluteFill>
  );
};

// ---------- 4. window: flying cars and towers covered in trees ----------
export const WindowScene: React.FC<SP> = ({lt, m, t}) => {
  const walkIn = clamp(lt / 1.6);
  const zoom = k(lt, m.trees - 0.3, m.trees + 0.8);
  const cam: [number, number, number] = [lerp(540, 760, zoom), lerp(760, 560, zoom), lerp(1.0, 1.6, zoom)];
  return (
    <AbsoluteFill>
      <Svg cam={cam}>
        <defs>
          <linearGradient id="dawn" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#2a1260" /><stop offset="0.45" stopColor="#d9468f" /><stop offset="0.75" stopColor="#ff9a5a" /><stop offset="1" stopColor="#ffd28a" />
          </linearGradient>
          <radialGradient id="sun"><stop offset="0" stopColor="#fff3c4" /><stop offset="1" stopColor="#ffb36b" stopOpacity="0" /></radialGradient>
          <clipPath id="glass"><rect x={60} y={120} width={960} height={980} rx={30} /></clipPath>
        </defs>
        <rect x={-400} y={-400} width={1900} height={2700} fill="#070b16" />
        <g clipPath="url(#glass)">
          <rect x={0} y={0} width={1080} height={1200} fill="url(#dawn)" />
          <circle cx={540} cy={900} r={420} fill="url(#sun)" />
          <City base={1110} t={t} cars={k(lt, m.fly - 0.4, m.fly + 0.2)} drift={lt * 20} />
        </g>
        {/* window frame */}
        <rect x={60} y={120} width={960} height={980} rx={30} fill="none" stroke="#141b2e" strokeWidth={26} />
        <line x1={540} y1={120} x2={540} y2={1100} stroke="#141b2e" strokeWidth={18} />
        <rect x={-400} y={1100} width={1900} height={900} fill="#0b1020" />
        <Stick x={lerp(-80, 330, out(walkIn))} y={1100} s={2.0} f={1} p={walkIn < 1 ? walk(lt * 9) : pose({nod: -0.25 - zoom * 0.1})} look={{...HERO, color: '#0b0f1c'}} look2={1} t={t} />
        {lt > m.fly ? <Txt x={300} y={720} size={90} color="#ffe14d" s={back((lt - m.fly) / 0.3)} o={1 - k(lt, m.fly + 1.4, m.fly + 1.8)}>WOW</Txt> : null}
      </Svg>
      <LightLeak t={t} a={0.4} />
    </AbsoluteFill>
  );
};

// ---------- 5. phone: it's in a museum, kids laugh ----------
export const PhoneScene: React.FC<SP> = ({lt, m, t}) => {
  const museum = lt > m.museum;
  const kids = k(lt, m.kids - 0.2, m.kids + 0.2);
  const ml = lt - m.museum;
  return (
    <AbsoluteFill style={{background: '#0c0f1d'}}>
      {!museum ? (
        <Svg cam={[540, 760, 1.25]}>
          <Lab t={t} />
          <Stick x={540} y={1100} s={2.3} f={1} p={pose({a1: 0.25, a2: -1.2 + Math.sin(lt * 14) * 0.2, b1: 0.3, b2: 1.2, nod: 0.35})} look={HERO} look2={0} t={t} />
          {[0, 1].map((i) => <Txt key={i} x={760 + i * 70} y={560 - i * 40} size={100} color="#ffe14d" s={back((lt - 0.6 - i * 0.3) / 0.3)}>?</Txt>)}
        </Svg>
      ) : (
        <Svg cam={[540, lerp(820, 700, k(ml, 0, 1.5)), lerp(1.0, 1.15, k(ml, 0, 3))]}>
          <rect x={-400} y={-400} width={1900} height={2700} fill="#141024" />
          <path d="M 540 -200 L 330 1000 L 750 1000 Z" fill="#fff6d6" opacity={0.08} />
          <rect x={380} y={820} width={320} height={300} fill="#2a2444" />
          <rect x={340} y={790} width={400} height={30} fill="#3b3460" />
          {/* glass case and the 2025 phone */}
          <g transform={`translate(540 640) rotate(${Math.sin(t) * 6})`}>
            <rect x={-60} y={-115} width={120} height={230} rx={22} fill="#111" stroke="#9aa4b2" strokeWidth={6} />
            <rect x={-48} y={-98} width={96} height={190} rx={12} fill="#1d2433" />
            <circle cx={0} cy={-80} r={6} fill="#333" />
          </g>
          <rect x={360} y={420} width={360} height={370} rx={10} fill="rgba(180,230,255,0.10)" stroke="#bfe9ff" strokeWidth={4} />
          <g opacity={k(ml, m.case - m.museum - 0.3, m.case - m.museum + 0.2)}>
            <rect x={330} y={1150} width={420} height={110} rx={14} fill="#f4f1e6" />
            <Txt x={540} y={1198} size={36} color="#111">SMARTPHONE · c. 2025</Txt>
            <Txt x={540} y={1240} size={26} color="#666" weight={700}>"Heavy. Needed charging daily."</Txt>
          </g>
          {/* kids from 2100 with glowing visors */}
          {[[170, 1], [910, -1]].map(([x, f], i) => {
            const laugh = Math.abs(Math.sin(t * 10 + i)) * kids;
            return (
              <g key={i} opacity={kids}>
                <Stick x={x} y={1100 - laugh * 14} s={1.25} f={f as 1 | -1} p={pose({lean: -0.2 * laugh, nod: -0.3 * laugh, a1: 1.6, a2: 0.1, b1: 0.8, b2: 1.6})} look={{color: '#121212', eyes: true}} t={t} />
                <Txt x={x} y={820 - laugh * 20} size={56} color="#ffe14d">HAHA</Txt>
              </g>
            );
          })}
        </Svg>
      )}
      <LightLeak t={t} a={0.2} />
    </AbsoluteFill>
  );
};

// ---------- 6. food: no cash, pay with your face, a printed burger ----------
export const FoodScene: React.FC<SP> = ({lt, m, t}) => {
  const scanning = lt > m.scan - 0.2 && lt < m.print - 0.1;
  const printing = lt > m.print - 0.1;
  const pp = clamp((lt - m.print) / 1.8);
  const layers = [['#e9a64a', 26, 260], ['#5a8f29', 12, 280], ['#ffcc33', 10, 270], ['#6b3a1e', 30, 250], ['#e9a64a', 40, 250]] as const;
  return (
    <AbsoluteFill style={{background: '#0a0f1f'}}>
      {!scanning && !printing ? (
        <Svg cam={[540, 760, 1.05]}>
          <rect x={-400} y={-400} width={1900} height={2700} fill="#0d1430" />
          <rect x={590} y={300} width={380} height={800} rx={30} fill="#141d45" stroke="#7df9ff" strokeWidth={5} />
          <Txt x={780} y={400} size={72} color="#ff7ab6" glow="#ff2d95">FOOD</Txt>
          {['BURGER', 'NOODLES', 'TACO'].map((w, i) => <Txt key={w} x={780} y={520 + i * 90} size={40} color="#7df9ff" weight={700}>{w}</Txt>)}
          <rect x={-400} y={1100} width={1900} height={900} fill="#070b18" />
          <Stick x={330} y={1100} s={2.2} f={1} p={pose({a1: 0.9, a2: 0.9, b1: 0.8, b2: 1.0, nod: 0.25})} look={HERO} look2={1} t={t} />
          <Txt x={330} y={640} size={64} color="#ffe14d" o={1 - k(lt, 1.4, 1.6)} s={1 + Math.sin(lt * 20) * 0.04}>grrrr…</Txt>
          {lt > m.cash ? [['💵', 300], ['💳', 780]].map(([e, x], i) => {
            const p = (lt - m.cash - i * 0.35) / 0.3;
            return (
              <g key={i} transform={`translate(${x} 560) scale(${back(p)})`}>
                <text x={0} y={40} textAnchor="middle" fontSize={150}>{e}</text>
                <path d="M -90 -60 L 90 120 M 90 -60 L -90 120" stroke="#ff2d2d" strokeWidth={22} strokeLinecap="round" opacity={k(lt, m.cash + 0.3 + i * 0.35, m.cash + 0.45 + i * 0.35)} />
              </g>
            );
          }) : null}
        </Svg>
      ) : scanning ? (
        <Svg>
          <rect x={-300} y={-300} width={1700} height={2500} fill="#081226" />
          <Face x={540} y={700} r={230} expr="confused" lx={0.2} />
          {/* face-scan grid */}
          {Array.from({length: 7}).map((_, i) => <line key={i} x1={300 + i * 80} y1={430} x2={300 + i * 80} y2={990} stroke="#7df9ff" strokeWidth={2} opacity={0.5} />)}
          <rect x={290} y={430 + ((lt * 600) % 560)} width={500} height={10} fill="#7df9ff" opacity={0.9} style={{filter: 'drop-shadow(0 0 12px #38e8ff)'}} />
          {[[300, 430], [780, 430], [300, 990], [780, 990]].map(([x, y], i) => <path key={i} d={`M ${x} ${y + (y > 600 ? -60 : 60)} L ${x} ${y} L ${x + (x > 500 ? -60 : 60)} ${y}`} stroke="#7df9ff" strokeWidth={10} fill="none" />)}
          {lt > m.scan + 1.0 ? <Txt x={540} y={260} size={90} color="#2bff88" glow="#00ff88" s={back((lt - m.scan - 1) / 0.3)}>PAID ✓</Txt> : null}
        </Svg>
      ) : (
        <Svg cam={[540, 700, 1.1]}>
          <rect x={-400} y={-400} width={1900} height={2700} fill="#0d1430" />
          <rect x={260} y={300} width={560} height={700} rx={30} fill="#1a2350" stroke="#7df9ff" strokeWidth={6} />
          <rect x={300} y={400} width={480} height={520} rx={14} fill="#0a0f24" />
          <rect x={300 + ((lt * 500) % 400)} y={420} width={60} height={40} rx={8} fill="#c9d1e3" />
          <line x1={330 + ((lt * 500) % 400)} y1={460} x2={330 + ((lt * 500) % 400)} y2={500} stroke="#ff7ab6" strokeWidth={6} />
          {layers.map(([c, h, w], i) => {
            const on = clamp(pp * layers.length - i);
            const y0 = 900 - layers.slice(0, i).reduce((a, q) => a + q[1], 0);
            return on > 0 ? <rect key={i} x={540 - (w * on) / 2} y={y0 - h} width={w * on} height={h} rx={i === 4 ? 30 : 8} fill={c} /> : null;
          })}
          <rect x={300} y={950} width={480 * pp} height={16} rx={8} fill="#2bff88" />
          <Txt x={540} y={240} size={64} color="#fff">{pp < 1 ? `PRINTING… ${Math.round(pp * 100)}%` : 'READY 🍔'}</Txt>
        </Svg>
      )}
      <LightLeak t={t} a={0.25} />
    </AbsoluteFill>
  );
};

// ---------- 7. news: you are on the giant hologram ----------
export const NewsScene: React.FC<SP> = ({lt, m, t}) => {
  const on = k(lt, 0.2, 0.7);
  const stare = k(lt, m.stare - 0.2, m.stare + 0.2);
  const zoom = k(lt, m.photo - 0.2, m.photo + 0.5) * (1 - k(lt, m.stare - 0.5, m.stare));
  const cam: [number, number, number] = [540, lerp(lerp(700, 560, zoom), 820, stare), lerp(lerp(1, 1.35, zoom), 1.15, stare)];
  const crowd = [[120, 1], [250, 1], [830, -1], [960, -1], [700, -1]] as const;
  return (
    <AbsoluteFill style={{background: '#090b1a'}}>
      <Svg cam={cam}>
        <defs><linearGradient id="dusk" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#120a35" /><stop offset="1" stopColor="#5a2a8a" /></linearGradient></defs>
        <rect x={-400} y={-400} width={1900} height={2700} fill="url(#dusk)" />
        <City base={1180} t={t} cars={0.8} drift={lt * 10} />
        {/* the hologram billboard */}
        <g opacity={on * (0.85 + 0.15 * Math.sin(t * 25))}>
          <path d="M 540 1180 L 160 820 L 920 820 Z" fill="#38e8ff" opacity={0.08} />
          <rect x={130} y={230} width={820} height={590} rx={24} fill="rgba(10,40,80,0.75)" stroke="#7df9ff" strokeWidth={6} />
          <rect x={130} y={230} width={820} height={80} rx={24} fill="#e63946" />
          <Txt x={540} y={290} size={52} color="#fff">BREAKING NEWS</Txt>
          {lt > m.headline - 0.1 ? <Txt x={540} y={400} size={50} color="#fff" o={k(lt, m.headline - 0.1, m.headline + 0.2)}>SLEEPER FROM 2025</Txt> : null}
          {lt > m.headline + 0.6 ? <Txt x={540} y={465} size={50} color="#7df9ff" o={k(lt, m.headline + 0.6, m.headline + 0.9)}>WAKES UP TODAY</Txt> : null}
          {lt > m.photo - 0.3 ? (
            <g>
              <rect x={410} y={500} width={260} height={290} rx={14} fill="#bfe9ff" />
              <Face x={540} y={625} r={70} expr="neutral" />
              <rect x={420} y={510} width={88} height={40} rx={8} fill="#e63946" />
              <Txt x={464} y={540} size={26} color="#fff">LIVE</Txt>
            </g>
          ) : null}
        </g>
        <rect x={-400} y={1180} width={1900} height={900} fill="#0b0d1e" />
        {/* the crowd turns to stare at you */}
        {crowd.map(([x, f], i) => (
          <Stick key={i} x={x} y={1180} s={1.75} f={(stare > 0.5 ? (x < 540 ? 1 : -1) : -1 * (x < 540 ? 1 : -1) * 1) as 1 | -1} p={pose({nod: -0.15 + stare * 0.1})} look={{color: '#2b2f4a', eyes: true}} look2={stare > 0.5 ? 1 : 0.5} t={t} />
        ))}
        <Stick x={540} y={1180} s={1.9} f={1} p={pose({a1: 0.5, a2: 1.2, b1: 0.4, b2: 1.3, nod: -0.2})} look={HERO} look2={stare > 0.5 ? -1 : 0.5} t={t} />
        {stare > 0 ? crowd.map(([x], i) => <Txt key={i} x={x} y={820 + (i % 2) * 30} size={60} o={stare}>👀</Txt>) : null}
      </Svg>
      <GlitchBars t={lt} amount={lt < 0.6 ? 1 - lt / 0.6 : lt > m.photo - 0.25 && lt < m.photo ? 0.8 : 0} />
      <LightLeak t={t} a={0.3} />
    </AbsoluteFill>
  );
};

// ---------- 8. twist: the old phone buzzes in its case ----------
export const TwistScene: React.FC<SP> = ({lt, m, t}) => {
  const buzz = (lt > 1.5 && lt < 2.4) || (lt > m.msg - 0.1 && lt < m.msg + 0.8);
  const close = k(lt, 2.3, m.msg - 0.2);
  const lit = lt > 1.5;
  const bx = buzz ? Math.sin(t * 90) * 8 : 0;
  return (
    <AbsoluteFill style={{background: '#05070f'}}>
      <Svg cam={[540, lerp(760, 640, close), lerp(1.0, 2.3, out(close))]}>
        <rect x={-400} y={-400} width={1900} height={2700} fill="#070a18" />
        <path d="M 540 -200 L 380 1000 L 700 1000 Z" fill="#9fd8ff" opacity={0.05} />
        <rect x={380} y={820} width={320} height={300} fill="#1a1730" />
        <rect x={360} y={420} width={360} height={370} rx={10} fill="rgba(180,230,255,0.06)" stroke="#5c7a99" strokeWidth={4} />
        <g transform={`translate(${540 + bx} 640)`}>
          <rect x={-60} y={-115} width={120} height={230} rx={22} fill="#111" stroke="#9aa4b2" strokeWidth={6} />
          <rect x={-48} y={-98} width={96} height={190} rx={12} fill={lit ? '#1b3a6b' : '#1d2433'} />
          {lit ? <rect x={-44} y={-62} width={88} height={74} rx={10} fill="#fff" opacity={0.92} /> : null}
          {lit ? <text x={0} y={-35} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={9.5} fill="#111">1 New Message</text> : null}
          {lt > m.from ? <text x={0} y={-15} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={11} fill="#e63946">From: ME</text> : null}
          {lt > m.date ? <text x={0} y={2} textAnchor="middle" fontFamily={MONT} fontWeight={700} fontSize={8} fill="#333">Sent: 31 Dec 2025</text> : null}
          {buzz ? [-1, 1].map((s) => <path key={s} d={`M ${s * 80} -60 q ${s * 14} 20 0 40 q ${s * -14} 20 0 40`} stroke="#7df9ff" strokeWidth={5} fill="none" />) : null}
        </g>
      </Svg>
      {lt > m.from ? (
        <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center'}}>
          <div style={{marginTop: 210, fontFamily: MONT, fontWeight: 900, fontSize: 96, color: '#ff3355', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', scale: String(back((lt - m.from) / 0.3))}}>FROM: YOU</div>
          {lt > m.date ? <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 70, color: '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', scale: String(back((lt - m.date) / 0.3))}}>SENT IN 2025</div> : null}
        </AbsoluteFill>
      ) : null}
      <GlitchBars t={lt} amount={lt > m.from - 0.05 && lt < m.from + 0.25 ? 1 : 0} />
    </AbsoluteFill>
  );
};

// ---------- 9. warning: "don't trust the robot", and it's behind you ----------
export const WarningScene: React.FC<SP> = ({lt, m, t}) => {
  const msg = "DON'T TRUST THE ROBOT.";
  const typed = msg.slice(0, Math.round(msg.length * clamp((lt - m.read + 0.1) / 1.0)));
  const behind = lt > m.behind;
  const red = k(lt, m.behind + 0.3, m.behind + 1.2);
  const flicker = behind ? (Math.sin(t * 37) > 0.7 ? 0.5 : 1) : 1;
  const expr: Expr = behind ? 'scared' : 'shock';
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {!behind ? (
        <Svg>
          <rect x={-300} y={-300} width={1700} height={2500} fill="#070a18" />
          <rect x={190} y={60} width={700} height={1080} rx={90} fill="#111" stroke="#9aa4b2" strokeWidth={14} />
          <rect x={220} y={90} width={640} height={1020} rx={70} fill="#0d1b33" />
          <Txt x={540} y={200} size={40} color="#9fb3cc" weight={700}>ME · 31 Dec 2025</Txt>
          <rect x={250} y={300} width={580} height={330} rx={40} fill="#e63946" opacity={typed.length ? 1 : 0} />
          <foreignObject x={270} y={320} width={540} height={300}>
            <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 74, lineHeight: 1.1, color: '#fff'}}>{typed}</div>
          </foreignObject>
        </Svg>
      ) : (
        <AbsoluteFill style={{opacity: flicker}}>
          <Svg cam={[540, 700, 1]}>
            <rect x={-300} y={-300} width={1700} height={2500} fill={`rgb(${lerp(8, 50, red)},${lerp(10, 4, red)},${lerp(24, 10, red)})`} />
            {/* the robot rises behind you, its eyes turn red */}
            <Robot x={760} y={lerp(1100, 540, out((lt - m.behind) / 0.8))} s={2.6} f={-1} eye={red > 0.5 ? '#ff2244' : '#38e8ff'} glow={1.5} />
            <Face x={360} y={860} r={210} expr={expr} lx={1} ly={-0.2} shake={4} />
          </Svg>
          {lt > m.behind + 2.6 ? (
            <AbsoluteFill style={{alignItems: 'center'}}>
              <div style={{marginTop: 200, padding: '0 70px', textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 70, lineHeight: 1.1, color: '#ff2244', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill'}}>"YOU WERE NOT SUPPOSED TO READ THAT."</div>
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      )}
      <GlitchBars t={lt} amount={lt > m.behind - 0.05 && lt < m.behind + 0.35 ? 1 : 0} />
    </AbsoluteFill>
  );
};

// ---------- 10. part two? ----------
export const CtaScene: React.FC<SP> = ({lt, m, t}) => {
  const press = k(lt, m.follow + 0.6, m.follow + 0.8) * (1 - k(lt, m.follow + 0.9, m.follow + 1.1));
  const followed = lt > m.follow + 0.85;
  return (
    <AbsoluteFill style={{background: '#050208', alignItems: 'center'}}>
      <Svg>
        <circle cx={500} cy={520} r={30} fill="#ff2244" opacity={0.5 + 0.5 * Math.sin(t * 3)} style={{filter: 'drop-shadow(0 0 30px #ff2244)'}} />
        <circle cx={580} cy={520} r={30} fill="#ff2244" opacity={0.5 + 0.5 * Math.sin(t * 3)} style={{filter: 'drop-shadow(0 0 30px #ff2244)'}} />
      </Svg>
      <div style={{marginTop: 690, fontFamily: MONT, fontWeight: 900, fontSize: 200, color: '#fff', textShadow: '6px 0 #ff2bd6, -6px 0 #00f0ff', scale: String(back(lt / 0.4))}}>PART 2?</div>
      <div style={{marginTop: 50, opacity: k(lt, m.follow - 0.2, m.follow + 0.1), scale: String(1 - press * 0.1), background: followed ? '#2b2f4a' : '#e63946', color: '#fff', fontFamily: MONT, fontWeight: 900, fontSize: 64, padding: '22px 70px', borderRadius: 999}}>{followed ? '✓ FOLLOWING' : '+ FOLLOW'}</div>
    </AbsoluteFill>
  );
};
