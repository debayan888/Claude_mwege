import sys, json
from faster_whisper import WhisperModel
import subprocess, numpy as np
audio, out, lang = sys.argv[1], sys.argv[2], (sys.argv[3] if len(sys.argv) > 3 else 'hi')
pcm = subprocess.run(['ffmpeg','-v','error','-i',audio,'-ac','1','-ar','16000','-f','f32le','-'], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, dtype=np.float32)
m = WhisperModel('large-v3', device='cpu', compute_type='int8', cpu_threads=4)
segs, info = m.transcribe(audio, language=lang, word_timestamps=True, vad_filter=True,
    vad_parameters={'min_silence_duration_ms': 500}, beam_size=5, condition_on_previous_text=False)
rows = []
with open(out, 'w') as f:
    for s in segs:
        mm, ss = divmod(s.start, 60)
        line = f'[{int(mm):02d}:{ss:05.2f}]{s.text.strip()}'
        print(line, flush=True); f.write(line + '\n')
        rows.append({'start': s.start, 'end': s.end, 'text': s.text.strip(), 'words': [(w.start, w.end, w.word) for w in s.words]})
json.dump(rows, open(out + '.json', 'w'), ensure_ascii=False, indent=1)
