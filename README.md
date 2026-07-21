# Gesture Arcade

Three browser games controlled entirely by your hands. No controllers. No keyboard. Just a webcam.

## Play
**https://anushkabasu.github.io/gesture-arcade-web**

Allow camera access when the browser asks. MediaPipe loads in the background — the green dot in the top right corner will light up once your hand is detected.

## Games

**Hand Pong** - hold your palm flat and move it up and down. Your paddle follows.

**Space Shooter** - move your palm left and right to slide the ship across the bottom of the screen. Pinch your thumb and index finger together to fire.

**Snake** - point your index finger in the direction you want the snake to turn. The snake steers toward wherever your finger is pointing relative to its head.

## Selecting a game

Point your palm at one of the game cards on the homepage. Once it detects your hand hovering over a card, pinch to confirm and the game launches.

## How the hand tracking works

Every frame, MediaPipe scans the camera feed and returns 21 landmark points across your hand. From those points the arcade calculates:

- Palm centre position - average of 5 key joints
- Pinch - distance between thumb tip and index fingertip
- Finger direction - index fingertip position relative to the snake's head

All three games share the same hand state object, updated in real time.

## Run locally

Clone the repo and open `index.html` with Live Server in VS Code. Requires a webcam and a browser that supports WebAssembly (Chrome or Edge recommended).

## Stack

HTML, CSS, JavaScript, MediaPipe Tasks Vision 0.10.3, GitHub Pages