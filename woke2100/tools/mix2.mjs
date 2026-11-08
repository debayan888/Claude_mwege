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
const tl = JSON.parse(fs.readFileSync(path.join(root, 'narration2/build/timeline.json')));
const wav = (f) => { const w = readWav(f); return {data: w.samples, sampleRate: w.sampleRate}; };
const S = Object.fromEntries(tl.scenes.map((s) => [s.id, s]));
const at = (id, mark) => S[id].start + (mark ? S[id].marks[mark] : 0);

const voice = tl.scenes.map((s) => ({...wav(path.join(root, 'narration2', s.voice.url)), start: s.voice.start}));
const fx = (file, t, gain = 1) => ({...wav(path.join(root, 'audio', file)), start: t, gain});
voice.push(
  fx('mira1.wav', S.roof.start + S.roof.dur - 4.05, 1.0),
  fx('heartbeat.wav', S.recap.start + 0.6, 0.8),
  fx('dramatic-boomer.wav', at('recap', 'behind') + 0.4, 0.45),
  fx('riser.wav', at('lift', 'up') - 0.2, 0.5),
  fx('vine-boom.wav', at('name', 'tonight') - 0.05, 0.5),
  fx('drones.wav', at('drones', 'many') - 0.3, 0.55),
  fx('dramatic-boomer.wav', at('drones', 'all') + 0.3, 0.5),
);
const sfx = [
  {name: 'whoosh', t: S.run.start + 0.3},
  {name: 'swipe', t: at('run', 'doors')}, {name: 'swipe', t: at('run', 'doors') + 0.8}, {name: 'swipe', t: at('run', 'doors') + 1.6},
  {name: 'whoosh', t: at('chase', 'glide'), gain: 1.2},
  {name: 'thud', t: S.lift.start + 0.4},
  {name: 'ding', t: S.roof.start + 0.2},
  {name: 'whoosh', t: at('fly', 'drop'), gain: 1.4},
  {name: 'rise', t: at('fly', 'drop') + 0.4, dur: 1.4},
  {name: 'blip', t: at('truth', 'list')},
  {name: 'error', t: at('name', 'tonight') + 0.1},
  {name: 'swipe', t: S.cta.start},
];
const voiceSpans = [...tl.voiceSpans, {start: S.roof.start + S.roof.dur - 4.05, end: S.roof.start + S.roof.dur - 0.5}];
const buf = await renderSoundtrack({
  duration: tl.duration, sampleRate: 48000, voice, voiceSpans, sfx,
  music: {style: 'tech', volume: 0.6, seed: 11},
  scenes: tl.scenes.map((s) => ({start: s.start, dur: s.dur})),
});
fs.mkdirSync(path.join(root, 'reel/public'), {recursive: true});
const out = encodeWav(buf);
fs.writeFileSync(path.join(root, 'reel/public/soundtrack2.wav'), Buffer.from(out instanceof ArrayBuffer ? out : out.buffer ?? out));
// the timeline for the visuals: scene starts, marks and every word, in absolute seconds
const T = {duration: tl.duration, scenes: tl.scenes.map((s) => ({id: s.id, start: s.start, dur: s.dur, marks: s.marks,
  words: s.words.map((w) => ({text: w.text, start: s.start + w.start, end: s.start + w.end}))}))};
fs.mkdirSync(path.join(root, 'reel/src'), {recursive: true});
fs.writeFileSync(path.join(root, 'reel/src/timeline2.json'), JSON.stringify(T));
console.log('soundtrack', tl.duration.toFixed(1), 's');
