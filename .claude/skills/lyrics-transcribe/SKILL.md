---
name: lyrics-transcribe
description: Transcribe the sung lyrics of a song into a timed .lrc file. Separates the vocals with Demucs, then transcribes them with Whisper large-v3 (faster-whisper) on the CPU, no API key. Use when the user wants lyrics, timed lyrics or captions from a song or music file.
---

# Transcribe song lyrics

Whisper alone mishears singing over a band, so separate the vocals first.

## Set up (once)

```bash
python3 -m venv ~/lyrics-env
~/lyrics-env/bin/pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
~/lyrics-env/bin/pip install demucs faster-whisper soundfile "av>=14"
```

## Run

```bash
~/lyrics-env/bin/python -m demucs --two-stems=vocals -n htdemucs -o sep song.mp3
~/lyrics-env/bin/python transcribe.py sep/htdemucs/song/vocals.wav lyrics.lrc hi
```

`transcribe.py` is in this skill's folder. The last argument is the language
code (`hi`, `en`, `es`, ...). It writes `lyrics.lrc` (one timed line per
segment) and `lyrics.lrc.json` (per-word times), which you can use to split
long lines.

## Check the result

- Repeated choruses are often misheard differently each time. Correct them
  from the cleanest repetition.
- Gaps of 20+ seconds are usually instrumentals, but can be missed lines.
- Tell the user which lines are uncertain. Never fill gaps from memory.
- Lyrics are copyrighted: keep the .lrc out of public repos.
