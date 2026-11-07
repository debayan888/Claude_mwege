# How explainroo makes a video

## intro {chapter="The idea: two files"}
How does a coding agent make a narrated video? [#tool] With a free tool called explainroo. [#mp4] It turns two text files into one MP4 file.

## files
The first file is called {script.md|script dot M D}. [#script] It holds the words the voice says. [#scenes] The second file, {scenes.js|scenes dot J S}, draws the pictures. [#cue] Each drawing can appear on a word from the script.

## voice {chapter="The voice"}
First, a voice model called Kokoro reads the script. [#local] It runs on your own computer, [#nokey] so you need no {API|A, P, I} key.

## timing
Next, a speech model called Whisper listens to the narration. [#words] It writes down when each word is spoken. [#sync] So a picture can appear the moment its word is heard.

## frames {chapter="Pictures and sound"}
Then Chrome draws every frame in the background. [#camera] A camera follows the narration and zooms in on new things. [#sound] explainroo adds music and sound effects, [#ffmpeg] and ffmpeg joins it all into the MP4.

## checks {chapter="Checks"}
The agent cannot watch the video, so explainroo helps it look. [#check] The check command finds text that is too small or cut off. [#stills] Still images show single frames. [#verify] Verify measures the loudness and listens to the finished sound.

## outro {hold=1.6}
So explainroo turns a script and some drawing code into a finished, narrated video, all on your computer.
