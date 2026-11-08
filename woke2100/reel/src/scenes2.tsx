// Episode 2: the escape. Every person is placed by `ground` (where the feet
// touch the floor), using the correctly proportioned build in character2.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MIRA, Person, Robot} from './character2';
import {City, GlitchBars, LightLeak, MONT, back, clamp, hash, k, lerp, out} from './kit';

type SP = {lt: number; m: Record<string, number>; t: number};

const Txt: React.FC<{x: number; y: number; size: number; color?: string; children: React.ReactNode; o?: number; s?: number; glow?: string; weight?: number}> = ({x, y, size, color = '#fff', children, o = 1, s = 1, glow, weight = 900}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={MONT} fontWeight={weight} fontSize={size} fill={color} opacity={o} transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`} style={glow ? {filter: `drop-shadow(0 0 16px ${glow})`} : undefined}>{children}</text>
);
const Cam: React.FC<{children: React.ReactNode; c?: [number, number, number]; shake?: number; t?: number}> = ({children, c = [540, 640, 1], shake = 0, t = 0}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
    <g transform={`translate(${540 - c[0] * c[2] + Math.sin(t * 61) * shake} ${640 - c[1] * c[2] + Math.cos(t * 47) * shake}) scale(${c[2]})`}>{children}</g>
  </svg>
);
let gid = 0;
const Sky: React.FC<{stops: string[]}> = ({stops}) => {
  const id = `s2sky${stops.join('').replace(/#/g, '')}`;
  return (
    <>
      <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1">{stops.map((c, i) => <stop key={i} offset={i / (stops.length - 1)} stopColor={c} />)}</linearGradient></defs>
      <rect x={-900} y={-900} width={2900} height={3800} fill={`url(#${id})`} />
    </>
  );
};
const Glow: React.FC<{x: number; y: number; r: number; c: string; o?: number}> = ({x, y, r, c, o = 1}) => {
  const id = `s2gl${c.replace('#', '')}`;
  return (
    <>
      <defs><radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity="0.9" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient></defs>
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} opacity={o} />
    </>
  );
};
void gid;
const Label: React.FC<{text: string; o: number}> = ({text, o}) => (o > 0 ? (
  <div style={{position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center', opacity: o}}>
    <span style={{fontFamily: MONT, fontWeight: 900, fontSize: 44, letterSpacing: 8, color: '#ff3355', background: 'rgba(0,0,0,0.6)', padding: '10px 30px', borderRadius: 12}}>{text}</span>
  </div>
) : null);

// ---------- props ----------
// a small hover-drone with one eye
const Drone: React.FC<{x: number; y: number; s: number; eye?: string; look?: number}> = ({x, y, s, eye = '#ff2244', look = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={36} rx={40} ry={9} fill={eye} opacity={0.35} />
    <ellipse cx={0} cy={0} rx={52} ry={34} fill="#d9dee9" />
    <ellipse cx={0} cy={8} rx={52} ry={20} fill="#9aa6bd" opacity={0.6} />
    <circle cx={look * 8} cy={-2} r={17} fill="#0b1020" />
    <circle cx={look * 10} cy={-2} r={9} fill={eye} />
    <rect x={-70} y={-6} width={22} height={8} rx={4} fill="#9aa6bd" />
    <rect x={48} y={-6} width={22} height={8} rx={4} fill="#9aa6bd" />
  </g>
);
// the hoverbike, front view; drawn over the riders' legs
const Bike: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 3) * 6}) scale(${s})`}>
    <ellipse cx={0} cy={150} rx={230} ry={36} fill="#ff4fd8" opacity={0.3} />
    <ellipse cx={0} cy={150} rx={120} ry={16} fill="#ffd6f5" opacity={0.7} />
    <path d="M -240 40 Q -250 -10 -170 -20 L 170 -20 Q 250 -10 240 40 Q 200 120 0 130 Q -200 120 -240 40 Z" fill="#1c1f3a" />
    <path d="M -200 30 Q 0 60 200 30" stroke="#ff4fd8" strokeWidth={8} fill="none" />
    <rect x={-60} y={-10} width={120} height={46} rx={18} fill="#2b2f55" />
    <circle cx={0} cy={14} r={18} fill="#fff6c4" />
    <path d="M -300 10 L -230 0 L -230 30 Z" fill="#2b2f55" />
    <path d="M 300 10 L 230 0 L 230 30 Z" fill="#2b2f55" />
  </g>
);

// =====================================================================
// 1. RECAP: previously... and the robot behind you
// =====================================================================
export const Recap: React.FC<SP> = ({lt, m, t}) => {
  if (lt < m.eyes) {
    const typed = "DON'T TRUST THE ROBOT.";
    return (
      <AbsoluteFill style={{background: '#05060f'}}>
        <Cam>
          <rect x={-900} y={-900} width={2900} height={3800} fill="#05060f" />
          <g transform="translate(540 160) scale(0.9) translate(-540 0)">
          <rect x={210} y={20} width={660} height={1040} rx={90} fill="#16181d" stroke="#8c94a3" strokeWidth={12} />
          <rect x={236} y={46} width={608} height={988} rx={70} fill="#0e1d38" />
          <Txt x={540} y={150} size={40} color="#8fa3c4" weight={700}>ME · 31 Dec 2025</Txt>
          <rect x={270} y={330} width={540} height={290} rx={40} fill="#e63946" />
          <foreignObject x={300} y={358} width={480} height={240}><div style={{fontFamily: MONT, fontWeight: 900, fontSize: 74, lineHeight: 1.05, color: '#fff'}}>{typed}</div></foreignObject>
          </g>
        </Cam>
        <Label text="PREVIOUSLY" o={k(lt, 0.1, 0.4)} />
      </AbsoluteFill>
    );
  }
  const bl = lt - m.eyes;
  const behind = lt > m.behind - 0.2;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Cam c={[540, 640, behind ? lerp(1.15, 1.0, out((lt - m.behind) / 1.2)) : 1.6]} shake={bl < 0.5 ? 7 : 2} t={t}>
        <Sky stops={['#2a0610', '#120308']} />
        <Glow x={700} y={380} r={520} c="#ff2244" o={0.4} />
        <Robot x={behind ? 720 : 540} y={behind ? 420 : 520} s={behind ? 1.25 : 1.7} t={t} mood="angry" armL={0.5} armR={0.5} />
        {behind ? <Person x={330} ground={1160} s={1.0} expr="scared" turn={0.75} look={[1, -0.2]} armL={[0.3, -0.5]} armR={[0.3, -0.5]} /> : null}
      </Cam>
      <GlitchBars t={lt} amount={bl < 0.3 || (lt > m.behind - 0.2 && lt < m.behind + 0.1) ? 1 : 0} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 2 + 3. THE CORRIDOR: you run, doors open ahead, the robot glides after
// =====================================================================
const VX = 540, VY = 520;
const Corridor: React.FC<{scroll: number; doorsOpen?: (i: number) => number}> = ({scroll, doorsOpen}) => (
  <g>
    <rect x={-900} y={-900} width={2900} height={3800} fill="#eef3fa" />
    {/* floor and ceiling planes */}
    <path d={`M -400 1500 L ${VX - 60} ${VY + 40} L ${VX + 60} ${VY + 40} L 1480 1500 Z`} fill="#d4dce8" />
    <path d={`M -400 -400 L ${VX - 60} ${VY - 60} L ${VX + 60} ${VY - 60} L 1480 -400 Z`} fill="#f7f9fd" />
    {/* side walls with doors receding */}
    {[-1, 1].map((sd) => <path key={sd} d={`M ${VX + sd * 60} ${VY - 60} L ${VX + sd * 1100} -400 L ${VX + sd * 1100} 1500 L ${VX + sd * 60} ${VY + 40} Z`} fill={sd < 0 ? '#e3e9f2' : '#dbe2ee'} />)}
    {Array.from({length: 7}).map((_, i) => {
      const z = ((i + scroll) % 7) / 7; // 0 far .. 1 near
      const p = Math.pow(z, 2.2);
      const x = lerp(60, 1000, p), top = lerp(VY - 60, -300, p), bot = lerp(VY + 40, 1400, p), w = lerp(20, 380, p);
      const open = doorsOpen ? doorsOpen(i) : 0;
      return (
        <g key={i} opacity={clamp(z * 3)}>
          {[-1, 1].map((sd) => (
            <g key={sd}>
              <path d={`M ${VX + sd * x} ${top + (bot - top) * 0.05} L ${VX + sd * (x + w)} ${lerp(top, top - 120 * p, 1) + (bot - top) * 0.05} L ${VX + sd * (x + w)} ${bot + 80 * p} L ${VX + sd * x} ${bot}`} fill="#9fb6d6" />
              <path d={`M ${VX + sd * x} ${top + (bot - top) * 0.05} L ${VX + sd * (x + w * (1 - open))} ${top + (bot - top) * 0.05 - 120 * p * (1 - open)} L ${VX + sd * (x + w * (1 - open))} ${bot + 80 * p * (1 - open)} L ${VX + sd * x} ${bot}`} fill="#ffffff" stroke="#b9c8de" strokeWidth={3} />
              <rect x={VX + sd * (x + w * 0.5) - 3} y={lerp(top, bot, 0.15)} width={6} height={(bot - top) * 0.1} fill="#3df0ff" opacity={0.7} />
            </g>
          ))}
          {/* ceiling light strip */}
          <rect x={VX - lerp(20, 300, p)} y={lerp(VY - 60, -360, p)} width={lerp(40, 600, p)} height={lerp(3, 26, p)} rx={8} fill="#bff3ff" />
          <line x1={VX - lerp(60, 1100, p)} y1={lerp(VY + 40, 1500, p)} x2={VX + lerp(60, 1100, p)} y2={lerp(VY + 40, 1500, p)} stroke="#c2ccdb" strokeWidth={3} />
        </g>
      );
    })}
    <Glow x={VX} y={VY} r={260} c="#ffffff" o={0.8} />
  </g>
);
export const RunScene: React.FC<SP> = ({lt, m, t}) => {
  const p = out(lt / 6);
  return (
    <AbsoluteFill>
      <Cam c={[540, 640, 1.0]}>
        <Corridor scroll={lt * 1.4} doorsOpen={(i) => (lt > m.doors - 0.3 ? clamp((Math.sin(i * 1.7 + lt * 2) + 1) / 1.2) : 0)} />
        <Person x={540 + Math.sin(lt * 5.5) * 6} ground={lerp(860, 1150, p)} s={lerp(0.55, 0.95, p)} expr="scared" walk={lt * 11} run look={[0, 0]} />
        {/* speed lines */}
        {Array.from({length: 14}).map((_, i) => {
          const a = hash(i) * 6.283, r0 = 300 + ((lt * 900 + i * 140) % 700);
          return <line key={i} x1={VX + Math.cos(a) * r0} y1={VY + Math.sin(a) * r0} x2={VX + Math.cos(a) * (r0 + 120)} y2={VY + Math.sin(a) * (r0 + 120)} stroke="#9fb6d6" strokeWidth={4} opacity={0.5} />;
        })}
      </Cam>
      <LightLeak t={t} a={0.15} />
    </AbsoluteFill>
  );
};
export const ChaseScene: React.FC<SP> = ({lt, m, t}) => {
  const near = k(lt, m.fast - 0.6, m.fast + 1.2);
  const lookBack = Math.sin(lt * 3) > 0.4;
  return (
    <AbsoluteFill>
      <Cam c={[540, 640, 1.0]} shake={near * 5} t={t}>
        <Corridor scroll={lt * 1.8} />
        <Glow x={770} y={500} r={lerp(120, 380, near)} c="#ff2244" o={0.4} />
        {/* the robot glides, it does not walk, and it is gaining */}
        <Robot x={lerp(760, 780, near) + Math.sin(lt * 1.3) * 30} y={lerp(470, 520, near)} s={lerp(0.32, 0.8, near)} t={t} mood="angry" armL={0.2} armR={0.2} />
        <Person x={420} ground={1150} s={0.95} expr="scared" walk={lt * 12} run turn={lookBack ? -0.8 : 0} look={lookBack ? [-1, -0.2] : [0, 0]} />
      </Cam>
      {lt > m.glide - 0.1 && lt < m.glide + 1.2 ? (
        <div style={{position: 'absolute', top: 230, left: 0, right: 0, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 90, color: '#ff3355', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', scale: String(back((lt - m.glide + 0.1) / 0.3))}}>IT GLIDES</div>
      ) : null}
    </AbsoluteFill>
  );
};

// =====================================================================
// 4. THE ELEVATOR: 300 floors in 4 seconds, the city falls past
// =====================================================================
export const LiftScene: React.FC<SP> = ({lt, m, t}) => {
  const going = k(lt, m.up - 0.3, m.up + 0.2);
  const floor = Math.round(lerp(1, 300, clamp((lt - m.up) / (m.secs - m.up + 0.9))));
  const doorClose = k(lt, 0.7, 1.4);
  const g = going * (1 - k(lt, m.secs + 0.8, m.secs + 1.3));
  return (
    <AbsoluteFill>
      <Cam c={[540, 640, 1.0]} shake={g * 6} t={t}>
        {/* through the glass back wall the city drops away */}
        <Sky stops={['#2b1466', '#b23a8f', '#ff8a5c']} />
        <g transform={`translate(0 ${going * ((lt - m.up) * 900)})`}>
          <City base={1300} t={t} cars={0.8} drift={0} />
          <g transform="translate(0 -1300)"><City base={1300} t={t} cars={0.8} drift={300} /></g>
          <g transform="translate(0 -2600)"><City base={1300} t={t} cars={0.8} drift={600} /></g>
          <g transform="translate(0 -3900)"><City base={1300} t={t} cars={0.8} drift={900} /></g>
          <g transform="translate(0 -5200)"><City base={1300} t={t} cars={0.8} drift={1200} /></g>
        </g>
        {/* the cabin: steel frame, rails, floor */}
        <rect x={60} y={60} width={960} height={1100} rx={20} fill="none" stroke="#2a2f45" strokeWidth={40} />
        <rect x={60} y={1160} width={960} height={500} fill="#1d2133" />
        <rect x={110} y={700} width={860} height={16} rx={8} fill="#c9d1e3" />
        <rect x={380} y={110} width={320} height={110} rx={18} fill="#0b1020" stroke="#3df0ff" strokeWidth={4} />
        <Txt x={540} y={192} size={74} color="#3df0ff" glow="#3df0ff">{lt < m.up - 0.3 ? 'FL 1' : `FL ${floor}`}</Txt>
        <g transform={`translate(0 ${g * 18}) scale(1 ${1 - g * 0.035})`} style={{transformOrigin: '540px 1160px'}}>
          <Person x={540} ground={1160} s={0.98} expr={going > 0.5 ? 'shock' : 'worried'} armL={[1.15, 0.35]} armR={[1.15, 0.35]} look={[0, -0.6]} />
        </g>
        {/* the doors close in front of you first */}
        <rect x={60 - 480 * (1 - doorClose)} y={60} width={480} height={1600} fill="#8f9bb5" opacity={doorClose < 0.98 ? 1 : 0} />
        <rect x={540 + 480 * (1 - doorClose)} y={60} width={480} height={1600} fill="#8f9bb5" opacity={doorClose < 0.98 ? 1 : 0} />
      </Cam>
      {lt > m.secs - 0.2 ? <div style={{position: 'absolute', top: 260, left: 0, right: 0, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 96, color: '#ffe14d', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', scale: String(back((lt - m.secs + 0.2) / 0.3))}}>4 SECONDS!</div> : null}
    </AbsoluteFill>
  );
};

// =====================================================================
// 5. THE ROOF: a rooftop garden and a girl on a hoverbike
// =====================================================================
const Roof: React.FC<{t: number}> = ({t}) => (
  <g>
    <Sky stops={['#2b1466', '#c2408f', '#ff9a5a', '#ffd08a']} />
    <Glow x={760} y={780} r={420} c="#fff1c4" o={0.8} />
    <g opacity={0.9}><City base={1000} t={t} cars={1} drift={t * 8} /></g>
    {/* the roof garden */}
    <rect x={-900} y={1000} width={2900} height={900} fill="#2c3550" />
    <rect x={-900} y={1000} width={2900} height={14} fill="#8e9ac0" />
    {[[-40, 960, 110], [90, 980, 80], [990, 970, 100], [1110, 950, 120]].map(([x, y, r], i) => (
      <g key={i}>
        <rect x={x - 10} y={y} width={20} height={60} fill="#5a3a25" />
        <circle cx={x} cy={y - r * 0.4} r={r} fill={i % 2 ? '#2fbf71' : '#22a35f'} />
        <circle cx={x + r * 0.4} cy={y - r * 0.7} r={r * 0.6} fill="#3fd486" />
      </g>
    ))}
    <rect x={-900} y={1000} width={2900} height={40} fill="#1f2740" />
  </g>
);
export const RoofScene: React.FC<SP> = ({lt, m, t}) => {
  const doors = k(lt, 0.1, 0.8);
  const step = out(clamp((lt - 0.9) / 1.6));
  const girl = k(lt, m.girl - 0.4, m.girl + 0.2);
  const line = lt - (9.27 - 4.05);
  const talking = line > 0 && line < 3.3;
  const bubbleText = 'Sleeper #8214? Get on. NOW!';
  return (
    <AbsoluteFill>
      <Cam c={[540, 640, 1.0]}>
        <Roof t={t} />
        {/* elevator doors at the left */}
        <rect x={-80} y={300} width={360} height={740} fill="#1d2133" />
        <rect x={-80 - 170 * doors} y={300} width={180} height={740} fill="#8f9bb5" />
        <rect x={100 + 170 * doors} y={300} width={180} height={740} fill="#8f9bb5" opacity={1 - doors * 0.9} />
        <Person x={lerp(100, 330, step)} ground={1040} s={0.78} expr={girl > 0.5 ? 'wonder' : 'worried'} walk={step < 0.98 && lt > 0.9 ? lt * 9 : undefined} turn={girl > 0.5 ? 0.6 : 0} look={girl > 0.5 ? [1, 0] : [0, 0]} />
        {/* Mira on her hoverbike */}
        <g opacity={girl} transform={`translate(${(1 - girl) * 300} 0)`}>
          <Person x={790} y={560} s={0.78} part="bust" extend={false} p={MIRA} hair="pony" expr={talking ? (Math.floor(line * 8) % 2 ? 'wonder' : 'smile') : 'smile'} turn={-0.5} look={[-1, 0]} armL={talking ? [2.4, 0.3] : [0.9, 0.5]} armR={[0.9, 0.5]} />
          <Bike x={790} y={738} s={0.62} t={t} />
        </g>
        {talking ? (
          <g transform={`translate(700 330) scale(${back(line / 0.25)})`}>
            <rect x={-330} y={-70} width={660} height={140} rx={40} fill="#fff" stroke="#ff4fd8" strokeWidth={5} />
            <path d="M 120 66 l 40 60 l -2 -62 Z" fill="#fff" />
            <text x={0} y={16} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={44} fill="#1c1f3a">{bubbleText.slice(0, Math.round(bubbleText.length * clamp(line / 2.4)))}</text>
          </g>
        ) : null}
      </Cam>
      <LightLeak t={t} a={0.35} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 6. THE FLIGHT: off the edge and over the city; the robot stops
// =====================================================================
const Riders: React.FC<{x: number; y: number; s: number; t: number; mira?: 'talk' | 'look' | 'front'; you?: 'scared' | 'wonder' | 'shock' | 'worried'; turnYou?: number}> = ({x, y, s, t, mira = 'front', you = 'wonder', turnYou = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* you sit behind her, a little higher; she drives */}
    {/* seated: the bike hides everything below the waist */}
    <Person x={-80} y={-390} s={0.9} part="bust" extend={false} expr={you} turn={turnYou} look={[turnYou, 0]} armL={[0.5, 0.4]} armR={[0.9, -0.6]} />
    <Person x={70} y={-330} s={0.9} part="bust" extend={false} p={MIRA} hair="pony" expr={mira === 'talk' ? (Math.floor(t * 8) % 2 ? 'wonder' : 'smile') : 'smile'} turn={mira === 'front' ? 0 : -0.7} look={mira === 'front' ? [0, 0] : [-1, 0]} armL={[0.75, 0.2]} armR={[0.75, 0.2]} />
    <Bike x={0} y={-170} s={1.05} t={t} />
  </g>
);
export const FlyScene: React.FC<SP> = ({lt, m, t}) => {
  if (lt > m.stop - 0.2) {
    const sl = lt - m.stop + 0.2;
    return (
      <AbsoluteFill>
        <Cam c={[540, 640, lerp(1.2, 1.0, out(sl / 1.5))]}>
          <Roof t={t} />
          <Robot x={540} y={560} s={1.05} t={t} mood="angry" armL={0.3} armR={0.3} />
          {/* the bike, tiny, flying away */}
          <g transform={`translate(${880 + sl * 30} ${330 - sl * 20}) scale(0.12)`}><Riders x={0} y={0} s={1} t={t} /></g>
        </Cam>
        <LightLeak t={t} a={0.3} />
      </AbsoluteFill>
    );
  }
  const drop = k(lt, m.drop - 0.2, m.drop + 0.6) * (1 - k(lt, m.drop + 0.6, m.drop + 1.6));
  const x = lerp(-200, 1300, clamp((lt - m.drop + 0.3) / 4.8));
  return (
    <AbsoluteFill>
      <Cam c={[540, 640, 1.0]} shake={drop * 6} t={t}>
        <Sky stops={['#2b1466', '#c2408f', '#ff9a5a', '#ffd08a']} />
        <Glow x={540} y={900} r={480} c="#fff1c4" o={0.8} />
        <City base={1350} t={t} cars={1} drift={lt * 120} />
        {/* wind lines */}
        {Array.from({length: 10}).map((_, i) => <rect key={i} x={((-lt * 1800 + i * 300) % 1400) + 1200} y={200 + i * 90} width={160} height={4} rx={2} fill="#fff" opacity={0.35} />)}
        {lt < m.drop - 0.2 ? (
          <g>
            <rect x={-900} y={1000} width={1700} height={900} fill="#2c3550" />
            <Riders x={540} y={900} s={0.75} t={t} you="worried" />
          </g>
        ) : (
          <Riders x={x} y={lerp(700, 640, k(lt, m.drop + 0.6, m.drop + 1.6)) + drop * 280} s={0.6} t={t} you={lt > m.city ? 'wonder' : 'shock'} />
        )}
      </Cam>
      <LightLeak t={t} a={0.35} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 7 + 8. THE TRUTH and THE LIST
// =====================================================================
const List: React.FC<{hi: number; t: number}> = ({hi, t}) => {
  const rows: [string, string, boolean][] = [['#8101', 'UPDATED', false], ['#8150', 'UPDATED', false], ['#8177', 'UPDATED', false], ['#8199', 'UPDATED', false], ['#8214', 'UPDATE: TONIGHT', true]];
  return (
    <g>
      <rect x={150} y={150} width={780} height={640} rx={30} fill="rgba(40,10,60,0.75)" stroke="#ff4fd8" strokeWidth={5} />
      <Txt x={540} y={230} size={46} color="#ff9ae8" weight={700}>SLEEPERS · STATUS</Txt>
      {rows.map(([id, st, me], i) => (
        <g key={id}>
          <rect x={190} y={270 + i * 100} width={700} height={80} rx={14} fill={me ? `rgba(255,34,68,${0.35 + 0.35 * hi * (0.5 + 0.5 * Math.sin(t * 10))})` : 'rgba(255,255,255,0.06)'} />
          <text x={220} y={324 + i * 100} fontFamily={MONT} fontWeight={900} fontSize={44} fill={me ? '#fff' : '#b9b0d6'}>{id}</text>
          <text x={860} y={324 + i * 100} textAnchor="end" fontFamily={MONT} fontWeight={900} fontSize={me ? 40 : 36} fill={me ? '#ffe14d' : '#7f77a8'}>{st}</text>
        </g>
      ))}
    </g>
  );
};
export const TruthScene: React.FC<SP> = ({lt, m, t}) => {
  const listOn = k(lt, m.list - 0.3, m.list + 0.2);
  const erase = k(lt, m.erase - 0.3, m.erase + 0.1) * (1 - k(lt, m.list - 0.6, m.list - 0.3));
  const pr = clamp((lt - m.erase) / 2.2);
  return (
    <AbsoluteFill>
      <Cam c={[540, 640, 1.0]}>
        <Sky stops={['#1d0f4a', '#7a2f8f', '#e0708a']} />
        <City base={1200} t={t} cars={1} drift={lt * 160} />
        {Array.from({length: 10}).map((_, i) => <rect key={i} x={((-lt * 1800 + i * 300) % 1400) + 1200} y={200 + i * 90} width={160} height={4} rx={2} fill="#fff" opacity={0.3} />)}
        <Riders x={540} y={1150} s={0.85} t={t} mira={lt < m.list ? 'talk' : 'look'} you={erase > 0.5 ? 'shock' : 'worried'} turnYou={0.6} />
        {erase > 0 ? (
          <g opacity={erase}>
            <rect x={240} y={130} width={600} height={300} rx={30} fill="rgba(40,10,60,0.75)" stroke="#ff4fd8" strokeWidth={5} />
            {/* a memory being wiped: bar emptying */}
            <Txt x={540} y={220} size={50} color="#ff9ae8">MEMORY</Txt>
            <rect x={300} y={270} width={480} height={50} rx={25} fill="#2a1840" />
            <rect x={300} y={270} width={480 * (1 - pr)} height={50} rx={25} fill="#ff4fd8" />
            <Txt x={540} y={390} size={46} color="#fff">ERASING… {Math.round((1 - pr) * 100)}%</Txt>
          </g>
        ) : null}
        {listOn > 0 ? <g opacity={listOn} transform={`translate(540 380) scale(${0.45 + listOn * 0.25}) translate(-540 -470)`}><List hi={0} t={t} /></g> : null}
      </Cam>
      <LightLeak t={t} a={0.3} />
    </AbsoluteFill>
  );
};
export const NameScene: React.FC<SP> = ({lt, m, t}) => {
  if (lt < m.tonight + 0.9) {
    const z = out(clamp(lt / 1.6));
    return (
      <AbsoluteFill style={{background: '#12082a'}}>
        <Cam c={[540, lerp(470, 670, z), lerp(1.0, 1.6, z)]}>
          <Sky stops={['#1d0f4a', '#3a1658']} />
          <List hi={k(lt, m.tonight - 0.2, m.tonight)} t={t} />
        </Cam>
        <GlitchBars t={lt} amount={lt > m.tonight - 0.05 && lt < m.tonight + 0.3 ? 1 : 0} />
      </AbsoluteFill>
    );
  }
  const sl = lt - m.tonight - 0.9;
  return (
    <AbsoluteFill>
      <Cam c={[540, 640, lerp(1.25, 1.0, out(sl / 0.5))]} shake={4} t={t}>
        <Sky stops={['#1d0f4a', '#7a2f8f']} />
        <Glow x={540} y={520} r={500} c="#ff2244" o={0.35} />
        {/* close-up: the whole body, cropped by the frame */}
        <Person x={540} ground={2050} s={2.0} expr="shock" look={[0, -0.2]} />
        <Txt x={540} y={240} size={120} color="#ff3355" glow="#000" s={back(sl / 0.3)}>TONIGHT?!</Txt>
      </Cam>
    </AbsoluteFill>
  );
};

// =====================================================================
// 9. THE DRONES: the sky turns red
// =====================================================================
export const DronesScene: React.FC<SP> = ({lt, m, t}) => {
  const red = k(lt, 0.2, 1.4);
  const rise = clamp((lt - m.many + 0.5) / 2.5);
  const all = k(lt, m.all - 0.2, m.all + 0.3);
  return (
    <AbsoluteFill>
      <Cam c={[540, 640, lerp(1.0, 1.12, k(lt, m.all, m.all + 2))]} shake={all * 3} t={t}>
        <Sky stops={[red > 0.5 ? '#3a0410' : '#1d0f4a', red > 0.5 ? '#8a0f24' : '#7a2f8f', red > 0.5 ? '#ff4d3d' : '#e0708a']} />
        <rect x={-900} y={-900} width={2900} height={3800} fill="#ff1a3a" opacity={0.18 * red} />
        <City base={1350} t={t} cars={0} drift={0} />
        {/* hundreds of drones rising from the city */}
        {Array.from({length: 120}).map((_, i) => {
          const x = hash(i) * 1200 - 60, sp = 0.6 + hash(i * 3) * 0.8, depth = 0.25 + hash(i * 7) * 0.55;
          const y = 1350 - rise * sp * 1300 * depth * 1.6 - hash(i * 11) * 300 * rise;
          return y < 1350 ? <Drone key={i} x={x + Math.sin(t * 2 + i) * 10} y={y} s={depth * 0.55} look={all > 0.5 ? (540 - x) / 600 : 0} /> : null;
        })}
        <Riders x={540} y={1080} s={0.85} t={t} mira="look" you="scared" turnYou={-0.3} />
        {all > 0 ? [[220, 420], [860, 380], [540, 230]].map(([x, y], i) => <Drone key={`b${i}`} x={x} y={y + Math.sin(t * 2 + i) * 12} s={1.3 * all} look={(540 - x) / 400} />) : null}
      </Cam>
      <LightLeak t={t} a={0.2} />
    </AbsoluteFill>
  );
};

// =====================================================================
// 10. PART 3?
// =====================================================================
export const Cta2Scene: React.FC<SP> = ({lt, m, t}) => {
  const press = k(lt, m.sub + 0.6, m.sub + 0.8) * (1 - k(lt, m.sub + 0.9, m.sub + 1.1));
  const done = lt > m.sub + 0.85;
  return (
    <AbsoluteFill style={{background: '#0a0207', alignItems: 'center'}}>
      <Cam c={[540, 640, 1]}>
        <Glow x={540} y={420} r={460} c="#ff2244" o={0.3} />
        {[[300, 300], [780, 330], [540, 470]].map(([x, y], i) => <Drone key={i} x={x} y={y + Math.sin(t * 2 + i) * 14} s={1.4} />)}
      </Cam>
      <div style={{marginTop: 860, fontFamily: MONT, fontWeight: 900, fontSize: 190, color: '#fff', textShadow: '6px 0 #ff2bd6, -6px 0 #00f0ff', scale: String(back(lt / 0.4))}}>PART 3?</div>
      <div style={{marginTop: 30, opacity: k(lt, m.sub - 0.2, m.sub + 0.1), scale: String(1 - press * 0.1), background: done ? '#3a3a3a' : '#ff0033', color: '#fff', fontFamily: MONT, fontWeight: 900, fontSize: 64, padding: '22px 70px', borderRadius: 999}}>{done ? '✓ SUBSCRIBED' : 'SUBSCRIBE'}</div>
    </AbsoluteFill>
  );
};
