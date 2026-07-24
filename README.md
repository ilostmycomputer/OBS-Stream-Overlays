# OBS Stream Overlays

Free browser-source overlays for OBS Studio. Download the files, add them as
Browser Sources, and edit the small settings shown below.

## Quick start

1. Download the repository from GitHub with **Code → Download ZIP**.
2. Unzip it somewhere you will not move later.
3. In OBS, click **Sources → + → Browser**.
4. Tick **Local file**, click **Browse**, and choose an HTML file from the
   `overlays` folder.
5. Set the Browser Source size, then click **OK**.

You do not need Node.js or Vencord for the countdown, gradient, or confetti
overlays.

## What needs installing?

For the normal overlays, **OBS Studio is the only requirement**.

The optional Discord typing alert needs a few extra things:

| Install | Why you need it |
| --- | --- |
| [Node.js 22 or newer](https://nodejs.org/en/download) | Runs the local bridge. Node.js includes `npm`. |
| `ws` | The bridge's WebSocket dependency. `npm install` installs it automatically; you do not need to find it yourself. |
| [pnpm 11](https://pnpm.io/installation) | Installs Vencord's dependencies. |
| [Vencord source](https://github.com/Vendicated/Vencord) | Required for adding and building a custom user plugin. |

You do not need to install a separate server, database, or cloud service. The
bridge runs on your own computer.

## Which overlay should I use?

| Overlay | Use it for |
| --- | --- |
| [Countdown](overlays/countdown/summer-update-countdown.html) | Counting down to an event or update. |
| [Subscriber border](overlays/gradient-stroke/gradient.html) | Giving a keyed subscriber count an animated coloured border. |
| [Confetti](overlays/confetti/confetti.html) | Celebrating an announcement, goal, or milestone. |
| [Discord typing alert](overlays/typing-notifications/overlay.html) | Track when developers start typing in channels such as **PRC Announcements** and get notified instantly on stream. This one needs extra setup. |

## Countdown

File: `overlays/countdown/summer-update-countdown.html`

Before adding it to OBS, open the file in Notepad and find `TARGET_DATE_TIME`
near the bottom. Replace the date with your event time. Keep the same format and
include the timezone:

```js
const TARGET_DATE_TIME = "2026-07-25T20:00:00+01:00";
```

Recommended Browser Source size: **700 × 180**.

The digits roll smoothly when the time changes. If you change the date while
OBS is open, right-click the source and choose **Refresh cache of current page**.

## Animated subscriber border

File: `overlays/gradient-stroke/gradient.html`

This file supplies animated colours. It is meant to be used with the OBS
**Stroke Glow Shadow** filter around a keyed subscriber-count source; it is not
the subscriber count itself.

1. Add `gradient.html` as a Browser Source.
2. Set it to the same size as your subscriber-count source, usually **1920 ×
   1080**.
3. In the Stroke Glow Shadow filter, choose this Browser Source as the source
   fill.

To change the colours, edit the colour values inside `conic-gradient` in the
file.

## Confetti

File: `overlays/confetti/confetti.html`

Add it as a full-screen Browser Source, usually **1920 × 1080**. The page is
transparent, so viewers only see the falling confetti.

To play it again, right-click the source in OBS and choose **Refresh cache of
current page**. There is no visible button or control on stream.

## Discord typing alert (optional)

Skip this section if you only want the visual overlays.

This alert uses three pieces:

1. The Node bridge passes messages on your computer.
2. The Vencord plugin sends typing events to the bridge.
3. OBS displays the alert in a Browser Source.

### Step 1: Start the bridge

Open PowerShell in the `overlays/typing-notifications` folder:

```powershell
npm install
npm start
```

The first command installs the bridge's only dependency, `ws`, into the local
`node_modules` folder. It does not install anything globally.

Leave this window open while you stream. The bridge only listens on your own
computer at `127.0.0.1:8765`; it is not a public server.

If PowerShell blocks `npm`, use these commands instead:

```powershell
npm.cmd install
npm.cmd start
```

You can also use the included Windows launcher after installing the bridge:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-obs.ps1
```

### Step 2: Add the alert to OBS

Add `overlays/typing-notifications/overlay.html` as a Browser Source.

Recommended Browser Source size: **720 × 200**.

The default heading says **PRC Announcements**. To change it, edit
`OVERLAY_TITLE` near the bottom of `overlay.html`.

### Step 3: Install the Vencord plugin

If you already have a Vencord source folder, open PowerShell there. Otherwise,
download or clone the source from [Vencord's GitHub repository](https://github.com/Vendicated/Vencord):

```powershell
git clone https://github.com/Vendicated/Vencord.git
cd Vencord
```

Install Vencord's dependencies once:

```powershell
npm.cmd install --global pnpm@11
pnpm.cmd install
```

`pnpm.cmd install` may take a while because it installs Vencord's full build
toolchain. Run it from the Vencord folder, not from this overlay folder.

Now copy this file:

```text
integrations/vencord/TypingNotifications/index.tsx
```

into your Vencord folder here:

```text
src/userplugins/typingnotifications/index.tsx
```

If `src/userplugins` does not exist yet, create that folder first. Do not put
the file in Vencord's `src/plugins` folder.

This follows Vencord's [official custom-plugin guide](https://docs.vencord.dev/installing/custom-plugins/).

Build Vencord, then restart Discord. On Windows, the build command is usually:

```powershell
pnpm.cmd build
```

In Discord, open a server channel's context menu, open its notification
settings, and turn on **Typing**. The alert will then appear in OBS when
someone starts typing in a watched channel.

### Test it without Discord

With the bridge running, open another PowerShell window in the same folder and
run:

```powershell
npm run test-event
```

You should see a test alert in OBS.

## If something is not showing

- **Blank overlay:** make sure the Browser Source has **Local file** enabled
  and points to the correct HTML file.
- **Countdown is wrong:** edit `TARGET_DATE_TIME`, then refresh the Browser
  Source.
- **No confetti:** use **Refresh cache of current page** on the confetti source.
- **No typing alert:** make sure the bridge terminal is running, then restart
  Discord after building the Vencord plugin.
- **Port already in use:** change `8765` in the bridge, OBS overlay, and
  Vencord plugin to the same unused local port.

## Customizing the overlays

These are plain source files. You can edit their text, colours, sizes, and
timings in Notepad or another text editor. No build step is needed for the
countdown, gradient, or confetti.

## License

The original overlay, bridge, launcher, and test files use the repository's
existing MIT License. The Vencord integration is GPL-3.0-or-later; see
`NOTICE.md`.

