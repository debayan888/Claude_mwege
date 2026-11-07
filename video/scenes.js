// How explainroo makes a video. 1920 x 1080, paper look.
const U = (s) => Math.max(s.W, s.H) / 100;

export default {
  intro(s) {
    const u = U(s);
    s.title('How explainroo makes a video', { y: s.cy - u * 10, size: u * 5.4, at: 0, enter: 'none' });
    s.text('a free tool for coding agents', { y: s.cy - u * 4, size: u * 2.6, color: 'muted', at: '#tool' });
    s.icon('file-text', { id: 'f1', x: s.cx - u * 22, y: s.cy + u * 9, size: u * 6, color: 'blue', label: 'text', labelSize: u * 2.2, at: 'two' });
    s.icon('file-code', { id: 'f2', x: s.cx - u * 10, y: s.cy + u * 9, size: u * 6, color: 'purple', label: 'code', labelSize: u * 2.2, at: 'files' });
    s.icon('film', { id: 'mp4', x: s.cx + u * 18, y: s.cy + u * 9, size: u * 7, color: 'accent', label: 'MP4', labelSize: u * 2.6, at: '#mp4' });
    s.arrow([s.cx - u * 4, s.cy + u * 8], [s.cx + u * 12, s.cy + u * 8], { at: '#mp4' });
  },

  files(s) {
    const u = U(s);
    const cells = s.grid(2, 1, { gap: u * 4 });
    const a = cells[0], b = cells[1];
    s.text('script.md', { x: a.x, y: a.y - u * 14, size: u * 3.4, font: 'mono', at: 0.3 });
    s.code('## files\nThe first file is called\nscript.md. It holds the\nwords the voice says.', {
      lang: 'md', title: false, x: a.x, y: a.y + u * 2, size: u * 1.9, w: a.w * 0.92, at: '#script',
    });
    s.text('scenes.js', { x: b.x, y: b.y - u * 14, size: u * 3.4, font: 'mono', at: '#scenes' });
    s.code("files(s) {\n  s.icon('file-text',\n    { at: 'words' });\n}", {
      lang: 'js', title: false, x: b.x, y: b.y + u * 2, size: u * 1.9, w: b.w * 0.92, at: 'pictures', highlight: [3], highlightAt: '#cue',
    });
    s.text('a picture appears on a *spoken word*', { y: s.safe.bottom - u * 3, size: u * 2.8, at: '#cue' });
  },

  voice(s) {
    const u = U(s);
    s.icon('file-text', { id: 'script', x: s.cx - u * 26, y: s.cy - u * 4, size: u * 7, color: 'blue', label: 'script.md', labelSize: u * 2.4, at: 0.2 });
    s.box('Kokoro', { id: 'kokoro', x: s.cx, y: s.cy - u * 4, icon: 'mic', size: u * 3.6, color: 'orange', at: 'Kokoro' });
    s.arrow('script', 'kokoro', { label: 'reads', at: 'reads' });
    s.icon('laptop', { x: s.cx + u * 24, y: s.cy - u * 4, size: u * 7, color: 'green', label: 'your computer', labelSize: u * 2.4, at: '#local' });
    s.icon('key', { id: 'key', x: s.cx, y: s.cy + u * 14, size: u * 5, color: 'red', label: 'no API key', labelSize: u * 2.4, at: '#nokey' });
    s.annotate('key', { type: 'cross', color: 'red', at: s.cue('key') + 0.2 });
  },

  timing(s) {
    const u = U(s);
    s.box('Whisper', { id: 'whisper', x: s.cx, y: s.safe.top + u * 6, icon: 'ear', size: u * 3.6, color: 'purple', at: 'Whisper' });
    const words = [['It', '0.1'], ['writes', '0.3'], ['down', '0.6'], ['when', '0.8'], ['each', '1.0'], ['word', '1.2']];
    const xs = s.row(words.length, { width: s.safe.w * 0.82 });
    words.forEach(([w, t], i) => {
      const at = s.mark('words') + i * 0.35;
      s.text(w, { x: xs[i], y: s.cy, size: u * 3.4, bg: 'surface', padding: u, at });
      s.note(t + ' s', { x: xs[i], y: s.cy + u * 6, size: u * 2.2, at });
    });
    s.icon('image', { id: 'pic', x: xs[5], y: s.cy + u * 18, size: u * 5, color: 'accent', at: 'picture' });
    s.arrow([xs[5], s.cy + u * 9], 'pic', { label: 'appears here', labelSize: u * 2.2, at: 'heard' });
  },

  frames(s) {
    const u = U(s);
    const xs = s.row(4, { width: s.safe.w * 0.86 });
    const steps = [
      { id: 'chrome', label: 'Chrome', icon: 'monitor', note: 'draws frames', color: 'blue', at: 'Chrome' },
      { id: 'cam', label: 'Camera', icon: 'video', note: 'follows the voice', color: 'teal', at: '#camera' },
      { id: 'snd', label: 'Sound', icon: 'music', note: 'music and effects', color: 'orange', at: '#sound' },
      { id: 'ff', label: 'ffmpeg', icon: 'film', note: 'makes the MP4', color: 'accent', at: '#ffmpeg' },
    ];
    steps.forEach((st, i) => {
      const b = s.box(st.label, { id: st.id, x: xs[i], y: s.cy - u * 2, icon: st.icon, size: u * 3, color: st.color, at: st.at });
      s.text(st.note, { x: xs[i], y: b.bottom + u * 3, size: u * 2.2, color: 'muted', at: st.at });
      if (i) s.arrow(steps[i - 1].id, st.id, { at: st.at });
    });
  },

  checks(s) {
    const u = U(s);
    s.text('The agent cannot watch the video', { y: s.safe.top + u * 4, size: u * 3.6, at: 0.2 });
    s.terminal([
      { cmd: 'explainroo check video', at: '#check' },
      { out: 'warn: text too small in "intro"', at: s.mark('check') + 1.6, color: 'orange' },
      { cmd: 'explainroo still video', at: '#stills' },
      { out: 'wrote out/stills/', at: s.mark('stills') + 1.4 },
      { cmd: 'explainroo verify video', at: '#verify' },
      { out: 'ok  loudness -14 LUFS, voice clear', at: s.mark('verify') + 2, color: 'green' },
    ], { y: s.cy + u * 4, w: s.safe.w * 0.78, size: u * 2.1, rows: 6 });
  },

  outro(s) {
    const u = U(s);
    s.icon('file-text', { id: 'a', x: s.cx - u * 26, y: s.cy - u * 4, size: u * 6, color: 'blue', label: 'script', labelSize: u * 2.4, at: 'script' });
    s.icon('file-code', { id: 'b', x: s.cx - u * 12, y: s.cy - u * 4, size: u * 6, color: 'purple', label: 'drawing code', labelSize: u * 2.4, at: 'drawing' });
    s.icon('film', { id: 'v', x: s.cx + u * 20, y: s.cy - u * 4, size: u * 8, color: 'accent', label: 'narrated video', labelSize: u * 2.6, at: 'finished' });
    s.arrow([s.cx - u * 5, s.cy - u * 5], [s.cx + u * 13, s.cy - u * 5], { at: 'finished' });
    s.text('all on *your computer*', { y: s.safe.bottom - u * 5, size: u * 3.6, at: 'computer' });
  },
};
