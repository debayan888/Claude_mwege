// Builds the full soundtrack: narration (Kokoro), the robot's lines, generated
// music that ducks under the voice, and sound effects. Uses explainroo's
// audio engine. Run: node tools/mix.mjs
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const X = path.join(os.homedir(), '.explainroo');
const {renderSoundtrack, encodeWav} = await import(path.join(X, 'engine/audio/soundtrack.js'));
const {readWav} = await import(path.join(X, 'src/wav.js'));
const here = path.dirname(new URL(import.meta.url).pathname), root = path.join(here, '..');
const tl = JSON.parse(fs.readFileSync(path.join(root, 'narration/build/timeline.json')));
const wav = (f) => { const w = readWav(f); return {data: w.samples, sampleRate: w.sampleRate}; };
const S = Object.fromEntries(tl.scenes.map((s) => [s.id, s]));
const at = (id, mark) => S[id].start + (mark ? S[id].marks[mark] : 0);

const voice = tl.scenes.map((s) => ({...wav(path.join(root, 'narration', s.voice.url)), start: s.voice.start}));
const fx = (file, t, gain = 1) => ({...wav(path.join(root, 'audio', file)), start: t, gain});
voice.push(
  fx('robot1.wav', S.robot.start + 0.15, 0.9),
  fx('robot2.wav', S.warning.start + 6.0, 0.9),
  fx('hiss.wav', at('pod', 'fog') - 0.2, 0.35),
  fx('vine-boom.wav', at('news', 'photo') - 0.05, 0.45),
  fx('buzz.wav', S.twist.start + 1.6, 0.6),
  fx('buzz.wav', at('twist', 'msg') - 0.1, 0.6),
  fx('vine-boom.wav', at('twist', 'from') - 0.05, 0.45),
  fx('heartbeat.wav', at('warning', 'read') + 0.2, 0.9),
  fx('dramatic-boomer.wav', at('warning', 'behind') + 0.6, 0.55),
);
const sfx = [
  {name: 'rise', t: 1.0, dur: 1.8},
  {name: 'whoosh', t: at('wake', 'open') - 0.1},
  {name: 'whoosh', t: S.pod.start + 0.4},
  {name: 'blip', t: S.robot.start + 0.05},
  {name: 'swipe', t: S.window.start},
  {name: 'whoosh', t: at('window', 'fly') - 0.3, gain: 1.3},
  {name: 'whoosh', t: at('window', 'fly') + 0.6},
  {name: 'thud', t: at('phone', 'museum')},
  {name: 'sparkle', t: at('phone', 'case')},
  {name: 'blip', t: at('food', 'scan')},
  {name: 'chime', t: at('food', 'print')},
  {name: 'error', t: S.news.start + 0.3},
  {name: 'ding', t: at('news', 'headline')},
  {name: 'swipe', t: S.twist.start},
  {name: 'swipe', t: S.cta.start},
];
const voiceSpans = [...tl.voiceSpans, {start: S.robot.start + 0.15, end: S.robot.start + 4.1}, {start: S.warning.start + 6, end: S.warning.start + 9.2}];
const buf = await renderSoundtrack({
  duration: tl.duration, sampleRate: 48000, voice, voiceSpans, sfx,
  music: {style: 'tech', volume: 0.55, seed: 7},
  scenes: tl.scenes.map((s) => ({start: s.start, dur: s.dur})),
});
fs.mkdirSync(path.join(root, 'reel/public'), {recursive: true});
const out = encodeWav(buf);
fs.writeFileSync(path.join(root, 'reel/public/soundtrack.wav'), Buffer.from(out instanceof ArrayBuffer ? out : out.buffer ?? out));
// the timeline for the visuals: scene starts, marks and every word, in absolute seconds
const T = {duration: tl.duration, scenes: tl.scenes.map((s) => ({id: s.id, start: s.start, dur: s.dur, marks: s.marks,
  words: s.words.map((w) => ({text: w.text, start: s.start + w.start, end: s.start + w.end}))}))};
fs.mkdirSync(path.join(root, 'reel/src'), {recursive: true});
fs.writeFileSync(path.join(root, 'reel/src/timeline.json'), JSON.stringify(T));
console.log('soundtrack', tl.duration.toFixed(1), 's');
