# Choo Lo: a romantic lyric video

A night-sky lyric video for "Choo Lo" by The Local Train. The visuals are an
HTML canvas page (`index.html`) that reacts to the song's energy and bass
(`audio.json`). `render.mjs` draws every frame in headless Chromium and joins
the frames with the song into an MP4.

The song is not in this repo. Bring your own copy.

## Add lyrics

Copy `lyrics.example.lrc` to `lyrics.lrc` and write one timed line per lyric:

    [00:41.20]first line of the song
    [00:46.80]next line

Each line fades in word by word at its time, and the heart steps back while a
lyric is on screen.

## Render

    node render.mjs path/to/Choo_Lo.mp3 out/choo-lo.mp4 --workers 4
    node render.mjs --still 8,40,120        # check single frames

Open `index.html` through any local web server (with `?t=40` to start at 40 s)
for a live preview.

## Transcribe lyrics from a song

Whisper on its own mishears singing over a band, so separate the vocals
first with Demucs, then transcribe them with Whisper large-v3
(faster-whisper). This runs on the CPU, with no API key.

    python3 -m venv ~/lyrics-env
    ~/lyrics-env/bin/pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
    ~/lyrics-env/bin/pip install demucs faster-whisper soundfile
    ~/lyrics-env/bin/python -m demucs --two-stems=vocals -n htdemucs -o sep song.mp3
    ~/lyrics-env/bin/python tools/transcribe.py sep/htdemucs/song/vocals.wav lyrics.lrc hi

`transcribe.py` writes a timed `.lrc` file and a `.json` file with
per-word times. Check it by ear: repeated choruses are often misheard
differently each time.
