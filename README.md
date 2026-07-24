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

For every overlay, [OBS Studio](https://obsproject.com/download) is the only
required application. The extra items below are only needed for the feature you
choose:

| If you use... | Install or use... | Why you need it |
| --- | --- | --- |
| Animated subscriber border | [Stroke Glow Shadow plugin](https://github.com/FiniteSingularity/obs-stroke-glow-shadow) and its [latest release installer](https://github.com/FiniteSingularity/obs-stroke-glow-shadow/releases) | Adds the stroke, glow, and shadow around a keyed subscriber-count source. |
| Discord typing alert bridge | [Node.js 22 or newer](https://nodejs.org/en/download) | Runs the local bridge. Node.js includes `npm`. |
| Discord typing alert bridge | `ws` | The bridge's WebSocket dependency. `npm install` installs it automatically; you do not need to find it yourself. |
| Discord typing alert tracking | [pnpm 11](https://pnpm.io/installation) and [Vencord source](https://github.com/Vendicated/Vencord) | Vencord is required to read Discord typing events. It is a separate third-party project that you install and build separately. |
| Vencord plugin default sound | A sound file you have permission to use, named `fears-to-fathom-notification-sound.mp3` | Place it beside the copied `index.tsx`; the plugin imports it at build time. This repository intentionally does not redistribute the audio. |
| Downloading Vencord with `git clone` | Git (optional) | Downloading a ZIP works without Git. |

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

### Install the required OBS plugin

1. Close OBS if it is currently open.
2. Open the [Stroke Glow Shadow Releases page](https://github.com/FiniteSingularity/obs-stroke-glow-shadow/releases).
3. Download the latest installer for your operating system and run it.
4. Open OBS again. The plugin should now be available in the source/filter
   menus.

The plugin is maintained separately from this repository. Check its release
notes for supported OBS versions before installing. If it does not appear in
OBS, restart OBS once more and confirm that you downloaded the installer rather
than the source-code ZIP.

### Add the animated border

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

**Vencord is required for the typing-tracking part of this feature.** Vencord
is a separate third-party Discord client modification. This repository does not
install or redistribute Vencord; it only provides the custom plugin integration,
local bridge, and OBS overlay that work with it.

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

The launcher finds OBS in its normal Windows install location. If you installed
OBS somewhere else, set its path before running the launcher:

```powershell
$env:OBS_PATH = "D:\Apps\obs-studio\bin\64bit\obs64.exe"
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

Before building, place your permitted default sound file beside the plugin if
you want to keep the default sound import:

```text
Vencord/src/userplugins/typingnotifications/index.tsx
Vencord/src/userplugins/typingnotifications/fears-to-fathom-notification-sound.mp3
```

The repository does not include that audio file. If you do not want a default
audio file, remove the `defaultSoundBase64` import and `DEFAULT_SOUND_URL`, then
change `playDefaultSound()` to call `playFallbackTone()` instead. You can also
choose a different sound later from the plugin's custom sound setting.

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

