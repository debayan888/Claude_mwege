// Episode 2 build: realistic cartoon proportions (about 4.6 heads tall,
// legs half the height, hands at mid-thigh). Place people with `ground`, the
// y where their feet touch the floor.
// Illustrated characters in a flat-vector style: the hero ("you"), extras
// built from the same template, and the robot. Everything is drawn in a local
// space where (0, 0) is the base of the neck and 1 unit is 1 px at s = 1.
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

export type Expr = 'neutral' | 'sleepy' | 'shock' | 'scared' | 'confused' | 'smile' | 'wonder' | 'worried' | 'laugh';
export type Palette = {skin: string; skinShade: string; hair: string; hairHi: string; top: string; topShade: string; legs: string; iris: string; scarf?: string; visor?: string; outfit?: 'hoodie' | 'future'; accent?: string; lashes?: boolean};

export const HERO_P: Palette = {skin: '#f2c4a0', skinShade: '#dba27f', hair: '#3a2417', hairHi: '#5c3a25', top: '#8e96a3', topShade: '#727a87', legs: '#2f3f63', iris: '#6b4226', scarf: '#e63946'};
export const KID_A: Palette = {skin: '#c98f6b', skinShade: '#ad7553', hair: '#1d1b2e', hairHi: '#3a3760', top: '#7c5cff', topShade: '#5f43d6', legs: '#2a2650', iris: '#3a2a1c', visor: '#38e8ff', outfit: 'future', accent: '#38e8ff'};
export const KID_B: Palette = {skin: '#f6d3b8', skinShade: '#e0b090', hair: '#e8a33d', hairHi: '#f6c46a', top: '#16c7a5', topShade: '#0f9e83', legs: '#203a4a', iris: '#2b5d8a', visor: '#ff7ab6', outfit: 'future', accent: '#ff7ab6'};

export const FEET = 668; // neck base to the sole of the shoe, at s = 1
export const MIRA: Palette = {skin: '#a8714f', skinShade: '#8c5a3c', hair: '#c9d6ff', hairHi: '#ffffff', top: '#1c1f3a', topShade: '#12152b', legs: '#1c1f3a', iris: '#2a1a10', outfit: 'future', accent: '#ff4fd8', lashes: true};
export type PersonProps = {
  x: number; y?: number; ground?: number; s: number; run?: boolean;
  p?: Palette;
  view?: 'front' | 'back';
  part?: 'full' | 'bust' | 'head';
  expr?: Expr;
  turn?: number; // -1 .. 1, head turned toward screen left/right
  tilt?: number; // head tilt, degrees
  look?: [number, number]; // pupils, -1 .. 1
  blink?: number; // 0 open .. 1 closed
  armL?: [number, number]; // shoulder and elbow angle (radians from down, + outward)
  armR?: [number, number];
  bob?: number; // body bob in px
  hair?: 'messy' | 'bun' | 'short' | 'pony';
  rim?: string; // rim-light colour
  extend?: boolean; // bust: false keeps the cut at the waist (inside the pod)
  walk?: number; // walk-cycle phase in radians; legs and arms move when set
};

const BROWS: Record<Expr, [number, number]> = {neutral: [0, 0], sleepy: [2, 0], shock: [-14, 0], scared: [-8, 0.35], confused: [-10, -0.3], smile: [-3, 0], wonder: [-12, 0], worried: [-6, 0.3], laugh: [-5, 0]};

function mouth(e: Expr, c: string) {
  switch (e) {
    case 'shock': return <ellipse cx={0} cy={-52} rx={11} ry={15} fill="#5a1e25" />;
    case 'wonder': return <path d="M -14 -58 Q 0 -36 14 -58 Z" fill="#5a1e25" />;
    case 'laugh': return <path d="M -20 -60 Q 0 -30 20 -60 Z" fill="#5a1e25" stroke="#fff" strokeWidth={0} />;
    case 'smile': return <path d="M -16 -60 Q 0 -46 16 -60" stroke={c} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    case 'scared': return <path d="M -16 -54 q 5.3 -6 10.6 0 q 5.3 6 10.6 0 q 5.3 -6 10.6 0" stroke={c} strokeWidth={4} fill="none" strokeLinecap="round" />;
    case 'worried': return <path d="M -13 -52 Q 0 -60 13 -52" stroke={c} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    case 'confused': return <path d="M -14 -56 L 12 -60" stroke={c} strokeWidth={4.5} strokeLinecap="round" />;
    case 'sleepy': return <path d="M -8 -57 Q 0 -53 8 -57" stroke={c} strokeWidth={4} fill="none" strokeLinecap="round" />;
    default: return <path d="M -12 -57 Q 0 -53 12 -57" stroke={c} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  }
}

const HEAD = 'M -60 -128 C -62 -66 -32 -30 0 -28 C 32 -30 62 -66 60 -128 C 58 -192 -58 -192 -60 -128 Z';

export const Head: React.FC<Omit<PersonProps, 'x' | 'y' | 's' | 'ground'>> = ({p = HERO_P, view = 'front', expr = 'neutral', turn = 0, look = [0, 0], blink = 0, hair = 'messy'}) => {
  const dx = turn * 12;
  const lid = Math.max(blink, expr === 'sleepy' ? 0.55 : 0);
  const big = expr === 'shock' || expr === 'scared' || expr === 'wonder';
  const [raise, slant] = BROWS[expr];
  if (view === 'back') {
    return (
      <g>
        <ellipse cx={-62} cy={-108} rx={11} ry={17} fill={p.skinShade} />
        <ellipse cx={62} cy={-108} rx={11} ry={17} fill={p.skinShade} />
        <path d={HEAD} fill={p.hair} />
        <path d="M -40 -170 Q 0 -196 40 -170" stroke={p.hairHi} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M -52 -60 Q 0 -30 52 -60 L 50 -50 Q 0 -20 -50 -50 Z" fill={p.hair} />
      </g>
    );
  }
  return (
    <g>
      {/* ears */}
      <ellipse cx={-61 + dx * 0.4} cy={-106} rx={11 - turn * 3} ry={17} fill={p.skinShade} />
      <ellipse cx={61 + dx * 0.4} cy={-106} rx={11 + turn * 3} ry={17} fill={p.skinShade} />
      {/* head with a soft shadow on one side */}
      <path d={HEAD} fill={p.skin} />
      <path d="M 20 -32 C 50 -44 62 -80 60 -128 C 60 -150 52 -170 40 -180 C 52 -140 50 -70 20 -32 Z" fill={p.skinShade} opacity={0.55} transform={`translate(${-dx * 0.3} 0)`} />
      <g transform={`translate(${dx} 0)`}>
        {/* blush */}
        <ellipse cx={-36} cy={-70} rx={11} ry={6} fill="#ff8f8f" opacity={0.28} />
        <ellipse cx={36} cy={-70} rx={11} ry={6} fill="#ff8f8f" opacity={0.28} />
        {/* eyes */}
        {[-1, 1].map((sd) => {
          const ex = sd * 24, ey = -100, ry = big ? 17 : 15, rx = big ? 14 : 13;
          return (
            <g key={sd}>
              <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#fff" />
              {p.visor ? null : (
                <>
                  <circle cx={ex + look[0] * 5} cy={ey + look[1] * 5 + 1} r={big ? 7.5 : 9} fill={p.iris} />
                  <circle cx={ex + look[0] * 5} cy={ey + look[1] * 5 + 1} r={big ? 3.6 : 5} fill="#120c08" />
                  <circle cx={ex + look[0] * 5 + 3} cy={ey + look[1] * 5 - 3} r={2.8} fill="#fff" />
                </>
              )}
              {/* upper eyelid */}
              {lid > 0 ? <rect x={ex - rx - 2} y={ey - ry - 2} width={rx * 2 + 4} height={(ry * 2 + 4) * lid} fill={p.skin} /> : null}
              <path d={`M ${ex - rx} ${ey - ry * (1 - 2 * lid) + 1} Q ${ex} ${ey - ry * (1 - 2 * lid) - (lid > 0.9 ? -4 : 5)} ${ex + rx} ${ey - ry * (1 - 2 * lid) + 1}`} stroke="#2a1a12" strokeWidth={3.5} fill="none" strokeLinecap="round" />
              {p.lashes ? <path d={`M ${ex + sd * rx * 0.6} ${ey - ry + 2} l ${sd * 9} -8 M ${ex + sd * rx * 0.95} ${ey - ry * 0.6} l ${sd * 9} -5`} stroke="#1a1010" strokeWidth={3.5} strokeLinecap="round" /> : null}
              {/* eyebrow */}
              <path d={`M ${ex - 14} ${-128 + raise - sd * slant * -8} L ${ex + 14} ${-128 + raise + sd * slant * -8}`} transform={`rotate(${sd * slant * 18} ${ex} ${-128 + raise})`} stroke={p.hair} strokeWidth={6.5} strokeLinecap="round" />
            </g>
          );
        })}
        {p.visor ? <rect x={-48} y={-114} width={96} height={26} rx={13} fill={p.visor} opacity={0.85} /> : null}
        {/* nose and mouth */}
        <path d="M -3 -88 Q 7 -78 -2 -72" stroke={p.skinShade} strokeWidth={4} fill="none" strokeLinecap="round" />
        {mouth(expr, '#7a3b2e')}
      </g>
      {/* hair */}
      {hair === 'messy' ? (
        <g transform={`translate(${dx * 0.4} 0)`}>
          <path d="M -66 -118 C -76 -192 -20 -214 10 -208 C 64 -206 80 -160 66 -116 L 60 -142 L 48 -128 L 42 -152 L 24 -136 L 12 -160 L -6 -140 L -24 -158 L -38 -136 L -52 -152 L -58 -124 Z" fill={p.hair} />
          <path d="M -30 -186 Q 8 -202 40 -184" stroke={p.hairHi} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M -50 -170 Q -40 -188 -20 -194" stroke={p.hairHi} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      ) : hair === 'pony' ? (
        <g>
          <path d="M 50 -150 Q 120 -140 110 -40 Q 100 20 70 40 Q 90 -40 60 -120 Z" fill={p.hair} />
          <path d="M -64 -118 C -72 -200 72 -200 64 -118 L 58 -150 Q 10 -130 -30 -168 Q -50 -140 -60 -120 Z" fill={p.hair} />
          <path d="M -30 -184 Q 0 -196 30 -184" stroke={p.hairHi} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} />
        </g>
      ) : hair === 'bun' ? (
        <g>
          <circle cx={0} cy={-200} r={26} fill={p.hair} />
          <path d="M -64 -120 C -70 -196 70 -196 64 -120 C 50 -160 -50 -160 -64 -120 Z" fill={p.hair} />
          <path d="M -30 -178 Q 0 -190 30 -178" stroke={p.hairHi} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d="M -64 -118 C -70 -200 70 -200 64 -118 L 56 -146 Q 0 -168 -56 -146 Z" fill={p.hair} />
          <path d="M -30 -180 Q 0 -192 30 -180" stroke={p.hairHi} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

function armPts(side: number, a1: number, a2: number): [number, number][] {
  const sh: [number, number] = [side * 80, 22];
  const d = (a: number): [number, number] => [side * Math.sin(a), Math.cos(a)];
  const e: [number, number] = [sh[0] + d(a1)[0] * 122, sh[1] + d(a1)[1] * 122];
  const w: [number, number] = [e[0] + d(a1 + a2)[0] * 112, e[1] + d(a1 + a2)[1] * 112];
  return [sh, e, w];
}

export const Person: React.FC<PersonProps> = (props0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tt = frame / fps;
  // alive when idle: a blink every few seconds and a gentle breath
  const seed = (props0.x * 7.3 + (props0.ground ?? props0.y ?? 0) * 1.7) % 3.1;
  const autoBlink = (tt + seed) % 3.4 < 0.13 ? 1 : 0;
  const props = {...props0, blink: props0.blink ?? (props0.expr === 'sleepy' ? undefined : autoBlink)};
  const {x, s, p = HERO_P, view = 'front', tilt = 0, rim, extend = true, walk, run} = props;
  const y = props.ground !== undefined ? props.ground - FEET * s : props.y ?? 0;
  // a close-up is the whole, correctly proportioned body, cropped by the frame
  const part = props.part === 'bust' && extend ? 'full' : props.part ?? 'full';
  // front-view walk: knees lift in turn, arms swing against the legs
  const w = walk ?? 0, walking = walk !== undefined;
  const liftL = walking ? Math.max(0, Math.sin(w)) : 0, liftR = walking ? Math.max(0, -Math.sin(w)) : 0;
  const armL = walking ? (run ? [0.45, -2.35 - 0.35 * Math.sin(w)] : [0.14 + Math.sin(w) * 0.16, 0.25 + liftR * 0.3]) as [number, number] : props.armL ?? [0.18, 0.1];
  const armR = walking ? (run ? [0.45, -2.35 + 0.35 * Math.sin(w)] : [0.14 - Math.sin(w) * 0.16, 0.25 + liftL * 0.3]) as [number, number] : props.armR ?? [0.18, 0.1];
  const gait = run ? 1.8 : 1;
  const bob = (props.bob ?? 0) + Math.sin(tt * 2.1 + seed) * 2.2 + 0;
  const fut = p.outfit === 'future';
  const acc = p.accent ?? '#38e8ff';
  const arms = ([[-1, armL], [1, armR]] as const).map(([sd, a]) => [sd, armPts(sd, a[0], a[1])] as const);
  const limb = (pts: [number, number][], w1: number, w2: number, col: string) => (
    <g>
      <line x1={pts[0][0]} y1={pts[0][1]} x2={pts[1][0]} y2={pts[1][1]} stroke={col} strokeWidth={w1} strokeLinecap="round" />
      <line x1={pts[1][0]} y1={pts[1][1]} x2={pts[2][0]} y2={pts[2][1]} stroke={col} strokeWidth={w2} strokeLinecap="round" />
    </g>
  );
  const hands = arms.map(([sd, pts]) => (
    <g key={`h${sd}`}>
      {p.outfit === 'future' ? <circle cx={pts[2][0] - (pts[2][0] - pts[1][0]) * 0.22} cy={pts[2][1] - (pts[2][1] - pts[1][1]) * 0.22} r={19} fill={p.accent ?? '#38e8ff'} opacity={0.9} /> : null}
      <circle cx={pts[2][0]} cy={pts[2][1]} r={19} fill={p.skin} />
      <ellipse cx={pts[2][0] - sd * 14} cy={pts[2][1] - 6} rx={7} ry={11} fill={p.skin} transform={`rotate(${sd * 30} ${pts[2][0] - sd * 14} ${pts[2][1] - 6})`} />
    </g>
  ));
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`} style={rim ? {filter: `drop-shadow(0 0 ${6 / s}px ${rim})`} : undefined}>
      {part === 'full' ? (
        <g>
          <ellipse cx={0} cy={FEET + 2} rx={120} ry={18} fill="#000" opacity={0.25} />
          {/* pelvis, then each leg from hip to knee to ankle */}
          <rect x={-66} y={214} width={132} height={52} rx={22} fill={p.legs} />
          {([[-1, liftL], [1, liftR]] as const).map(([sd, lift]) => {
            const hx = sd * 34, hy = 240;
            const kx = sd * 34, ky = 450 - lift * 34 * gait, ax = sd * 36, ay = 652 - lift * 70 * gait;
            return (
              <g key={sd}>
                <line x1={hx} y1={hy} x2={kx} y2={ky} stroke={p.legs} strokeWidth={56} strokeLinecap="round" />
                <line x1={kx} y1={ky} x2={ax} y2={ay} stroke={p.legs} strokeWidth={50} strokeLinecap="round" />
                {sd > 0 ? <line x1={kx + 14} y1={ky} x2={ax + 14} y2={ay} stroke="#000" strokeWidth={14} opacity={0.12} strokeLinecap="round" /> : null}
                {fut ? (
                  <g>
                    <rect x={kx - 22} y={ky - 4} width={44} height={8} rx={4} fill={acc} />
                    <rect x={ax - 34} y={ay - 30} width={68} height={50} rx={18} fill="#1b1f2e" />
                    <rect x={ax - 30} y={ay + 12} width={60} height={6} rx={3} fill={acc} opacity={0.8} />
                  </g>
                ) : (
                  <g>
                    <path d={`M ${ax - 32} ${ay + 12} Q ${ax - 34} ${ay - 12} ${ax - 6} ${ay - 12} L ${ax + 14} ${ay - 12} Q ${ax + 36} ${ay - 6} ${ax + 34} ${ay + 12} Z`} fill="#f4f4f4" />
                    <rect x={ax - 33} y={ay + 8} width={67} height={8} rx={4} fill="#c9ced8" />
                  </g>
                )}
              </g>
            );
          })}
        </g>
      ) : null}
      {part !== 'head' ? (
        <g>
          {/* arms behind for the back view */}
          {view === 'back' ? arms.map(([sd, pts]) => <g key={sd}>{limb(pts, 40, 34, p.topShade)}</g>) : null}
          {/* hoodie */}
          <path d="M -82 6 C -98 40 -92 150 -76 236 L 76 236 C 92 150 98 40 82 6 C 50 -14 -50 -14 -82 6 Z" fill={p.top} />
          <path d="M 30 0 C 70 0 92 40 86 120 C 84 170 80 210 76 236 L 40 236 C 60 160 62 60 30 0 Z" fill={p.topShade} opacity={0.6} />
          {fut ? (
            <g>
              <rect x={-34} y={-22} width={68} height={34} rx={14} fill={p.topShade} />
              <ellipse cx={-80} cy={16} rx={32} ry={22} fill={p.topShade} />
              <ellipse cx={80} cy={16} rx={32} ry={22} fill={p.topShade} />
              <g style={{filter: `drop-shadow(0 0 6px ${acc})`}}>
                <line x1={0} y1={12} x2={0} y2={194} stroke={acc} strokeWidth={5} />
                <path d="M -62 62 L 0 100 L 62 62" stroke={acc} strokeWidth={5} fill="none" />
                <rect x={-74} y={196} width={148} height={14} rx={7} fill={acc} opacity={0.85} />
              </g>
            </g>
          ) : view === 'front' ? (
            <g>
              <path d="M -46 -6 Q 0 34 46 -6" stroke={p.topShade} strokeWidth={14} fill="none" strokeLinecap="round" />
              <line x1={-14} y1={20} x2={-16} y2={74} stroke="#e8eaee" strokeWidth={4} strokeLinecap="round" />
              <line x1={14} y1={20} x2={16} y2={74} stroke="#e8eaee" strokeWidth={4} strokeLinecap="round" />
              <path d="M -52 150 L 52 150 L 44 196 L -44 196 Z" fill={p.topShade} opacity={0.55} />
            </g>
          ) : (
            <path d="M -58 -4 Q 0 70 58 -4 Q 0 30 -58 -4 Z" fill={p.topShade} />
          )}
          {/* neck */}
          <rect x={-16} y={-40} width={32} height={44} fill={p.skinShade} />
          {p.scarf ? (
            <g>
              <path d="M -46 -8 Q 0 22 46 -8" stroke={p.scarf} strokeWidth={24} fill="none" strokeLinecap="round" />
              {view === 'front' ? <path d="M 22 4 Q 30 50 18 96" stroke={p.scarf} strokeWidth={22} fill="none" strokeLinecap="round" /> : null}
              {view === 'front' ? [30, 50, 70].map((yy) => <line key={yy} x1={10} y1={yy + 4} x2={34} y2={yy} stroke="#b62532" strokeWidth={3} />) : null}
            </g>
          ) : null}
          {view === 'front' ? arms.map(([sd, pts]) => <g key={sd}>{limb(pts, 40, 34, p.top)}</g>) : null}
          {view === 'front' ? hands : null}
        </g>
      ) : null}
      <g transform={`rotate(${tilt} 0 -40) translate(0 -40) scale(1.05) translate(0 40)`}>
        <Head {...props} />
      </g>
    </g>
  );
};

// ---------- the robot ----------
export type Mood = 'happy' | 'neutral' | 'scan' | 'angry';
export const Robot: React.FC<{x: number; y: number; s: number; t: number; mood?: Mood; armR?: number; armL?: number; tilt?: number}> = ({x, y, s, t, mood = 'neutral', armR = 0, armL = 0, tilt = 0}) => {
  const bob = Math.sin(t * 2.2) * 10;
  const eye = mood === 'angry' ? '#ff2244' : '#3df0ff';
  const id = `rb${mood}`;
  const eyes = {
    happy: [-1, 1].map((sd) => <path key={sd} d={`M ${sd * 34 - 16} -96 Q ${sd * 34} -118 ${sd * 34 + 16} -96`} stroke={eye} strokeWidth={9} fill="none" strokeLinecap="round" />),
    neutral: [-1, 1].map((sd) => <ellipse key={sd} cx={sd * 34} cy={-100} rx={13} ry={16} fill={eye} />),
    scan: [-1, 1].map((sd) => <rect key={sd} x={sd * 34 - 18} y={-104} width={36} height={8} rx={4} fill={eye} />),
    angry: [-1, 1].map((sd) => <path key={sd} d={`M ${sd * 34 - 18} ${-108 - sd * -7} L ${sd * 34 + 18} ${-108 + sd * -7} L ${sd * 34 + 14} -90 L ${sd * 34 - 14} -90 Z`} fill={eye} />),
  }[mood];
  const arm = (sd: number, a: number) => {
    const sx = sd * 92, sy = 36, ex = sx + sd * Math.sin(0.35 + a) * 80, ey = sy + Math.cos(0.35 + a) * 80, hx = ex + sd * Math.sin(0.1 + a * 1.4) * 72, hy = ey + Math.cos(0.1 + a * 1.4) * 72;
    return (
      <g>
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#d5dbe8" strokeWidth={24} strokeLinecap="round" />
        <line x1={ex} y1={ey} x2={hx} y2={hy} stroke="#eef1f7" strokeWidth={22} strokeLinecap="round" />
        <circle cx={ex} cy={ey} r={14} fill="#9aa6bd" />
        <circle cx={hx} cy={hy} r={20} fill="#f7f9fc" stroke="#c4ccdb" strokeWidth={3} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${tilt})`}>
      <defs>
        <linearGradient id={`${id}b`} x1="0" x2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.6" stopColor="#eef1f7" /><stop offset="1" stopColor="#b9c3d6" /></linearGradient>
        <radialGradient id={`${id}g`}><stop offset="0" stopColor={eye} stopOpacity="0.9" /><stop offset="1" stopColor={eye} stopOpacity="0" /></radialGradient>
      </defs>
      {/* thruster glow */}
      <ellipse cx={0} cy={250} rx={90} ry={26} fill={`url(#${id}g)`} />
      <path d="M -26 200 L 26 200 L 16 236 L -16 236 Z" fill="#9aa6bd" />
      <ellipse cx={0} cy={238} rx={16} ry={6} fill={eye} />
      {arm(-1, armL)}
      {arm(1, armR)}
      {/* body */}
      <path d="M -96 20 C -104 120 -60 210 0 214 C 60 210 104 120 96 20 C 70 0 -70 0 -96 20 Z" fill={`url(#${id}b)`} />
      <path d="M -60 70 Q 0 90 60 70" stroke="#c4ccdb" strokeWidth={4} fill="none" />
      <circle cx={0} cy={124} r={20} fill="#0b1020" />
      <circle cx={0} cy={124} r={11} fill={eye} opacity={0.6 + 0.4 * Math.sin(t * 3)} />
      {/* neck and head */}
      <rect x={-20} y={-10} width={40} height={30} fill="#9aa6bd" />
      <rect x={-104} y={-178} width={208} height={168} rx={70} fill={`url(#${id}b)`} />
      <rect x={-84} y={-150} width={168} height={102} rx={46} fill="#0b1020" />
      <ellipse cx={0} cy={-100} rx={84} ry={52} fill={`url(#${id}g)`} opacity={0.35} />
      {eyes}
      <path d="M -60 -168 Q -30 -176 -6 -170" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.9} />
      <line x1={0} y1={-178} x2={0} y2={-206} stroke="#c4ccdb" strokeWidth={6} />
      <circle cx={0} cy={-212} r={9} fill={eye} />
    </g>
  );
};
