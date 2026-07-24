# OBS Stream Overlays

Ready-to-use, open-source browser-source overlays for OBS Studio. Everything
here is local HTML/CSS/JavaScript except the optional Discord/Vencord typing
integration.

## Included

| Overlay | What it does |
| --- | --- |
| [`countdown`](overlays/countdown/summer-update-countdown.html) | Compact countdown with per-digit odometer animation. |
| [`gradient-stroke`](overlays/gradient-stroke/gradient.html) | Animated yellow gradient source for a keyed subscriber-count stroke. |
| [`confetti`](overlays/confetti/confetti.html) | Transparent rainbow confetti that plays when the Browser Source loads or refreshes. |
| [`typing-notifications`](overlays/typing-notifications/overlay.html) | Local OBS toast for Discord typing events, powered by a localhost WebSocket bridge. |

## Requirements

- OBS Studio with the Browser Source source type.
- Node.js 18 or newer for the typing-notifications bridge.
- A Vencord source checkout only if you want Discord typing events. The HTML
  overlays do not require Vencord.

## Install the HTML overlays

1. Download this repository from GitHub, or clone it locally.
2. In OBS, add a **Browser** source.
3. Enable **Local file** and browse to the HTML file you want.
4. Set the Browser Source dimensions to match the source:
   - countdown: around `700 x 180`
   - gradient and confetti: your canvas size, commonly `1920 x 1080`
   - typing notifications: around `720 x 200`
5. Leave the page background transparent when OBS offers that option. Each
   overlay already uses a transparent page background where appropriate.

### Countdown

Open `overlays/countdown/summer-update-countdown.html` in a text editor and
change `TARGET_DATE_TIME` near the bottom. Use an ISO 8601 date with a timezone,
for example:

```js
const TARGET_DATE_TIME = "2026-07-25T20:00:00+01:00";
```

Only the digits that change roll, so the surrounding layout stays still.

### Animated gradient stroke

Add `overlays/gradient-stroke/gradient.html` as a Browser Source at the same
size as the source you want to outline. Use that Browser Source as the source
fill for your OBS Stroke Glow Shadow filter (or an equivalent source-filled
stroke filter). Edit the color stops in the `conic-gradient` to change the
palette.

### Confetti

Add `overlays/confetti/confetti.html` as a full-canvas Browser Source. The page
is invisible apart from the falling confetti. To replay it, use **Refresh cache
of current page** on the Browser Source. This makes it easy to trigger from an
OBS scene action or a hotkey without putting a visible control on stream.

## Discord typing-notification overlay

The typing overlay is a local three-part setup:

```text
Vencord TypingNotifications plugin
        │  ws://127.0.0.1:8765?role=publisher
        ▼
Node bridge
        │  ws://127.0.0.1:8765?role=overlay
        ▼
OBS Browser Source
```

### 1. Install and run the bridge

Open PowerShell in `overlays/typing-notifications` and run:

```powershell
npm install
npm start
```

The bridge listens only on `127.0.0.1:8765`; it is not an internet-facing
server. Keep that terminal open while you want the overlay connected.

If port `8765` is already in use, set `TYPING_OBS_PORT` to another local port
and update `BRIDGE_URL` in the OBS overlay and `OBS_BRIDGE_URL` in the Vencord
plugin to match.

For a one-command Windows launch, run `start-obs.ps1` after `npm install`:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-obs.ps1
```

The launcher finds Node.js on `PATH` and OBS in the standard install folders.
Set `$env:OBS_PATH` to the full path to `obs64.exe` if OBS is installed
elsewhere.

### 2. Add the overlay to OBS

Add `overlays/typing-notifications/overlay.html` as a local Browser Source.
The default heading is `PRC Announcements`; edit `OVERLAY_TITLE` near the
bottom of the file if you want different text. The overlay keeps the newest
toast and removes it after 60 seconds.

### 3. Install the Vencord integration

Copy
`integrations/vencord/TypingNotifications/index.tsx` into your Vencord
checkout at:

```text
src/userplugins/typingnotifications/index.tsx
```

Then build Vencord using its normal development workflow. On Windows, that is
commonly:

```powershell
pnpm.cmd build
```

Restart Discord after the build. In a server channel's context menu, open the
notification settings and enable **Typing**. The plugin supports optional
tracked-user IDs, username/nickname display selection, and a custom typing
sound. Leave tracked IDs blank to allow every user in watched channels.

The plugin sends an event only after its watched-channel, self-user, optional
tracked-user, and deduplication checks. If the bridge is not running, the
Discord notification still works and the plugin retries the local connection.

### 4. Test the bridge without Discord

With the bridge running, open a second PowerShell window in the same folder and
run:

```powershell
npm run test-event
```

You should see a test toast in OBS. If it does not appear, check that the
Browser Source points to the repository file and that nothing else is using
port `8765`.

## Privacy and network behavior

- The HTML overlays do not send data anywhere.
- The typing bridge binds to localhost only and forwards validated local events
  between the Vencord plugin and the OBS Browser Source.
- The typing toast may load the avatar URL that Discord provides, so the OBS
  browser can display the avatar. No separate backend or VPS is included.

## Customization

The overlays are intentionally plain source files. Edit the constants and CSS
variables at the top or bottom of each file to change titles, dates, colors,
dimensions, timing, and text. No build step is required for the HTML overlays.

## License

This repository is GPL-3.0-or-later. See `LICENSE` and `NOTICE.md`.

