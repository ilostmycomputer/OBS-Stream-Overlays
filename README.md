# OBS Stream Overlays

Free, local browser-source overlays for OBS Studio. The standalone overlays need
only OBS. The optional Discord typing alert also needs Node.js, a local bridge,
and a custom Vencord source build.

This guide is deliberately written for someone who has never configured OBS
before. Follow the sections in order and run each test before moving on.

## What is included?

| Overlay | File | Purpose | Recommended Browser Source size |
| --- | --- | --- | --- |
| Countdown | [`overlays/countdown/summer-update-countdown.html`](overlays/countdown/summer-update-countdown.html) | Counts down to an event with rolling digits. | `700 × 180` |
| Animated gradient | [`overlays/gradient-stroke/gradient.html`](overlays/gradient-stroke/gradient.html) | Supplies animated colours to the Stroke Glow Shadow plugin. It is not a subscriber counter by itself. | Match the source it will fill. |
| Confetti | [`overlays/confetti/confetti.html`](overlays/confetti/confetti.html) | Plays transparent falling confetti whenever the page loads or refreshes. | Match your OBS canvas. |
| Discord typing alert | [`overlays/typing-notifications/overlay.html`](overlays/typing-notifications/overlay.html) | Shows a person's avatar and username when they start typing in a watched Discord channel. | `720 × 200` |

## Dependencies

Install only the items required by the feature you intend to use.

| Dependency | Required for | Notes |
| --- | --- | --- |
| [OBS Studio](https://obsproject.com/download) | Every overlay | Install the official OBS package. It includes the Browser Source source type used by these files. |
| A text editor such as Windows Notepad | Customisation | Used to change dates, titles, colours, and ports. Do not use Microsoft Word. |
| Bundled OpenAI Sans `.otf` files | Optional countdown typography | The countdown works without them and falls back to a system sans-serif font. |
| [Stroke Glow Shadow](https://github.com/FiniteSingularity/obs-stroke-glow-shadow/releases) | Animated subscriber border only | Third-party OBS plugin. Check its latest release notes for compatibility with your installed OBS version. |
| [Node.js 22 or newer](https://nodejs.org/en/download) | Discord typing bridge and Vencord source build | Node.js includes `npm`. The documented Vencord version currently requires Node.js 22 or newer. |
| `ws` version `8.21.1` | Discord typing bridge | Installed automatically and locally by `npm ci`; do not download it manually. |
| [Git](https://git-scm.com/downloads) | Cloning Vencord source | Optional if you download the Vencord source ZIP instead. Git is the clearer documented path. |
| `pnpm` version `11.9.0` | Building Vencord | Installed globally with the command in this guide. |
| [Vencord source](https://github.com/Vendicated/Vencord) | Reading Discord typing events | Separate third-party project. This repository supplies only the custom plugin source. |
| Discord Desktop | Documented Vencord injection path | The steps below target the normal desktop Discord client. Other clients require their own Vencord installation method. |

No database, cloud server, API key, port forwarding, or paid service is needed.
The typing bridge listens only on `127.0.0.1`, meaning your own computer.

---

# Part 1: Download the files

1. Open this repository on GitHub.
2. Select **Code**.
3. Select **Download ZIP**.
4. Open your Downloads folder.
5. Right-click the downloaded ZIP and select **Extract All**.
6. Move the extracted folder somewhere permanent, for example:

   ```text
   C:\Users\YourName\Documents\OBS-Stream-Overlays
   ```

7. Do not move or rename this folder after adding its files to OBS. OBS stores
   the file locations and will show a blank source if those locations later
   change.

---

# Part 2: First-time OBS setup

## 1. Install and open OBS

1. Download and install [OBS Studio](https://obsproject.com/download).
2. Open OBS.
3. If the **Auto-Configuration Wizard** appears, complete it. Choose whether
   your priority is streaming or recording. This does not affect whether these
   overlays work.
4. Look at the bottom of the OBS window. You should see panels named **Scenes**,
   **Sources**, **Audio Mixer**, **Scene Transitions**, and **Controls**.

If **Browser** is not available when adding a source, reinstall OBS using the
official installer. The normal official OBS package includes Browser Source.

## 2. Find your canvas size

Your full-screen overlays must match OBS's **Base (Canvas) Resolution**.

1. Select **Settings** in the Controls panel.
2. Select **Video**.
3. Note the two numbers beside **Base (Canvas) Resolution**.
4. Select **Cancel** if you did not change anything.

Common canvas sizes are:

- `1920 × 1080`
- `2560 × 1440`
- `3840 × 2160`

Do not automatically use `1920 × 1080` if your Base (Canvas) Resolution is
something else.

## 3. Create a scene

1. In the **Scenes** panel, select the **+** button.
2. Enter a name such as `Main Stream`.
3. Select **OK**.

A scene is a collection of sources. Sources higher in the Sources list appear
in front of sources lower in the list.

## 4. Add any HTML overlay as a Browser Source

Use this procedure whenever a later section tells you to add an HTML file.

1. Select the scene that should contain the overlay.
2. In the **Sources** panel, select **+**.
3. Select **Browser**.
4. Select **Create new**.
5. Give the source a descriptive name, such as `Countdown`, `Confetti`, or
   `Discord Typing Alert`.
6. Select **OK**.
7. Enable **Local file**.
8. Select **Browse**.
9. Choose the required `.html` file from the extracted repository folder.
10. Enter the Width and Height stated in this README.
11. Leave **Shutdown source when not visible** disabled unless a section says
    otherwise. Disabling it lets persistent sources remain connected while
    hidden or while another scene is active.
12. Leave **Refresh browser when scene becomes active** disabled unless you
    specifically want the overlay to restart every time you enter the scene.
13. Select **OK**.
14. In the Sources panel, drag the overlay above the game, display capture, or
    camera sources that it should appear over.

To resize a full-screen source exactly to the canvas:

1. Right-click the source in the Sources panel.
2. Select **Transform → Fit to Screen**.

To reload an edited HTML file:

1. Right-click its Browser Source.
2. Select **Refresh cache of current page**.

The eye icon beside a source shows or hides it without deleting it.

---

# Part 3: Countdown

File: [`overlays/countdown/summer-update-countdown.html`](overlays/countdown/summer-update-countdown.html)

## Configure the target date

1. Close OBS or leave it open and refresh the source after editing.
2. Right-click `summer-update-countdown.html` in File Explorer.
3. Select **Open with → Notepad**.
4. Near the bottom, find:

   ```js
   const TARGET_DATE_TIME = "2026-07-25T12:00:00Z";
   ```

5. Replace only the date inside the quotation marks.
6. Use an ISO 8601 date that includes a timezone.

Examples:

```js
// 8:00 PM during UK summer time (BST)
const TARGET_DATE_TIME = "2026-07-25T20:00:00+01:00";

// 8:00 PM during UK winter time (GMT/UTC)
const TARGET_DATE_TIME = "2026-12-20T20:00:00+00:00";
```

7. Save the file with **File → Save**.
8. Add it to OBS as a Browser Source at `700 × 180`.
9. If it was already in OBS, right-click it and select **Refresh cache of
   current page**.

The countdown reaches zero and stops. If it immediately shows zero, the target
time is in the past or the timezone is wrong.

## Optional OpenAI Sans installation

The five `.otf` font files beside the countdown are optional.

On Windows:

1. Open `overlays\countdown`.
2. Select the five `OpenAI-Sans-*.otf` files.
3. Right-click the selection.
4. Select **Install** or **Install for all users**.
5. Restart OBS or refresh the Browser Source.

The overlay remains functional without these files.

---

# Part 4: Confetti

File: [`overlays/confetti/confetti.html`](overlays/confetti/confetti.html)

1. Add `confetti.html` as a Browser Source.
2. Set its Width and Height to your OBS Base (Canvas) Resolution.
3. Right-click it and select **Transform → Fit to Screen**.
4. Move it above the sources it should cover.
5. Ensure **Shutdown source when not visible** is disabled.
6. Leave **Refresh browser when scene becomes active** disabled for manual
   control.

The confetti plays once whenever the page loads. To play it again:

1. Right-click the `Confetti` source.
2. Select **Refresh cache of current page**.

For automatic confetti whenever a dedicated celebration scene opens, edit the
Browser Source and enable **Refresh browser when scene becomes active**.

---

# Part 5: Animated subscriber border

Files and software:

- [`overlays/gradient-stroke/gradient.html`](overlays/gradient-stroke/gradient.html)
- [Stroke Glow Shadow OBS plugin](https://github.com/FiniteSingularity/obs-stroke-glow-shadow/releases)
- A separate subscriber-count source that already has transparency around the
  text or numbers

`gradient.html` supplies moving colours. It does not obtain or display a
subscriber count.

## 1. Install Stroke Glow Shadow

1. Check the plugin's latest release notes and confirm that the release supports
   your installed OBS version and operating system.
2. Close OBS completely.
3. Download the correct installer from the plugin's
   [Releases page](https://github.com/FiniteSingularity/obs-stroke-glow-shadow/releases).
4. Run the installer. Do not download GitHub's **Source code (zip)** archive;
   that is not the compiled OBS plugin.
5. Reopen OBS.

If the plugin is available through OBS's own plugin manager in your OBS build,
you may install it there instead.

## 2. Prepare the subscriber-count source

The stroke follows the source's visible alpha shape.

- A source with transparent space around the digits is ready.
- A green-screen source needs an OBS **Chroma Key** filter first.
- An opaque rectangular source will produce a rectangular border, not a border
  around the digits.

To add a Chroma Key when needed:

1. Right-click the subscriber-count source.
2. Select **Filters**.
3. Under **Effect Filters**, select **+ → Chroma Key**.
4. Choose the green background colour and adjust Similarity until only the
   count remains visible.
5. Keep Chroma Key above the Stroke filter in the Effect Filters list.

## 3. Add the animated colour source

1. Add `gradient.html` as a Browser Source.
2. Give it a name such as `Subscriber Border Gradient`.
3. Set it to the same Width and Height as the subscriber-count source.
4. The gradient may be hidden behind other scene sources. The Stroke filter can
   still use it as its fill source.

## 4. Add the stroke

1. Right-click the subscriber-count source.
2. Select **Filters**.
3. Under **Effect Filters**, select **+**.
4. Select the plugin's **Stroke** filter.
5. Set the stroke position to **Outer**.
6. Start with a stroke size around `4` to `8` pixels.
7. Start with an offset of `0`.
8. Enable anti-aliasing if the plugin exposes that option.
9. Set the fill type to **Source**.
10. Select `Subscriber Border Gradient` as the fill source.
11. Close the Filters window when the result looks correct.

If the entire rectangle is outlined, the subscriber-count source still has an
opaque background. Fix its transparency or Chroma Key before adjusting the
stroke.

To change the colours, open `gradient.html` in a text editor and edit the hex
values inside `conic-gradient`, then refresh the Browser Source.

---

# Part 6: Discord typing alert

This is the only feature with a multi-program installation. Complete it in this
order:

1. Install and test the local bridge.
2. Add and test the OBS overlay without Discord.
3. Build and inject the Vencord integration.
4. Enable the plugin and choose channels.
5. Test using another Discord account or another person.

The plugin intentionally ignores your own typing events.

## How the typing alert works

```text
Another Discord user starts typing
        ↓
Custom Vencord plugin
        ↓
Local WebSocket bridge at 127.0.0.1:8765
        ↓
OBS Browser Source
```

## A. Install and test the bridge

### 1. Install Node.js

1. Install [Node.js 22 or newer](https://nodejs.org/en/download).
2. Close every existing PowerShell window after installation.
3. Open a new PowerShell window.
4. Verify Node.js and npm:

   ```powershell
   node --version
   npm.cmd --version
   ```

The first command must show version `22` or newer, such as `v22.x.x`.

### 2. Open PowerShell in the bridge folder

1. In File Explorer, open:

   ```text
   OBS-Stream-Overlays\overlays\typing-notifications
   ```

2. Click the address bar.
3. Type `powershell`.
4. Press Enter.

The new PowerShell window should open directly in that folder.

### 3. Install the exact dependency versions

Run:

```powershell
npm.cmd ci
```

This reads `package-lock.json` and installs the locked `ws` dependency into the
local `node_modules` folder. It does not install a server globally.

### 4. Run the automated bridge test

Run:

```powershell
npm.cmd test
```

Expected final output:

```text
Bridge smoke test passed.
```

Do not continue if this test fails. Read the error shown in PowerShell first.

### 5. Start the bridge

Run:

```powershell
npm.cmd start
```

Expected output:

```text
Typing OBS bridge listening on ws://127.0.0.1:8765
```

Leave this PowerShell window open while streaming. Closing it stops the typing
alert bridge.

## B. Add and test the OBS overlay

1. In OBS, add
   [`overlays/typing-notifications/overlay.html`](overlays/typing-notifications/overlay.html)
   as a local Browser Source.
2. Name it `Discord Typing Alert`.
3. Set Width to `720` and Height to `200`.
4. Leave **Shutdown source when not visible** disabled so the WebSocket can stay
   connected.
5. Leave **Refresh browser when scene becomes active** disabled.
6. Select **OK**.
7. Move the source above your gameplay or display source.

Now test the entire bridge-to-OBS path without Discord:

1. Keep the bridge PowerShell window running.
2. Open a second PowerShell window in the same
   `overlays\typing-notifications` folder.
3. Run:

   ```powershell
   npm.cmd run test-event
   ```

4. OBS should show a `@test-user is typing` alert.

If this test does not appear, do not install Vencord yet. Fix the local bridge
or OBS source first using the troubleshooting section.

## C. Install the custom Vencord source build

Vencord is a separate third-party Discord client modification. These steps
build its current source and inject that build into Discord Desktop.

### 1. Install Git and pnpm

1. Install [Git](https://git-scm.com/downloads).
2. Open a new PowerShell window.
3. Confirm Node.js is still version 22 or newer:

   ```powershell
   node --version
   ```

4. Install the Vencord-required pnpm version:

   ```powershell
   npm.cmd install --global pnpm@11.9.0
   ```

5. Verify it:

   ```powershell
   pnpm.cmd --version
   ```

Expected output begins with `11.9.0`.

### 2. Download Vencord source

Choose a permanent development folder, then run:

```powershell
git clone https://github.com/Vendicated/Vencord.git
cd Vencord
```

If the folder already exists, open PowerShell in that existing Vencord folder
instead of cloning a second copy.

### 3. Install Vencord's build dependencies

From the Vencord folder, run:

```powershell
pnpm.cmd install --frozen-lockfile
```

This installs Vencord's full development toolchain and can take substantially
longer than installing the small local bridge.

### 4. Copy the custom plugin

Create this exact folder inside the Vencord source checkout:

```text
src\userplugins\typingNotifications
```

Then copy this repository file:

```text
integrations\vencord\TypingNotifications\index.tsx
```

into the new Vencord folder so the final path is exactly:

```text
Vencord\src\userplugins\typingNotifications\index.tsx
```

Do not put it in Vencord's built-in `src\plugins` folder.

### 5. Build Vencord

From the Vencord folder, run:

```powershell
pnpm.cmd build
```

The command must finish without a build error. If it fails, copy the first
meaningful error rather than repeatedly rebuilding.

### 6. Inject the build into Discord Desktop

Building creates Vencord's files, but it does not install them into Discord.
Injection is a separate required step.

1. Fully close Discord, including its system-tray icon.
2. In the Vencord PowerShell window, run:

   ```powershell
   pnpm.cmd inject
   ```

3. Follow the Vencord installer prompts and select the Discord installation you
   use.
4. Reopen Discord after injection finishes.

When you later change the custom plugin source, run `pnpm.cmd build`, close
Discord, run `pnpm.cmd inject`, and reopen Discord again.

## D. Enable and configure TypingNotifications

### 1. Enable the plugin

1. In Discord, open **User Settings**.
2. Open **Vencord → Plugins**.
3. Search for `TypingNotifications`.
4. Enable it.
5. Open its settings if you want to:
   - restrict alerts to specific Discord user IDs;
   - use usernames or server nicknames in OBS;
   - disable the notification tone;
   - upload a custom sound up to 10 MB.

If the plugin is absent, verify the exact camel-case path
`src\userplugins\typingNotifications\index.tsx`, then rebuild, inject, and
restart Discord.

### 2. Choose channels to watch

1. Right-click a server text channel.
2. Open **Notification Settings**.
3. Enable the added **Typing** option.

Discord occasionally changes its context-menu structure. The plugin includes a
fallback that may place **Typing** beside the normal notification item instead
of inside its submenu.

### 3. Perform the real test

1. Keep the bridge running with `npm.cmd start`.
2. Keep OBS open with `Discord Typing Alert` visible in the active scene.
3. Keep TypingNotifications enabled in Discord.
4. Ask another person to type in the watched channel, or use a separate Discord
   account.
5. Do not use your own account for this test; the plugin deliberately ignores
   your own typing.

You should receive both the Vencord notification and the OBS alert.

## E. Easier Windows startup after setup

After `npm.cmd ci` and the manual tests have succeeded, the included launcher
can start the bridge and OBS together:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-obs.ps1
```

Run it from `overlays\typing-notifications`.

The launcher:

- verifies Node.js and the local dependency;
- confirms that port `8765` is either free or already running this bridge;
- starts and health-checks the bridge;
- starts OBS;
- stops the bridge it launched when OBS closes.

It intentionally refuses to launch a second OBS process. Close OBS first.

If OBS is installed in a non-standard location:

```powershell
$env:OBS_PATH = "D:\Apps\obs-studio\bin\64bit\obs64.exe"
powershell -ExecutionPolicy Bypass -File .\start-obs.ps1
```

The `OBS_PATH` value applies to that PowerShell window only.

## F. Changing the local bridge port

The default port is `8765`. Change it only when another program already uses
that port.

All three components must use the same number:

1. Bridge and launcher:

   ```powershell
   $env:TYPING_OBS_PORT = "9876"
   npm.cmd start
   ```

2. OBS overlay: edit `BRIDGE_URL` near the bottom of
   `overlays/typing-notifications/overlay.html`:

   ```js
   const BRIDGE_URL = "ws://127.0.0.1:9876";
   ```

3. Vencord plugin: edit `OBS_BRIDGE_URL` near the top of
   `integrations/vencord/TypingNotifications/index.tsx`:

   ```ts
   const OBS_BRIDGE_URL = "ws://127.0.0.1:9876";
   ```

4. Copy the changed Vencord plugin into your Vencord source checkout again.
5. Run `pnpm.cmd build`.
6. Close Discord.
7. Run `pnpm.cmd inject`.
8. Reopen Discord.
9. Refresh the OBS Browser Source.

---

# Troubleshooting

## Browser Source is missing in OBS

Reinstall OBS using the official installer. Normal official OBS distributions
include Browser Source. Avoid stripped-down or unofficial packages.

## An overlay is blank

1. Edit the Browser Source.
2. Confirm **Local file** is enabled.
3. Confirm it points to the correct `.html` file in the permanent extracted
   folder.
4. Confirm the Width and Height are not zero.
5. Right-click it and select **Refresh cache of current page**.
6. Move it above the gameplay source in the Sources list.

## Countdown is already at zero or shows the wrong time

- Confirm the target date is in the future.
- Include an explicit timezone such as `+01:00` for UK summer time or `+00:00`
  for UK winter time.
- Save the file and refresh its Browser Source.

## Confetti played only once

That is intentional. Select **Refresh cache of current page** to trigger it
again, or enable **Refresh browser when scene becomes active** for a dedicated
celebration scene.

## The border outlines a rectangle

The target source is opaque. Add or correct its Chroma Key, ensure Chroma Key is
above Stroke in Effect Filters, or use a source with genuine transparency.

## Stroke Glow Shadow does not appear

- Restart OBS after installation.
- Confirm you downloaded the compiled installer, not GitHub's source-code ZIP.
- Confirm the plugin release supports your OBS version and operating system.
- Check the plugin's own release notes and installation instructions.

## PowerShell says scripts are disabled or `npm` cannot run

Use the `.cmd` forms shown in this guide:

```powershell
npm.cmd ci
npm.cmd start
pnpm.cmd build
```

The launcher command already uses `-ExecutionPolicy Bypass` for that one script
process.

## `npm.cmd ci` fails

- Confirm PowerShell is open in `overlays\typing-notifications`.
- Confirm that folder contains both `package.json` and `package-lock.json`.
- Confirm `node --version` is version 22 or newer.
- Check your internet connection, because npm must download `ws` once.

## Bridge reports `EADDRINUSE` or the launcher says port 8765 is occupied

Another process is listening on port `8765`. Close the other process or follow
all port-change steps above. Changing only one component will not work.

## `npm.cmd run test-event` does not appear in OBS

1. Confirm the `npm.cmd start` window is still open.
2. Confirm it says the bridge is listening on `127.0.0.1:8765`.
3. Confirm OBS points to the correct `overlay.html` file.
4. Confirm **Shutdown source when not visible** is disabled.
5. Refresh the Browser Source.
6. Confirm the bridge and overlay use the same port.

## The test event works, but Discord typing does not

The bridge and OBS are working. Check only the Vencord side:

1. Confirm TypingNotifications is enabled.
2. Confirm the channel has **Typing** enabled.
3. Confirm you tested with another user's typing, not your own.
4. Confirm Discord was fully closed before `pnpm.cmd inject`.
5. Rebuild, inject, and restart Discord.
6. Confirm the Vencord plugin and bridge use the same port.

## TypingNotifications is not listed in Vencord

The final source path must be exactly:

```text
Vencord\src\userplugins\typingNotifications\index.tsx
```

Then run, in order:

```powershell
pnpm.cmd build
pnpm.cmd inject
```

Restart Discord after injection.

## Avatar images are missing but alerts otherwise work

The username alert can still function. Discord's avatar URL must also be
reachable by the OBS Browser Source, so check the computer's internet access
and any firewall or filtering software.

---

# Updating later

## Update this overlay repository

Downloading a new ZIP can replace files, so first back up any custom dates,
titles, colours, sounds, or port changes.

## Update Vencord source

From the Vencord source folder:

```powershell
git pull
pnpm.cmd install --frozen-lockfile
```

Confirm that Vencord's `package.json` still specifies the same Node.js and pnpm
requirements. Then restore or verify the custom plugin file, run
`pnpm.cmd build`, close Discord, run `pnpm.cmd inject`, and reopen Discord.

Because Vencord and Discord are independent third-party projects, future
updates can change their build or menu structure. Use Vencord's current source
installation documentation when it conflicts with an older downloaded copy of
this README.

---

# Repository checks

The repository includes automated validation:

- JavaScript syntax checks for every HTML overlay;
- local README link checks;
- a bridge health check;
- an end-to-end WebSocket smoke test;
- Windows PowerShell launcher parsing;
- a CI build of the custom integration against current Vencord source.

To run the local bridge checks yourself:

```powershell
cd overlays\typing-notifications
npm.cmd ci
npm.cmd run check
```

The Vencord compatibility build runs in GitHub Actions because it needs a full
Vencord source checkout.

---

# Security and privacy

- The bridge binds to `127.0.0.1`, not your LAN or the public internet.
- It does not require a Discord token, API key, database, or cloud account.
- The custom Vencord plugin reads typing events already received by your Discord
  client and sends only the displayed username, channel name, avatar URL, and
  timestamp to the local bridge.
- Review third-party OBS and Discord modifications before installing them.

# License

The original overlays, bridge, launcher, tests, and documentation use the
repository's MIT License. The Vencord integration retains its
GPL-3.0-or-later notice. The optional OpenAI Sans files are separate third-party
assets. See [`docs/NOTICE.md`](docs/NOTICE.md).
