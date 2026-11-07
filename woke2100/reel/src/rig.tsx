// A side-view stick-figure rig. Every character in the reel is drawn with
// this one rig, so proportions and line weight stay identical from scene to
// scene. Angles are radians from straight down; a positive angle swings the
// limb toward the way the figure faces (f = 1 right, -1 left).
import React from 'react';

export type Pose = {
  lean: number; // torso tilt, forward positive
  nod: number; // extra head tilt
  a1: number; a2: number; // near arm: upper, forearm (relative)
  b1: number; b2: number; // far arm
  l1: number; l2: number; // near leg: thigh, shin (relative, negative bends knee)
  m1: number; m2: number; // far leg
};

export const P0: Pose = {lean: 0, nod: 0, a1: 0.1, a2: 0.15, b1: -0.1, b2: 0.15, l1: 0.06, l2: 0, m1: -0.06, m2: 0};
export const pose = (o: Partial<Pose>): Pose => ({...P0, ...o});
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
// smooth 0..1 between times a and b
export const k = (t: number, a: number, b: number) => {
  const p = clamp((t - a) / (b - a));
  return p * p * (3 - 2 * p);
};
export const mixP = (p: Pose, q: Pose, x: number): Pose => {
  const o = {} as Pose;
  (Object.keys(P0) as (keyof Pose)[]).forEach((key) => {
    o[key] = lerp(p[key], q[key], clamp(x));
  });
  return o;
};

// Walk and run cycles: opposite arm and leg swing together, the back leg's
// knee bends as it lifts, and a run leans forward with bent elbows.
export const walk = (ph: number): Pose => {
  const s = Math.sin(ph);
  return pose({
    lean: 0.05,
    l1: 0.42 * s, l2: -Math.max(0, -Math.sin(ph - 0.9)) * 0.8,
    m1: -0.42 * s, m2: -Math.max(0, Math.sin(ph - 0.9)) * 0.8,
    a1: -0.38 * s, a2: 0.3, b1: 0.38 * s, b2: 0.3,
  });
};
export const run = (ph: number): Pose => {
  const s = Math.sin(ph);
  return pose({
    lean: 0.3, nod: -0.15,
    l1: 0.75 * s + 0.1, l2: -Math.max(0, -Math.sin(ph - 0.9)) * 1.5 - 0.15,
    m1: -0.75 * s + 0.1, m2: -Math.max(0, Math.sin(ph - 0.9)) * 1.5 - 0.15,
    a1: -0.8 * s, a2: 1.5, b1: 0.8 * s, b2: 1.5,
  });
};
export const CROUCH = pose({lean: 0.45, nod: -0.25, l1: 1.0, l2: -1.7, m1: 0.9, m2: -1.6, a1: -0.6, a2: 0.4, b1: -0.5, b2: 0.4});
export const JUMP = pose({lean: 0.25, l1: 0.5, l2: -1.2, m1: -0.2, m2: -0.6, a1: 2.6, a2: 0.2, b1: 2.3, b2: 0.3});
export const LAND = pose({lean: 0.35, l1: 0.9, l2: -1.5, m1: 0.6, m2: -1.2, a1: 1.2, a2: 0.3, b1: 0.9, b2: 0.3});
export const SQUAT_GRAB = pose({lean: 0.55, nod: 0.2, l1: 1.1, l2: -1.8, m1: 1.0, m2: -1.7, a1: 1.0, a2: 0.2, b1: 0.9, b2: 0.2});
export const LIFT_HIGH = pose({lean: -0.05, nod: -0.4, a1: 3.0, a2: 0.0, b1: 2.95, b2: 0.0});
export const PHONE = pose({nod: 0.35, a1: 0.7, a2: 1.9, b1: -0.05, b2: 0.2});
export const HANG = pose({lean: 0.1, nod: -0.3, a1: 2.9, a2: 0.15, b1: 2.8, b2: 0.2, l1: 0.2, l2: -0.5, m1: -0.1, m2: -0.2});
export const THUMBS = pose({a1: 1.2, a2: 1.4, b1: -0.1, b2: 0.2});
export const POINT_CAM = pose({a1: 1.5, a2: 0.05});
export const FILM = pose({nod: 0.05, a1: 1.45, a2: 0.6, b1: 1.35, b2: 0.7});
export const SIT_EDGE = pose({l1: 1.5, l2: -1.4, m1: 1.4, m2: -1.3, a1: 0.3, a2: 0.1, b1: -0.3, b2: 0.1});

const S = {torso: 58, neck: 7, head: 16, ua: 30, fa: 28, th: 36, sh: 36};

export type Look = {
  color: string;
  scarf?: string; // the hero's red scarf: his signature, in every scene
  cap?: string; // the kid's yellow cap
  tie?: string; // the dad's tie
  glasses?: boolean;
  width?: number;
  halo?: string; // outline colour behind the figure, or 'none'
  eyes?: boolean; // big cartoon eyes on the head
};

type Props = {
  blink?: number; // 0 open .. 1 shut
  look2?: number; // pupils: -1 back .. 1 forward
  x: number;
  y: number; // ground line, or the hip when hip is true
  s: number;
  f: 1 | -1;
  p: Pose;
  look: Look;
  hip?: boolean;
  rot?: number; // whole-body rotation in degrees around the hip
  opacity?: number;
  t?: number; // time, for the scarf flutter
};

export type Joints = {hip: [number, number]; sh: [number, number]; hd: [number, number]; handA: [number, number]; handB: [number, number]};

export function joints({x, y, s, f, p, hip}: Omit<Props, 'look'>): Joints & {legs: [number, number][][]; arms: [number, number][][]} {
  const dir = (a: number): [number, number] => [f * Math.sin(a), Math.cos(a)];
  const leg = (a1: number, a2: number) => S.th * Math.cos(a1) + S.sh * Math.cos(a1 + a2);
  const hy = hip ? y : y - s * Math.max(leg(p.l1, p.l2), leg(p.m1, p.m2));
  const H: [number, number] = [x, hy];
  const sh: [number, number] = [x + f * Math.sin(p.lean) * S.torso * s, hy - Math.cos(p.lean) * S.torso * s];
  const hd: [number, number] = [sh[0] + f * Math.sin(p.lean + p.nod) * (S.neck + S.head) * s, sh[1] - Math.cos(p.lean + p.nod) * (S.neck + S.head) * s];
  const limb = (o: [number, number], a1: number, a2: number, L1: number, L2: number) => {
    const d1 = dir(a1);
    const j: [number, number] = [o[0] + d1[0] * L1 * s, o[1] + d1[1] * L1 * s];
    const d2 = dir(a1 + a2);
    return [o, j, [j[0] + d2[0] * L2 * s, j[1] + d2[1] * L2 * s]] as [number, number][];
  };
  const armA = limb(sh, p.a1, p.a2, S.ua, S.fa), armB = limb(sh, p.b1, p.b2, S.ua, S.fa);
  const legA = limb(H, p.l1, p.l2, S.th, S.sh), legB = limb(H, p.m1, p.m2, S.th, S.sh);
  return {hip: H, sh, hd, handA: armA[2], handB: armB[2], legs: [legB, legA], arms: [armB, armA]};
}

const pts = (a: [number, number][]) => a.map((q) => q.join(',')).join(' ');

export const Stick: React.FC<Props> = (props) => {
  const {s, f, look, rot = 0, opacity = 1, t = 0} = props;
  const J = joints(props);
  const w = (look.width ?? 8) * s;
  const c = look.color;
  const flutter = Math.sin(t * 9) * 4 * s;
  const neckMid: [number, number] = [(J.sh[0] + J.hd[0]) / 2, (J.sh[1] + J.hd[1]) / 2];
  const halo = look.halo ?? '#ffffff';
  return (
    <g opacity={opacity} transform={`rotate(${rot} ${J.hip[0]} ${J.hip[1]})`} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {halo !== 'none' ? (
        <g stroke={halo} strokeWidth={w + 7 * s} opacity={0.85}>
          {[...J.arms, ...J.legs, [J.hip, J.sh, neckMid]].map((l, i) => <polyline key={i} points={pts(l)} />)}
          <circle cx={J.hd[0]} cy={J.hd[1]} r={S.head * s + 3.5 * s} fill={halo} stroke="none" />
        </g>
      ) : null}
      <polyline points={pts(J.arms[0])} stroke={c} strokeWidth={w} />
      <polyline points={pts(J.legs[0])} stroke={c} strokeWidth={w} />
      <polyline points={pts([J.hip, J.sh, neckMid])} stroke={c} strokeWidth={w} />
      <polyline points={pts(J.legs[1])} stroke={c} strokeWidth={w} />
      {look.tie ? <polyline points={pts([[J.sh[0] + f * 3 * s, J.sh[1] + 4 * s], [J.sh[0] + f * 7 * s, J.sh[1] + 26 * s]])} stroke={look.tie} strokeWidth={w * 0.7} /> : null}
      <polyline points={pts(J.arms[1])} stroke={c} strokeWidth={w} />
      <circle cx={J.hd[0]} cy={J.hd[1]} r={S.head * s} fill={c} />
      {look.scarf ? (
        <g>
          <path d={`M ${J.sh[0] - 9 * s} ${J.sh[1] - 4 * s} Q ${J.sh[0]} ${J.sh[1] + 3 * s} ${J.sh[0] + 9 * s} ${J.sh[1] - 4 * s}`} stroke={look.scarf} strokeWidth={w * 0.95} />
          <path d={`M ${J.sh[0] - f * 6 * s} ${J.sh[1] - 2 * s} Q ${J.sh[0] - f * 22 * s} ${J.sh[1] + 2 * s + flutter} ${J.sh[0] - f * 34 * s} ${J.sh[1] - 4 * s + flutter * 1.6}`} stroke={look.scarf} strokeWidth={w * 0.8} />
        </g>
      ) : null}
      {look.cap ? (
        <g>
          <path d={`M ${J.hd[0] - 16 * s} ${J.hd[1] - 2 * s} A ${16 * s} ${16 * s} 0 0 1 ${J.hd[0] + 16 * s} ${J.hd[1] - 2 * s} Z`} fill={look.cap} />
          <line x1={J.hd[0]} y1={J.hd[1] - 3 * s} x2={J.hd[0] + f * 27 * s} y2={J.hd[1] - 3 * s} stroke={look.cap} strokeWidth={5 * s} />
        </g>
      ) : null}
      {look.eyes ? (() => {
        const r = 5.2 * s, ex = J.hd[0] + f * 6 * s, ey = J.hd[1] - 2 * s, bl = props.blink ?? 0, lk = props.look2 ?? 0.5;
        return (
          <g>
            {[0, 1].map((i) => (
              <g key={i}>
                <ellipse cx={ex + f * i * 9 * s} cy={ey} rx={r} ry={r * (1 - bl * 0.92)} fill="#fff" />
                {bl < 0.7 ? <circle cx={ex + f * i * 9 * s + f * lk * 1.8 * s} cy={ey + 0.5 * s} r={r * 0.5} fill="#000" /> : null}
              </g>
            ))}
          </g>
        );
      })() : null}
      {look.glasses ? <line x1={J.hd[0] - f * 2 * s} y1={J.hd[1] - 3 * s} x2={J.hd[0] + f * 17 * s} y2={J.hd[1] - 3 * s} stroke="#9aa4b2" strokeWidth={3.5 * s} /> : null}
    </g>
  );
};

// the cast: one look per character, used everywhere
export const HERO: Look = {color: '#121212', scarf: '#e63946'};
export const KID: Look = {color: '#121212', cap: '#ffc300'};
export const DAD: Look = {color: '#121212', tie: '#1d4ed8', glasses: true};
export const CROWD: Look = {color: '#8d8a84'};

// lying flat and low in the pit, arms over the head
export const PRONE = pose({lean: 1.15, nod: 0.35, l1: 1.7, l2: -2.7, m1: 1.6, m2: -2.6, a1: 1.3, a2: 1.9, b1: 1.2, b2: 2.0});
// standing at the wall, both hands on the platform edge
export const CLIMB_FALLBACK = pose({lean: -0.05, nod: -0.3, a1: 2.3, a2: 0.4, b1: 2.2, b2: 0.5});
export const SIT_CHAIR = pose({l1: 1.5, l2: -1.5, m1: 1.45, m2: -1.45, a1: 0.9, a2: 0.6, b1: 0.8, b2: 0.7});
