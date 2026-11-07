// The station: one continuous shot, seen as a cross-section across the
// tracks. Platform on the left (1.1 m high), the track bed on the right with
// the safety pit between the rails, and the tunnel the train comes out of.
// Scale: 212 px = 1 m, so the hero is 1.75 m and the kid about 1 m.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  CLIMB_FALLBACK, CROUCH, CROWD, FILM, HERO, JUMP, KID, LAND, LIFT_HIGH, P0, PHONE, PRONE, SIT_EDGE, SQUAT_GRAB, Stick, THUMBS,
  clamp, joints, k, lerp, mixP, pose, run, walk, Pose,
} from './rig';
import {Cap, Captions, MONT, Sfx} from './ui';

const PLAT = 1260; // platform top
const EDGE = 520; // platform edge
const FLOOR = 1500; // track bed
const PIT_L = 712, PIT_R = 908, PIT_FLOOR = 1712;
const HS = 2.2; // hero scale
const KS = 1.25; // kid scale

type St = {x: number; y: number; p: Pose; f: 1 | -1; hip?: boolean; rot?: number};

// ---------- the hero ----------
function hero(t: number): St {
  if (t < 13.5) {
    // on his phone; looks up at the horn, then at the kid
    const look = k(t, 11.0, 11.6);
    return {x: 230, y: PLAT, f: 1, p: mixP(PHONE, pose({nod: -0.05, a1: 0.5, a2: 1.6}), look)};
  }
  if (t < 13.95) return {x: 230, y: PLAT, f: 1, p: mixP(pose({a1: 0.1}), CROUCH, k(t, 13.55, 13.9))}; // anticipation
  if (t < 14.55) return {x: lerp(230, 490, (t - 13.95) / 0.6), y: PLAT, f: 1, p: run((t - 13.95) * 16)};
  if (t < 15.1) {
    // a jump follows a parabola: up first, then down under gravity
    const p = (t - 14.55) / 0.55;
    const x = lerp(490, 650, p);
    const y = lerp(PLAT, FLOOR, p * p) - Math.sin(p * Math.PI) * 70;
    return {x, y, f: 1, p: mixP(JUMP, LAND, k(p, 0.6, 1))};
  }
  if (t < 15.35) return {x: 650, y: FLOOR, f: 1, p: LAND};
  if (t < 15.85) return {x: lerp(650, 705, (t - 15.35) / 0.5), y: FLOOR, f: 1, p: mixP(LAND, run((t - 15.35) * 16), k(t, 15.35, 15.5))};
  if (t < 16.35) return {x: 705, y: FLOOR, f: 1, p: mixP(run(8), SQUAT_GRAB, k(t, 15.85, 16.2))};
  if (t < 17.0) return {x: 705, y: FLOOR, f: 1, p: mixP(SQUAT_GRAB, LIFT_HIGH, k(t, 16.35, 16.95))}; // lift with the legs
  if (t < 17.7) return {x: lerp(705, 600, (t - 17.0) / 0.7), y: FLOOR, f: -1, p: {...walk((t - 17) * 9), a1: 3.0, a2: 0, b1: 2.95, b2: 0, lean: -0.05}};
  if (t < 18.4) return {x: 600, y: FLOOR, f: -1, p: {...LIFT_HIGH, lean: lerp(-0.05, 0.12, k(t, 17.7, 18.3))}};
  if (t < 19.0) return {x: 600, y: FLOOR, f: -1, p: mixP(LIFT_HIGH, P0, k(t, 18.4, 18.9))};
  if (t < 20.3) {
    // tries to climb: hands on the ledge, one knee up, then slips back
    const up = k(t, 19.2, 19.7) * (1 - k(t, 19.95, 20.2));
    return {x: 585, y: FLOOR - up * 40, f: -1, p: mixP(CLIMB_FALLBACK, {...CLIMB_FALLBACK, l1: 1.4, l2: -1.6}, up)};
  }
  if (t < 21.4) return {x: 585, y: FLOOR, f: t < 20.6 ? -1 : 1, p: mixP(LAND, pose({nod: -0.2, a1: 0.3, b1: 0.2}), k(t, 20.3, 20.7))};
  if (t < 21.75) return {x: lerp(585, 790, (t - 21.4) / 0.35), y: FLOOR, f: 1, p: run((t - 21.4) * 18)};
  if (t < 26.3) {
    // drops into the pit and lies flat
    const d = k(t, 21.75, 22.2);
    return {x: lerp(790, 728, d), y: lerp(FLOOR, PIT_FLOOR, d), f: 1, p: mixP(CROUCH, PRONE, d)};
  }
  if (t < 27.3) {
    const r = k(t, 26.3, 27.2);
    return {x: lerp(728, 810, r), y: lerp(PIT_FLOOR, FLOOR, k(t, 26.7, 27.2)), f: -1, p: mixP(PRONE, P0, r)};
  }
  return {x: 810, y: FLOOR, f: -1, p: mixP(P0, THUMBS, k(t, 27.6, 27.9))};
}

// ---------- the kid ----------
function kid(t: number, H: ReturnType<typeof joints>): St {
  if (t < 6.3) return {x: 430, y: PLAT, f: 1, p: t < 5.5 ? pose({a1: 0.7 + Math.abs(Math.sin(t * 5)) * 0.4, a2: 0.3}) : pose({nod: 0.3, a1: 0.6})};
  if (t < 7.1) return {x: lerp(430, 495, (t - 6.3) / 0.8), y: PLAT, f: 1, p: walk((t - 6.3) * 10)};
  if (t < 7.6) return {x: 505, y: PLAT - 4, f: 1, p: mixP(P0, SIT_EDGE, k(t, 7.1, 7.5)), hip: k(t, 7.1, 7.5) > 0.5}; // sits on the edge first
  if (t < 8.1) {
    const p = k(t, 7.6, 8.1);
    return {x: lerp(510, 560, p), y: lerp(PLAT + 2, FLOOR, p * p), f: 1, p: mixP(SIT_EDGE, LAND, p), hip: p < 0.5};
  }
  if (t < 8.4) return {x: 560, y: FLOOR, f: 1, p: mixP(LAND, P0, k(t, 8.1, 8.4))};
  if (t < 9.4) return {x: lerp(560, 740, (t - 8.4)), y: FLOOR, f: 1, p: walk((t - 8.4) * 10)};
  if (t < 10.0) return {x: 740, y: FLOOR, f: 1, p: mixP(P0, SQUAT_GRAB, k(t, 9.4, 9.7) * (1 - k(t, 9.75, 10)))};
  if (t < 16.2) {
    // frozen, hugging the ball
    const scared = pose({nod: -0.1, a1: 1.3, a2: 1.8, b1: 1.2, b2: 1.9});
    return {x: 740, y: FLOOR, f: t < 10.6 ? 1 : -1, p: mixP(pose({a1: 1.0, a2: 1.4}), scared, k(t, 10.6, 11))};
  }
  if (t < 18.3) {
    // carried in the hero's hands
    const hx = (H.handA[0] + H.handB[0]) / 2, hy = (H.handA[1] + H.handB[1]) / 2;
    return {x: hx, y: hy + 10, f: -1, p: pose({nod: 0.1, a1: 1.6, a2: 0.4, b1: 1.4, b2: 0.5, l1: 0.5, l2: -0.6, m1: 0.3, m2: -0.4}), hip: true};
  }
  if (t < 19.0) return {x: lerp(500, 420, k(t, 18.3, 19)), y: PLAT, f: -1, p: walk((t - 18.3) * 10)};
  if (t < 27.6) return {x: 420, y: PLAT, f: 1, p: pose({a1: 0.9, a2: 1.2, nod: 0.15})};
  // jumps for joy
  const j = Math.abs(Math.sin((t - 27.6) * 5));
  return {x: 420, y: PLAT - j * 60, f: 1, p: pose({a1: 2.8, b1: 2.7, l2: -j * 0.6, m2: -j * 0.5})};
}

// ---------- captions ----------
const CAPS: Cap[] = [
  {at: 0.3, until: 2.7, text: 'Biggest day of his life.'},
  {at: 2.8, until: 5.4, text: 'Job interview at *9:00*.'},
  {at: 5.6, until: 7.3, text: 'Then the ball bounced…'},
  {at: 7.4, until: 10.4, text: '…and the kid *followed* it.'},
  {at: 10.6, until: 11.9, text: '*TRAIN* coming.'},
  {at: 12.0, until: 13.4, text: 'Everyone just *filmed*.'},
  {at: 13.5, until: 16.0, text: 'Except *him*.'},
  {at: 18.3, until: 19.1, text: 'Kid safe.'},
  {at: 19.2, until: 20.4, text: "But he *can't* climb out."},
  {at: 24.7, until: 25.4, text: '…'},
  {at: 25.5, until: 27.9, text: 'He had dropped flat into the *pit* between the rails.'},
  {at: 28.0, until: 30.6, text: '*Not a scratch.*'},
];

const Ui: React.FC<{t: number}> = ({t}) => {
  // phone notification
  const ph = k(t, 1.0, 1.4) * (1 - k(t, 4.8, 5.2));
  // train warning
  const warn = k(t, 10.5, 10.7) * (1 - k(t, 13.3, 13.5));
  // countdown 3, 2, 1
  const cd = t >= 20.5 && t < 22.3 ? 3 - Math.floor((t - 20.5) / 0.6) : 0;
  const cdl = (t - 20.5) % 0.6;
  return (
    <>
      {ph > 0 ? (
        <div style={{position: 'absolute', left: 140, right: 140, top: 440, opacity: ph, translate: `0 ${(1 - ph) * -60}px`, background: 'rgba(255,255,255,0.96)', borderRadius: 36, padding: '28px 36px', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', fontFamily: MONT}}>
          <div style={{fontSize: 30, fontWeight: 700, color: '#6b7280'}}>CALENDAR · now</div>
          <div style={{fontSize: 50, fontWeight: 900, color: '#111', marginTop: 6}}>Job Interview · 9:00 AM</div>
          <div style={{fontSize: 34, fontWeight: 700, color: '#e63946', marginTop: 6}}>Don't be late. It's 8:41.</div>
        </div>
      ) : null}
      {warn > 0 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', opacity: warn * (0.65 + 0.35 * Math.abs(Math.sin(t * 8)))}}>
          <div style={{background: '#e63946', color: '#fff', fontFamily: MONT, fontWeight: 900, fontSize: 52, padding: '16px 40px', borderRadius: 999, letterSpacing: 2}}>⚠ TRAIN ARRIVING</div>
        </div>
      ) : null}
      {cd > 0 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 300, color: '#ff2d2d', WebkitTextStroke: '18px #000', paintOrder: 'stroke fill', scale: String(interpolate(cdl, [0, 0.2], [1.6, 1], {extrapolateRight: 'clamp'})), opacity: interpolate(cdl, [0.45, 0.6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>{cd}</div>
      ) : null}
    </>
  );
};

// ---------- the world ----------
const Train: React.FC<{t: number}> = ({t}) => {
  // approaches out of the tunnel: tiny at first, then fills the track
  if (t < 10.5 || t > 24.6) return null;
  const p = Math.pow(clamp((t - 10.5) / 12), 3);
  const passing = t > 22.5;
  if (!passing) {
    const w = lerp(16, 600, p), h = w * 1.28, cx = lerp(805, 820, p), bottom = lerp(1250, 1478, p);
    const x = cx - w / 2, y = bottom - h;
    return (
      <g>
        <circle cx={cx} cy={bottom - h * 0.18} r={lerp(60, 520, p)} fill="url(#beam)" />
        <rect x={x} y={y} width={w} height={h} rx={w * 0.12} fill="#23263a" />
        <rect x={x + w * 0.1} y={y + h * 0.1} width={w * 0.8} height={h * 0.35} rx={w * 0.05} fill="#0d0f1a" />
        <rect x={x} y={y + h * 0.6} width={w} height={h * 0.06} fill="#ffc300" />
        <circle cx={x + w * 0.2} cy={y + h * 0.78} r={w * 0.07} fill="#fffbe0" />
        <circle cx={x + w * 0.8} cy={y + h * 0.78} r={w * 0.07} fill="#fffbe0" />
      </g>
    );
  }
  // passing over: the car body sits at platform height, the pit stays clear underneath
  const flick = Math.floor(t * 20) % 2;
  return (
    <g clipPath="url(#trackOnly)">
      <rect x={EDGE + 4} y={700} width={1080} height={560} fill="#2b2f45" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={EDGE + 30 + ((i * 260 + t * 2600) % 1040) - 260} y={790} width={180} height={150} rx={14} fill={flick ? '#ffe7a3' : '#ffd36b'} opacity={0.9} />
      ))}
      <rect x={EDGE + 4} y={1060} width={1080} height={22} fill="#ffc300" />
      <rect x={EDGE + 4} y={1260} width={1080} height={160} fill="#14151f" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={EDGE + 60 + ((i * 210 + t * 1800) % 630)} cy={1440} r={38} fill="#3a3f55" />
      ))}
      {Array.from({length: 10}).map((_, i) => (
        <rect key={i} x={0} y={720 + i * 70} width={1080} height={4} fill="#fff" opacity={0.08} transform={`translate(${((t * 5000 + i * 300) % 2200) - 1100} 0)`} />
      ))}
    </g>
  );
};

const Phone: React.FC<{t: number; H: ReturnType<typeof joints>}> = ({t, H}) => {
  if (t < 13.5) return <rect x={H.handA[0] - 10} y={H.handA[1] - 26} width={22} height={38} rx={5} fill="#1f2937" stroke="#9ca3af" strokeWidth={3} />;
  // dropped: falls to the platform and cracks
  const p = clamp((t - 13.5) / 0.35);
  const x = lerp(280, 300, p), y = lerp(1120, PLAT - 6, p * p);
  return (
    <g>
      <rect x={x - 19} y={y - 10} width={38} height={14} rx={4} fill="#1f2937" />
      {p >= 1 ? <path d={`M ${x - 8} ${y - 8} l 6 5 l -3 6 M ${x + 4} ${y - 9} l -3 6`} stroke="#d1d5db" strokeWidth={2} fill="none" /> : null}
    </g>
  );
};

function ballPos(t: number, kidS: St, kidJ: ReturnType<typeof joints>): [number, number] | null {
  const r = 18;
  if (t < 5.5) return [470, PLAT - r - Math.abs(Math.sin(t * 5)) * 90];
  if (t < 6.0) return [lerp(470, EDGE, (t - 5.5) / 0.5), PLAT - r];
  if (t < 6.45) {const p = (t - 6.0) / 0.45; return [lerp(EDGE, 600, p), lerp(PLAT - r, FLOOR - r, p * p)];}
  if (t < 8.0) {const p = (t - 6.45) / 1.55; return [lerp(600, 790, 1 - (1 - p) * (1 - p)), FLOOR - r - Math.abs(Math.sin(p * 9)) * 40 * (1 - p)];}
  if (t < 9.8) return [790, FLOOR - r];
  if (t < 16.0) return [kidJ.handA[0], kidJ.handA[1] - 6];
  // dropped when he is grabbed; it rolls into the pit
  const p = clamp((t - 16) / 0.6);
  return [lerp(kidJ.handA[0], 780, p), lerp(kidJ.handA[1], PIT_FLOOR - r, p * p)];
}

export const Station: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const hs = hero(t);
  const H = joints({...hs, s: HS});
  const ks = kid(t, H);
  const KJ = joints({...ks, s: KS});
  const ball = ballPos(t, ks, KJ);

  // crowd: three bystanders; they film, one helps pull the kid up
  const filming = k(t, 11.8, 12.3) * (1 - k(t, 18.2, 18.6));
  const cheer = k(t, 27.6, 27.9);
  const helperX = lerp(330, 455, k(t, 15, 16.5)) - k(t, 18.4, 19) * 40;
  const helperP = t > 17.5 && t < 19 ? mixP(P0, SQUAT_GRAB, k(t, 17.5, 17.9) * (1 - k(t, 18.6, 19))) : t > 15 && t < 16.5 ? walk(t * 10) : mixP(P0, FILM, filming);

  // camera: framing for each beat, with shake as the train arrives
  const keys: [number, number, number, number][] = [
    [0, 330, 1150, 1.35], [4.6, 330, 1150, 1.35], [5.6, 640, 1300, 1.2], [10.2, 640, 1300, 1.2], [10.8, 800, 1180, 1.45],
    [12.0, 700, 1200, 1.2], [13.3, 540, 1260, 1.0], [20.3, 540, 1260, 1.0], [21.0, 720, 1300, 1.15], [22.4, 720, 1300, 1.15],
    [22.6, 540, 1260, 1.0], [26.2, 640, 1400, 1.25], [27.5, 600, 1300, 1.05], [31, 600, 1300, 1.05],
  ];
  const ts = keys.map((q) => q[0]);
  const cam = [1, 2, 3].map((i) => interpolate(t, ts, keys.map((q) => q[i]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const shakeAmt = k(t, 20.5, 22.4) * 8 + (t > 22.5 && t < 24.6 ? 26 : 0);
  const sx = Math.sin(t * 91) * shakeAmt, sy = Math.cos(t * 77) * shakeAmt;
  const black = t >= 24.6 && t < 25.4;
  const flash = interpolate(t, [22.35, 22.5, 22.9], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#0f1220'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <clipPath id="trackOnly"><rect x={EDGE} y={0} width={2000} height={3000} /></clipPath>
          <radialGradient id="beam"><stop offset="0" stopColor="#fff7d1" stopOpacity="0.95" /><stop offset="1" stopColor="#fff7d1" stopOpacity="0" /></radialGradient>
          <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e9e4d8" /><stop offset="1" stopColor="#d8d1c2" /></linearGradient>
          <linearGradient id="pit" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#3a3a3a" /><stop offset="1" stopColor="#1c1c1c" /></linearGradient>
        </defs>
        <g transform={`translate(${540 - cam[0] * cam[2] + sx} ${980 - cam[1] * cam[2] + sy}) scale(${cam[2]})`}>
          {/* station wall with tiles and the station sign */}
          <rect x={-600} y={300} width={2300} height={1300} fill="url(#wall)" />
          {Array.from({length: 26}).map((_, i) => <line key={`v${i}`} x1={-600 + i * 90} y1={300} x2={-600 + i * 90} y2={PLAT} stroke="#cfc7b6" strokeWidth={2} />)}
          {Array.from({length: 11}).map((_, i) => <line key={`h${i}`} x1={-600} y1={300 + i * 90} x2={EDGE} y2={300 + i * 90} stroke="#cfc7b6" strokeWidth={2} />)}
          <rect x={60} y={780} width={380} height={110} rx={12} fill="#1d4ed8" />
          <text x={250} y={852} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={52} fill="#fff">CENTRAL</text>
          {/* tunnel behind the tracks */}
          <path d={`M ${EDGE} ${FLOOR} L ${EDGE} 1000 Q ${805} 760 1180 1000 L 1180 ${FLOOR} Z`} fill="#3a4160" />
          <path d={`M ${EDGE + 60} ${FLOOR} L ${EDGE + 60} 1060 Q ${805} 850 1120 1060 L 1120 ${FLOOR} Z`} fill="#2b3150" />
          <Train t={t} />
          {/* track bed, rails and the pit */}
          <rect x={EDGE} y={FLOOR} width={1200} height={400} fill="#4b4b4b" />
          <rect x={PIT_L} y={FLOOR} width={PIT_R - PIT_L} height={PIT_FLOOR - FLOOR + 30} fill="url(#pit)" />
          <rect x={PIT_L - 34} y={FLOOR - 24} width={26} height={24} fill="#9aa1ad" />
          <rect x={PIT_R + 8} y={FLOOR - 24} width={26} height={24} fill="#9aa1ad" />
          {/* platform, with its yellow safety line */}
          <rect x={-600} y={PLAT} width={EDGE + 600} height={700} fill="#b9b2a3" />
          <rect x={EDGE - 70} y={PLAT} width={50} height={10} fill="#ffc300" />
          <rect x={EDGE - 6} y={PLAT} width={6} height={FLOOR - PLAT} fill="#8e8778" />
          {/* bystanders */}
          {[[60, 1], [140, 1]].map(([x], i) => (
            <g key={i}>
              <Stick x={x} y={PLAT} s={2.1} f={1} p={mixP(P0, FILM, filming)} look={CROWD} t={t} />
            </g>
          ))}
          <Stick x={helperX} y={PLAT} s={2.1} f={1} p={helperP} look={CROWD} t={t} />
          {cheer > 0 ? [60, 140, helperX].map((x, i) => <Stick key={`c${i}`} x={x} y={PLAT} s={2.1} f={1} p={pose({a1: 2.8, b1: 2.6})} look={{color: '#8d8a84'}} opacity={cheer} t={t} />) : null}
          {filming > 0.3 ? [60, 140].map((x, i) => <rect key={`ph${i}`} x={x + 70} y={1010} width={18} height={30} rx={4} fill="#1f2937" opacity={filming} />) : null}
          <Phone t={t} H={H} />
          <Stick {...ks} s={KS} look={KID} t={t} />
          <Stick {...hs} s={HS} look={HERO} t={t} />
          {ball ? <circle cx={ball[0]} cy={ball[1]} r={18} fill="#e63946" stroke="#9b1c25" strokeWidth={3} /> : null}
          {/* dust after the train */}
          {t > 25.4 && t < 29 ? Array.from({length: 24}).map((_, i) => (
            <circle key={`d${i}`} cx={600 + ((i * 97) % 420)} cy={1500 - ((t - 25.4) * (30 + (i % 5) * 12)) - (i % 7) * 20} r={10 + (i % 4) * 6} fill="#cfc6b4" opacity={0.5 * (1 - k(t, 26.5, 29))} />
          )) : null}
        </g>
      </svg>
      <Ui t={t} />
      <Captions caps={CAPS} />
      {flash > 0 ? <AbsoluteFill style={{background: '#fffbe6', opacity: flash}} /> : null}
      {black ? <AbsoluteFill style={{background: '#000'}} /> : null}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />

      <Sfx at={0} src="drone.wav" volume={0.35} dur={22.5} />
      <Sfx at={5.5} src="whip.wav" volume={0.5} />
      <Sfx at={7.6} src="whoosh.wav" volume={0.7} />
      <Sfx at={10.6} src="horn.wav" volume={0.8} />
      <Sfx at={12.0} src="heartbeat.wav" volume={0.9} />
      <Sfx at={12.9} src="heartbeat.wav" volume={0.9} />
      <Sfx at={13.5} src="dramatic-boomer.wav" volume={0.8} />
      <Sfx at={14.5} src="whoosh.wav" volume={0.8} />
      <Sfx at={17.0} src="rumble.wav" volume={0.8} dur={7.6} />
      <Sfx at={18.9} src="horn.wav" volume={0.9} />
      <Sfx at={20.5} src="heartbeat.wav" volume={1} />
      <Sfx at={21.1} src="heartbeat.wav" volume={1} />
      <Sfx at={21.7} src="horn.wav" volume={0.75} />
      <Sfx at={27.6} src="cheer.wav" volume={0.8} />
      <Sfx at={26.0} src="drone.wav" volume={0.25} />
    </AbsoluteFill>
  );
};
