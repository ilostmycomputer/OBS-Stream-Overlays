# OBS Five-Click Cursor Zoom

An open-source Windows helper for OBS Studio. Five rapid left-clicks in roughly the same area trigger a smooth `2.5×` zoom towards the cursor. The zoom follows the cursor with gentle easing for 15 seconds, hides the cursor in the recording or stream, then restores the original scene-item transform.

The committed defaults are safe for public distribution:

- OBS WebSocket password: `replace this`
- captured display: `1920 × 1080`
- activation mode: recording only
- tracking rate: 60 FPS
- follow smoothing: `0.18`

All project logic is readable in `src/`. There is no compiled helper, minified bundle, telemetry, cloud service, or concealed executable. `start.bat` directly runs `src/index.js`. The two third-party dependencies and their exact versions are declared in `package.json`; `node_modules` is generated locally by npm and is not committed.

## Requirements

- Windows 10 or 11
- OBS Studio 28 or newer with OBS WebSocket enabled
- Node.js 22 or newer
- A Display Capture source for the monitor being zoomed

## 1. Download only this tool

You do not need the entire repository.

1. Open this folder on GitHub.
2. Download these 11 files while preserving the `src` folder, or download the repository ZIP and keep only this folder.
3. Move the folder somewhere permanent, such as `Documents\OBS Five-Click Cursor Zoom`.

## 2. Configure OBS WebSocket

1. Open OBS.
2. Select **Tools → WebSocket Server Settings**.
3. Enable the WebSocket server.
4. Keep the port at `4455`, unless you deliberately change both OBS and `config.json`.
5. Enable authentication.
6. Set a password.
7. Open `config.json` in Notepad and replace:

   ```json
   "password": "replace this"
   ```

   with the exact same password.

Do not commit or publicly share your edited password.

## 3. Create the cursor-free zoom layer

1. In OBS, create a new scene named exactly `Click Zoom Layer`.
2. Inside that scene, add a **new Display Capture** for the monitor you want to zoom.
3. Disable **Capture Cursor** on that Display Capture.
4. Right-click the capture and select **Transform → Fit to Screen**.
5. Open each normal recording or streaming scene where you want the effect.
6. Add `Click Zoom Layer` as a **Scene** source.
7. Keep it as a top-level source rather than placing it inside a group.
8. Move it to the top of the Sources list.
9. Fit it to the screen.
10. Hide it using the eye icon.

Your ordinary Display Capture can keep its cursor enabled. During the effect, the helper temporarily enables the cursor-free duplicate above it.

## 4. Set the captured display

The public configuration assumes a primary `1920 × 1080` monitor:

```json
"display": {
  "left": 0,
  "top": 0,
  "width": 1920,
  "height": 1080
}
```

Change `width` and `height` to the resolution of the monitor OBS captures. Most single-monitor and primary-monitor setups should leave `left` and `top` at `0`.

For a secondary monitor, `left` and `top` represent its location in **Windows Settings → System → Display**. A monitor directly to the right of a `1920 × 1080` primary display usually begins at `left: 1920, top: 0`.

## 5. Install and run

1. Run `install.bat` once. It installs the exact dependencies listed in `package.json`.
2. Open OBS.
3. Run `start.bat`.
4. Keep the command window open.
5. Start recording.
6. Click five times rapidly in roughly the same area.

By default, clicks are ignored unless OBS is actively recording.

## How it works

```text
Global Windows mouse events
        ↓
Five left-clicks within 1.2 seconds and 180 pixels
        ↓
Check OBS recording/streaming state through WebSocket
        ↓
Find the top-level "Click Zoom Layer" scene item
        ↓
Enable the cursor-free capture and animate its crop/scale
        ↓
Ease the target towards the live cursor position at 60 FPS
        ↓
Restore the original transform and visibility after 15 seconds
```

The helper does not modify the Windows cursor or hide it on your physical monitor. Cursor hiding is achieved by showing an OBS Display Capture that has **Capture Cursor** disabled.

## Configuration reference

### Trigger

| Setting | Default | Purpose |
| --- | ---: | --- |
| `trigger.clicks` | `5` | Number of clicks required. |
| `trigger.windowMs` | `1200` | Maximum time for the click sequence. |
| `trigger.radiusPx` | `180` | Maximum distance from the first click. Set to `0` to disable the proximity check. |
| `trigger.cooldownMs` | `2000` | Delay before another sequence can trigger. |
| `trigger.activationMode` | `recording` | Use `recording`, `streaming`, or `either`. |

### Zoom

| Setting | Default | Purpose |
| --- | ---: | --- |
| `zoom.factor` | `2.5` | Maximum zoom level. |
| `zoom.trackMs` | `15000` | Tracking duration in milliseconds. |
| `zoom.zoomInMs` | `300` | Zoom-in animation duration. |
| `zoom.zoomOutMs` | `400` | Zoom-out animation duration. |
| `zoom.fps` | `60` | Target tracking update rate. |
| `zoom.followSmoothing` | `0.18` | Cursor-follow responsiveness from `0` to `1`. |

Suggested smoothing values:

- `0.10`: slower and more cinematic
- `0.18`: balanced default
- `0.30`: faster response
- `1.00`: immediate following

## File structure

```text
obs-five-click-cursor-zoom/
├── README.md
├── config.json
├── install.bat
├── package.json
├── start.bat
└── src/
    ├── click-detector.js
    ├── config.js
    ├── effect-timing.js
    ├── index.js
    ├── output-gate.js
    └── zoom-math.js
```

Each source file has one responsibility:

- `index.js`: mouse hooks, OBS connection, effect lifecycle and scene restoration
- `click-detector.js`: rapid-click timing, proximity and cooldown logic
- `config.js`: defaults and validation
- `effect-timing.js`: zoom-in, tracking and zoom-out phases
- `output-gate.js`: recording/streaming activation modes
- `zoom-math.js`: coordinate mapping, crop transforms and smoothing

## Troubleshooting

- **Cannot connect to OBS:** verify the WebSocket server, port and password in both OBS and `config.json`.
- **Source not found:** the active scene must contain a top-level Scene source named exactly `Click Zoom Layer`.
- **Wrong zoom position:** correct the `display` resolution and monitor position in `config.json`.
- **Clicks ignored in an elevated game:** run `start.bat` as administrator.
- **Cursor visible during the zoom:** disable **Capture Cursor** inside the dedicated `Click Zoom Layer` scene.
- **Effect does not activate while streaming:** change `trigger.activationMode` to `streaming` or `either`.

## Privacy and security

- The helper connects only to the OBS WebSocket address configured in `config.json`; the default is the local address `127.0.0.1`.
- It does not transmit click data, screenshots, passwords or analytics to any external service.
- Mouse coordinates remain inside the local Node.js process and are used only to calculate the OBS crop.
- Never commit your real OBS WebSocket password.

## Licence

This tool is released under the repository's MIT Licence. Its dependencies retain their own licences; inspect their package metadata before redistribution.
